const AbstractSegmenter = require('../../../framework/segmenters/abstract-segmenter').AbstractSegmenter;

class Segmenter extends AbstractSegmenter {
  constructor(options) {
    super(options);
    this.windowWidth = options.moduleSettings.windowWidth;
    this.numberIntervalFrames = options.moduleSettings.intervalLength;
    this.numberPauseFrames = options.moduleSettings.pauseLength;
    this.frameBuffer = [];
    this.intervalCount = 0;
    this.pauseCount = 0;
  }

  computeSegments(frame) {
    // Add new frame to the buffer
    this.frameBuffer.push(frame);
    if (this.frameBuffer.length > this.windowWidth) {
      // Shift frames in buffer
      this.frameBuffer.shift();
    }
    // Increment pause count
    this.pauseCount = Math.max(this.pauseCount - 1, 0);
    this.intervalCount = (this.intervalCount + 1) % this.numberIntervalFrames;
    if (this.frameBuffer.length >= this.windowWidth && this.pauseCount == 0 && this.intervalCount == 0) {
      // Buffer full & ready
      return [ this.frameBuffer.slice() ];
    }
    return [];
  }

  notifyRecognition() {
    this.pauseCount = this.numberPauseFrames;
  }
}

module.exports = Segmenter;