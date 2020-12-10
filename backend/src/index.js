const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const QuantumLeap = require('./framework/quantum-leap');
const UserIndependentTesting = require('./testing/testing').UserIndependentTesting;
const Configuration = require('./framework/config-helper');

////////////////////////////////////////////////////////////////////////////////
// Constants
const TEMPLATES_NAME = 'config-template.json';
const VALUES_NAME = 'config.json';
const DATASET_INFO_NAME = 'info.json';
const TESTING_DIRECTORY_D = path.join(__dirname, 'testing', 'dynamic');
const TESTING_DIRECTORY_S = path.join(__dirname, 'testing', 'static');
const QUANTUMLEAP_DIRECTORY = path.join(__dirname, 'quantumleap');
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

app.get('/quantumleap/templates', (req, res) => {
  let templates = configuration.getTemplates();
  return res.status(200).json(templates);
});

// app.put('/templates', (req, res) => {
//   let templates = req.body.data;
//   configuration.setTemplates(templates);
//   res.status(204).send();
// });

app.get('/quantumleap/values', (req, res) => {
  let values = configuration.getValues();
  return res.status(200).json(values);
});

app.put('/quantumleap/values', (req, res) => {
  let values = req.body.data;
  configuration.setValues(values);
  res.status(204).send();
  try {
    configuration.saveValues();
  } catch (err) {
    console.error(`Unable to save the values. Details: ${err.stack}`);
  }
});

app.post('/quantumleap/actions/restart', (req, res) => {
  try {
    let qlConfig = configuration.toQLConfig();
    quantumLeap.restart(qlConfig);
    return res.status(200).send();
  } catch (err) {
    console.log(`Unable to restart QuantumLeap. Details: ${err.stack}`)
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
    console.error(`Unable to save the values. Details: ${err.stack}`);
  }
});
app.post('/testing/dynamic/actions/start', (req, res) => {
  try {
    let parsedTestingConfig = testingConfigD.toQLConfig();
    // TODO
    let userIndependentTesting = new UserIndependentTesting('dynamic', parsedTestingConfig.main.settings);
    userIndependentTesting.run();
    return res.status(200).send();
  } catch (err) {
    console.log(`Unable to start testing. Details: ${err.stack}`)
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
    console.error(`Unable to save the values. Details: ${err.stack}`);
  }
});
app.post('/testing/static/actions/start', (req, res) => {
  try {
    let parsedTestingConfig = testingConfigS.toQLConfig();
    // TODO
    let userIndependentTesting = new UserIndependentTesting('static', parsedTestingConfig.main.settings);
    userIndependentTesting.run();
    return res.status(200).send();
  } catch (err) {
    console.log(`Unable to start testing. Details: ${err.stack}`)
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
