const AbstractSegmenter = require('../../../framework/segmenters/abstract-segmenter').AbstractSegmenter;

class Segmenter extends AbstractSegmenter {
  constructor(options) {
    super(options);
    this.numberIntervalFrames = options.moduleSettings.intervalLength;
    this.numberPauseFrames = options.moduleSettings.pauseLength;
    this.windows = options.moduleSettings.windows;
    // Init frame buffers
    this.frameBuffers = [];
    this.windows.forEach(window => {
      this.frameBuffers.push([]);
    });
    this.intervalCount = 0;
    this.pauseCount = 0;
  }

  computeSegments(frame) {
    let segments = [];
    this.frameBuffers.forEach((frameBuffer, index) => {
      let windowWidth = this.windows[index].width;
      // Add new frame to the buffer
      frameBuffer.push(frame);
      if (frameBuffer.length > windowWidth) {
        // Shift frames in buffer
        frameBuffer.shift();
      }
      // Increment pause count
      this.pauseCount = Math.max(this.pauseCount - 1, 0);
      this.intervalCount = (this.intervalCount + 1) % this.numberIntervalFrames;
      if (frameBuffer.length >= windowWidth && this.pauseCount == 0 && this.intervalCount == 0) {
        // Buffer full & ready
        segments.push(frameBuffer.slice());
      }
    });
    return segments;
  }

  notifyRecognition() {
    this.pauseCount = this.numberPauseFrames;
  }
}

module.exports = Segmenter;