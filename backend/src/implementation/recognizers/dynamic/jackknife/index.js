const AbstractDynamicRecognizer = require('../../../../framework/modules/recognizers/dynamic/abstract-dynamic-recognizer').AbstractDynamicRecognizer;
const jackknife_blades = require('./jackknife/jackknife').jackknife_blades;
const Jackknife = require('./jackknife/jackknife_recognizer').Jackknife;
const Vector = require('./jackknife/vector').Vector;
const Sample = require('./jackknife/sample').Sample;
const { parsePointsNames } = require('../../../../framework/utils');

class Recognizer extends AbstractDynamicRecognizer {

  static name = "JackknifeRecognizer";

  constructor(options, dataset) {
    super();
    this.N = options.samplingPoints;
    this.selectedPoints = parsePointsNames(options.points);
    let blades = new jackknife_blades();
    blades.set_ip_defaults();
    this.jackknifeRecognizer = new Jackknife(blades)
    if (dataset !== undefined) {
      dataset.getGestureClasses().forEach((gesture) => {
        gesture.getSamples().forEach(sample => {
          this.addGesture(gesture.name, sample, false);
        }
        );
      });
      this.jackknifeRecognizer.train(6, 2, 1.0);
    }
  }

  addGesture(name, sample, train = false) {
    let jackknifeSample = convert(sample, this.selectedPoints, name);
    if (jackknifeSample) {
      this.jackknifeRecognizer.add_template(jackknifeSample);
      if (train) {
        this.jackknifeRecognizer.train(6, 2, 1.0);
      }
    }
  }

  removeGesture(name) {
    console.log("Cannot remove gesture!");
  }

  recognize(sample) {
    let jackknifeSample = convert(sample, this.selectedPoints);
    if (!jackknifeSample) {
      return { name: "", score: 0.0, time: 0.0 };
    }
    let t0 = Date.now();
    let ret = this.jackknifeRecognizer.classify(jackknifeSample);
    let t1 = Date.now();
    return (ret.name == -1) ? { name: "", score: 0.0, time: t1 - t0 } : { name: ret.name, score: ret.score, time: t1 - t0 };
  }

  toString() {
    return `${Recognizer.name} [ samplingPoints = ${this.N} ]`;
  }
}

function convert(sample, selectedPoints, name) {
  let jackknifeSample;
  if (name) {
    jackknifeSample = new Sample(0, name);
  } else {
    jackknifeSample = new Sample();
  }
  let nFrames = sample.paths[selectedPoints[0]].strokes[0].points.length;
  let trajectory = [];
  for (let i = 0; i < nFrames; i++) {
    let vCoordinates = [];
    for (const articulation of selectedPoints) {
      let point = sample.paths[articulation].strokes[0].points[i];
      vCoordinates.push(...point.getCoordinates());
    }
    trajectory.push(new Vector(vCoordinates));
  }
  jackknifeSample.add_trajectory(trajectory);
  return jackknifeSample;
}

module.exports = Recognizer;