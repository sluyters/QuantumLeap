const AbstractSegmenter = require('../../../framework/segmenters/abstract-segmenter').AbstractSegmenter;
const StrokeData = require('../../../framework/gestures/stroke-data').StrokeData;
const Stroke = require('../../../framework/gestures/stroke-data').Stroke;
const Path = require('../../../framework/gestures/stroke-data').Path;
const { parsePointsNames } = require('../../../framework/utils');

const xBound = 120;
const yBound = 1000;
const zBound = 60;

class Segmenter extends AbstractSegmenter {
  constructor(options) {
    super(options);
    this.minFrames = options.minSegmentLength;
    this.maxFrames = options.maxSegmentLength;
    this.numberPauseFrames = options.pauseLength;
    this.monitoredArticulations = parsePointsNames(options.monitoredArticulations);
    this.strokeData = null;
    this.pauseCount = 0;
  }

  segment(frame) {
    // Increment pause count
    this.pauseCount = Math.max(this.pauseCount - 1, 0);
    if (this.pauseCount != 0) {
      return null;
    }
    if (isWithinBounds(frame, this.monitoredArticulations)) {
      // At least one articulation is in the zone
      if (this.frameCount >= this.maxFrames) {
        // Max number of frames reached
        let oldStrokeData = this.strokeData;
        this.strokeData = null;
        this.frameCount = 0;
        return oldStrokeData;
      }
      if (this.strokeData === null) {
        // Initialize strokeData
        this.strokeData = new StrokeData();
        for (const articulation of frame.articulations) {
          let path = new Path(articulation.label);
          this.strokeData.addPath(articulation.label, path);
          let stroke = new Stroke();
          path.addStroke(stroke);
          stroke.addPoint(articulation.point);
        }
      } else {
        for (const articulation of frame.articulations) {
          let path = this.strokeData.paths[articulation.label];
          let stroke = path.strokes[0];
          stroke.addPoint(articulation.point);
        }
      }
      this.frameCount++;
    } else if (this.frameCount > this.minFrames) {
      // Hands outside of the zone & enough frames
      let oldStrokeData = this.strokeData;
      this.strokeData = null;
      this.frameCount = 0;
      return oldStrokeData;
    } else {
      // Hands outside of the zone and not enough frames
      this.strokeData = null;
      this.frameCount = 0;
    }
    return null;
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