const StrokeData = require('../gestures/StrokeData').StrokeData;
const Stroke = require('../gestures/StrokeData').Stroke;
const Path = require('../gestures/StrokeData').Path;
const Point = require('../gestures/Point').Point3D;
const fingers = ["rightThumbPosition", "rightIndexPosition", "rightMiddlePosition", "rightRingPosition", "rightPinkyPosition", "leftThumbPosition", "leftIndexPosition", "leftMiddlePosition", "leftRingPosition", "leftPinkyPosition"];

const xBorn = 150;
const zBorn = 30;

class Segmenter {
    constructor() {
        this.strokeData = null;
        this.minFrames = 10;
        this.maxFrames = 180;
    }

    segment(rawData) {
        let started = false;
        rawData.forEach(pointable =>{
            if(pointable["label"] === "leftPalmPosition" || pointable["label"] === "rigthPalmPosition" ) {
                let x = pointable["point"].x;
                let z = pointable["point"].z;
                if(x < xBorn && x > -xBorn && z < zBorn && z > -zBorn)
                    started = true;
            }
        });

        if(!started){
            if(this.strokeData !== null){
                let strokeData = this.strokeData;
                this.strokeData = null;
                console.log("Gesture end\t" + JSON.stringify(strokeData));
                return { success: true, strokeData: strokeData};
            }else{
                return { success: false, frames: null };
            }
        }

        if(this.strokeData === null){
            console.log("Gesture start");
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