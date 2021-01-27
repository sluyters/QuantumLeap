const AbstractSegmenter = require('../../../framework/modules/segmenters/abstract-segmenter').AbstractSegmenter;
const { parsePointsNames } = require('../../../framework/utils');

class Segmenter extends AbstractSegmenter {
  constructor(options) {
    super(options);
    let thresholds = options.moduleSettings.thresholds.map((threshold) => {
      return {
        point: parsePointsNames(threshold.point)[0],
        property: threshold.property,
        min: threshold.lowerBound,
        max: threshold.upperBound,
        abs: threshold.abs,
      };
    })
    this.frameBuffer = [];
    let mode = options.moduleSettings.mode;
    
    this.checkThresholds = (frame) => {
      let ret = mode === 'and' ? true : false; 
      for (let i = 0; i < thresholds.length; i++) {
        let threshold = thresholds[i];
        // Get point value
        let point = frame.getArticulation(threshold.point).point;
        let value = point[property]; // TODO change when better representation of the points
        // If abs, get absolute value
        if (threshold.abs) {
          value = Math.abs(value);
        }
        // Check value against threshold
        if (mode === 'and') {
          ret = ret && compare(threshold.min, threshold.max, value);
          if (!ret) {
            return ret;
          }
        } else {
          ret = ret || compare(threshold.min, threshold.max, value);
          if (ret) {
            return ret;
          }
        }
      }
      return ret;
    }
  }

  computeSegments(frame) {
    if (this.checkThresholds(frame)) {
      // The value(s) reach the threshold
      this.frameBuffer.push(frame);
    } else if (this.frameBuffer.length > 0 ) {
      // The value(s) no longer reach the threshold
      let frames = this.frameBuffer;
      this.frameBuffer = [];
      return [ frames ]; 
    }
    return [];
  }

  notifyRecognition() {
    // Do nothing
  }
}

function compare(min, max, a) {
  if (min !== null && min !== undefined && a < min) {
    return false;
  }
  if (max !== null && max !== undefined && a > max) {
    return false;
  }
  return true;
}

module.exports = Segmenter;