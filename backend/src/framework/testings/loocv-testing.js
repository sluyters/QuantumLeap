const Testing = require('./testing');
const LogHelper = require('../log-helper');

function getLOOCVTestingScenarios(recognizerType, testingSettings, globalSettings) {
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

// Leave-One-Out Cross-Validation
class LOOCVTesting extends Testing {
  constructor(recognizerType, testingSettings, globalSettings) {
    super(recognizerType, globalSettings);
    this.testingType = 'Leave-One-Out Cross-Validation';
    this.evaluationTechnique = 'LOOCV';
    this.userScenario = 'Unknown';
  }

  testRecognizer(procedureType, datasets, recognizerModule, printProgress) {
    // Get datasets
    let testingDataset = procedureType === 'singleDataset' ? datasets[0] : datasets[1];
    let trainingDataset = datasets[0];

    let results = [];

    let nTrials = 0;
    let res = {
      accuracy: 0.0,
      time: 0.0,
      confusionMatrix: []
    };
    res.confusionMatrix = new Array(testingDataset.G).fill(0).map(() => new Array(testingDataset.G).fill(0));

    let index = 0;
    testingDataset.getGestureClasses().forEach((gestureClass) => {
      gestureClass.getSamples().forEach(testingSample => {
        // Train recognizer
        let recognizer = new recognizerModule.module(recognizerModule.moduleSettings);
        this.trainRecognizer(recognizer, trainingDataset, testingSample);

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
        if (testingDataset.getGestureClasses().has(result.name)) {
          let resultIndex = testingDataset.getGestureClasses().get(result.name).index;
          res.confusionMatrix[gestureClass.index][resultIndex] += 1;
        }

        // Update execution time and accuracy
        res.accuracy += (result.name === gestureClass.name) ? 1 : 0;
        res.time += result.time;
  
        // Increment number of trials
        nTrials++;
      });

      // Compute and print progress
      index += 1;
      let progress = index / testingDataset.G;
      printProgress(progress);
    });
    // Compute averages
    res.accuracy = res.accuracy / nTrials;
    res.time = res.time / nTrials;
    results.push(res);
    return results;
  }

  trainRecognizer(recognizer, dataset, testClassId, testSampleId) {
    throw new Error('You have to implement this function');
  }

  getRepetitions(procedureType, datasets) {
    let testingDataset = procedureType === 'singleDataset' ? datasets[0] : datasets[1];
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

class LOOCVUDTesting extends LOOCVTesting {
  constructor(recognizerType, testingSettings, globalSettings) {
    super(recognizerType, testingSettings, globalSettings);
    this.testingType = 'Leave-One-Out Cross-Validation User-Dependent';
    this.userScenario = 'UD';
    this.requiresSameUsers = true;
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
    this.userScenario = 'UI';
    this.requiresSameUsers = false;
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
    this.userScenario = 'Mixed';
    this.requiresSameUsers = true;
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

module.exports = {
  getLOOCVTestingScenarios,
  LOOCVTesting,
  LOOCVUDTesting,
  LOOCVUITesting,
  LOOCVMixedTesting,
}