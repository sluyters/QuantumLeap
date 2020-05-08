class StrokeData {

    constructor(user) {
        this.user = user;
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

    addPoint(stroke){
        this.points.push(stroke);
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