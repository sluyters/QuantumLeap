////////////////////////////////////////////////////////////////////////////////
// Imports

const fs = require('fs');
const path = require('path');

////////////////////////////////////////////////////////////////////////////////
// Constants

const CONFIG_DEF_NAME = 'config-def.json';
const QL_CONFIG_DEF_PATH = path.join(__dirname, CONFIG_DEF_NAME);
const MODULES_PATH = path.join(__dirname, 'implementation');

////////////////////////////////////////////////////////////////////////////////
// Exported functions

/**
 * Convert config into an object usable by QuantumLeap
 */
function configToQLConfig(config) {
  let generalInstance = config.generalInstance;
  let QLConfig = config.general[generalInstance];
  let selectedModules = config.general[generalInstance].selectedModules
  Object.keys(selectedModules).forEach(moduleType => {
    let selectedModule = selectedModules[moduleType];
    if (moduleType === 'datasets') {
      QLConfig[moduleType] = {};
      Object.keys(selectedModule).forEach(datasetType => {
        let selectedDataset = selectedModule[datasetType];
        let pathToModule = path.join(MODULES_PATH, moduleType, datasetType, selectedDataset.module);
        let moduleConfig = config.modules[moduleType][datasetType][selectedDataset.module][selectedDataset.instance];
        // Add the config of the dataset
        QLConfig[moduleType][datasetType] = {
          module: require(pathToModule),
          options: moduleConfig
        };
      });
    } else {
      let pathToModule = path.join(MODULES_PATH, moduleType + 's', selectedModule.module);
      let moduleConfig = config.modules[moduleType + 's'][selectedModule.module][selectedModule.instance];
      // Add the config of the module
      QLConfig[moduleType] = {
        module: require(pathToModule),
        options: moduleConfig
      };
    }
  });
  return QLConfig;
}

/**
 * Load the config from a config.json file
 */
function loadConfig(configPath) {
  try {
    return JSON.parse(fs.readFileSync(configPath));
  } catch(err) {
    console.error(err);
    return undefined;
  }
}

/**
 * Load the config definition from a config-def.json file
 */
function loadConfigDef() {

}

/**
 * Load the config definitions
 */
function loadConfigDefs() {

}

/**
 * Save the config in a config.json file.
 */
function saveConfig(configPath, config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

/**
 * Build a configuration from the config-def.json files
 */
function buildConfig() {
  // Init config
  let config = { generalInstance: "default" };
  // Get general QL config
  config["general"] = { default: getConfigFrom(QL_CONFIG_DEF_PATH) };
  // Get modules configs
  config["modules"] = initConfigs(MODULES_PATH, CONFIG_DEF_NAME);
  return config;
}

/**
 * Rebuild the config with new modules and settings (if any). 
 * Previous settings are not overwritten.
 */
function updateConfig(config) {
  // Build new config
  let newConfig = buildConfig();
  // For each key of new config, check if there is an equivalent key in the old one
  let ret = fuseObjects(config, newConfig);
  return { 
    modified: ret.modified,
    config: ret.fusedObject 
  };
}

////////////////////////////////////////////////////////////////////////////////
// Helpers

/**
 * Add to object1 all the keys of object2 that are not in object1.
 */
function fuseObjects(object1, object2) {
  let modified = false;
  let fusedObject = {};
  Object.keys(object2).forEach(key => {
    if(!object1.hasOwnProperty(key)) {
      // Add the missing property
      fusedObject[key] = object2[key];
      modified = true;
    } else if (typeof object1[key] === 'object' && object1[key] !== null) {
      // Check sub-properties
      let ret = fuseObjects(object1[key], object2[key]);
      fusedObject[key] = ret.fusedObject;
      modified = ret.modified;
    } else {
      // Keep value from object1
      fusedObject[key] = object1[key];
    }
  });
  // Add the missing properties from object1
  Object.keys(object1).forEach(key => {
    if(!fusedObject.hasOwnProperty(key)) {
      fusedObject[key] = object1[key];
    }
  });
  return { modified, fusedObject };
} 

function initConfigs(directory, configDefName) {
  let config = {};
  let items = fs.readdirSync(directory, { withFileTypes: true });
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    const itemPath = path.join(directory, item.name);
    if (item.isDirectory()) {
      let subConfig = initConfigs(itemPath, configDefName);
      if (Object.keys(subConfig).length !== 0) {
        config[item.name] = subConfig;
      }
    } else if (item.name === configDefName) {
      let defaultConfig = getConfigFrom(itemPath);
      return { default: defaultConfig }; 
    }
  }
  return config;
}

function getConfigFrom(filePath) {
  const configDef = JSON.parse(fs.readFileSync(filePath));
  return parseSettings(configDef.settings);
}

function parseSettings(settings) {
  let parsedSettings = {};
  settings.forEach(item => {
    if (item.type === 'category') {
      parsedSettings[item.name] = parseSettings(item.settings);
    } else if (item.type === 'setting') {
      parsedSettings[item.name] = item.data.default;
    }
  });
  return parsedSettings;
}

////////////////////////////////////////////////////////////////////////////////
// Exports
module.exports = {
  configToQLConfig,
  loadConfig,
  loadConfigDef,
  loadConfigDefs,
  saveConfig,
  buildConfig,
  updateConfig
};