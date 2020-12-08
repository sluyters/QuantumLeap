////////////////////////////////////////////////////////////////////////////////
// Imports
const fs = require('fs');
const path = require('path');

////////////////////////////////////////////////////////////////////////////////
// Exported functions
class QLConfiguration {
  /**
   * @param {string} mainDirectory - The directory where the main configuration
   * and definition files are located.
   * @param {string} modulesDirectory - The directory where the modules are 
   * located.
   * @param {string} configFilename - The name of the configuration files.
   * @param {string} templateFilename - The name of the templates files.
   */
  constructor(mainDirectory, modulesDirectory, datasetsDirectory, configFilename, templateFilename, datasetInfoFilename) {
    this.mainDirectory = mainDirectory;
    this.modulesDirectory = modulesDirectory;
    this.datasetsDirectory = datasetsDirectory;
    this.configFilename = configFilename;
    this.templateFilename = templateFilename;
    this.datasetInfoFilename = datasetInfoFilename;
    this.configPath = path.join(mainDirectory, configFilename);
    this.mainConfigDefPath = path.join(mainDirectory, templateFilename);
    this.templates = {};
    this.values = {};
  }

  load() {
    // Load the configuration
    console.log('Loading configuration...');
    this.loadTemplates()
    console.log(JSON.stringify(this.templates, null, 2));
    if (!this.loadValues()) {
      // No configuration loaded, rebuild the configuration
      console.log('No valid configuration found. Building a new configuration...');
      if (this.buildValues()) {
        this.saveValues();
      }
    } else {
      // // Configuration loaded, check for modifications
      // console.log('Configuration loaded! Checking for new modules/settings...');
      // if (this.rebuildValues()) {
      //   console.log('New modules/settings found! Saving the modications...');
      //   //this.saveValues();
      // }
    }
    console.log(JSON.stringify(this.values, null, 2));
    console.log('Done!');
  }

  /**
   * Load the config templates
   */
  loadTemplates() {
    let newConfigDefs = {}
    try {
      // Load main config definition
      newConfigDefs['main'] = JSON.parse(fs.readFileSync(this.mainConfigDefPath));
      // Load config templates of the modules
      newConfigDefs['modules'] = initData(this.modulesDirectory, this.templateFilename);
      // Load datasets
      newConfigDefs['datasets'] = initData(this.datasetsDirectory, this.datasetInfoFilename);
    } catch (err) {
      console.error(`Failed to load the config templates. Details: ${err.stack}`);
      return false;
    }
    this.templates = newConfigDefs;
    return true;
  }

  /**
   * Load the QuantumLeap configuration. Return false if the configuration could
   * not be loaded, true otherwise.
   */
  loadValues() {
    try {
      this.values = JSON.parse(fs.readFileSync(this.configPath));
    } catch (err) {
      console.error(`Failed to load the config values. Details: ${err.stack}`);
      this.values = {};
      return false;
    }
    return true;
  }

  /**
   * Build a configuration from the config-def.json files. Return false if the 
   * configuration could not be built, true otherwise.
   */
  buildValues() {
    try {
      this.values = {
        main: {
          settings: buildModuleValues(this.templates.main.settings)
        }
      }
    } catch (err) {
      console.error(`Failed to build the configuration. Details: ${err.stack}`);
      this.values = {};
      return false;
    }
    return true;
  }

