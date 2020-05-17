const GPSDRecognizer = require('./gpsd/gpsd-static-recognizer').Recognizer;
const Point = require('./gpsd/gpsd-static-recognizer').Point;

const articulations = ["rightPalmPosition", "rightThumbPosition", "rightIndexPosition", "rightMiddlePosition", "rightRingPosition", "rightPinkyPosition"]; // TODO change

let pinch = [
    new Point(23.2502, 193.991, 17.1),
    new Point(-24.6563, 178.378, -29.2918),
    new Point(-8.50629, 227.948, -63.6768),
    new Point(10.2697, 161.293, 3.50911),
    new Point(24.7831, 159.183, 9.89916),
    new Point(39.6524, 164.147, 2.17134)
];

let grab = [
    new Point(4.97248, 190.935, 7.58023),
    new Point(-28.8872, 165.358, -44.1474),
    new Point(-35.5126, 234.159, -64.8204),
    new Point(-6.4885, 243.078, -73.7132),
    new Point(15.8887, 206.847, -70.8685),
    new Point(32.1765, 188.574, -51.7214)
];

let pointIndex = [
    new Point(15.1578, 223.82, 24.5823),
    new Point(-7.5707, 190.456, -6.30516),
    new Point(-8.15578, 232.581, -66.5692),
    new Point(-8.51972, 191.547, 28.3864),
    new Point(5.48818, 190.245, 34.3428),
    new Point(18.2911, 191.727, 30.8463)
];

let flat = [
    new Point(16.1366, 223.455, 1.74582),
    new Point(-43.985, 235.718, -9.85369),
    new Point(-15.3497, 242.485, -78.0869),
    new Point(-3.41127, 229.939, -91.0177),
    new Point(9.7227, 211.863, -84.5062),
    new Point(18.3766, 195.168, -61.1797)
];

class Classifier {
    constructor(config) {
        this.staticRecognizer = new GPSDRecognizer();
        // TODO modify and take gestures and non-gestures from a dataset
        this.staticRecognizer.addGesture("", pinch);
        this.staticRecognizer.addGesture("grab", grab);
        this.staticRecognizer.addGesture("pointIndex", pointIndex);
        this.staticRecognizer.addGesture("", flat);
    }

    classify(frame) {
        let points = []
        for (const articulation of articulations) {
            points.push(frame.getArticulation(articulation).point);
        }
        let { success, name, time } = this.staticRecognizer.recognize(points);
        if (success) {
            return name;
        } else {
            return "";
        }
    }
}

function getArticulation(frame, name) {
    for (const articulation of frame.articulations) {
        if (articulation.label === name) {
            return articulation.point;
        }
    }
    return null;
}

module.exports = {
    Classifier
}