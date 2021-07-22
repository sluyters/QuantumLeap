const AbstractDynamicRecognizer = require('../../../../framework/modules/recognizers/dynamic/abstract-dynamic-recognizer').AbstractDynamicRecognizer;
const GPSDaRecognizer = require('./gpsda/gpsda-dynamic-recognizer').Recognizer;
const Point = require('./gpsda/gpsda-dynamic-recognizer').Point;
const { parsePointsNames } = require('../../../../framework/utils');

class Recognizer extends AbstractDynamicRecognizer {

  static name = "GPSDaRecognizer";

  constructor(options, dataset) {
    super(options);
    this.selectedPoints = parsePointsNames(options.points);
    this.samplingPoints = options.samplingPoints;
    this.alpha = options.alpha;
    this.gpsdaRecognizer = new GPSDaRecognizer(this.samplingPoints, this.alpha);
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
    let points = convert(sample, this.selectedPoints);
    this.gpsdaRecognizer.addGesture(name, points);
  }

  removeGesture(name) {
    this.gpsdaRecognizer.removeGesture(name);
  }

  recognize(sample) {
    let points = convert(sample, this.selectedPoints);
    let { name, score, time } = this.gpsdaRecognizer.recognize(points);
    return score > 0.0 ? { name: name, score: score, time: time } : { name: '', score: 0.0, time: time };
  }

  toString() {
    return `${Recognizer.name} [ samplingPoints = ${this.samplingPoints}, alpha = ${this.alpha.toFixed(2)}, points = ${this.selectedPoints} ]`;
  }
}

function convert(sample, selectedPoints) {
  let nFrames = sample.paths[selectedPoints[0]].strokes[0].points.length;
  let points = [];
  for (let i = 0; i < nFrames; i++) {
    let coords = [];
    selectedPoints.forEach(pathName => {
      coords.push(...sample.paths[pathName].strokes[0].points[i].getCoordinates());
    });
    points.push(new Point(coords));
  }
  return points;
}

module.exports = Recognizer;