const AbstractSegmenter = require('../../../framework/modules/segmenters/abstract-segmenter').AbstractSegmenter;

class Segmenter extends AbstractSegmenter {
  constructor(options, dataset) {
    super({
      additionalSettings: {
        motionThreshold: 0.0,
        motionArticulations: {} 
      }
    });
  }

  addGesture(name, sample) {
    // Do nothing
  }

  removeGesture(name) {
    // Do nothing
  }

  computeSegments(frame) {
    return [];
  }

  notifyRecognition() {
    // Do nothing
  }
}

module.exports = Segmenter;