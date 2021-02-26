const AbstractSegmenter = require('../../../framework/modules/segmenters/abstract-segmenter').AbstractSegmenter;
const { Machete } = require('./machete/machete');
const { Sample } = require('./machete/sample');
const { Vector } = require('./machete/vector');
const { ContinuousResult, ContinuousResultOptions }= require ('./machete/continuous_result_options');
const { parsePointsNames } = require('../../../framework/utils');

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

    // TODO
    this.frameBuffer = [];
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
    // Create vector with selected points 
    if (frame.hasData) {
      let vCoordinates = [];
      for (const articulation of this.monitoredArticulations) {
        vCoordinates.push(...frame.getArticulation(articulation).point.getCoordinates());
      }
      let vector = new Vector(vCoordinates);
      let continuousResults = this.macheteSegmenter.doTheThing(vector, frame.timestamp);
      let result = ContinuousResult.selectResult(continuousResults, this.cancelIfBetterScore);
      //console.log(continuousResults, result)
      if (result !== null) {
        console.log(result);
        // TODO
      }
    }
    // // Increment pause count
    // this.pauseCount = Math.max(this.pauseCount - 1, 0);
    // this.intervalCount = (this.intervalCount + 1) % this.numberIntervalFrames;
    // this.frameBuffers.forEach((frameBuffer, index) => {
    //   let windowWidth = this.windows[index].width;
    //   // Add new frame to the buffer
    //   frameBuffer.push(frame);
    //   if (frameBuffer.length > windowWidth) {
    //     // Shift frames in buffer
    //     frameBuffer.shift();
    //   }
    //   if (frameBuffer.length >= windowWidth && this.pauseCount == 0 && this.intervalCount == 0) {
    //     // Buffer full & ready
    //     segments.push(frameBuffer.slice());
    //   }
    // });
    return segments;
  }

  notifyRecognition() {
    // TODO
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