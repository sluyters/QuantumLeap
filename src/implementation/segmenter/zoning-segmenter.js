const StrokeData = require('../../framework/gestures/StrokeData').StrokeData;
const Stroke = require('../../framework/gestures/StrokeData').Stroke;
const Path = require('../../framework/gestures/StrokeData').Path;

const xBound = 120;
const zBound = 60;

class Segmenter {
    constructor(options) {
        this.minFrames = options.minSegmentLength;
        this.maxFrames = options.maxSegmentLength;
        this.numberPauseFrames = options.pauseLength;
        this.strokeData = null;
        this.pauseCount = 0;
    }

    segment(frame) {
        // Increment pause count
        this.pauseCount = Math.max(this.pauseCount - 1, 0);
        if (this.pauseCount != 0) {
            return null; 
        }
        if (isWithinBounds(frame)) {
            // At least one hand is in the zone
            if (this.frameCount >= this.maxFrames) {
                // Max number of frames reached
                let oldStrokeData = this.strokeData;
                this.strokeData = null;
                this.frameCount = 0;
                return oldStrokeData;
            } 
            if (this.strokeData === null) {
                // Initialize strokeData
                this.strokeData = new StrokeData();
                for (const articulation of frame.articulations) {
                    let path = new Path(articulation.label);
                    strokeData.addPath(articulation.label, path);
                    let stroke = new Stroke();
                    path.addStroke(stroke);
                    stroke.addPoint(articulation.point);
                }
            } else {
                for (const articulation of frame.articulations) {
                    let path = this.strokeData.paths[articulation.label];
                    let stroke = path.strokes[0];
                    stroke.addPoint(articulation.point);
                }
            }
            this.frameCount++;
        } else if (this.frameCount > this.minFrames) {
            // Hands outside of the zone & enough frames
            let oldStrokeData = this.strokeData;
            this.strokeData = null;
            this.frameCount = 0;
            return oldStrokeData;
        } else {
            // Hands outside of the zone and not enough frames
            this.strokeData = null;
            this.frameCount = 0;
        }
        return null;
    }

    notifyRecognition() {
        this.pauseCount = this.numberPauseFrames;
    }
}

function isWithinBounds(frame) {
    let withinBounds = false;
    if (frame.hasLeftHand) {
        let x = frame.getArticulation("leftPalmPosition").point.x;
        let z = frame.getArticulation("leftPalmPosition").point.z;
        withinBounds = x < xBound && x > -xBound && z < zBound && z > -zBound;
    } 
    if (!withinBounds && frame.hasRightHand) {
        let x = frame.getArticulation(frame, "rightPalmPosition").point.x;
        let z = frame.getArticulation(frame, "rightPalmPosition").point.z;
        withinBounds = x < xBound && x > -xBound && z < zBound && z > -zBound;
    }
    return withinBounds;
}

module.exports = {
    Segmenter
};