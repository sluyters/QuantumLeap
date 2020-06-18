const AbstractClassifier = require('../../../framework/classifiers/abstract-classifier').AbstractClassifier;
const GPSDRecognizer = require('./gpsd/gpsd-static-recognizer').Recognizer;
const Point = require('./gpsd/gpsd-static-recognizer').Point;

class Classifier extends AbstractClassifier {

    static name = "GPSDClassifier";

    constructor(options, dataset) {
        super(options);
        this.articulations = options.articulations;
        this.staticRecognizer = new GPSDRecognizer(options.alpha);
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
}

module.exports = {
    Classifier,
    Point
}