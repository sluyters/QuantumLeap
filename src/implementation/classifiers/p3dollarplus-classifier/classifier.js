const AbstractClassifier = require('../../../framework/classifiers/abstract-classifier').AbstractClassifier;
const P3DollarPlusRecognizer = require('./p3dollarplus/recognizer').Recognizer;
const Point = require('./p3dollarplus/recognizer').Point;

class Classifier extends AbstractClassifier {

    static name = "P3DollarPlusClassifier";

    constructor(options, dataset) {
        super(options);
        this.articulations = options.articulations;
        this.staticRecognizer = new P3DollarPlusRecognizer(this.articulations.length);
        // Load gestures from the dataset
        if (dataset !== undefined) {
			dataset.getGestureClasses().forEach((gesture) => {
				gesture.getSamples().forEach(sample => {
                    this.addPose(gesture.name, sample);
				});
            });
        }
    }

    addPose(name, frame) {
        let points = []
        for (const articulation of this.articulations) {
            points.push(frame.getArticulation(articulation).point);
        }
        this.staticRecognizer.addGesture(name, points);
    }

    removePose(name) {
        this.staticRecognizer.removeGesture(name);
    }

    classify(frame) {
        let points = []
        for (const articulation of this.articulations) {
            let point = frame.getArticulation(articulation).point;
            points.push(new Point(point.x, point.y, point.z, 0));
        }
        try {
            let { success, name, time } = this.staticRecognizer.recognize(points);
            return success ? { 'name': name, 'time': time } : { 'name': "", 'time': time };
        } catch(err) {
            //console.log(err);
            return { 'name': "", 'time': 0.0 };
        }
    }

    toString() {
        return `${Classifier.name}`;
    }
}

module.exports = {
    Classifier,
    Point
}