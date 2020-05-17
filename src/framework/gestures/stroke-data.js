class StrokeData {

    constructor(user, id, infosupp) {
        this.user = user;
        this.id = id;
        this.paths = {};
        this.infosupp = infosupp;
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