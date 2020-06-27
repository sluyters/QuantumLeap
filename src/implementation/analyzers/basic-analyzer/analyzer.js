const AbstractAnalyzer = require('../../../framework/analyzers/abstract-analyzer').AbstractAnalyzer;

class Analyzer extends AbstractAnalyzer {

    constructor(options) {
        super(options);
        this.firstFrame = null;
    }

    analyze(frame) {
        // TODO improve values
        if (this.firstFrame === null) {
            // Initialize first frame
            this.firstFrame = frame;
        }
        // Compute pinch, rotation, and translation wrt. first frame. 
        let pinch = computePinch(this.firstFrame, frame);
        let rotation = computeRotation(this.firstFrame, frame);
        let translation = computeTranslation(this.firstFrame, frame);
        // Save the current frame for next call
        return { 'rotation': rotation, 'pinch': pinch, 'translation': translation };
    }

    reset() {
        this.firstFrame = null;
    }
}

function computePinch(fromFrame, toFrame) {
    let dFrom = getDistance(fromFrame.getArticulation("rightThumbPosition").point, fromFrame.getArticulation("rightIndexPosition").point);
    let dTo = getDistance(toFrame.getArticulation("rightThumbPosition").point, toFrame.getArticulation("rightIndexPosition").point);
    return (dTo / dFrom);
}

function computeRotation(fromFrame, toFrame) {
    let alphaFromFrame = getAngleFromXAxis(fromFrame.getArticulation("rightThumbPosition").point, fromFrame.getArticulation("rightIndexPosition").point);
    let alphaToFrame = getAngleFromXAxis(toFrame.getArticulation("rightThumbPosition").point, toFrame.getArticulation("rightIndexPosition").point);
    return alphaFromFrame - alphaToFrame;
}

function computeTranslation(fromFrame, toFrame) {
    let pFrom = fromFrame.getArticulation("rightPalmPosition").point;
    let pTo = toFrame.getArticulation("rightPalmPosition").point;
    let dx = pTo.x / pFrom.x;
    let dy = pTo.y / pFrom.y;
    let dz = pTo.z / pFrom.z;
    return [dx, dy, dz];
}

function getAngleFromXAxis(p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

function getDistance(p1, p2) {
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    var dz = p2.z - p1.z;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

module.exports = {
    Analyzer
}