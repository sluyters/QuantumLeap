const GestureSet = require('../../gestures/gesture-set').GestureSet;
const GestureClass = require('../../gestures/gesture-class').GestureClass;
const path = require('path'); // TODO improve

function initDataset(type, sensorsConfig, datasetsConfig) {
  // Load the names of the points used in the pipeline (TODO)
  let sensorsPointsNames = getPointsNames(sensorsConfig)
  let datasets = [];
  // Load the datasets
  datasetsConfig.modules.forEach(datasetLoaderModule => {
    let datasetLoader = datasetLoaderModule.module;
    let identifier = datasetLoaderModule.additionalSettings.id;
    if (datasetLoaderModule.additionalSettings.datasets !== undefined && datasetLoaderModule.additionalSettings.datasets.length > 0) {
      let datasetName = datasetLoaderModule.additionalSettings.datasets[0];
      let datasetPath = path.resolve(__dirname, '../../../datasets', type, datasetName); // TODO improve
      datasets.push(datasetLoader.loadDataset(datasetName, datasetPath, identifier, sensorsPointsNames));
    }
  });
  let newDataset = new GestureSet('GestureSet');
  // Select/aggregate/rename classes of the dataset if required
  if (datasetsConfig.aggregateClasses && datasetsConfig.aggregateClasses.length != 0) {
    datasetsConfig.aggregateClasses.forEach((aggregate, index) => {
      // Aggregate gesture class
      let newGestureClass = new GestureClass(aggregate.name, index);
      let templates = [];
      // Fuse the classes into a new aggregate class
      for (const className of aggregate.gestureClasses) {
        datasets.forEach(dataset => {
          let oldClass = dataset.getGestureClasses().get(className);
          if (oldClass) {
            templates = templates.concat(templates, oldClass.getSamples());
          }
        });
      }
      // Select a number of templates from the dataset if required
      if (datasetsConfig.templatesPerClass > 0) {
        templates = getRandomSubarray(templates, datasetsConfig.templatesPerClass);
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
        if (datasetsConfig.templatesPerClass > 0) {
          templates = getRandomSubarray(templates, datasetsConfig.templatesPerClass);
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

function getPointsNames() {
  return [];
}

module.exports = {
  initDataset
};