  // /**
  //  * Rebuild the config with new modules and settings (if any). Previous 
  //  * settings are not overwritten. Return false if the configuration was not
  //  * updated, true otherwise.
  //  */
  // rebuildValues() {
  //   try {
  //     // Build new config
  //     let newConfig = buildValuesHelper(this.templates);
  //     // For each key of new config, check if there is an equivalent key in the old one
  //     let ret = fuseObjects(this.values, newConfig);
  //     if (ret.modified) {
  //       this.values = ret.fusedObject;
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   } catch (err) {
  //     console.error(`Failed to update the configuration. Details: ${err.stack}`);
  //     return false;
  //   }
  // }

  /**
   * Save the configuration in a config.json file. Return false if the 
   * configuration could not be saved, true otherwise.
   */
  saveValues() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.values, null, 2));
    } catch (err) {
      console.error(`Failed to save the configuration. Details: ${err.stack}`);
      return false;
    }
    return true;
  }

  /**
   * Convert config into an object usable by QuantumLeap
   */
  toQLConfig() {
    // Helper
    const parseValues = (values) => {
      if (typeof values === 'object' && values !== null) {
        let config = Array.isArray(values) ? [] : {};
        Object.keys(values).forEach(key => {
          config[key] = parseValues(values[key]);
        });
        if (values.hasOwnProperty('moduleName') && values.hasOwnProperty('moduleType')) {
          let pathToModule = path.join(this.modulesDirectory, values.moduleType, values.moduleName);
          config['module'] = require(pathToModule);
        }
        return config;
      } else {
        return values;
      }
    };
    let qlConfig = parseValues(this.values);
    return qlConfig;
  }

  // Getters and setters. Eventually, add getters/setters for specific values/templates
  getTemplates() {
    return this.templates;
  }

  setTemplates(templates) {
    this.templates = templates;
  }

  getValues() {
    return this.values;
  }

  setValues(values) {
    // TODO Check if values are valid
    this.values = values;
  }

  setGeneralValues(values, generalInstance) {
    this.values.general[generalInstance] = values;
    console.log(JSON.stringify(this.values, null, 2))
  }

  setModuleValues(values, moduleType, moduleName, moduleInstance) {
    this.values.modules[moduleType][moduleName][moduleInstance] = values;
    console.log(JSON.stringify(this.values, null, 2))
  }

  setModuleValue(value, moduleType, moduleName, moduleInstance, valuePath) {
  
  }

}

////////////////////////////////////////////////////////////////////////////////
// Helpers

// function buildValuesHelper(templates) {
//   let values = {
//     main: {
//       settings: buildModuleValues(templates.main.settings)
//     }
//   }
//   return values;
// }

function buildModuleValues(modules) {
  let values = {};
  Object.keys(modules).forEach(key => {
    if (Array.isArray(modules[key])) {
      // Get the settings of the module
      values[key] = getValuesFromSettings(modules[key]);
    } else {
      // There are other sub-modules
      values[key] = buildModuleValues(modules[key]);
    }
  });
  return values;
}

// /**
//  * Add to object1 all the keys of object2 that are not in object1.
//  */
// function fuseObjects(object1, object2) {
//   let modified = false;
//   let fusedObject = {};
//   Object.keys(object2).forEach(key => {
//     if(!object1.hasOwnProperty(key)) {
//       // Add the missing property
//       fusedObject[key] = object2[key];
//       modified = true;
//     } else if (typeof object1[key] === 'object' && object1[key] !== null && typeof object2[key] === 'object' && object2[key] !== null) {
//       // Check sub-properties
//       let ret = fuseObjects(object1[key], object2[key]);
//       fusedObject[key] = ret.fusedObject;
//       modified = ret.modified;
//     } else {
//       // Keep value from object1
//       fusedObject[key] = object1[key];
//     }
//   });
//   // Add the missing properties from object1
//   Object.keys(object1).forEach(key => {
//     if(!fusedObject.hasOwnProperty(key)) {
//       fusedObject[key] = object1[key];
//     }
//   });
//   return { modified, fusedObject };
// } 

function initData(directory, filename) {
  let data = {};
  let items = fs.readdirSync(directory, { withFileTypes: true });
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    const itemPath = path.join(directory, item.name);
    if (item.isDirectory()) {
      let subData = initData(itemPath, filename);
      if (Object.keys(subData).length !== 0) {
        data[item.name] = subData;
      }
    } else if (item.name === filename) {
      try {
        let parsedData = JSON.parse(fs.readFileSync(itemPath));
        return parsedData;
      } catch (err) {
        console.error(`Failed to load data at ${itemPath}). Details: ${err.stack}`);
      }
    }
  }
  return data;
}

function getValuesFromSettings(settings) {
  let parsedSettings = {};
  settings.forEach(item => {
    if (item.type === 'Category') {
      parsedSettings[item.name] = getValuesFromSettings(item.settings);
    } else {
      parsedSettings[item.name] = item.default;
    }
  });
  return parsedSettings;
}

////////////////////////////////////////////////////////////////////////////////
// Exports
module.exports = QLConfiguration;