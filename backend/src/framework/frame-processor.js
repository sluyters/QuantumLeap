const RingBuffer = require('ringbufferjs');
const { initDataset } = require('./modules/datasets/init-datasets');

class FrameProcessor {
  constructor(config) {
    let framerate =  config.sensors.framerate;
    // Initialize filter
    let filterModule = config.filters.modules[0];
    this.filter = new filterModule.module(framerate, filterModule.moduleSettings);
    // Initialize analyzer
    let analyzerModule = config.analyzers.modules[0];
    this.analyzer = new analyzerModule.module(analyzerModule.moduleSettings);
    // Initialize datasets and recognizers
    this.datasets = {}
    this.scoreThresholds = {};
    this.recognizers = {};
    this.enabledGestures = {};
    for (let type of ['static', 'dynamic']) {
      // Initialize dataset
      this.datasets[type] = initDataset(type, config.sensors, config.datasets[type]);
      // Define thresholds (TODO option to compute threshold automatically per class)
      this.scoreThresholds[type] = config.recognizers[type].scoreThreshold;
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
    // Initialize segmenter
    let segmenterModule = config.segmenters.modules[0];
    if (config.recognizers.dynamic.loadOnRequest) {
      this.segmenter = new segmenterModule.module(segmenterModule);
    } else {
      this.segmenter = new segmenterModule.module(segmenterModule, this.datasets.dynamic);
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
    if (this.config.recognizers.dynamic.loadOnRequest) {
      this.segmenter = new segmenterModule.module(segmenterModule);
    }
  }

  enableGesture(type, name) {
    if (!this.enabledGestures[type].includes(name)) {
      // The gesture  is not already enabled
      if (this.config.recognizers[type].loadOnRequest) {
        let gestureClass = this.datasets[type].getGestureClasses().get(name);
        if (gestureClass) {
          for (const template of gestureClass.getSamples()) {
            try {
              this.recognizers[type].addGesture(name, template);
            } catch(error) {
              console.error(`Gesture recognizer (${type}) error while adding a template for gesture '${name}': ${error.stack}`);
            }
            if (type === 'dynamic') {
              try {
                this.segmenter.addGesture(name, template);
              } catch(error) {
                console.error(`Gesture segmenter error while adding a template for gesture '${name}': ${error.stack}`);
              }
            }
          }
        } else {
          console.error(`No ${type} gesture class in the dataset with name '${name}'`);
        }
      }
      console.log(name)
      this.enabledGestures[type].push(name);
    }
  }

  disableGesture(type, name) {
    var index = this.enabledGestures[type].indexOf(name);
    if (index > -1) {
      // The gesture  was enabled, disable it
      this.enabledGestures[type].splice(index, 1);
      if (this.config.recognizers[type].loadOnRequest) {
        try {
          this.recognizers[type].removeGesture(name);
        } catch(error) {
          console.error(`Gesture recognizer (${type}) error while removing gesture '${name}': ${error.stack}`);
        }
      }
    }
    if (this.config.recognizers.dynamic.loadOnRequest) {
      try {
        this.segmenter.removeGesture(name);
      } catch(error) {
        console.error(`Gesture segmenter error while removing gesture '${name}': ${error.stack}`);
      }
    }
  }

  // Pipeline methods

  filterFrame(frame) {
    try {
      frame = this.filter.filter(frame);
    } catch (error) {
      console.error(`Filter error: ${error.stack}`);
    }
    return frame;
  }

  recognizeStatic(frame) {
    // Recognize the static gesture
    let sg = '';
    try {
      let { name, score, time } = this.recognizers.static.recognize(frame);
      if (score >= this.scoreThresholds.static) {
        sg = name;
      }
    } catch (error) {
      console.error(`Static gesture recognizer error: ${error.stack}`);
    }
    // Compute the ratio of gesture in the buffer and increment the counter
    let sgRatio = 0;
    if (this.sgCounter[sg]) {
      sgRatio = this.sgCounter[sg]++ / this.sgBuffer.size();
    } else {
      this.sgCounter[sg] = 1;
    }
    // Remove the oldest gesture from the buffer
    if (this.sgBuffer.isFull()) {
      let oldSg = this.sgBuffer.deq();
      this.sgCounter[oldSg]--;
    }
    // Add the new gesture to the buffer
    this.sgBuffer.enq(sg);
    // If the gesture does not reach the threshold, replace it by the previous one that did
    if (sgRatio < this.config.recognizers.static.poseRatioThreshold) {
      sg = '';
    } 
    return sg;
  }

  analyze(frame) {
    let data = '';
    try {
      data = this.analyzer.analyze(frame);
    } catch (error) {
      console.error(`Analyzer error: ${error.stack}`);
    }
    return data;
  }

  segment(frame) {
    let segments = [];
    try {
      segments = this.segmenter.segment(frame);
    } catch (error) {
      console.error(`Segmenter error: ${error.stack}`);
    }
    return segments;
  }

  recognizeDynamic(segments) {
    let bestName = '';
    let bestScore = -1;
    // For each segment, attempt to recognize the gesture
    segments.forEach(segment => {
      try {
        // Recognize the gesture
        let { name, score, time } = this.recognizers.dynamic.recognize(segment);
        // Keep the gesture with the highest score
        if (score && score > bestScore) {
          bestName = name;
          bestScore = score;
        }
      } catch (error) {
        console.error(`Dynamic gesture recognizer error: ${error.stack}`);
      }
    });
    if (bestScore >= this.scoreThresholds.dynamic) {
      return bestName;
    } else {
      return '';
    }
  }

  processFrame(frame) {
    frame = this.filterFrame(frame);
    let sg = this.recognizeStatic(frame);

    if (sg && (!this.config.recognizers.static.sendIfRequested || this.enabledGestures.static.includes(sg))) {
      // Static gesture detected
      let data = this.analyze(frame);
      this.segmenter.notifyRecognition();
      return { type: 'static', name: sg, data: data };
    } else {
      // No static gesture detected
      this.analyzer.reset();
      let segments = this.segment(frame);
      let dg = this.recognizeDynamic(segments);
      if (dg && (!this.config.recognizers.dynamic.sendIfRequested || this.enabledGestures.dynamic.includes(dg))) {
        // Static gesture detected
        this.segmenter.notifyRecognition();
        return { type: 'dynamic', name: dg, data: {} };
      }
    }
    // Nothing detected
    return null;
  }
}

module.exports = {
  FrameProcessor
}