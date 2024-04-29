const path = require('path');
const fs = require('fs');
const GestureSet = require('../gestures/gesture-set').GestureSet;
const GestureClass = require('../gestures/gesture-class').GestureClass;
const stringify = require('json-stringify-pretty-compact');
const { performance } = require('perf_hooks');
const LogHelper = require('../log-helper');

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
 * Load a gesture dataset
 */
function loadDataset(type, datasetLoaderModule, aggregateClasses = []) {
  // Load the dataset
  let datasetLoader = datasetLoaderModule.module;
  let sensorId = datasetLoaderModule.additionalSettings.sensorId;
  sensorId = sensorId ? sensorId : 'default';
  let datasetId = datasetLoaderModule.additionalSettings.datasetId;
  let datasetName = datasetLoaderModule.additionalSettings.datasets[0];
  let datasetPath = path.resolve(__dirname, '../../datasets', type, datasetName); // TODO improve
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

module.exports = Testing;