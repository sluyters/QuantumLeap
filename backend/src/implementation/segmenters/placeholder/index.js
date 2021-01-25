const AbstractSegmenter = require('../../../framework/modules/segmenters/abstract-segmenter').AbstractSegmenter;

class Segmenter extends AbstractSegmenter {
  constructor(options) {
    super({
      additionalSettings: {
        motionThreshold: 0.0,
        motionArticulations: {} 
      }
    });
  }

  computeSegments(frame) {
    return [];
  }

  notifyRecognition() {
    // Do nothing
  }
}

module.exports = Segmenter;