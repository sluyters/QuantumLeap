const Sensor = require('../../framework/sensors/Sensor').Sensor;
const Leap = require('leapjs');
const StrokeData = require('../../framework/gestures/stroke-data').StrokeData;
const Stroke = require('../../framework/gestures/stroke-data').Stroke;
const Path = require('../../framework/gestures/stroke-data').Path;
const Point = require('../../framework/gestures/point').Point3D;

const fingers = ["rightThumbPosition", "rightIndexPosition", "rightMiddlePosition", "rightRingPosition", "rightPinkyPosition", "leftThumbPosition", "leftIndexPosition", "leftMiddlePosition", "leftRingPosition", "leftPinkyPosition"];


class LeapSensor extends Sensor{

    static callback = undefined;
    static dataset = undefined;
    constructor(gestureSegmenter) {
        super();
        this.gestureSegmenter = gestureSegmenter;
    }

    onGesture(callback){
        LeapSensor.callback=callback;
    }

    async acquireData(){
        Leap.loop((frame) => {
            let rawData = convert(frame);
            console.log(rawData)
            let { success, strokeData } = this.gestureSegmenter.segment(rawData);
            if (success) {
                LeapSensor.callback(strokeData);
            }
        });
    }

    stop(){
        console.log("End sensor");
    }
}

function convert(frame) {
    if(frame.hands.length == 0)
        return [];
    let points = [];
    let rightHandId = -1;
    let leftHandId = -1;

    for (const hand of frame['hands']) {
        let label;
        if (hand['type'] === 'right') {
            rightHandId = hand['id'];
            label = "rigthPalmPosition";
        }
        else{
            leftHandId = hand['id'];
            label = "leftPalmPosition";
        }
        let palmPosition = hand['palmPosition'];
        let x = palmPosition[0];
        let y = palmPosition[1];
        let z = palmPosition[2];
        let t = frame['timestamp'];
        points.push({label: label, point: new Point(x, y, z, t)});
    }

    frame['fingers'].forEach( (pointable, index, array) =>{
        if (!pointable.tool) {
            // Get the name of the finger from handId and type
            let fingerName;
            if (pointable.handId === rightHandId) {
                fingerName = getFingerName("right", pointable.type);
            } else if (pointable.handId === leftHandId) {
                fingerName = getFingerName("left", pointable.type);
            }
            let tipPosition = pointable['tipPosition'];
            let point = new Point(tipPosition[0], tipPosition[1], tipPosition[2], frame['timestamp']);
            points.push({label: fingerName, point: point});
        }
    });

    return points;
}

function getFingerName(hand, type) {
    if (hand == "right") {
        return fingers[type];
    } else {
        return fingers[5 + type];
    }
}

module.exports = {
    LeapSensor
};