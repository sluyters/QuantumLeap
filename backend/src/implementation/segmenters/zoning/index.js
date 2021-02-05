const AbstractSegmenter = require('../../../framework/modules/segmenters/abstract-segmenter').AbstractSegmenter;
const { parsePointsNames } = require('../../../framework/utils');

const xBound = 120;
const yBound = 1000;
const zBound = 60;

class Segmenter extends AbstractSegmenter {
  constructor(options, dataset) {
    super(options);
    this.minFrames = options.moduleSettings.minSegmentLength;
    this.maxFrames = options.moduleSettings.maxSegmentLength;
    this.numberPauseFrames = options.moduleSettings.pauseLength;
    this.monitoredArticulations = parsePointsNames(options.moduleSettings.monitoredArticulations);
    this.frameBuffer = [];
    this.pauseCount = 0;
  }

  addGesture(name, sample) {
    // Do nothing
  }

  removeGesture(name) {
    // Do nothing
  }

  computeSegments(frame) {
    // Increment pause count
    this.pauseCount = Math.max(this.pauseCount - 1, 0);
    if (this.pauseCount != 0) {
      return [];
    }
    if (isWithinBounds(frame, this.monitoredArticulations)) {
      // At least one articulation is in the zone
      if (this.frameBuffer.length >= this.maxFrames) {
        // Max number of frames reached
        let frames = this.frameBuffer;
        this.frameBuffer = [];
        return [ frames ];
      }
      this.frameBuffer.push(frame);
    } else if (this.frameBuffer.length > this.minFrames) {
      // Hands outside of the zone & enough frames
      let frames = this.frameBuffer;
      this.frameBuffer = [];
      return [ frames ];
    } else {
      // Hands outside of the zone and not enough frames
      this.frameBuffer = [];
    }
    return [];
  }

  notifyRecognition() {
    this.pauseCount = this.numberPauseFrames;
  }
}

function isWithinBounds(frame, articulations) {
  if (frame.hasData) {
    for (const articulation of articulations) {
      let x = frame.getArticulation(articulation).point.x;
      let y = frame.getArticulation(articulation).point.y;
      let z = frame.getArticulation(articulation).point.z;
      let withinBounds = x < xBound && x > -xBound && y < yBound && y > -yBound && z < zBound && z > -zBound;
      if (withinBounds) {
        return true;
      }
    }
  }
  return false;
}

module.exports = Segmenter;