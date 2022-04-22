const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const QuantumLeap = require('./framework/quantumleap');
const UserIndependentTesting = require('./framework/testing').UserIndependentTesting;
const UserDependentTesting = require('./framework/testing').UserDependentTesting;
const Configuration = require('./framework/config-helper');
const LogHelper = require('./framework/log-helper');

////////////////////////////////////////////////////////////////////////////////
// Constants
const TEMPLATES_NAME = 'config-template.json';
const VALUES_NAME = 'config.json';
const DATASET_INFO_NAME = 'info.json';
const TESTING_DIRECTORY_D = path.join(__dirname, 'config', 'testing', 'dynamic');
const TESTING_DIRECTORY_S = path.join(__dirname, 'config', 'testing', 'static');
const QUANTUMLEAP_DIRECTORY = path.join(__dirname, 'config', 'quantumleap');
const MODULES_DIRECTORY = path.join(__dirname, 'implementation');
const DATASETS_DIRECTORY = path.join(__dirname, 'datasets');
const SERVER_IP = '127.0.0.1';
const SERVER_PORT = 6442;

////////////////////////////////////////////////////////////////////////////////
// Create http server
let server = http.createServer();

////////////////////////////////////////////////////////////////////////////////
// Initialize Benchmarking tool and its configuration
let testingConfigD = new Configuration(TESTING_DIRECTORY_D, MODULES_DIRECTORY, DATASETS_DIRECTORY, VALUES_NAME, TEMPLATES_NAME, DATASET_INFO_NAME);
testingConfigD.load();
let testingConfigS = new Configuration(TESTING_DIRECTORY_S, MODULES_DIRECTORY, DATASETS_DIRECTORY, VALUES_NAME, TEMPLATES_NAME, DATASET_INFO_NAME);
testingConfigS.load();

