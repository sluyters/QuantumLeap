const AbstractStaticRecognizer = require('../../../../framework/recognizers/static/abstract-static-recognizer').AbstractStaticRecognizer;
const P3DollarPlusRecognizer = require('./p3dollarplus/recognizer').Recognizer;
const Point = require('./p3dollarplus/recognizer').Point;
const { parsePointsNames } = require('../../../../framework/utils');

class Classifier extends AbstractStaticRecognizer {

    static name = "P3DollarPlusClassifier";

    constructor(options, dataset) {
        super(options);
        this.points = parsePointsNames(options.points);
        this.staticRecognizer = new P3DollarPlusRecognizer(this.points.length);
        // Load gestures from the dataset
        if (dataset !== undefined) {
			dataset.getGestureClasses().forEach((gesture) => {
				gesture.getSamples().forEach(sample => {
                    this.addGesture(gesture.name, sample);
				});
            });
        }
    }

    addGesture(name, sample) {
        let frame = sample.frame;
        let points = []
        for (const articulation of this.points) {
            points.push(frame.getArticulation(articulation).point);
        }
        this.staticRecognizer.addGesture(name, points);
    }

    removeGesture(name) {
        this.staticRecognizer.removeGesture(name);
    }

    recognize(frame) {
        let points = []
        for (const articulation of this.points) {
            let point = frame.getArticulation(articulation).point;
            points.push(new Point(point.x, point.y, point.z, 0));
        }
        try {
            let { success, name, time } = this.staticRecognizer.recognize(points);
            return success ? { 'name': name, 'time': time } : { 'name': "", 'time': time };
        } catch(err) {
            return { 'name': "", 'time': 0.0 };
        }
    }

    toString() {
        return `${Classifier.name}`;
    }
}

module.exports = Classifier;