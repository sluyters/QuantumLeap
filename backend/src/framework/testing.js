const path = require('path');
const fs = require('fs');
const GestureSet = require('./gestures/gesture-set').GestureSet;
const GestureClass = require('./gestures/gesture-class').GestureClass;
const stringify = require('json-stringify-pretty-compact');
const { performance } = require('perf_hooks');
const LogHelper = require('./log-helper');

// Important values
const computeNextT = x => x * 2; // Function that computes the next number of training templates
// const computeNextT = x => (x < 16) ? (x * 2) : (x + 8); // Function that computes the next number of training templates


class Testing {
  constructor(recognizerType, config) {
    this.testingType = 'Testing';
    this.recognizerType = recognizerType;
    // Get datasets and recognizers
    console.log(config)
    this.datasets = config.datasets[recognizerType];
    this.recognizers = config.recognizers[recognizerType];
  }

  run() {
    LogHelper.log('info', `Starting testing (${this.testingType})`);
    let t0 = performance.now();
    let results = [];
    for (let i = 0; i < this.datasets.modules.length; i++) {
      let dataset = loadDataset(this.recognizerType, this.datasets);
      let datasetResults = {
        //r: this.r,
        dataset: dataset.name,
        gestures: Array.from(dataset.getGestureClasses().keys()),
        data: []
      };
      for (let j = 0; j < this.recognizers.modules.length; j++) {
        let recognizerModule = this.recognizers.modules[j];
        // Callback to display the progress of the testing to the user
        let printProgress = (recognizerProgress) => {
          let I = this.datasets.modules.length;
          let J = this.recognizers.modules.length
          let progress = 100 * (i/I + j/(I*J) + recognizerProgress/(I*J));
          let t1 = performance.now();
          let elapsedTime = t1 - t0;
          let remainingTime =  (elapsedTime / progress) * (100 - progress);
          process.stdout.write(`Progress - ${progress.toFixed(1)}% (${getTimeStr(remainingTime)} remaining)                      \r`);
        }
        let res = this.testRecognizer(dataset, recognizerModule, printProgress);
        datasetResults.data.push({
          name: recognizerModule.module.name,
          options: recognizerModule.moduleSettings,
          data: res
        });
      }
      results.push(datasetResults);
    }
    LogHelper.log('info', `Ending Testing (${this.testingType})`);
    fs.writeFileSync(`results-${this.recognizerType}-${this.testingType}.json`, stringify(results, {maxLength: 150, indend: 2}));
  }

  testRecognizer(dataset, recognizerModule) {
    throw new Error('You have to implement this function');
  }

  static getTestingScenarios(recognizerType, globalSettings) {
    let testingScenarios = [];
    globalSettings.general.testingParams.types.forEach(testingSettings => {
      switch (testingSettings.paramName) {
        case 'tts':
          testingScenarios.push(...TTSTesting.getTestingScenarios(recognizerType, testingSettings, globalSettings));
          break;
        case 'loocv':
          testingScenarios.push(...LOOCVTesting.getTestingScenarios(recognizerType, testingSettings, globalSettings));
          break;
        default:
          throw new Error(`Unknown testing type: ${testingSettings.paramName}.`);
      }
    });
    return testingScenarios;
  }
}


// Leave-One-Out Cross-Validation

class LOOCVTesting extends Testing {
  constructor(recognizerType, testingSettings, globalSettings) {
    super(recognizerType, globalSettings);
    this.testingType = 'Leave-One-Out Cross-Validation';
  }

  testRecognizer(dataset, recognizerModule, printProgress) {
    let results = [];

    let nTrials = 0;
    let res = {
      accuracy: 0.0,
      time: 0.0,
      confusionMatrix: []
    };
    res.confusionMatrix = new Array(dataset.G).fill(0).map(() => new Array(dataset.G).fill(0));

    let i = 0;
    dataset.getGestureClasses().forEach(gestureClass => {
      gestureClass.getSamples().forEach(testingSample => {
        // Train recognizer
        let recognizer = new recognizerModule.module(recognizerModule.moduleSettings);
        this.trainRecognizer(recognizer, dataset, testingSample);

        // Attempt recognition
        try {
          if (this.recognizerType === 'dynamic') {
            var result = recognizer.recognize(testingSample);
          } else {
            var result = recognizer.recognize(testingSample.frame);
          }
        } catch(err) {
          console.error(gestureClass.name, testingSample);
          throw err;
        }

        // Update the confusion matrix
        if (dataset.getGestureClasses().has(result.name)) {
          let resultIndex = dataset.getGestureClasses().get(result.name).index;
          res.confusionMatrix[gestureClass.index][resultIndex] += 1;
        }

        // Update execution time and accuracy
        res.accuracy += (result.name === gestureClass.name) ? 1 : 0;
        res.time += result.time;
  
        // Increment number of trials
        nTrials++;
      });

      // Compute and print progress
      let progress = i  / dataset.G;
      printProgress(progress);
      i++;
    });

    res.accuracy = res.accuracy / nTrials;
    res.time = res.time / nTrials;
    results.push(res);
    return results;
  }

