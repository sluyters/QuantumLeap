const path = require('path');
const fs = require('fs');
const GestureSet = require('./gestures/gesture-set').GestureSet;
const GestureClass = require('./gestures/gesture-class').GestureClass;

// Important values
const computeNextT = x => x * 2; // Function that computes the next number of training templates

class Testing {
  constructor(recognizerType, config) {
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
        let res = this.testRecognizer(dataset, recognizerModule);
        console.log(recognizerModule.module.name);
        datasetResults.data.push({
          name: recognizerModule.module.name,
          options: recognizerModule.options,
          data: res
        });
      }
      console.log(datasetResults)
      results.push(datasetResults);
    }
    console.log('end')
    fs.writeFileSync(`results-${this.recognizerType}.json`, JSON.stringify(results, null, 2));
  }

  testRecognizer(dataset, recognizerModule) {
    throw new Error('You have to implement this function');
  }
}

class UserIndependentTesting extends Testing {
  constructor(recognizerType, config) {
    super(recognizerType, config);
  }

  testRecognizer(dataset, recognizerModule) {
    let results = [];
    // Perform the test for each size of training set
    for (let trainingSetSize = this.minT; trainingSetSize <= Math.min(dataset.getMinTemplate(), this.maxT); trainingSetSize = computeNextT(trainingSetSize)) {
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
            //while (training == -1 || markedTemplates[index].includes(training) || gestureClass.getSamples()[training].user == gestureClass.getSamples()[markedTemplates[index][0]].user) {
            while (training == -1 || markedTemplates[index].includes(training)) {
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
      }
      res.accuracy = res.accuracy / (this.r * dataset.G);
      res.time = res.time / (this.r * dataset.G);
      results.push(res);
    }
    return results;
  }
}

class UserDependentTesting extends Testing {
  constructor(recognizerType, config) {
    super(recognizerType, config);
  }

  testRecognizer(dataset, recognizerModule) {
    super.testRecognizer(dataset, recognizerModule);
  }
}


// HELPER FUNCTIONS

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
  let identifier = datasetLoaderModule.additionalSettings.id;
  let datasetName = datasetLoaderModule.additionalSettings.datasets[0];
  let datasetPath = path.resolve(__dirname, '../datasets', type, datasetName); // TODO improve
  let dataset = datasetLoader.loadDataset(datasetName, datasetPath, identifier, [])
  // Select/aggregate/rename classes of the dataset if required
  if (datasetsConfig.aggregateClasses && datasetsConfig.aggregateClasses.length != 0) {
    let newDataset = new GestureSet(dataset.name);
    datasetsConfig.aggregateClasses.forEach((aggregate, index) => {
      // Aggregate gesture class
      let newClass = new GestureClass(aggregate.name, index);
      let templates = [];
      // Fuse the classes into a new aggregate class
      for (const className of aggregate.classes) {
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
    return newDataset
  } else {
    return dataset;
  }
}

module.exports = {
  Testing,
  UserDependentTesting,
  UserIndependentTesting
}