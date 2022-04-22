const path = require('path');
const fs = require('fs');
const GestureSet = require('./gestures/gesture-set').GestureSet;
const GestureClass = require('./gestures/gesture-class').GestureClass;
const stringify = require("json-stringify-pretty-compact");
const { performance } = require('perf_hooks');
const LogHelper = require('./log-helper');

// Important values
const computeNextT = x => x * 2; // Function that computes the next number of training templates

class Testing {
  constructor(recognizerType, config) {
    this.testingType = '';
    this.recognizerType = recognizerType;
    // Get datasets and recognizers
    this.datasets = config.datasets[recognizerType];
    this.recognizers = config.recognizers[recognizerType];
    // Get testing parameters
    this.minT = config.general.testingParams.minT;
    this.maxT = config.general.testingParams.maxT;
    this.r = config.general.testingParams.r;
    // Get global parameters for the recognizers
    this.n = config.general.globalParams.samplingPoints;
    this.selectedPoints = config.general.globalParams.points;
  }

  run() {
    LogHelper.log('info', `Starting testing (${this.testingType})`);
    let t0 = performance.now();
    let results = [];
    for (let i = 0; i < this.datasets.modules.length; i++) {
      let dataset = loadDataset(this.recognizerType, this.datasets);
      let datasetResults = {
        r: this.r,
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
      // console.log('\n', datasetResults);
      results.push(datasetResults);
    }
    LogHelper.log('info', `Ending Testing (${this.testingType})`);
    fs.writeFileSync(`results-${this.recognizerType}-${this.testingType}.json`, stringify(results, {maxLength: 150, indend: 2}));
  }

  testRecognizer(dataset, recognizerModule) {
    throw new Error('You have to implement this function');
  }
}

class UserIndependentTesting extends Testing {
  constructor(recognizerType, config) {
    super(recognizerType, config);
    this.testingType = 'UI';
  }

  testRecognizer(dataset, recognizerModule, printProgress) {
    let results = [];
    // Compute training set sizes
    let trainingSetSizes = [];
    for (let trainingSetSize = this.minT; trainingSetSize <= Math.min(dataset.getMinTemplate() - 1, this.maxT); trainingSetSize = computeNextT(trainingSetSize)) {
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
            while (training == -1 || markedTemplates[index].includes(training) || gestureClass.getSamples()[training].user === gestureClass.getSamples()[markedTemplates[index][0]].user) {
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
          if (this.recognizerType === 'dynamic') {
            var result = recognizer.recognize(toBeTested);
          } else {
            var result = recognizer.recognize(toBeTested.frame);
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
}

// TODO
class UserDependentTesting extends Testing {
  constructor(recognizerType, config) {
    super(recognizerType, config);
    this.testingType = 'UD';
  }

  testRecognizer(dataset, recognizerModule, printProgress) {
    let results = [];

    // Compute the minimum number of templates per gesture and per user
    let minTperU = Infinity;
    dataset.getGestureClasses().forEach((gestureClass) => {
      let templatesPerUser = new Map();
      gestureClass.getSamples().forEach((sample) => {
        if (templatesPerUser.has(sample.user)) {
          templatesPerUser.set(sample.user, templatesPerUser.get(sample.user) + 1);
        } else {
          templatesPerUser.set(sample.user, 1);
        }
      });
      templatesPerUser.forEach((TperU) => {
        minTperU = Math.min(minTperU, TperU);
      });
    });

    // Compute training set sizes
    let trainingSetSizes = [];
    for (let trainingSetSize = this.minT; trainingSetSize <= Math.min(dataset.getMinTemplate() - 1, minTperU, this.maxT); trainingSetSize = computeNextT(trainingSetSize)) {
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
            // Select a valid training template (could be more efficient by randomizing only over the user's gestures)
            let training = -1;
            while (training == -1 || markedTemplates[index].includes(training) || gestureClass.getSamples()[training].user !== gestureClass.getSamples()[markedTemplates[index][0]].user) {
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
          if (this.recognizerType === 'dynamic') {
            var result = recognizer.recognize(toBeTested);
          } else {
            var result = recognizer.recognize(toBeTested.frame);
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
  Testing,
  UserDependentTesting,
  UserIndependentTesting
}