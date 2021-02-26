const { CircularBuffer } = require("./circular_buffer");
const { MacheteTemplate } = require("./machete_template");

class Machete {
    constructor(deviceType, crOptions) {
        this.deviceType = deviceType;
        this.crOptions = crOptions;
        this.buffer = new CircularBuffer();
        this.templates = [];
        this.trainingSet = [];
        this.lastFrameNo = -1;
        this.deviceFps = -1;

        this.bestScore = 0;
        this.bestTemplate = undefined;
        this.lastPt = undefined;
    }

    getTrainingSet() {
        return this.trainingSet;
    }

    getCROptions() {
        return this.crOptions;
    }

    clear() {
        // Remove ?
        for (let t = 0; t < this.templates.length; t++) {

        }

        this.templates = [];
        this.lastFrameNo = -1;
    }

    addSample(sample, filtered) {
        // Make sure buffer is sufficiently large to
        // store a very slow version of this sample.
        let size = sample.trajectory.length * 5;
        if (size > this.buffer.size()) {
            this.buffer.resize(size);
        }

        let template = new MacheteTemplate(this.deviceType, this.crOptions, sample, filtered);
        this.templates.push(template);
        this.trainingSet.push(sample);
        this.reset();
    }

    reset() {
        for (let i = 0; i < this.templates.length; i++) {
            this.templates[i].reset();
        }

        this.buffer.clear();
    }

    // TODO return score, head, tail ?
    segmentation(score, head, tail) {
        score = this.bestScore;

        head = -1;
        tail = -1;

        if (this.bestTemplate.trigger.check === true) {
            head = this.bestTemplate.trigger.start;
            tail = this.bestTemplate.trigger.end;
        }
    }

    doTheThing(pt, frameNo) {
        let res = [];

        if (this.lastFrameNo === -1) {
            this.lastFrameNo = frameNo; // Added (check if correct)
            this.lastPt = pt;
        }

        // Update Circular Buffer TODO FIX BUG
        while (this.lastFrameNo < frameNo) {
            this.buffer.insert(pt);
            this.lastFrameNo++;
        }

        let vec = pt.subtract(this.lastPt);
        let segmentLength = vec.l2norm();

        this.lastPt = pt;

        if (segmentLength <= Number.EPSILON) {
            return [];
        }

        vec = vec.divide(segmentLength);

        for (let i = 0; i < this.templates.length; i++) {
            this.templates[i].update(this.buffer, pt, vec, frameNo, segmentLength);
            res.push(this.templates[i].result);
        }

        return res;
    }
}

module.exports = {
    Machete
};