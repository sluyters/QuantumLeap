const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const QuantumLeap = require('./quantum-leap');

///////////////////////////////////////////////////////////////////////////////
// Constants
const CONFIG_PATH = path.join(__dirname, 'config.json');
const MODULES_PATH = path.join(__dirname, 'implementation');
const SERVER_IP = '127.0.0.1';
const SERVER_PORT = 6442;

///////////////////////////////////////////////////////////////////////////////
// Create http server
let server = http.createServer();

///////////////////////////////////////////////////////////////////////////////
// Initialize QuantumLeap and its configuration
let [config, exportedProperties] = loadQLConfig(CONFIG_PATH, MODULES_PATH);
const oldConfig = require('./config'); // TODO Remove eventually
config['datasets'] = oldConfig.datasets; // TODO Remove eventually
let quantumLeap = new QuantumLeap(config, server);

///////////////////////////////////////////////////////////////////////////////
// REST API for settings
const app = express();
app.use(bodyParser.json())

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'POST, PUT, GET, OPTIONS');
  next();
});

app.get('/modules/:moduleType', (req, res) => {
  let moduleType = req.params.moduleType;
  let modulesPath = path.join(MODULES_PATH, moduleType);
  let withConfigs = req.query.withConfigs === 'true' ? true : false;
  fs.readdir(modulesPath, { withFileTypes: true } , (err, items) => {
    if (err) {
      return res.status(500).json({ message: String(err) });
    } else {
      let modules = [];
      if (!withConfigs) {
        modules = items.filter(item => item.isDirectory()).map(item => item.name);
      } else {
        try {
          modules = items.filter(item => item.isDirectory()).map(item => {
            let modulePath = path.join(modulesPath, item.name, 'config.json');
            let moduleConfig = JSON.parse(fs.readFileSync(modulePath))
            moduleConfig.settings = parseImportedProperties(moduleConfig.settings, exportedProperties);
            return moduleConfig;
          });
        } catch(err) {
          return res.status(500).json({ message: String(err) });
        }
      }
      return res.status(200).json({ modules: modules });
    }
  });
  //res.send('TEST1');
  //quantumLeap.restart(config);
});

app.get('/modules/:moduleType/:moduleName', (req, res) => {
  let moduleType = req.params.moduleType;
  let moduleName = req.params.moduleName;
  let modulePath = path.join(MODULES_PATH, moduleType, moduleName, 'config.json');
  fs.readFile(modulePath, (err, data) => {
    if (err) {
      return res.status(500).json({ message: String(err) });
    } else {
      let moduleConfig = JSON.parse(data);
      moduleConfig.settings = parseImportedProperties(moduleConfig.settings, exportedProperties);
      return res.status(200).json({ module: moduleConfig });
    }
  });
  //return res.send('TEST2');
});

app.put('/modules/:moduleType/:moduleName', (req, res) => {
  let moduleType = req.params.moduleType;
  let moduleName = req.params.moduleName;
  let modulePath = path.join(MODULES_PATH, moduleType + 's', moduleName, 'config.json');
  let moduleConfig = req.body.config;
  console.log(moduleConfig)
  if (!moduleConfig) {
    // TODO check the data
    return res.status(400).json({ message: 'Invalid data' });
  }
  fs.writeFile(modulePath, JSON.stringify(moduleConfig, null, 2), (err) => {
    if (err) {
      console.log(err)
      return res.status(500).json({ message: `Error while saving the configuration ${String(err)}` });
    } else {
      // Re-load the configuration
      [config, exportedProperties] = loadQLConfig(CONFIG_PATH, MODULES_PATH);
      config['datasets'] = oldConfig.datasets; // TODO Remove eventually
      // Restart QuantumLeap
      quantumLeap.restart(config);
      return res.status(200).json({ message: 'Success' });
    }
  })
});

///////////////////////////////////////////////////////////////////////////////
// Listen to http messages
server.on('request', app);

///////////////////////////////////////////////////////////////////////////////
// Start the server
server.listen(SERVER_PORT, SERVER_IP, () => {
  console.log(`QuantumLeap listening @ ${SERVER_IP}:${SERVER_PORT}.`);
});

///////////////////////////////////////////////////////////////////////////////
// Helpers
function loadQLConfig(pathToConfig, pathToModules) {
  let rawConfig = JSON.parse(fs.readFileSync(pathToConfig));
  let parsedConfig = parseSettings(rawConfig.settings)
  let exportedProperties = {};
  // Get the configuration of each module
  Object.keys(rawConfig.selectedModules).forEach(moduleName => {
    let selectedModule = rawConfig.selectedModules[moduleName];
    let pathToModule = path.join(pathToModules, moduleName + 's', selectedModule);
    let pathToModuleConfig = path.join(pathToModule, 'config.json')
    let rawModuleConfig = JSON.parse(fs.readFileSync(pathToModuleConfig));
    parsedConfig[moduleName] = {
      module: require(pathToModule),
      options: parseSettings(rawModuleConfig.settings)
    };
    exportedProperties[moduleName] = rawModuleConfig.exportedProperties;
  });
  return [parsedConfig, exportedProperties];
}

function parseSettings(settings) {
  let parsedSettings = {};
  settings.forEach(item => {
    if (item.type === 'category') {
      parsedSettings[item.name] = parseSettings(item.settings);
    } else if (item.type === 'setting') {
      parsedSettings[item.name] = item.data.current;
    }
  });
  return parsedSettings;
}

function parseImportedProperties(settings, exportedProperties) {
  settings.forEach((item, index) => {
    if (item.type === 'category') {
      settings[index].settings = parseImportedProperties(item.settings);
    } else if (item.type === 'setting') {
      settings[index].data = parseDataImportedProperties(item.data, exportedProperties);
    }
  });
  return settings;
}

function parseDataImportedProperties(setting, exportedProperties) {
  Object.keys(setting).forEach(property => {
    const value = setting[property];
    if (value && typeof value === 'object') {
      if (value.isExternalProperty) {
        setting[property] = exportedProperties[value.module][value.propertyName];
      } else {
        setting[property] = parseDataImportedProperties(setting[property], exportedProperties)
      }
    }
  });
  return setting;
}