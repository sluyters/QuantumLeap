const AbstractClassifier = require('../../../framework/classifiers/abstract-classifier').AbstractClassifier;
const GPSDAlphaDissimilarityRecognizer = require('./gpsda-dissimilarity/gpsda-dissimilarity-static-recognizer').Recognizer;
const Point = require('./gpsda-dissimilarity/gpsda-dissimilarity-static-recognizer').Point;
const { parsePointsNames } = require('../../../framework/utils');

class Classifier extends AbstractClassifier {

    static name = "GPSDaDissimilarityClassifier";
    
    constructor(options, dataset) {
        super(options);
        this.articulations = parsePointsNames(options.articulations);
        this.alpha = options.alpha;
        this.staticRecognizer = new GPSDAlphaDissimilarityRecognizer(this.articulations.length, options.alpha);
        // Load gestures from the dataset
        if (dataset !== undefined) {
			dataset.getGestureClasses().forEach((gesture) => {
				gesture.getSamples().forEach(sample => {
                    this.addPose(gesture.name, sample);
				});
            });
        }
    }

    addPose(name, sample) {
        let frame = sample.frame;
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

module.exports = Classifier;