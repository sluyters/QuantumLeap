const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const QuantumLeap = require('./framework/quantum-leap');
const Configuration = require('./config-helper');

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
    let qlConfig = configuration.toQLConfig();
    quantumLeap.restart(qlConfig);
    return res.status(200).send();
  } catch (err) {
    console.log(err.stack)
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