  trainRecognizer(recognizer, dataset, testClassId, testSampleId) {
    throw new Error('You have to implement this function');
  }

  static getTestingScenarios(recognizerType, testingSettings, globalSettings) {
    let testingScenarios = [];
    testingSettings.paramSettings.modes.forEach(mode => {
      switch (mode.paramName) {
        case 'userDependent':
          testingScenarios.push(new LOOCVUDTesting(recognizerType, testingSettings, globalSettings));
          break;
        case 'userIndependent':
          testingScenarios.push(new LOOCVUITesting(recognizerType, testingSettings, globalSettings));
          break;
        case 'mixed':
          testingScenarios.push(new LOOCVMixedTesting(recognizerType, testingSettings, globalSettings));
          break;
        default:
          throw new Error(`Unknown testing mode for LOOCVTesting: ${mode.paramName}.`);
      }
    });
    return testingScenarios;
  }
}

class LOOCVUDTesting extends LOOCVTesting {
  constructor(recognizerType, testingSettings, globalSettings) {
    super(recognizerType, testingSettings, globalSettings);
    this.testingType = 'Leave-One-Out Cross-Validation User-Dependent';
  }

  trainRecognizer(recognizer, dataset, testingSample) {
    dataset.getGestureClasses().forEach(gestureClass => {
      gestureClass.getSamples().forEach(trainingSample => {
        if (trainingSample !== testingSample && trainingSample.user === testingSample.user) {
          recognizer.addGesture(gestureClass.name, trainingSample);
        }
      });
    });
  }
}

class LOOCVUITesting extends LOOCVTesting {
  constructor(recognizerType, testingSettings, globalSettings) {
    super(recognizerType, testingSettings, globalSettings);
    this.testingType = 'Leave-One-Out Cross-Validation User-Independent';
  }

  trainRecognizer(recognizer, dataset, testingSample) {
    dataset.getGestureClasses().forEach(gestureClass => {
      gestureClass.getSamples().forEach(trainingSample => {
        if (trainingSample !== testingSample && trainingSample.user !== testingSample.user) {
          recognizer.addGesture(gestureClass.name, trainingSample);
        }
      });
    });
  }
}

class LOOCVMixedTesting extends LOOCVTesting {
  constructor(recognizerType, testingSettings, globalSettings) {
    super(recognizerType, testingSettings, globalSettings);
    this.testingType = 'Leave-One-Out Cross-Validation Mixed';
  }

  trainRecognizer(recognizer, dataset, testingSample) {
    dataset.getGestureClasses().forEach(gestureClass => {
      gestureClass.getSamples().forEach(trainingSample => {
        if (trainingSample !== testingSample) {
          recognizer.addGesture(gestureClass.name, trainingSample);
        }
      });
    });
  }
}


// Train-Test Split

class TTSTesting extends Testing {
  constructor(recognizerType, testingSettings, globalSettings) {
    super(recognizerType, globalSettings);
    this.testingType = 'Train-Test Split';
    // Get testing parameters
    this.minT = testingSettings.paramSettings.minT;
    this.maxT = testingSettings.paramSettings.maxT;
    this.r = testingSettings.paramSettings.r;
  }

