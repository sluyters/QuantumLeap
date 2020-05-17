const StrokeData = require('../../framework/gestures/StrokeData').StrokeData;
const Stroke = require('../../framework/gestures/StrokeData').Stroke;
const Path = require('../../framework/gestures/StrokeData').Path;

class Segmenter {
    
    constructor(options) {
        this.windowWidth = options.windowWidth;
        this.numberIntervalFrames = options.intervalLength;
        this.numberPauseFrames = options.pauseLength;
        this.frameBuffer = null;
        this.intervalCount = 0;
        this.pauseCount = 0;
        this.bufferLength = 0;
    }

    segment(frame) {
        if (this.frameBuffer === null) {
            // Initialize frameBuffer
            this.frameBuffer = initBuffer(frame);
        } else {
            for (const articulation of frame.articulations) {
                this.frameBuffer[articulation.label].push(articulation.point);
                if (this.bufferLength >= this.windowWidth) {
                    // Shift items in buffer
                    this.frameBuffer[articulation.label].shift();
                }
            }
        }
        // Increment pause count
        this.pauseCount = Math.max(this.pauseCount - 1, 0);
        this.intervalCount = (this.intervalCount + 1) % this.numberIntervalFrames;
        if (this.bufferLength < this.windowWidth) {
            // Buffer not full
            this.bufferLength++;
            return null;
        } else if (this.pauseCount == 0 && this.intervalCount == 0 && (frame.hasLeftHand || frame.hasRightHand)) {
            let strokeData = new StrokeData();
            // Buffer full & ready
            for (const articulation of frame.articulations) {
                let path = new Path(articulation.label);
                strokeData.addPath(articulation.label, path);
                let stroke = new Stroke();
                path.addStroke(stroke)
                stroke.points = this.frameBuffer[articulation.label].slice();
            }
            return strokeData;
        } else {
            // Pause
            return null;
        }
    }

    notifyRecognition() {
        this.pauseCount = this.numberPauseFrames;
    }
}

function initBuffer(frame) {
    let buffer = {};
    for (const articulation of frame.articulations) {
        buffer[articulation.label] = [ articulation.point ];
    }
    return buffer;
}

module.exports = {
    Segmenter
};