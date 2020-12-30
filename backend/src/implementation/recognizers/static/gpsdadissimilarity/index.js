const AbstractStaticRecognizer = require('../../../../framework/modules/recognizers/static/abstract-static-recognizer').AbstractStaticRecognizer;
const GPSDAlphaDissimilarityRecognizer = require('./gpsda-dissimilarity/gpsda-dissimilarity-static-recognizer').Recognizer;
const Point = require('./gpsda-dissimilarity/gpsda-dissimilarity-static-recognizer').Point;
const { parsePointsNames } = require('../../../../framework/utils');

class Classifier extends AbstractStaticRecognizer {

  static name = "GPSDaDissimilarityClassifier";

  constructor(options, dataset) {
    super(options);
    this.selectedPoints = parsePointsNames(options.points);
    this.alpha = options.alpha;
    this.staticRecognizer = new GPSDAlphaDissimilarityRecognizer(this.selectedPoints.length, options.alpha);
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
    for (const articulation of this.selectedPoints) {
      points.push(frame.getArticulation(articulation).point);
    }
    this.staticRecognizer.addGesture(name, points);
  }

  removeGesture(name) {
    this.staticRecognizer.removeGesture(name);
  }

  recognize(frame) {
    let points = []
    for (const articulation of this.selectedPoints) {
      points.push(frame.getArticulation(articulation).point);
    }
    try {
      let { name, score, time } = this.staticRecognizer.recognize(points);
      return score > 0.0 ? { name: name, score: score, time: time } : { name: '', score: 0.0, time: time };
    } catch (err) {
      return { name: '', score: 0.0, time: 0.0 }
    }
  }

  toString() {
    return `${Classifier.name} [ alpha = ${this.alpha.toFixed(2)} ]`;
  }
}

module.exports = Classifier;