  testRecognizer(dataset, recognizerModule, printProgress) {
    let results = [];

    // Compute the maximum number of training templates per gesture class
    let maxTrainingSetSize = Infinity;
    dataset.getGestureClasses().forEach((gestureClass) => {
      let nTemplatesPerUser = new Map();
      gestureClass.getSamples().forEach((sample) => {
        if (nTemplatesPerUser.has(sample.user)) {
          nTemplatesPerUser.set(sample.user, nTemplatesPerUser.get(sample.user) + 1);
        } else {
          nTemplatesPerUser.set(sample.user, 1);
        }
      });
      maxTrainingSetSize = this.getMaxTrainingSetSize(nTemplatesPerUser, maxTrainingSetSize, gestureClass);
    });
    maxTrainingSetSize = Math.min(maxTrainingSetSize, this.maxT);
    if (maxTrainingSetSize != this.maxT) {
      LogHelper.log('warn', `The configured value for maximum number of training templates (T = ${this.maxT}) is too large! The maximum supported value for this gesture set (UI testing) is T = ${maxTrainingSetSize}.`)
    }

    // Compute training set sizes
    let trainingSetSizes = [];
    for (let trainingSetSize = Math.max(1, this.minT); trainingSetSize <= maxTrainingSetSize; trainingSetSize = computeNextT(trainingSetSize)) {
      trainingSetSizes.push(trainingSetSize);
    }

    // Perform the test for each size of training set
    for (let i = 0; i < trainingSetSizes.length; i++) {
      let trainingSetSize = trainingSetSizes[i];
      let res = {
        n: trainingSetSize,
        accuracy: 0.0,
        time: 0.0,
        confusionMatrix: []
      };
      res.confusionMatrix = new Array(dataset.G).fill(0).map(() => new Array(dataset.G).fill(0));

      // Repeat the test this.r times
      for (let r = 0; r < this.r; r++) {
        // Initialize the recognizer and select the candidates
        let recognizer = new recognizerModule.module(recognizerModule.moduleSettings);
        let candidates = selectCandidates(dataset);
        // For each gesture class, mark the templates that cannot be reused
        let markedTemplates = [];
        candidates.forEach(candidate => {
          markedTemplates.push([candidate]);
        });
        // Train the recognizer
        for (let t = 0; t < trainingSetSize; t++) { // Add trainingSetSize strokeData per gestureClass
          // Add one sample for each gesture class
          let index = 0;
          dataset.getGestureClasses().forEach((gestureClass) => {
            // Select a valid training template
            let training = -1;
            while (training == -1 || markedTemplates[index].includes(training) || !this.isValidUser(gestureClass.getSamples()[training].user, gestureClass.getSamples()[markedTemplates[index][0]].user)) {
              training = getRandomNumber(0, gestureClass.getSamples().length);
            }
            // Mark the training template
            markedTemplates[index].push(training);
            // Train the recognizer
            recognizer.addGesture(gestureClass.name, gestureClass.getSamples()[training]);
            index++;
          });
        }

        // Test the recognizer
        let index = 0;
        dataset.getGestureClasses().forEach((gestureClass) => {
          // Retrieve the testing sample
          let toBeTested = gestureClass.getSamples()[candidates[index]];
          // Attempt recognition
          try {
            if (this.recognizerType === 'dynamic') {
              var result = recognizer.recognize(toBeTested);
            } else {
              var result = recognizer.recognize(toBeTested.frame);
            }
          } catch(err) {
            console.error(gestureClass.name, toBeTested);
            throw err;
          }
          // Update the confusion matrix
          if (dataset.getGestureClasses().has(result.name)) {
            let resultIndex = dataset.getGestureClasses().get(result.name).index;
            res.confusionMatrix[gestureClass.index][resultIndex] += 1;
          }
          // Update execution time and accuracy
          res.accuracy += (result.name === gestureClass.name) ? 1 : 0;
          res.time += result.time;
          index++;
        });
        // Compute and print progress
        let progress = i / trainingSetSizes.length + r / (this.r * trainingSetSizes.length);
        printProgress(progress);
      }
      res.accuracy = res.accuracy / (this.r * dataset.G);
      res.time = res.time / (this.r * dataset.G);
      results.push(res);
    }
    return results;
  }

  getMaxTrainingSetSize(nTemplatesPerUser, maxTrainingSetSize, gestureClass) {
    throw new Error('You have to implement this function');
  }

  isValidUser(userTraining, userTesting) {
    throw new Error('You have to implement this function');
  }

  static getTestingScenarios(recognizerType, testingSettings, globalSettings) {
    let testingScenarios = [];
    testingSettings.paramSettings.modes.forEach(mode => {
      switch (mode.paramName) {
        case 'userDependent':
          testingScenarios.push(new TTSUDTesting(recognizerType, testingSettings, globalSettings));
          break;
        case 'userIndependent':
          testingScenarios.push(new TTSUITesting(recognizerType, testingSettings, globalSettings));
          break;
        default:
          throw new Error(`Unknown testing mode for Train-Test Split: ${mode.paramName}.`);
      }
    });
    return testingScenarios;
  }
}

