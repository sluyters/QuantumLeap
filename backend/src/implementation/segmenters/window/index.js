const AbstractSegmenter = require('../../../framework/modules/segmenters/abstract-segmenter').AbstractSegmenter;

class Segmenter extends AbstractSegmenter {
  constructor(options, dataset) {
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

  addGesture(name, sample) {
    // Do nothing
  }

  removeGesture(name) {
    // Do nothing
  }

  computeSegments(frame) {
    let segments = [];
    // Decrement pause count
    this.pauseCount = Math.max(this.pauseCount - 1, 0);
    this.intervalCount = (this.intervalCount + 1) % this.numberIntervalFrames;
    this.frameBuffers.forEach((frameBuffer, index) => {
      let windowWidth = this.windows[index].width;
      // Add new frame to the buffer
      frameBuffer.push(frame);
      if (frameBuffer.length > windowWidth) {
        // Shift frames in buffer
        frameBuffer.shift();
      }
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