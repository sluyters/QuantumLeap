const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const QuantumLeap = require('./quantum-leap');
const Configuration = require('./config-helper')

// TODO clarify '+ s' for module type

////////////////////////////////////////////////////////////////////////////////
// Constants
const CONFIG_DEF_NAME = 'config-def.json';
const CONFIG_NAME = 'config.json';
const MAIN_DIRECTORY = __dirname;
const MODULES_DIRECTORY = path.join(__dirname, 'implementation');
const SERVER_IP = '127.0.0.1';
const SERVER_PORT = 6442;

////////////////////////////////////////////////////////////////////////////////
// Create http server
let server = http.createServer();

////////////////////////////////////////////////////////////////////////////////
// Initialize QuantumLeap and its configuration
let configuration = new Configuration(MAIN_DIRECTORY, MODULES_DIRECTORY, CONFIG_NAME, CONFIG_DEF_NAME);
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

app.get('/configurations', (req, res) => {
  // TODO
  return res.status(501);
});

app.get('/configurations/current', (req, res) => {
  // TODO
  return res.status(501);
});

// Responds with the general description
app.get('/configurations/current/general/description', (req, res) => {
  let descriptions = configuration.getDescriptions();
  let description = getComponentDescription(descriptions, 'general');
  return res.status(200).json(description);
});

// Responds with the description of the module
app.get('/configurations/current/modules/:moduleType/description', (req, res) => {
  let moduleType = req.params.moduleType;
  let moduleName = req.params.moduleName;
  let descriptions = configuration.getDescriptions();
  let moduleDescription = getComponentDescription(descriptions, moduleType, moduleName);
  return res.status(200).json(moduleDescription);
});

// "/configurations/current/general/values?setting='example1.example2'"
// Responds with the values for each general setting
app.get('/configurations/current/general/values', (req, res) => {
  let setting = req.query.setting;
  let values = configuration.getValues();
  let generalValues = getCurrentComponentValues(values, 'general');
  if (setting) {
    // Send just the value of this setting
    let value = getObjectPropertyFromString(generalValues, setting);
    return res.status(200).json(value);
  } else {
    // Send the value of each setting
    return res.status(200).json(generalValues);
  }
});

// Responds with the name of the current selected module
app.get('/configurations/current/modules/:moduleType', (req, res) => {
  let moduleType = req.params.moduleType;
  let values = configuration.getValues();
  let moduleName = getCurrentComponent(values, moduleType).module;
  // Send the name of the selected module
  return res.status(200).json(moduleName);
});

// "/configurations/current/modules/:moduleType/values?setting='example1.example2'"
// Responds with the values for each setting of the module
app.get('/configurations/current/modules/:moduleType/values', (req, res) => {
  let moduleType = req.params.moduleType;
  let setting = req.query.setting;
  let values = configuration.getValues();
  let moduleValues = getCurrentComponentValues(values, moduleType);
  if (setting) {
    // Send just the value of this setting
    let value = getObjectPropertyFromString(moduleValues, setting);
    return res.status(200).json(value);
  } else {
    // Send the value of each setting
    return res.status(200).json(moduleValues);
  }
});

// "/configurations/current/general/properties?property='example1.example2'"
// Responds with the properties of the module
app.get('/configurations/current/general/properties', (req, res) => {
  let propertyName = req.query.property;
  let values = configuration.getValues();
  let descriptions = configuration.getDescriptions();
  let generalDescription = getCurrentComponentDescription(values, descriptions, 'general');
  let generalProperties = generalDescription.properties;
  if (propertyName) {
    // Send just the value of this property
    let property = getObjectPropertyFromString(generalProperties, propertyName);
    return res.status(200).json(property);
  } else {
    // Send the value of each property
    return res.status(200).json(generalProperties);
  }
});

// "/configurations/current/modules/:moduleType/properties?property='example1.example2'"
// Responds with the properties of the module
app.get('/configurations/current/modules/:moduleType/properties', (req, res) => {
  let moduleType = req.params.moduleType;
  let propertyName = req.query.property;
  let values = configuration.getValues();
  let descriptions = configuration.getDescriptions();
  let moduleDescription = getCurrentComponentDescription(values, descriptions, moduleType);
  let moduleProperties = moduleDescription.properties;
  if (propertyName) {
    // Send just the value of this property
    let property = getObjectPropertyFromString(moduleProperties, propertyName);
    return res.status(200).json(property);
  } else {
    // Send the value of each property
    return res.status(200).json(moduleProperties);
  }
});

app.get('/configurations/all', (req, res) => {
  // TODO
  return res.status(501);
});

// Responds with the the list of modules of this type
app.get('/configurations/all/modules/:moduleType', (req, res) => {
  let moduleType = req.params.moduleType;
  let descriptions = configuration.getDescriptions();
  let modules = Object.keys(descriptions.modules[moduleType + 's']);
  return res.status(200).json(modules);
});

// Responds with the description of the general configuration
app.get('/configurations/all/general/description', (req, res) => {
  let descriptions = configuration.getDescriptions();
  let description = getComponentDescription(descriptions, 'general');
  return res.status(200).json(description);
});

