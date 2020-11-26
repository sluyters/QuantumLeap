const GestureSet = require('./gestures/gesture-set').GestureSet;
const GestureClass = require('./gestures/gesture-class').GestureClass;
const RingBuffer = require('ringbufferjs');
const path = require('path'); // TODO improve

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
    this.gestureDataset = initDataset('gesture', config.gestureDatasetsSettings);
    this.poseDataset = initDataset('pose', config.poseDatasetsSettings);
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

function initDataset(type, datasetConfig) {
  let datasets = [];
  // Load the datasets
  datasetConfig.modules.forEach(datasetLoaderModule => {
    let datasetLoader = datasetLoaderModule.module;
    let datasetName = datasetLoaderModule.additionalSettings.datasets[0];
    let datasetPath = path.resolve(__dirname, '../datasets', type, datasetName);
    datasets.push(datasetLoader.loadDataset(datasetName, datasetPath));
  });
  let newDataset = new GestureSet('GestureSet');
  // Select/aggregate/rename classes of the dataset if required
  if (datasetConfig.aggregateClasses && datasetConfig.aggregateClasses.length != 0) {
    datasetConfig.aggregateClasses.forEach((aggregate, index) => {
      // Aggregate gesture class
      let newGestureClass = new GestureClass(aggregate.name, index);
      let templates = [];
      // Fuse the classes into a new aggregate class
      for (const className of aggregate.classes) {
        datasets.forEach(dataset => {
          let oldClass = dataset.getGestureClasses().get(className);
          if (oldClass) {
            templates = templates.concat(templates, oldClass.getSamples());
          }
        });
      }
      // Select a number of templates from the dataset if required
      if (datasetConfig.templatesPerClass > 0) {
        templates = getRandomSubarray(templates, datasetConfig.templatesPerClass);
      }
      // Add the templates to the new gesture class
      for (template of templates) {
        newGestureClass.addSample(template);
      }
      // Add the aggregate class to the new dataset
      newDataset.addGestureClass(newGestureClass);
    });
    return newDataset
  } else {
    // Get names of all gesture classes
    datasets.forEach(dataset => {
      dataset.getGestureClasses().forEach(gestureClass => {
        let newGestureClass = newDataset.getGestureClasses().get(gestureClass.name);
        if (!newGestureClass) {
          newGestureClass = new GestureClass(gestureClass.name, gestureClass.index);;
        }
        let templates = gestureClass.getSamples();
        // Select a number of templates from the dataset if required
        if (datasetConfig.templatesPerClass > 0) {
          templates = getRandomSubarray(templates, datasetConfig.templatesPerClass);
        }
        // Add the templates to the new gesture class
        for (template of templates) {
          newGestureClass.addSample(template);
        }
        newDataset.addGestureClass(newGestureClass);
      });
    });
    return newDataset;
  }
}

// https://stackoverflow.com/questions/11935175/sampling-a-random-subset-from-an-array
function getRandomSubarray(arr, size) {
  if (size > arr.length) {
    console.log("Not enough templates!")
    return arr;
  }
  var shuffled = arr.slice(0), i = arr.length, min = i - size, temp, index;
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(min);
}

module.exports = {
  FrameProcessor
}