const RingBuffer = require('ringbufferjs');
const { initDataset } = require('./datasets/init-datasets');

class FrameProcessor {
  constructor(config) {
    // Initialize analyzer
    let analyzerModule = config.analyzers.modules[0];
    this.analyzer = new analyzerModule.module(analyzerModule.moduleSettings);
    // Initialize segmenter
    let segmenterModule = config.segmenters.modules[0];
    this.segmenter = new segmenterModule.module(segmenterModule.moduleSettings);
    // Initialize datasets and recognizers
    this.datasets = {}
    this.recognizers = {};
    this.enabledGestures = {};
    for (let type of ['static', 'dynamic']) {
      // Initialize dataset
      this.datasets[type] = initDataset(type, config.sensors, config.datasets[type]);
      // Initialize recognizer
      let recognizerModule = config.recognizers[type].modules[0];
      if (config.recognizers[type].loadOnRequest) {
        this.recognizers[type] = new recognizerModule.module(recognizerModule.moduleSettings);
      } else {
        this.recognizers[type] = new recognizerModule.module(recognizerModule.moduleSettings, this.datasets[type]);
      }
      // Keep track of the enabled gestures
      this.enabledGestures[type] = [];
    }
    // Initialize buffer for static gestures
    this.sgBuffer = new RingBuffer(config.recognizers.static.bufferLength);
    this.sgCounter = {};
    // Save config
    this.config = config;
  }

  resetContext() {
    for (let type of ['static', 'dynamic']) {
      let recognizerModule = this.config.recognizers[type].modules[0];
      if (this.config.recognizers[type].loadOnRequest) {
        this.recognizers[type] = new recognizerModule.module(recognizerModule.moduleSettings);
      }
      this.enabledGestures[type] = [];
    }
  }

  enableGesture(type, name) {
    if (!this.enabledGestures[type].includes(name)) {
      // The gesture  is not already enabled
      if (this.config.recognizers[type].loadOnRequest) {
        let gestureClass = this.datasets[type].getGestureClasses().get(name);
        if (gestureClass) {
          for (const template of gestureClass.getSamples()) {
            this.recognizers[type].addGesture(name, template);
          }
        } else {
          console.error(`No ${type} gesture class in the dataset with name '${name}'`);
        }
      }
      this.enabledGestures[type].push(name);
    }
  }

  disableGesture(type, name) {
    var index = this.enabledGestures[type].indexOf(name);
    if (index > -1) {
      // The gesture  was enabled, disable it
      this.enabledGestures[type].splice(index, 1);
      if (this.config.recognizers[type].loadOnRequest) {
        this.recognizers[type].removeGesture(name);
      }
    }
  }

  processFrame(frame) {
    // Get static gesture and data from the static gesture buffer
    let prevSgInfo = '';
    let prevSgRatio = 0;
    if (this.sgBuffer.isFull()) {
      prevSgInfo = this.sgBuffer.deq();
      if (prevSgInfo.gesture) {
        prevSgRatio = this.sgCounter[prevSgInfo.gesture]-- / this.config.recognizers.static.bufferLength;
      }
    }
    let sg = '';
    try {
      sg = this.recognizers.static.recognize(frame).name;
    } catch (error) {
      console.error(`Static gesture recognizer error: ${error}`);
    }
    let newSgInfo = { 
      gesture: '', 
      data: '' 
    };
    if (sg && (!this.config.recognizers.static.sendIfRequested || this.enabledGestures.static.includes(sg))) {
      newSgInfo = { gesture: sg, data: this.analyzer.analyze(frame) };
      if (!this.sgCounter.hasOwnProperty(sg)) {
        this.sgCounter[sg] = 1;
      } else {
        this.sgCounter[sg]++;
      }
    }
    this.sgBuffer.enq(newSgInfo);
    if (prevSgInfo.gesture) {
      if (prevSgRatio > this.config.recognizers.static.poseRatioThreshold) {
        // Static gesture detected
        this.segmenter.notifyRecognition();
        return { 'type': 'static', 'name': prevSgInfo.gesture, 'data': prevSgInfo.data };
      }
    } else {
      // Reset analyzer
      this.analyzer.reset();
      // Try to segment and recognize dynamic gesture
      let segment = this.segmenter.segment(frame);
      if (segment) {
        let name = '';
        try {
          name = this.recognizers.dynamic.recognize(segment).name;
        } catch (error) {
          console.error(`Dynamic gesture recognizer error: ${error}`);
        }
        if (name && (!this.config.recognizers.dynamic.sendIfRequested || this.enabledGestures.dynamic.includes(name))) {
          this.segmenter.notifyRecognition();
          return { 'type': 'dynamic', 'name': name, 'data': {} };
        }
      }
    }
    // Nothing detected
    return null;
  }
}

module.exports = {
  FrameProcessor
}