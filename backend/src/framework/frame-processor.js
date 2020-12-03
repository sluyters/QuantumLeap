const RingBuffer = require('ringbufferjs');
const { initDataset } = require('./datasets/init-datasets');

class FrameProcessor {
  constructor(config) {
    // Fetch configs
    this.analyzerModule = config.analyzersSettings.modules[0];
    this.segmenterModule = config.segmentersSettings.modules[0];
    this.recognizerModule = config.recognizersSettings.modules[0];
    this.classifierModule = config.classifiersSettings.modules[0];
    // Initialize analyzer, segmenter, datasets, recognizer and classifier
    this.analyzer = new this.analyzerModule.module(this.analyzerModule.moduleSettings);
    this.segmenter = new this.segmenterModule.module(this.segmenterModule.moduleSettings);
    this.gestureDataset = initDataset('gesture', config.sensorsSettings, config.gestureDatasetsSettings);
    this.poseDataset = initDataset('pose', config.sensorsSettings, config.poseDatasetsSettings);
    if (config.recognizersSettings.loadOnRequest) {
      this.recognizer = new this.recognizerModule.module(this.recognizerModule.moduleSettings);
    } else {
      this.recognizer = new this.recognizerModule.module(this.recognizerModule.moduleSettings, this.gestureDataset);
    }
    if (config.classifiersSettings.loadOnRequest) {
      this.classifier = new this.classifierModule.module(this.classifierModule.moduleSettings);
    } else {
      this.classifier = new this.classifierModule.module(this.classifierModule.moduleSettings, this.poseDataset);
    }
    // Keep track of enabled poses and gestures
    this.enabledPoses = [];
    this.enabledGestures = [];
    // Initialize pose buffer
    this.poseBuffer = new RingBuffer(config.classifiersSettings.bufferLength);
    this.poseCounter = {};
    // Save config
    this.config = config;
  }

  resetContext() {
    if (this.config.recognizersSettings.loadOnRequest) {
      this.recognizer = new this.recognizerModule.module(this.recognizerModule.moduleSettings);
    }
    if (this.config.classifiersSettings.loadOnRequest) {
      this.classifier = new this.classifierModule.module(this.classifierModule.moduleSettings);
    }
    this.enabledPoses = [];
    this.enabledGestures = [];
  }

  enablePose(name) {
    if (!this.enabledPoses.includes(name)) {
      // The pose is not already enabled
      if (this.config.classifiersSettings.loadOnRequest) {
        let gestureClass = this.poseDataset.getGestureClasses().get(name);
        if (gestureClass) {
          for (const template of gestureClass.getSamples()) {
            this.classifier.addPose(name, template);
          }
        } else {
          console.error(`No pose class in the dataset with name '${name}'`);
        }
      }
      this.enabledPoses.push(name);
    }
  }

  enableGesture(name) {
    if (!this.enabledGestures.includes(name)) {
      // The gesture is not already enabled
      if (this.config.recognizersSettings.loadOnRequest) {
        let gestureClass = this.gestureDataset.getGestureClasses().get(name);
        if (gestureClass) {
          for (const template of gestureClass.getSamples()) {
            this.recognizer.addGesture(name, template);
          }
        } else {
          console.error(`No gesture class in the dataset with name '${name}'`);
        }
      }
      this.enabledGestures.push(name);
    }
  }

  disablePose(name) {
    var index = this.enabledPoses.indexOf(name);
    if (index > -1) {
      // The pose was enabled, disable it
      this.enabledPoses.splice(index, 1);
      if (this.config.classifiersSettings.loadOnRequest) {
        this.classifier.removePose(name);
      }
    }
  }

  disableGesture(name) {
    var index = this.enabledGestures.indexOf(name);
    if (index > -1) {
      // The gesture was enabled, disable it
      this.enabledGestures.splice(index, 1);
      if (this.config.recognizersSettings.loadOnRequest) {
        this.recognizer.removeGesture(name);
      }
    }
  }

  processFrame(frame) {
    // Get pose and data from the pose buffer
    let oldPoseInfo = "";
    let oldPoseRatio = 0;
    if (this.poseBuffer.isFull()) {
      oldPoseInfo = this.poseBuffer.deq();
      if (oldPoseInfo.pose) {
        oldPoseRatio = this.poseCounter[oldPoseInfo.pose]-- / this.config.classifiersSettings.bufferLength;
      }
    }
    let staticPose = "";
    try {
      staticPose = this.classifier.classify(frame).name;
    } catch (error) {
      console.error(`Classifier error: ${error}`);
    }
    let newPoseInfo = { pose: "", data: "" };
    if (staticPose && (!this.config.classifiersSettings.sendIfRequested || this.enabledPoses.includes(staticPose))) {
      newPoseInfo = { pose: staticPose, data: this.analyzer.analyze(frame) };
      if (!this.poseCounter.hasOwnProperty(staticPose)) {
        this.poseCounter[staticPose] = 1;
      } else {
        this.poseCounter[staticPose]++;
      }
    }
    this.poseBuffer.enq(newPoseInfo);
    if (oldPoseInfo.pose) {
      if (oldPoseRatio > this.config.classifiersSettings.poseRatioThreshold) {
        // Static pose detected
        this.segmenter.notifyRecognition();
        return { 'type': 'static', 'name': oldPoseInfo.pose, 'data': oldPoseInfo.data };
      }
    } else {
      // Reset analyzer
      this.analyzer.reset();
      // Try to segment and recognize dynamic gesture
      let segment = this.segmenter.segment(frame);
      if (segment) {
        let name = "";
        try {
          name = this.recognizer.recognize(segment).name;
        } catch (error) {
          console.error(`Recognizer error: ${error}`);
        }
        if (name && (!this.config.recognizersSettings.sendIfRequested || this.enabledGestures.includes(name))) {
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