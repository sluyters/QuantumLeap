const Point = require('../../../framework/gestures/point').Point3D;

const AbstractAnalyzer = require('../../../framework/analyzers/abstract-analyzer').AbstractAnalyzer;

class Analyzer extends AbstractAnalyzer {

    constructor(options) {
        super(options);
        this.previousFrame = null;
    }

    analyze(frame) {
        if (this.previousFrame === null) {
            // Initialize first frame
            this.previousFrame = frame;
        }
        // Compute pinch, rotation, and translation wrt. first frame. 
        let pinch = computePinch(this.previousFrame, frame);
        let rotation = computeRotation(this.previousFrame, frame);
        let translation = computeTranslation(this.previousFrame, frame);
        // Save the current frame for next call
        this.previousFrame = frame;
        return { 'rotation': rotation, 'pinch': pinch, 'translation': translation };
    }

    reset() {
        this.previousFrame = null;
    }
}

function computePinch(fromFrame, toFrame) {
    let dFrom = getDistance(fromFrame.getArticulation("rightThumbPosition").point, fromFrame.getArticulation("rightIndexPosition").point);
    let dTo = getDistance(toFrame.getArticulation("rightThumbPosition").point, toFrame.getArticulation("rightIndexPosition").point);
    return (dTo / dFrom);
}

function computeRotation(fromFrame, toFrame) {
    let vectorFrom = translateTo(fromFrame.getArticulation("rightIndexPosition").point, fromFrame.getArticulation("rightThumbPosition").point);
    let vectorTo = translateTo(toFrame.getArticulation("rightIndexPosition").point, toFrame.getArticulation("rightThumbPosition").point);
    let a = computeAngle(vectorTo, vectorFrom);
    console.log(a)
    return a
}

function computeTranslation(fromFrame, toFrame) {
    let pFrom = fromFrame.getArticulation("rightPalmPosition").point;
    let pTo = toFrame.getArticulation("rightPalmPosition").point;
    let dx = pTo.x - pFrom.x;
    let dy = pTo.y - pFrom.y;
    let dz = pTo.z - pFrom.z;
    return [dx, dy, dz];
}

function computeAngle(p1, p2) {
    return Math.atan2(p1.x * p2.y - p1.y * p2.x, p1.x * p2.x + p1.y * p2.y);
}

function getDistance(p1, p2) {
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    var dz = p2.z - p1.z;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function translateTo(p1, p2) {
	return new Point(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);
}

module.exports = {
    Analyzer
}