// Responds with the list of instances of the module
app.get('/configurations/all/modules/:moduleType/:moduleName/instances', (req, res) => {
  let moduleType = req.params.moduleType;
  let moduleName = req.params.moduleName;
  let values = configuration.getValues();
  let instances = Object.keys(values.modules[moduleType + 's'][moduleName]);
  return res.status(200).json(instances);
});

// Responds with the description of the module
app.get('/configurations/all/modules/:moduleType/:moduleName/description', (req, res) => {
  let moduleType = req.params.moduleType;
  let moduleName = req.params.moduleName;
  let descriptions = configuration.getDescriptions();
  let moduleDescription = getComponentDescription(descriptions, moduleType, moduleName);
  return res.status(200).json(moduleDescription);
});

// "/configurations/all/general/properties?property='example1.example2'"
// Responds with the general properties
app.get('/configurations/all/general/properties', (req, res) => {
  let propertyName = req.query.property;
  let descriptions = configuration.getDescriptions();
  let properties = getComponentDescription(descriptions, 'general').properties;
  if (propertyName) {
    // Send just the value of this property
    let property = getObjectPropertyFromString(properties, propertyName);
    return res.status(200).json(property);
  } else {
    // Send the value of each property
    return res.status(200).json(properties);
  }
});

// "/configurations/all/modules/:moduleType/:moduleName/properties?property='example1.example2'"
// Responds with the properties of the module
app.get('/configurations/all/modules/:moduleType/:moduleName/properties', (req, res) => {
  let moduleType = req.params.moduleType;
  let moduleName = req.params.moduleName;
  let propertyName = req.query.property;
  let descriptions = configuration.getDescriptions();
  let moduleProperties = getComponentDescription(descriptions, moduleType, moduleName).properties;
  if (propertyName) {
    // Send just the value of this property
    let property = getObjectPropertyFromString(moduleProperties, propertyName);
    return res.status(200).json(property);
  } else {
    // Send the value of each property
    return res.status(200).json(moduleProperties);
  }
});

// "/configurations/all/general/values?setting='example1.example2'"
// Responds with the values for each general setting
app.get('/configurations/all/general/:instance/values', (req, res) => {
  let instance = req.params.instance;
  let setting = req.query.setting;
  let values = configuration.getValues();
  let generalValues = getComponentInstances(values, 'general')[instance];
  if (setting) {
    // Send just the value of this setting
    let value = getObjectPropertyFromString(generalValues, setting);
    return res.status(200).json(value);
  } else {
    // Send the value of each setting
    return res.status(200).json(generalValues);
  }
});

// "/configurations/all/general/values?setting='example1.example2'"
app.put('/configurations/all/general/:instance/values', (req, res) => {
  let instance = req.params.instance;
  let setting = req.query.setting;
  if (setting) {
    // Set just the value of this setting
    //let value = getObjectPropertyFromString(generalValues, setting);
  } else {
    // Set the value of each setting
    let newValues = req.body.data;
    configuration.setGeneralValues(newValues, instance);
  }
  res.status(204).send();
  try {
    configuration.saveValues();
    quantumLeap.restart(configuration.toQLConfig());
  } catch (err) {
    console.error(`Unable to restart QuantumLeap. Details: ${err.stack}`);
  }
});

// "/configurations/all/modules/:moduleType/:moduleName/:moduleInstance/values?setting='example1.example2'"
// Responds with the values for each setting of the module
app.get('/configurations/all/modules/:moduleType/:moduleName/:moduleInstance/values', (req, res) => {
  let moduleType = req.params.moduleType;
  let moduleName = req.params.moduleName;
  let moduleInstance = req.params.moduleInstance;
  let setting = req.query.setting;
  let values = configuration.getValues();
  let moduleValues = getComponentInstances(values, moduleType, moduleName)[moduleInstance];
  if (setting) {
    // Send just the value of this setting
    let value = getObjectPropertyFromString(moduleValues, setting);
    return res.status(200).json(value);
  } else {
    // Send the value of each setting
    return res.status(200).json(moduleValues);
  }
});

// "/configurations/all/modules/:moduleType/:moduleName/:moduleInstance/values?setting='example1.example2'"
app.put('/configurations/all/modules/:moduleType/:moduleName/:moduleInstance/values', (req, res) => {
  let moduleType = req.params.moduleType;
  let moduleName = req.params.moduleName;
  let moduleInstance = req.params.moduleInstance;
  let setting = req.query.setting;
  if (setting) {
    // Set just the value of this setting
    let newValue = req.body.data;
    //configuration.setModuleValue(newValue, moduleType, moduleName, moduleInstance, setting);
  } else {
    // Set the value of each setting
    let newValues = req.body.data;
    configuration.setModuleValues(newValues, moduleType + 's', moduleName, moduleInstance);
  }
  res.status(204).send();
  try {
    configuration.saveValues();
    quantumLeap.restart(configuration.toQLConfig());
  } catch (err) {
    console.error(`Unable to restart QuantumLeap. Details: ${err.stack}`);
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