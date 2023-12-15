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
    this.requiresSameUsers = false;
    this.config = config;
    this.testingType = 'Unknown';
    this.evaluationTechnique = 'Unknown';
    this.userScenario = 'Unknown';
    this.recognizerType = recognizerType;
    // Get datasets and recognizers
    this.datasetsProcedures = config.datasets[recognizerType].procedure;
    this.recognizers = config.recognizers[recognizerType];
  }

  run() {
    for (let i = 0; i < this.datasetsProcedures.length; i++) {
      let t0 = performance.now();
      let results = [];
      let procedure = this.datasetsProcedures[i];
      LogHelper.log('info', `Starting testing (${this.testingType}) ${i + 1} of ${this.datasetsProcedures.length} (${procedure.paramName})`);
      // Load dataset(s)
      let datasets = [];
      switch (procedure.paramName) {
        case 'singleDataset': // Single dataset
          datasets.push(loadDataset(this.recognizerType, procedure.paramSettings.modules[0], procedure.paramSettings.aggregateClasses));
          break;
        case 'crossDataset': // Cross dataset
          let trainingDataset = loadDataset(this.recognizerType, procedure.paramSettings.trainingModules[0], procedure.paramSettings.aggregateClasses);
          let testingDataset = loadDataset(this.recognizerType, procedure.paramSettings.testingModules[0], procedure.paramSettings.aggregateClasses);
          // Filter users TODO remove users which are not the same across a single gesture class
          if (this.requiresSameUsers) {
            let uniqueTrainingUsers = trainingDataset.getUsers();
            let uniqueTestingUsers = testingDataset.getUsers();
            let usersToRemove = uniqueTestingUsers.filter(user => !uniqueTrainingUsers.includes(user));
            trainingDataset.removeUsers(usersToRemove);
            testingDataset.removeUsers(usersToRemove);
          }
          // Check gesture classes (keep only ones that are in both datasets, log the ones that are ignored)
          trainingDataset.getGestureClasses().forEach((val, key) => {
            if (!testingDataset.getGestureClasses().has(key)) {
              trainingDataset.removeGestureClass(key);
              LogHelper.log('warn', `The dataset '${testingDataset.name}' does not feature class '${key}'.`);
            }
          });
          testingDataset.getGestureClasses().forEach((val, key) => {
            if (!trainingDataset.getGestureClasses().has(key)) {
              testingDataset.removeGestureClass(key);
              LogHelper.log('warn', `The dataset '${trainingDataset.name}' does not feature class '${key}'.`);
            }
          });
          datasets.push(trainingDataset);
          datasets.push(testingDataset);
          break;
        default: 
          LogHelper.log('error', `Unknown dataset procedure: ${this.procedure.paramName}`);
          continue;
      }

      // Initialize dataset results object
      let gestureClasses = datasets[0].getGestureClasses();
      let gestures = new Array(gestureClasses.G);
      gestureClasses.forEach(gestureClass => {
        gestures[gestureClass.index] = gestureClass.name;
      });
      let datasetResults = {
        r: this.getRepetitions(procedure.paramName, datasets), // TODO Fix
        evaluationTechnique: this.evaluationTechnique,
        datasetProcedure: procedure.paramName,
        userScenario: this.userScenario,
        datasets: datasets.map(dataset => dataset.name),
        gestures: gestures,
        data: []
      };

      // Test modules
      for (let j = 0; j < this.recognizers.modules.length; j++) {
        let recognizerModule = this.recognizers.modules[j];
        // Callback to display the progress of the testing to the user
        let printProgress = (recognizerProgress) => {
          // let I = this.datasetsProcedures.length;
          let J = this.recognizers.modules.length
          // let progress = 100 * (i/I + j/(I*J) + recognizerProgress/(I*J));
          let progress = 100 * (j/J + recognizerProgress/(J));
          let t1 = performance.now();
          let elapsedTime = t1 - t0;
          let remainingTime =  (elapsedTime / progress) * (100 - progress);
          process.stdout.write(`Progress - ${progress.toFixed(1)}% (${getTimeStr(remainingTime)} remaining)                      \r`);
        }
        let res = this.testRecognizer(procedure.paramName, datasets, recognizerModule, printProgress);
        datasetResults.data.push({
          name: recognizerModule.module.name,
          options: recognizerModule.moduleSettings,
          data: res
        });
      }
      results.push(datasetResults);
      LogHelper.log('info', `Ending Testing (${this.testingType}, ${procedure})`);
      writeFile(`results-${this.recognizerType}-${this.testingType}.json`, stringify(results, {maxLength: 150, indend: 2}));
    }
  }

  testRecognizer(procedureType, datasets, recognizerModule, printProgress) {
    throw new Error('You have to implement this function');
  }

  getRepetitions(procedureType, datasets) {
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
  let candidates = new Map();
  dataset.getGestureClasses().forEach((gestureClass) => {
    candidates.set(gestureClass.name, getRandomNumber(0, gestureClass.getSamples().length));
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
function loadDataset(type, datasetLoaderModule, aggregateClasses = []) {
  // Load the dataset
  let datasetLoader = datasetLoaderModule.module;
  let sensorId = datasetLoaderModule.additionalSettings.sensorId;
  sensorId = sensorId ? sensorId : 'default';
  let datasetId = datasetLoaderModule.additionalSettings.datasetId;
  let datasetName = datasetLoaderModule.additionalSettings.datasets[0];
  let datasetPath = path.resolve(__dirname, '../datasets', type, datasetName); // TODO improve
  let dataset = datasetLoader.loadDataset(datasetName, datasetPath, sensorId, datasetId, [])
  // Select/aggregate/rename classes of the dataset if required
  if (aggregateClasses && aggregateClasses.length != 0) {
    let newDataset = new GestureSet(dataset.name);
    aggregateClasses.forEach((aggregate, id) => {
      // Aggregate gesture class
      let newClass = new GestureClass(aggregate.name, id);
      let templates = [];
      // Fuse the classes into a new aggregate class
      for (const className of aggregate.gestureClasses) {
        let oldClass = dataset.getGestureClasses().get(className);
        if (oldClass === undefined) {
          LogHelper.log('warn', `The dataset '${datasetName}' does not feature class '${className}'.`);
        } else {
          templates = templates.concat(templates, oldClass.getSamples());
        }
      }
      // Add the templates to the new gesture class
      if (templates.length > 0) {
        for (template of templates) {
          newClass.addSample(template);
        }
        // Add the aggregate class to the new dataset
        newDataset.addGestureClass(newClass);
      }
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

function writeFile(filename, data, increment = 0) {
  const name = `${path.basename(filename, path.extname(filename))}${increment ? (' (' + increment + ')'): ''}${path.extname(filename)}`;
  try {
    fs.writeFileSync(name, data, { encoding: 'utf-8', flag: 'wx' });
  } catch (err) {
    if (err.code === 'EEXIST') {
      writeFile(filename, data, increment += 1);
    } else {
      throw err;
    }
  }
}

module.exports = {
  Testing
}