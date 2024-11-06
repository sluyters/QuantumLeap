const Testing = require('./testing');
const LogHelper = require('../log-helper');
const { shuffleArray, splitArray } = require('../utils');

function getKFCVTestingScenarios(recognizerType, testingSettings, globalSettings) {
  let testingScenarios = [];
  testingSettings.paramSettings.modes.forEach(mode => {
    switch (mode.paramName) {
      case 'mixed':
        testingScenarios.push(new KFCVMixedTesting(recognizerType, testingSettings, globalSettings));
        break;
      default:
        throw new Error(`Unknown testing mode for KFCVTesting: ${mode.paramName}.`);
    }
  });
  return testingScenarios;
}

// k-fold Cross-Validation
class KFCVTesting extends Testing {
  constructor(recognizerType, testingSettings, globalSettings) {
    super(recognizerType, globalSettings);
    this.testingType = 'k-fold Cross-Validation';
    this.evaluationTechnique = 'KFCV';
    this.userScenario = 'Unknown';
    // Get testing parameters
    this.k = testingSettings.paramSettings.k;
  }

  testRecognizer(procedureType, datasets, recognizerModule, printProgress) {
    // Get datasets
    if (procedureType !== 'singleDataset') {
      throw new Error(`KFCVTesting is not compatible with dataset procedure: ${procedureType}.`);
    }
    let dataset = datasets[0];

    // Split the dataset into k random groups of the same size
    let folds = this.getRandomFolds(dataset, this.k);

    // Initialize results
    let results = [];
    let res = {
      accuracy: 0.0,
      time: 0.0,
      confusionMatrix: []
    };
    let nTrials = 0;
    let datasetSize = dataset.getSize();
    res.confusionMatrix = new Array(dataset.G).fill(0).map(() => new Array(dataset.G).fill(0));

    // Use each group as the testing set
    for (let i = 0; i < folds.length; i++) {
      // Get training and testing set
      let testingFold = folds[i];
      let trainingFolds = folds.slice();
      trainingFolds.splice(i, 1);

      // Train recognizer
      let recognizer = new recognizerModule.module(recognizerModule.moduleSettings);
      this.trainRecognizer(recognizer, trainingFolds);

      // Test recognizer
      for (let item of testingFold) {
        let testingSampleName = item.name;
        let testingSample = item.sample;
        let gestureClass = dataset.getGestureClasses().get(testingSampleName);

        // Attempt recognition
        try {
          if (this.recognizerType === 'dynamic') {
            var result = recognizer.recognize(testingSample);
          } else {
            var result = recognizer.recognize(testingSample.frame);
          }
        } catch(err) {
          console.error(testingSampleName, testingSample);
          throw err;
        }

        // Update the confusion matrix
        if (dataset.getGestureClasses().has(result.name)) {
          let resultIndex = dataset.getGestureClasses().get(result.name).index;
          res.confusionMatrix[gestureClass.index][resultIndex] += 1;
        }

        // Update execution time and accuracy
        res.accuracy += (result.name === testingSampleName) ? 1 : 0;
        res.time += result.time;
  
        // Increment number of trials
        nTrials++;

        // Compute and print progress
        let progress = nTrials / datasetSize;
        printProgress(progress);
      }
    }

    // Compute averages
    res.accuracy = res.accuracy / nTrials;
    res.time = res.time / nTrials;
    results.push(res);
    return results;    
  }

  getRandomFolds(dataset, numberOfFolds) {
    throw new Error('You have to implement this function');
  }

  trainRecognizer(recognizer, trainingFolds) {
    for (let fold of trainingFolds) {
      for (let item of fold) {
        let trainingSampleName = item.name;
        let trainingSample = item.sample;
        recognizer.addGesture(trainingSampleName, trainingSample);
      }
    }
  }

  getRepetitions(procedureType, datasets) {
    if (procedureType !== 'singleDataset') {
      throw new Error(`KFCVTesting is not compatible with dataset procedure: ${procedureType}.`);
    }
    let testingDataset = datasets[0];
    // Return one value (if all gestures have same number of templates) or a vector of values
    let isSameValue = true;
    let repetitionsPerGestureClass = new Array(testingDataset.G);
    let prevRepetitions = -1;
    testingDataset.getGestureClasses().forEach(gestureClass => {
      repetitionsPerGestureClass[gestureClass.index] = gestureClass.TperG;
      if (prevRepetitions !== -1 && prevRepetitions !== gestureClass.TperG)
        isSameValue = false;
    });
    if (isSameValue)
      return repetitionsPerGestureClass[0];
    else 
      return repetitionsPerGestureClass;   
  }
}

class KFCVMixedTesting extends KFCVTesting {
  constructor(recognizerType, testingSettings, globalSettings) {
    super(recognizerType, testingSettings, globalSettings);
    this.testingType = 'k-fold Cross-Validation Mixed';
    this.userScenario = 'Mixed';
    this.requiresSameUsers = true;
  }

  getRandomFolds(dataset, numberOfFolds) {
    let flattenedGestureSet = dataset.flatten();
    shuffleArray(flattenedGestureSet);
    let folds = splitArray(flattenedGestureSet, numberOfFolds, true);
    return folds;
  }
} 

module.exports = {
  getKFCVTestingScenarios,
  KFCVTesting,
  KFCVMixedTesting,
}