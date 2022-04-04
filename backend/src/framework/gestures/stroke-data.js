const Sample = require('./sample').Sample;

class StrokeData extends Sample {
    constructor(user, id, infosupp) {
        super(user, id, infosupp);
        this.paths = {};
    }
    addPath(label, path){
        this.paths[label] = path;
    }
}

class Stroke {
    constructor(id) {
        this.id = id;
        this.points = [];
    }
    addPoint(point){
        this.points.push(point);
    }
}

class Path {
    constructor(label) {
        this.label = label;
        this.strokes = [];
    }
    addStroke(stroke){
        this.strokes.push(stroke);
    }
}

module.exports = {
    StrokeData,
    Stroke,
    Path
};