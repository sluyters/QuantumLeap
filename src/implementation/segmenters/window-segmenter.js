const AbstractSegmenter = require('../../framework/segmenters/abstract-segmenter').AbstractSegmenter;
const StrokeData = require('../../framework/gestures/stroke-data').StrokeData;
const Stroke = require('../../framework/gestures/stroke-data').Stroke;
const Path = require('../../framework/gestures/stroke-data').Path;

class Segmenter extends AbstractSegmenter {
    
    constructor(options) {
        super(options);
        this.windowWidth = options.windowWidth;
        this.numberIntervalFrames = options.intervalLength;
        this.numberPauseFrames = options.pauseLength;
        this.motionThreshold = options.motionThreshold;
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
                // Add the position of this articulation to the buffer
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
        } else if (this.pauseCount == 0 && this.intervalCount == 0 && (frame.hasLeftHand || frame.hasRightHand)) {
            // Buffer full & ready
          //  if (isMotion(this.frameBuffer, this.motionThreshold, ["rightPalmPosition", "rightThumbTipPosition", "rightIndexTipPosition"])) {
                // Create the StrokeData object from the frames in the buffer
                let strokeData = new StrokeData();
                for (const articulation of frame.articulations) {
                    let path = new Path(articulation.label);
                    strokeData.addPath(articulation.label, path);
                    let stroke = new Stroke();
                    path.addStroke(stroke);
                    stroke.points = this.frameBuffer[articulation.label].slice();
                }
                return strokeData;
            //}
        }
        return null;
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

function isMotion(frameBuffer, threshold, articulations) {
    for (const articulation of articulations) {
        // Compute motion related to first point
        let refPoint = frameBuffer[articulation][0];
        for (let i = frameBuffer[articulation].length - 1; i > 0; i--) {
            let motion = distance(refPoint, frameBuffer[articulation][i]);
            if (motion >= threshold) {
                return true;
            }
        }
    }
    return false;
}

function distance(p1, p2) {
	var dx = p2.x - p1.x;
	var dy = p2.y - p1.y;
	var dz = p2.z - p1.z;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

module.exports = {
    Segmenter
};