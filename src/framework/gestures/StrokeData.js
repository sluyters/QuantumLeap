class StrokeData {

    constructor() {
        this.strokes = [];
    }

    addStroke(stroke){
        this.strokes.push(stroke);
    }


}

class Stroke {
    constructor() {
        this.points = [];
    }

    addPoint(point){
        this.points.push(point);
    }
}

module.exports = {
    StrokeData,
    Stroke
};