const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const QuantumLeap = require('./quantum-leap');
const Configuration = require('./config-helper')

// TODO clarify '+ s' for module type

////////////////////////////////////////////////////////////////////////////////
// Constants
const TEMPLATES_NAME = 'config-template.json';
const VALUES_NAME = 'config.json';
const DATASET_INFO_NAME = 'info.json';
const MAIN_DIRECTORY = __dirname;
const MODULES_DIRECTORY = path.join(__dirname, 'implementation');
const DATASETS_DIRECTORY = path.join(__dirname, 'datasets');
const SERVER_IP = '127.0.0.1';
const SERVER_PORT = 6442;

////////////////////////////////////////////////////////////////////////////////
// Create http server
let server = http.createServer();

////////////////////////////////////////////////////////////////////////////////
// Initialize QuantumLeap and its configuration
let configuration = new Configuration(MAIN_DIRECTORY, MODULES_DIRECTORY, DATASETS_DIRECTORY, VALUES_NAME, TEMPLATES_NAME, DATASET_INFO_NAME);
configuration.load();
qlConfig = configuration.toQLConfig();
let quantumLeap = new QuantumLeap(server);
try {
  quantumLeap.start(qlConfig);
} catch (err) {
  console.error(`Unable to start QuantumLeap. Details: ${err.stack}`);
}

////////////////////////////////////////////////////////////////////////////////
// REST API to modify the configuration
const app = express();
app.use(bodyParser.json())
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'POST, PUT, GET, OPTIONS');
  next();
});

app.get('/templates', (req, res) => {
  let templates = configuration.getTemplates();
  return res.status(200).json(templates);
});

app.put('/templates', (req, res) => {
  let templates = req.body.data;
  configuration.setTemplates(templates);
  res.status(204).send();
});

app.get('/values', (req, res) => {
  let values = configuration.getValues();
  return res.status(200).json(values);
});

app.put('/values', (req, res) => {
  let values = req.body.data;
  configuration.setValues(values);
  res.status(204).send();
  try {
    configuration.saveValues();
  } catch (err) {
    console.error(`Unable to restart QuantumLeap. Details: ${err.stack}`);
  }
});

app.post('/actions/restart', (req, res) => {
  try {
    quantumLeap.restart(configuration.toQLConfig());
    return res.status(200).send();
  } catch (err) {
    res.status(500).send();
  } 
});

////////////////////////////////////////////////////////////////////////////////
// Listen to http messages
server.on('request', app);

////////////////////////////////////////////////////////////////////////////////
// Start the server
server.listen(SERVER_PORT, SERVER_IP, () => {
  console.log(`QuantumLeap listening @ ${SERVER_IP}:${SERVER_PORT}.`);
});

////////////////////////////////////////////////////////////////////////////////
// Helpers

/**
 * Return the value of the property represented in inputString and undefined if 
 * the property does not exist. 
 * inputString must be in the form "key1.key2. ... .keyN", where each key is 
 * separated by a dot.
 */
function getObjectPropertyFromString(object, inputString) {
  const keys = inputString.split('.');
  return getObjectProperty(object, keys, 0);
}

function getObjectProperty(object, keys, index) {
  if (index === keys.length - 1) {
    return object[keys[index]];
  } else {
    return getObjectProperty(object[keys[index]], keys, index + 1);
  }
}

/**
 * Set the value of the property represented in inputString. Add the key if it
 * does not exist.
 * inputString must be in the form "key1.key2. ... .keyN", where each key is 
 * separated by a dot.
 */
function setObjectPropertyFromString(object, inputString, value) {
  const keys = inputString.split('.');
  setObjectProperty(object, value, keys, 0);
}

function setObjectProperty(object, value, keys, index) {
  if (index === keys.length - 1) {
    object[keys[index]] = value;
  } else {
    setObjectProperty(object[keys[index]], value, keys, index + 1);
  }
}


// function getCurrentModuleConfig(config, moduleType) {
//   let configInstance = config.generalInstance;
//   let current = config.general[configInstance].selectedModules[moduleType];
//   return config.modules[moduleType + 's'][current.module][current.instance];
// }

function getComponentInstances(values, componentType, componentName) {
  if (componentType === 'general') {
    // QuantumLeap
    return values.general;
  } else {
    // Module
    return values.modules[componentType + 's'][componentName];
  }
}

function getComponentDescription(descriptions, componentType, componentName) {
  if (componentType === 'general') {
    // QuantumLeap
    return descriptions.general;
  } else {
    // Module
    return descriptions.modules[componentType + 's'][componentName];
  }
}

function getCurrentComponent(values, componentType) {
  let currentGeneralInstance = values.general[values.generalInstance];
  if (componentType === 'general') {
    // QuantumLeap
    return { module: undefined, instance: values.generalInstance };
  } else {
    // Module
    let currentModule = currentGeneralInstance.selectedModules[componentType];
    return { module: currentModule.module, instance: currentModule.instance };
  }
}

function getCurrentComponentValues(values, componentType) {
  let currentGeneralInstance = values.general[values.generalInstance];
  if (componentType === 'general') {
    // QuantumLeap
    return currentGeneralInstance;
  } else {
    // Module
    let currentModule = currentGeneralInstance.selectedModules[componentType];
    return values.modules[componentType + 's'][currentModule.module][currentModule.instance];
  }
}

function getCurrentComponentDescription(values, descriptions, componentType) {
  if (componentType === 'general') {
    // QuantumLeap
    return descriptions.general;
  } else {
    // Module
    let currentGeneralInstance = values.general[values.generalInstance];
    let currentModule = currentGeneralInstance.selectedModules[componentType];
    return descriptions.modules[componentType + 's'][currentModule.module];
  }
}