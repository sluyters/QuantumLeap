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
        this.paths = new Map();
    }

    addPath(label, path){
        this.paths.set(label, path);
    }

    toJSON(clef){
        return Array.from(this.paths.entries());
    }
}

class Path {
    constructor(label) {
        this.points = [];
        this.label = label;
    }

    addPoint(point){
        this.points.push(point);
    }
}

module.exports = {
    StrokeData,
    Stroke,
    Path
};