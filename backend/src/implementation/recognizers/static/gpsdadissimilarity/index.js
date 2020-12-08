const AbstractStaticRecognizer = require('../../../../framework/recognizers/static/abstract-static-recognizer').AbstractStaticRecognizer;
const GPSDAlphaDissimilarityRecognizer = require('./gpsda-dissimilarity/gpsda-dissimilarity-static-recognizer').Recognizer;
const Point = require('./gpsda-dissimilarity/gpsda-dissimilarity-static-recognizer').Point;
const { parsePointsNames } = require('../../../../framework/utils');

class Classifier extends AbstractStaticRecognizer {

    static name = "GPSDaDissimilarityClassifier";
    
    constructor(options, dataset) {
        super(options);
        this.points = parsePointsNames(options.points);
        this.alpha = options.alpha;
        this.staticRecognizer = new GPSDAlphaDissimilarityRecognizer(this.points.length, options.alpha);
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