class TTSUDTesting extends TTSTesting {
  constructor(recognizerType, testingSettings, globalSettings) {
    super(recognizerType, testingSettings, globalSettings);
    this.testingType = 'Train-Test Split User-Dependent';
  }

  getMaxTrainingSetSize(nTemplatesPerUser, maxTrainingSetSize, gestureClass) {
    nTemplatesPerUser.forEach((nTemplates) => {
      maxTrainingSetSize = Math.min(maxTrainingSetSize, nTemplates - 1);
    });
    return maxTrainingSetSize;
  }

  isValidUser(userTraining, userTesting) {
    return userTesting === userTraining;
  }
}

class TTSUITesting extends TTSTesting {
  constructor(recognizerType, testingSettings, globalSettings) {
    super(recognizerType, testingSettings, globalSettings);
    this.testingType = 'Train-Test Split User-Independent';
  }

  getMaxTrainingSetSize(nTemplatesPerUser, maxTrainingSetSize, gestureClass) {
    let maxTemplatesPerUser = -Infinity;
    nTemplatesPerUser.forEach((nTemplates) => {
      maxTemplatesPerUser = Math.max(maxTemplatesPerUser, nTemplates);
    });
    return Math.min(maxTrainingSetSize, gestureClass.TperG - maxTemplatesPerUser);
  }

  isValidUser(userTraining, userTesting) {
    return userTesting !== userTraining;
  }
}


// HELPER FUNCTIONS

function getTimeStr(msTime) {
  // Convert to seconds:
  let seconds = msTime / 1000;
  // Extract days:
  const days = parseInt(seconds / (3600 * 24));
  seconds = seconds % (3600 * 24);
  // Extract hours:
  const hours = parseInt(seconds / 3600);
  seconds = seconds % 3600;
  // Extract minutes:
  const minutes = parseInt(seconds / 60);
  seconds = parseInt(seconds % 60);
  
  if (days != 0) {
    timeStr = `${days} days, ${hours} hours`;
  } else if (hours != 0) {
    timeStr = `${hours} hours, ${minutes} minutes`;
  } else if (minutes != 0) {
    timeStr = `${minutes} minutes, ${seconds} seconds`;
  } else {
    timeStr = `${seconds} seconds`;
  }
  
  return timeStr;
}

/**
 * Return a random list of candidate gestures, 1 candidate per gesture class.
 */
function selectCandidates(dataset) {
  let candidates = [];
  dataset.getGestureClasses().forEach((value) => {
    candidates.push(getRandomNumber(0, value.getSamples().length));
  });
  return candidates;
};

/**
 * Return a random number between min and max.
 */
function getRandomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

/**
 * Load a gesture dataset
 */
function loadDataset(type, datasetsConfig) {
  // Load the dataset
  let datasetLoaderModule = datasetsConfig.modules[0];
  let datasetLoader = datasetLoaderModule.module;
  let sensorId = datasetLoaderModule.additionalSettings.sensorId;
  let datasetId = datasetLoaderModule.additionalSettings.datasetId;
  let datasetName = datasetLoaderModule.additionalSettings.datasets[0];
  let datasetPath = path.resolve(__dirname, '../datasets', type, datasetName); // TODO improve
  let dataset = datasetLoader.loadDataset(datasetName, datasetPath, sensorId, datasetId, [])
  // Select/aggregate/rename classes of the dataset if required
  if (datasetsConfig.aggregateClasses && datasetsConfig.aggregateClasses.length != 0) {
    let newDataset = new GestureSet(dataset.name);
    datasetsConfig.aggregateClasses.forEach((aggregate, index) => {
      // Aggregate gesture class
      let newClass = new GestureClass(aggregate.name, index);
      let templates = [];
      // Fuse the classes into a new aggregate class
      for (const className of aggregate.gestureClasses) {
        let oldClass = dataset.getGestureClasses().get(className);
        templates = templates.concat(templates, oldClass.getSamples());
      }
      // Add the templates to the new gesture class
      for (template of templates) {
        newClass.addSample(template);
      }
      // Add the aggregate class to the new dataset
      newDataset.addGestureClass(newClass);
    });
    dataset = newDataset;
  }
  // Get users
  let users = datasetLoaderModule.additionalSettings.users;
  users = users.split(',').filter(x => x.length > 0);
  if (users.length > 0) {
    for (let [key, gestureClass] of dataset.getGestureClasses()) {
      gestureClass.samples = gestureClass.samples.filter(sample => users.includes(sample.user));
      gestureClass.TperG = gestureClass.samples.length;
    }
  }
  return dataset;
}

module.exports = {
  Testing
}