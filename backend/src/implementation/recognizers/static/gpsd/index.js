const AbstractStaticRecognizer = require('../../../../framework/recognizers/static/abstract-static-recognizer').AbstractStaticRecognizer;
const GPSDRecognizer = require('./gpsd/gpsd-static-recognizer').Recognizer;
const Point = require('./gpsd/gpsd-static-recognizer').Point;
const { parsePointsNames } = require('../../../../framework/utils');

class Classifier extends AbstractStaticRecognizer {

    static name = "GPSDClassifier";

    constructor(options, dataset) {
        super(options);
        this.articulations = parsePointsNames(options.articulations);
        this.staticRecognizer = new GPSDRecognizer(this.articulations.length);
        // Load gestures from the dataset
        if (dataset !== undefined) {
			dataset.getGestureClasses().forEach((gesture) => {
				gesture.getSamples().forEach(sample => {
                    this.addGesture(gesture.name, sample);
				});
            });
        }
    }

   addGesture(name, frame) {
        let points = []
        for (const articulation of this.articulations) {
            points.push(frame.getArticulation(articulation).point);
        }
        this.staticRecognizer.addGesture(name, points);
    }

    removeGesture(name) {
        this.staticRecognizer.removeGesture(name);
    }

    recognize(frame) {
        let points = []
        for (const articulation of this.articulations) {
            points.push(frame.getArticulation(articulation).point);
        }
        let { success, name, time } = this.staticRecognizer.recognize(points);
        return success ? { 'name': name, 'time': time } : { 'name': "", 'time': time };
    }

    toString() {
        return `${Classifier.name}`;
    }
}

module.exports = Classifier;