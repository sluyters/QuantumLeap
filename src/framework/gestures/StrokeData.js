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

class Point2D {
    constructor(x,y,t) {
        this.x =x;
        this.y = y;
        this.t = t;
    }
}

module.exports = {
    StrokeData,
    Stroke,
    Point2D
};