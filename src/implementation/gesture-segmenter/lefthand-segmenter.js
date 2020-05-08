const StrokeData = require('../../framework/gestures/StrokeData').StrokeData;
const Stroke = require('../../framework/gestures/StrokeData').Stroke;
const Path = require('../../framework/gestures/StrokeData').Path;
const Point = require('../../framework/gestures/Point').Point3D;
const fingers = ["rightThumbPosition", "rightIndexPosition", "rightMiddlePosition", "rightRingPosition", "rightPinkyPosition", "leftThumbPosition", "leftIndexPosition", "leftMiddlePosition", "leftRingPosition", "leftPinkyPosition"];

class Segmenter {
    constructor() {
        this.strokeData = null;
        this.minFrames = 10;
        this.maxFrames = 180;
    }

    segment(rawData) {
        let hasLeftHand = false;
        rawData.forEach(pointable =>{
            if(pointable["label"] === "leftPalmPosition") {
                hasLeftHand = true;
            }
        });


        if(!hasLeftHand){
            if(this.strokeData !== null){
                let strokeData = this.strokeData;
                this.strokeData = null;
                return { success: true, strokeData: strokeData};
            }else{
                return { success: false, frames: null };
            }
        }

        if(this.strokeData === null){
            this.strokeData = new StrokeData();
            let stroke = new Stroke();
            this.strokeData.addStroke(stroke);

            fingers.forEach((fingerName) => {
                let strokePath = new Path(fingerName);
                stroke.addPath(fingerName, strokePath);
            });

            let strokePath = new Path("rigthPalmPosition");
            stroke.addPath("rigthPalmPosition", strokePath);
            strokePath = new Path("leftPalmPosition");
            stroke.addPath("leftPalmPosition", strokePath);
        }

        rawData.forEach(pointable =>{
            let stroke = this.strokeData.strokes[0];
            let strokePath = stroke.paths[pointable["label"]];
            strokePath.addPoint(pointable["point"]);
        });

        return { success: false, frames: null };
    }
}

module.exports = {
    Segmenter
};