// Initialize QuantumLeap and its configuration
let configuration = new Configuration(QUANTUMLEAP_DIRECTORY, MODULES_DIRECTORY, DATASETS_DIRECTORY, VALUES_NAME, TEMPLATES_NAME, DATASET_INFO_NAME);
configuration.load();
qlConfig = configuration.toQLConfig();
let quantumLeap = new QuantumLeap(server);
try {
  quantumLeap.start(qlConfig);
} catch (err) {
  LogHelper.log('error', `Unable to start QuantumLeap. Details: ${err.stack}`);
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

// app.get('/quantumleap/templates', (req, res) => {
//   let templates = configuration.getTemplates();
//   return res.status(200).json(templates);
// });

app.get('/quantumleap/templates/:moduleType?/:gestureType?', (req, res) => {
  let moduleType = req.params.moduleType;
  let gestureType = req.params.gestureType;
  let templates = configuration.getTemplates();
  if (moduleType) {
    templates = templates.main.settings[moduleType];
  }
  if (gestureType) {
    templates = templates[gestureType];
  }
  return res.status(200).json(templates);
});

app.get('/quantumleap/values/:moduleType?/:gestureType?', (req, res) => {
  let moduleType = req.params.moduleType;
  let gestureType = req.params.gestureType;
  let values = configuration.getValues();
  if (moduleType) {
    values = values.main.settings[moduleType];
  }
  if (gestureType) {
    values = values[gestureType];
  }
  return res.status(200).json(values);
});

app.put('/quantumleap/values/:moduleType?/:gestureType?', (req, res) => {
  let moduleType = req.params.moduleType;
  let gestureType = req.params.gestureType;
  let values = configuration.getValues();
  let newValues = req.body.data;
  if (moduleType) {
    if (gestureType) {
      values.main.settings[moduleType][gestureType] = newValues;
    } else {
      values.main.settings[moduleType] = newValues;
    }
  } else {
    values = newValues;
  }
  configuration.setValues(values);
  res.status(204).send();
  try {
    configuration.saveValues();
  } catch (err) {
    LogHelper.log('error', `Unable to save the values. Details: ${err.stack}`);
  }
});

app.get('/quantumleap/state/running', (req, res) => {
  return res.status(200).json({ running: quantumLeap.isRunning() });
});

app.post('/quantumleap/actions/start', (req, res) => {
  try {
    let qlConfig = configuration.toQLConfig();
    quantumLeap.start(qlConfig);
    return res.status(204).send();
  } catch (err) {
    LogHelper.log('error', `Unable to restart QuantumLeap. Details: ${err.stack}`)
    res.status(500).send();
  } 
});

app.post('/quantumleap/actions/stop', (req, res) => {
  try {
    quantumLeap.stop();
    return res.status(204).send();
  } catch (err) {
    LogHelper.log('error', `Unable to stop QuantumLeap. Details: ${err.stack}`)
    res.status(500).send();
  } 
});

app.get('/testing/dynamic/templates', (req, res) => {
  let templates = testingConfigD.getTemplates();
  return res.status(200).json(templates);
});


app.get('/testing/dynamic/values', (req, res) => {
  let values = testingConfigD.getValues();
  return res.status(200).json(values);
});

app.put('/testing/dynamic/values', (req, res) => {
  let values = req.body.data;
  testingConfigD.setValues(values);
  res.status(204).send();
  try {
    testingConfigD.saveValues();
  } catch (err) {
    LogHelper.log('error', `Unable to save the values. Details: ${err.stack}`);
  }
});
app.post('/testing/dynamic/actions/start', (req, res) => {
  try {
    let parsedTestingConfig = testingConfigD.toQLConfig();
    if (parsedTestingConfig.main.settings.general.testingParams.userDependent) {
      let userDependentTesting = new UserDependentTesting('dynamic', parsedTestingConfig.main.settings);
      userDependentTesting.run();
    }
    if (parsedTestingConfig.main.settings.general.testingParams.userIndependent) {
      let userIndependentTesting = new UserIndependentTesting('dynamic', parsedTestingConfig.main.settings);
      userIndependentTesting.run();
    }
    return res.status(200).send();
  } catch (err) {
    LogHelper.log('error', `Unable to start testing. Details: ${err.stack}`)
    res.status(500).send();
  } 
});

app.get('/testing/static/templates', (req, res) => {
  let templates = testingConfigS.getTemplates();
  return res.status(200).json(templates);
});


app.get('/testing/static/values', (req, res) => {
  let values = testingConfigS.getValues();
  return res.status(200).json(values);
});

app.put('/testing/static/values', (req, res) => {
  let values = req.body.data;
  testingConfigS.setValues(values);
  res.status(204).send();
  try {
    testingConfigS.saveValues();
  } catch (err) {
    LogHelper.log('error', `Unable to save the values. Details: ${err.stack}`);
  }
});
app.post('/testing/static/actions/start', (req, res) => {
  try {
    let parsedTestingConfig = testingConfigS.toQLConfig();
    if (parsedTestingConfig.main.settings.general.testingParams.userDependent) {
      let userDependentTesting = new UserDependentTesting('static', parsedTestingConfig.main.settings);
      userDependentTesting.run();
    }
    if (parsedTestingConfig.main.settings.general.testingParams.userIndependent) {
      let userIndependentTesting = new UserIndependentTesting('static', parsedTestingConfig.main.settings);
      userIndependentTesting.run();
    }
    return res.status(200).send();
  } catch (err) {
    LogHelper.log('error', `Unable to start testing. Details: ${err.stack}`)
    res.status(500).send();
  } 
});

////////////////////////////////////////////////////////////////////////////////
// Listen to http messages
server.on('request', app);

////////////////////////////////////////////////////////////////////////////////
// Start the server
server.listen(SERVER_PORT, SERVER_IP, () => {
  LogHelper.log('info', `QuantumLeap listening @ ${SERVER_IP}:${SERVER_PORT}.`);
});
