const AbstractSegmenter = require('../../../framework/modules/segmenters/abstract-segmenter').AbstractSegmenter;
const { Machete } = require('./machete/machete');
const { Sample } = require('./machete/sample');
const { Vector } = require('./machete/vector');
const { ContinuousResult, ContinuousResultOptions }= require ('./machete/continuous_result_options');
const { parsePointsNames } = require('../../../framework/utils');
const CBuffer = require('cbuffer');

class Segmenter extends AbstractSegmenter {
  constructor(options, dataset) {
    super(options);
    // this.numberIntervalFrames = options.moduleSettings.intervalLength;
    // this.numberPauseFrames = options.moduleSettings.pauseLength;
    // this.windows = options.moduleSettings.windows;
    // // Init frame buffers
    // this.frameBuffers = [];
    // this.windows.forEach(window => {
    //   this.frameBuffers.push([]);
    // });
    // this.intervalCount = 0;
    // this.pauseCount = 0;

    this.numberPauseFrames = 60;// options.moduleSettings.pauseLength;

    this.monitoredArticulations = parsePointsNames(options.moduleSettings.monitoredArticulations);
    this.cancelIfBetterScore = false;
    let crOptions =  new ContinuousResultOptions();
    crOptions.latencyFrameCount = 1;
    this.macheteSegmenter = new Machete(undefined, crOptions);

    if (dataset !== undefined) {
      dataset.getGestureClasses().forEach((gesture) => {
        gesture.getSamples().forEach(sample => {
          this.addGesture(gesture.name, sample);
        }
        );
      });
    }

    // Circular frame buffer (TODO size should depend on Machete's buffer)
    this.fb = new CBuffer(300);
    // Index of the oldest frame in the buffer
    this.fbStart = 0;
    // Index of the newest frame in the buffer
    this.fbEnd = 0;
    this.pauseCount = 0;
  }

  addGesture(name, sample) {
    let macheteSample = convert(sample, this.monitoredArticulations, name);
    if (macheteSample) {
      this.macheteSegmenter.addSample(macheteSample, false);
    }
  }

  removeGesture(name) {
    // TODO (modify Machete source code)
  }

  computeSegments(frame) {
    let segments = [];
    // Decrement pause count
    this.pauseCount = Math.max(this.pauseCount - 1, 0);
    
    if (frame.hasData) {
      // Update frame buffer
      if (this.fb.isFull()) {
        this.fbStart++;
      }
      this.fb.push(frame);
      // Create vector with selected points 
      let vCoordinates = [];
      for (const articulation of this.monitoredArticulations) {
        vCoordinates.push(...frame.getArticulation(articulation).point.getCoordinates());
      }
      let vector = new Vector(vCoordinates);
      // Attempt segmentation
      let continuousResults = this.macheteSegmenter.doTheThing(vector, this.fbEnd++);
      let result = ContinuousResult.selectResult(continuousResults, this.cancelIfBetterScore);
      if (result !== null && this.pauseCount === 0) {
        let frames = this.fb.slice(result.startFrameNo - this.fbStart, result.endFrameNo - this.fbStart + 1);
        segments.push(frames);
      }
    }
    return segments;
  }

  notifyRecognition() {
    this.pauseCount = this.numberPauseFrames;
  }
}

function convert(sample, selectedPoints, name) {
  let macheteSample;
  // TODO
  if (name) {
    // TODO
    macheteSample = new Sample(0, name, 0);
  } else {
    macheteSample = new Sample();
  }
  let nFrames = sample.paths[selectedPoints[0]].strokes[0].points.length;
  let trajectory = [];
  for (let i = 0; i < nFrames; i++) {
    let vCoordinates = [];
    for (const articulation of selectedPoints) {
      let point = sample.paths[articulation].strokes[0].points[i];
      vCoordinates.push(...point.getCoordinates())
    }
    trajectory.push(new Vector(vCoordinates));
  }
  macheteSample.addTrajectory(trajectory);
  return macheteSample;
}

module.exports = Segmenter;