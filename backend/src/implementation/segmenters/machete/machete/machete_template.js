const { ContinuousResult } = require("./continuous_result_options");
const { Mathematics } = require("./mathematics");
const { MacheteTrigger } = require("./machete_trigger");
const { MacheteElement } = require("./machete_element");

class MacheteTemplate {
    constructor(deviceId, crOptions, sample, filtered = true) {
        this.points = undefined;
        this.vectors = undefined;
        this.deviceId = deviceId; 
        this.currentIndex = 0;
        this.sampleCount = 0;

        this.trigger = new MacheteTrigger();
        this.dtw = [ [], [] ];
        let resampled = [];
        

        this.sample = sample;

        if (filtered == true) {
            this.minimumFrameCount = sample.filteredTrajectory.length / 2;
            this.maximumFrameCount = sample.filteredTrajectory.length * 2;
        } else {
            this.minimumFrameCount = sample.trajectory.length / 2;
            this.maximumFrameCount = sample.trajectory.length * 2;
        }

        this.prepare(deviceId, resampled, filtered);

        this.vectorCount = this.vectors.length;

        this.crOptions = crOptions;
        this.result = new ContinuousResult(
            crOptions,
            sample.gestureId,
            sample
            )
        {
            sample = sample
        };
    }

    prepare(deviceId, resampled, filtered = true) {
        let rotated = undefined;
        this.deviceId = deviceId;

        if (filtered === true) {
            rotated = this.sample.filteredTrajectory;
        } else {
            rotated = this.sample.trajectory;
        }

        // Remove duplicate points
        resampled.push(rotated[0]);

        for(let i = 1; i < rotated.length; i++) {
            let count = resampled.length - 1;
            let length = resampled[count].l2norm(rotated[i]);

            if (length <= Number.EPSILON) {
                continue;
            }

            resampled.push(rotated[i]);
        }

        this.sampleCount = resampled.length;

        let ret = Mathematics.boundingBox(resampled);
        let minimum = ret.minPoint;
        let maximum = ret.maxPoint;

        let diag = maximum.l2norm(minimum);

        // Resample the input using DP
        // ERROR HERE
        let dpPoints = Mathematics.douglasPeuckerDensity(resampled, diag * 0.010)[1];

        this.points = dpPoints;

        // console.log(resampled)
        // console.log(dpPoints)
        // while(true) {

        // }

        // Convert DP resampled points into vectors
        this.vectors = Mathematics.vectorize(this.points, true);

        // Determine correction factor information
        this.f2l_Vector = this.points[this.points.length - 1].subtract(this.points[0]);
        let f2l_length = this.f2l_Vector.l2norm();
        this.closedness = f2l_length;
        this.closedness = this.closedness / Mathematics.pathLength(resampled);
        this.f2l_Vector.normalize();

        this.weightClosedness = (1.0 - f2l_length / diag);
        this.weightF2l = Math.min(1.0, 2.0 * f2l_length / diag);
    }

    resetElements() {
        // Restart the DTW matrix
        for (let ridx = 0; ridx < 2; ridx++) {
            this.dtw[ridx] = [];
        }

        // Reset idx, no real need except
        // but for completeness. :)
        this.currentIndex = 0;

        // Will be 20.0 for mouse
        let startAngleDegrees = 65.0;

        for (let ridx = 0; ridx < 2; ridx++) {
            for (let cidx = 0; cidx <= this.vectorCount; cidx++) {
                this.dtw[ridx].push(new MacheteElement(cidx, startAngleDegrees));
            }
        }

        this.trigger.reset();
    }

    reset() {
        this.resetElements();
    }

    // TODO return head and tail, remove head and tail } = require(args
    segmentation(head, tail) {
        let current = this.dtw[this.currentIndex];
        curr = current[current.length - 1];

        head = curr.startFrameNo - 1;
        tail = curr.endFrameNo;

        return { "head": head, "tail": tail };
    }

    // TODO remove buffer and pt as they are useless
    update(buffer, pt, nvec, frameNo, length) {
        // Cache current row as prev
        let previous = this.dtw[this.currentIndex];

        // Update Circular Buffer Index
        this.currentIndex++;
        this.currentIndex = this.currentIndex % 2;

        // Cache reference to current row
        let current = this.dtw[this.currentIndex];

        // Update frame number
        current[0].startFrameNo = frameNo;

        for (let col = 1; col <= this.vectorCount; col++) {
            let dot = nvec.dot(this.vectors[col - 1]);
            let cost = 1.0 - Math.max(-1.0, Math.min(1.0, dot));
            cost = cost * cost;

            // Pick the lowest cost neightbor to
            // extent it"s warping path through
            // this (frame_no, col) element.
            let n1 = current[col - 1];
            let n2 = previous[col - 1];
            let n3 = previous[col];

            let extend = n1;
            let minimum = n1.getNormalizedWarpingPathCost();

            if (n2.getNormalizedWarpingPathCost() < minimum) {
                extend = n2;
                minimum = n2.getNormalizedWarpingPathCost();
            }

            if (n3.getNormalizedWarpingPathCost() < minimum) {
                extend = n3;
                minimum = n3.getNormalizedWarpingPathCost();
            }

            // Update the miniumum cost warping path
            // Element to include this frame
            current[col].update(extend, frameNo, cost, length);
        }

        let curr = current[this.vectorCount];

        let startFrameNo = curr.startFrameNo;
        let endFrameNo = curr.endFrameNo;
        let durationFrameCount = endFrameNo - startFrameNo + 1;
        let cf = 1.0;

        let ret = curr.getNormalizedWarpingPathCost();

        if (durationFrameCount < this.minimumFrameCount) {
            cf *= 1000.0;
        }

        this.trigger.update(ret, cf, curr.startFrameNo, curr.endFrameNo);

        let _t = this.trigger.getThreshold();

        this.result.update(ret * cf, _t, curr.startFrameNo, curr.endFrameNo, frameNo);
    }
}

module.exports = {
    MacheteTemplate
};