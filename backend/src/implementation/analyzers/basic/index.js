const Point = require('../../../framework/gestures/point').Point3D;
const AbstractAnalyzer = require('../../../framework/modules/analyzers/abstract-analyzer').AbstractAnalyzer;

class Analyzer extends AbstractAnalyzer {

    constructor(options) {
        super(options);
        this.previousFrame = null;
        this.leftHanded = options.leftHanded;
        this.handedness = options.leftHanded ? "left" : "right";
    }

    analyze(frame) {
        if (this.previousFrame === null) {
            // Initialize first frame
            this.previousFrame = frame;
        }
        // Compute pinch, rotation, and translation wrt. first frame. 
        let pinch = computePinch(this.previousFrame, frame, this.handedness);
        let rotation = computeRotation(this.previousFrame, frame, this.handedness);
        let translation = computeTranslation(this.previousFrame, frame, this.handedness);
        let thumbVector = computeThumbVector(frame, this.handedness);
        // Save the current frame for next call
        this.previousFrame = frame;
        return { 'rotation': rotation, 'pinch': pinch, 'translation': translation, 'thumbVector': thumbVector };
    }

    reset() {
        this.previousFrame = null;
    }
}

function computePinch(fromFrame, toFrame, handedness) {
    let dFrom = getDistance(fromFrame.getArticulation(`${handedness}ThumbTipPosition_lmc`).point, fromFrame.getArticulation(`${handedness}IndexTipPosition_lmc`).point);
    let dTo = getDistance(toFrame.getArticulation(`${handedness}ThumbTipPosition_lmc`).point, toFrame.getArticulation(`${handedness}IndexTipPosition_lmc`).point);
    return (dTo / dFrom);
}

function computeRotation(fromFrame, toFrame, handedness) {
    let vectorFrom = translateTo(fromFrame.getArticulation(`${handedness}IndexTipPosition_lmc`).point, fromFrame.getArticulation(`${handedness}PalmPosition_lmc`).point);
    let vectorTo = translateTo(toFrame.getArticulation(`${handedness}IndexTipPosition_lmc`).point, toFrame.getArticulation(`${handedness}PalmPosition_lmc`).point);
    let a = computeAngle(vectorTo, vectorFrom);
    return a
}

function computeTranslation(fromFrame, toFrame, handedness) {
    let pFrom = fromFrame.getArticulation(`${handedness}PalmPosition_lmc`).point;
    let pTo = toFrame.getArticulation(`${handedness}PalmPosition_lmc`).point;
    let dx = pTo.x - pFrom.x;
    let dy = pTo.y - pFrom.y;
    let dz = pTo.z - pFrom.z;
    return [dx, dy, dz];
}

function computeThumbVector(frame, handedness) {
    let tVector = translateTo(frame.getArticulation(`${handedness}ThumbTipPosition_lmc`).point, frame.getArticulation(`${handedness}PalmPosition_lmc`).point);
    return [tVector.x, tVector.y, tVector.z];
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


module.exports = Analyzer;