const AbstractSegmenter = require('../../framework/segmenters/abstract-segmenter').AbstractSegmenter;
const StrokeData = require('../../framework/gestures/stroke-data').StrokeData;
const Stroke = require('../../framework/gestures/stroke-data').Stroke;
const Path = require('../../framework/gestures/stroke-data').Path;
const Point = require('../../framework/gestures/point').Point3D;

class Segmenter extends AbstractSegmenter {
    constructor(options) {
        super(options);
        this.minFrames = options.minSegmentLength;
        this.maxFrames = options.maxSegmentLength;
        this.strokeData = null;
        this.frameCount = 0;
    }

    segment(frame) {
        if (frame.hasLeftHand) {
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
                    this.strokeData.addPath(articulation.label, path);
                    let stroke = new Stroke();
                    path.addStroke(stroke);
                    // Quick hack to remove left hand
                    if (articulation.label.includes("left")) {
                        stroke.addPoint(new Point(0, 0, 0, frame.timestamp));
                    } else {
                        stroke.addPoint(articulation.point);
                    }
                }
            } else {
                for (const articulation of frame.articulations) {
                    let path = this.strokeData.paths[articulation.label];
                    let stroke = path.strokes[0];
                    // Quick hack to remove left hand
                    if (articulation.label.includes("left")) {
                        stroke.addPoint(new Point(0, 0, 0, frame.timestamp));
                    } else {
                        stroke.addPoint(articulation.point);
                    }
                }
            }
            this.frameCount++;
        } else if (this.frameCount > this.minFrames) {
            // Left hand removed and enough frames
            let oldStrokeData = this.strokeData;
            this.strokeData = null;
            this.frameCount = 0;
            return oldStrokeData;
        } else {
            // Left hand removed and not enough frames
            this.strokeData = null;
            this.frameCount = 0;
        }
        return null;
    }

    notifyRecognition() {
        // Do nothing
    }
}

module.exports = {
    Segmenter
};