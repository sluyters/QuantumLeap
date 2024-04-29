const Testing = require('./testing');
const LogHelper = require('../log-helper');
const { getRandomNumber } = require('../utils');

function getTTSTestingScenarios(recognizerType, testingSettings, globalSettings) {
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

// Train-Test Split
class TTSTesting extends Testing {
  constructor(recognizerType, testingSettings, globalSettings) {
    super(recognizerType, globalSettings);
    this.testingType = 'Train-Test Split';
    this.evaluationTechnique = 'TTS';
    this.userScenario = 'Unknown';
    // Get testing parameters
    this.minT = testingSettings.paramSettings.minT;
    this.maxT = testingSettings.paramSettings.maxT;
    this.r = testingSettings.paramSettings.r;
  }

  testRecognizer(procedureType, datasets, recognizerModule, printProgress) {
    // Get datasets
    let testingDataset = procedureType === 'singleDataset' ? datasets[0] : datasets[1];
    let trainingDataset = datasets[0];
    
    let results = [];

    // Compute the maximum number of training templates per gesture class
    let maxTrainingSetSize = Math.min(this.getMaxTrainingSetSize(procedureType, datasets), this.maxT);
    if (maxTrainingSetSize != this.maxT) {
      LogHelper.log('warn', `The configured value for maximum number of training templates (T = ${this.maxT}) is too large! The maximum supported value for this gesture set is T = ${maxTrainingSetSize}.`)
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
      res.confusionMatrix = new Array(testingDataset.G).fill(0).map(() => new Array(testingDataset.G).fill(0));

      // Repeat the test this.r times
      for (let r = 0; r < this.r; r++) {
        // Initialize the recognizer and select the candidates
        let recognizer = new recognizerModule.module(recognizerModule.moduleSettings);
        let candidates = selectCandidates(testingDataset);
        // For each gesture class, mark the templates that cannot be reused
        let markedTrainingTemplates = new Map();
        candidates.forEach((candidate, gestureClassName) => {
          markedTrainingTemplates.set(gestureClassName, procedureType === 'singleDataset' ? [candidate] : []);
        });
        // Train the recognizer
        for (let t = 0; t < trainingSetSize; t++) { // Add trainingSetSize strokeData per gestureClass
          // Add one sample for each gesture class
          trainingDataset.getGestureClasses().forEach(gestureClass => {
            // Get candidate
            let candidate = testingDataset.getGestureClasses().get(gestureClass.name).getSamples()[candidates.get(gestureClass.name)];
            // Select a valid training template
            let training = -1;
            while (training == -1 || markedTrainingTemplates.get(gestureClass.name).includes(training) || !this.isValidUser(gestureClass.getSamples()[training].user, candidate.user)) {
              training = getRandomNumber(0, gestureClass.getSamples().length);
            }
            // Mark the training template
            markedTrainingTemplates.get(gestureClass.name).push(training);
            // Train the recognizer
            recognizer.addGesture(gestureClass.name, gestureClass.getSamples()[training]);
          });
        }

        // Test the recognizer
        testingDataset.getGestureClasses().forEach(gestureClass => {
          // Retrieve the testing sample
          let toBeTested = gestureClass.getSamples()[candidates.get(gestureClass.name)];
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
          if (testingDataset.getGestureClasses().has(result.name)) {
            let resultIndex = testingDataset.getGestureClasses().get(result.name).index;
            res.confusionMatrix[gestureClass.index][resultIndex] += 1;
          }
          // Update execution time and accuracy
          res.accuracy += (result.name === gestureClass.name) ? 1 : 0;
          res.time += result.time;
        });
        // Compute and print progress
        let progress = i / trainingSetSizes.length + r / (this.r * trainingSetSizes.length);
        printProgress(progress);
      }
      res.accuracy = res.accuracy / (this.r * testingDataset.G);
      res.time = res.time / (this.r * testingDataset.G);
      results.push(res);
    }
    return results;
  }

  getMaxTrainingSetSize(procedureType, datasets) {
    throw new Error('You have to implement this function');
  }

  isValidUser(userTraining, userTesting) {
    throw new Error('You have to implement this function');
  }

  getRepetitions(procedureType, datasets) {
    return this.r;
  }
}

class TTSUDTesting extends TTSTesting {
  constructor(recognizerType, testingSettings, globalSettings) {
    super(recognizerType, testingSettings, globalSettings);
    this.testingType = 'Train-Test Split User-Dependent';
    this.userScenario = 'UD';
    this.requiresSameUsers = true;
  }

  getMaxTrainingSetSize(procedureType, datasets) {
    let trainingDataset = datasets[0];
    let maxTrainingSetSize = Infinity;
    trainingDataset.getGestureClasses().forEach((gestureClass) => {
      // Compute number of templates per user for this gesture class
      let nTemplatesPerUser = new Map();
      gestureClass.getSamples().forEach((sample) => {
        if (nTemplatesPerUser.has(sample.user)) {
          nTemplatesPerUser.set(sample.user, nTemplatesPerUser.get(sample.user) + 1);
        } else {
          nTemplatesPerUser.set(sample.user, 1);
        }
      });
      // Update max training set size
      nTemplatesPerUser.forEach((nTemplates) => {
        maxTrainingSetSize = Math.min(maxTrainingSetSize, procedureType === 'singleDataset' ? nTemplates - 1 : nTemplates);
      });
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
    this.userScenario = 'UI';
    this.requiresSameUsers = false;
  }

  getMaxTrainingSetSize(procedureType, datasets) {
    let testingDataset = procedureType === 'singleDataset' ? datasets[0] : datasets[1];
    let trainingDataset = datasets[0];

    let maxTrainingSetSize = Infinity;
    let sharedUsers = []; // Used in crossDataset procedure
    // Compute shared users
    if (procedureType === 'crossDataset') {
      let trainingUsers = trainingDataset.getUsers();
      let testingUsers = testingDataset.getUsers();
      sharedUsers = testingUsers.filter(user => trainingUsers.includes(user));
    }
    if (procedureType === 'crossDataset' && sharedUsers.length === 0) {
      // Cross dataset without shared users between training and testing
      maxTrainingSetSize = trainingDataset.getMinTemplate();   
    } else if (procedureType === 'singleDataset' || (procedureType === 'crossDataset' && sharedUsers.length > 0)) {
      // Single dataset OR cross dataset with shared users between training and testing
      trainingDataset.getGestureClasses().forEach((gestureClass) => {
        // Compute number of templates per user for this gesture class
        let nTemplatesPerUser = new Map();
        gestureClass.getSamples().forEach((sample) => {
          if (nTemplatesPerUser.has(sample.user)) {
            nTemplatesPerUser.set(sample.user, nTemplatesPerUser.get(sample.user) + 1);
          } else if (procedureType === 'singleDataset' || sharedUsers.includes(sample.user)) {
            nTemplatesPerUser.set(sample.user, 1);
          }
        });
        // Update max training set size
        let maxTemplatesPerUser = -Infinity;
        nTemplatesPerUser.forEach((nTemplates) => {
          maxTemplatesPerUser = Math.max(maxTemplatesPerUser, nTemplates);
        });
        maxTrainingSetSize =  Math.min(maxTrainingSetSize, gestureClass.TperG - maxTemplatesPerUser);
      });
    }
    return maxTrainingSetSize;
  }

  isValidUser(userTraining, userTesting) {
    return userTesting !== userTraining;
  }
}

const computeNextT = x => x * 2; // Function that computes the next number of training templates

/**
 * Return a random list of candidate gestures, 1 candidate per gesture class.
 */
function selectCandidates(dataset) {
  let candidates = new Map();
  dataset.getGestureClasses().forEach((gestureClass) => {
    candidates.set(gestureClass.name, getRandomNumber(0, gestureClass.getSamples().length));
  });
  return candidates;
};

module.exports = {
  getTTSTestingScenarios,
  TTSTesting,
  TTSUDTesting,
  TTSUITesting,
}