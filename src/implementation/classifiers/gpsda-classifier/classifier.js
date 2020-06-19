const AbstractClassifier = require('../../../framework/classifiers/abstract-classifier').AbstractClassifier;
const GPSDaRecognizer = require('./gpsda/gpsda-static-recognizer').Recognizer;
const Point = require('./gpsda/gpsda-static-recognizer').Point;

class Classifier extends AbstractClassifier {

    static name = "GPSDaClassifier";

    constructor(options, dataset) {
        super(options);
        this.articulations = options.articulations;
        this.alpha = options.alpha;
        this.staticRecognizer = new GPSDaRecognizer(options.alpha);
        // Load gestures from the dataset
        if (dataset !== undefined) {
			dataset.getGestureClasses().forEach((gesture) => {
				gesture.getSample().forEach(sample => {
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

    classify(frame) {
        let points = []
        for (const articulation of this.articulations) {
            points.push(frame.getArticulation(articulation).point);
        }
        //console.log(points)
        let { success, name, time } = this.staticRecognizer.recognize(points);
        return success ? { 'name': name, 'time': time } : { 'name': "", 'time': time };
    }

    toString() {
        return `${Classifier.name} [ alpha = ${this.alpha.toFixed(2)} ]`;
    }
}

module.exports = {
    Classifier,
    Point
}