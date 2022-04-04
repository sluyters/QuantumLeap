const AbstractDynamicRecognizer = require('../../../../framework/modules/recognizers/dynamic/abstract-dynamic-recognizer').AbstractDynamicRecognizer;
const jackknife_blades = require('./jackknife/jackknife').jackknife_blades;
const Jackknife = require('./jackknife/jackknife_recognizer').Jackknife;
const Vector = require('./jackknife/vector').Vector;
const Sample = require('./jackknife/sample').Sample;
const { parsePointsNames } = require('../../../../framework/utils');

const { performance } = require('perf_hooks');

class Recognizer extends AbstractDynamicRecognizer {

  static name = "JackknifeRecognizer";

  constructor(options, dataset) {
    super();
    this.N = options.samplingPoints;
    this.selectedPoints = parsePointsNames(options.points);
    let blades = new jackknife_blades();
    blades.set_ip_defaults();
    blades.resample_cnt = this.N;
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
    let t0 = performance.now();
    let ret = this.jackknifeRecognizer.classify(jackknifeSample);
    let t1 = performance.now();
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

  // TODO Code added for 3D TouchPad (is it still useful?)
//   for(let i = 0 ; i < Object.keys(sample.paths).length; i ++){
//     for(let y = 0; y < selectedPoints.length ; y++){
//       if(sample.paths[selectedPoints[y][i]] !== undefined){
//         selectedPoints = selectedPoints[y]
//         y = selectedPoints.length
//         i = sample.paths.length
//       }
//     }
//   }

  let nStrokes = sample.paths[selectedPoints[0]].strokes.length;
  let trajectory = [];

  for (let i = 0; i < nStrokes; i++) {
    let nFrames = sample.paths[selectedPoints[0]].strokes[i].points.length;
    for (let j = 0; j < nFrames; j++) {
      let vCoordinates = [];
      for (const articulation of selectedPoints) {
        let point = sample.paths[articulation].strokes[i].points[j];
        vCoordinates.push(...point.getCoordinates());
      }
      trajectory.push(new Vector(vCoordinates));
    }
  }
  
  jackknifeSample.add_trajectory(trajectory);
  return jackknifeSample;
}

module.exports = Recognizer;