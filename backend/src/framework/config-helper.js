////////////////////////////////////////////////////////////////////////////////
// Imports
const { settings } = require('cluster');
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
    console.log('Loading templates...');
    this.loadTemplates()
    console.log('Templates loaded!');
    console.log('Loading configuration...');
    if (!this.loadValues()) {
      // No configuration loaded, rebuild the configuration
      console.log('No valid configuration found. Loading a new configuration...');
      this.repairValues()
      this.saveValues();
    } else {
      console.log('Configuration file found! Checking the configuration...');
      if (this.repairValues()) {
        console.log('Some errors were found in the configuration file. Saving the repaired configuration...');
        this.saveValues();
      }
    }
    console.log('Configuration loaded!');
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

  repairValues() {
    // Helper functions
    const repairValuesHelper = (settings, values) => {
      let repaired = false;
      if (Array.isArray(settings)) {
        repaired = repairSettings(settings, values) || repaired;
      } else if (settings !== null && typeof settings === 'object') {
        Object.keys(settings).forEach(key => {
          if (!values.hasOwnProperty(key)) {
            values[key] = {};
            repaired = true;
          }
          repaired = repairValuesHelper(settings[key], values[key]) || repaired;
        });
      }
      return repaired;
    }
    const repairSettings = (templates, values) => {
      let repaired = false;
      templates.forEach(template => {
        // If no value, set a default one
        if (!values.hasOwnProperty(template.name)) {
          if (template.hasOwnProperty('default')) {
            values[template.name] = template.default;
          } else {
            values[template.name] = {};
          }
          repaired = true;
        }
        // Check subsettings and modules
        if (template.type === 'Category') {
          repaired = repairSettings(template.settings, values[template.name]) || repaired;
        } else if (template.type === 'CompoundSetting') {
          values[template.name].forEach(item => {
            repaired = repairSettings(template.settings, item) || repaired;
          });
        } else if (template.type === 'ModuleSelector') {
          // If one or more module(s) is selected, repair subsettings
          values[template.name].forEach((moduleValue) => {
            // Additional settings
            if (!moduleValue.hasOwnProperty('additionalSettings')) {
              moduleValue.additionalSettings = {};
              repaired = true;
            }
            repaired = repairSettings(template.settings, moduleValue.additionalSettings) || repaired;
            // Module settings
            if (!moduleValue.hasOwnProperty('moduleSettings')) {
              moduleValue.moduleSettings = {};
              repaired = true;
            }
            let subTypes = template.moduleType.split('/');
            let moduleTemplate = this.templates.modules;
            subTypes.forEach(subType => {
              moduleTemplate = moduleTemplate[subType];
            });
            moduleTemplate = moduleTemplate[moduleValue.moduleName];
            repaired = repairSettings(moduleTemplate.settings, moduleValue.moduleSettings) || repaired;
          })
        } else if (template.hasOwnProperty('settings')) {
          console.error(`Subsettings unsupported for setting (NAME: ${template.name}, TYPE: ${template.type})!`);
        }
      });
      return repaired;
    };
    let repaired = false;
    // Check basic structure
    if (typeof this.values !== 'object') {
      this.values = {};
      repaired = true;
    }
    if (!this.values.hasOwnProperty('main') || !this.values.main.hasOwnProperty('settings')) {
      this.values.main = {};
      this.values.main.settings = {};
      repaired = true;
    }
    // Check the rest
    repaired = repairValuesHelper(this.templates.main.settings, this.values.main.settings) || repaired;
    return repaired;
  }

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

  toQLConfig() {
    const parseValues = (settings, values) => {
      if (Array.isArray(settings)) {
        parseSettings(settings, values);
      } else if (settings !== null && typeof settings === 'object') {
        Object.keys(settings).forEach(key => {
          parseValues(settings[key], values[key]);
        });
      }
    }
    const parseSettings = (templates, values) => {
      templates.forEach(template => {
        if (template.type === 'Category') {
          parseSettings(template.settings, values[template.name]);
        } else if (template.type === 'CompoundSetting') {
          values[template.name].forEach(item => {
            parseSettings(template.settings, item);
          });
        } else if (template.type === 'ModuleSelector') {
          if (values[template.name].length === 0) {
            // If no module is selected, select placeholder
            let pathToModule = path.join(this.modulesDirectory, template.moduleType, 'placeholder');
            let parsedModule = {
              module: require(pathToModule),
              moduleSettings: {},
              additionalSettings: {},
            };
            values[template.name].push(parsedModule);
          } else {
            // If one or more module(s) is selected, repair subsettings
            values[template.name].forEach((moduleValue, index) => {
              let pathToModule = path.join(this.modulesDirectory, template.moduleType, moduleValue.moduleName);
              let parsedModule = {
                module: require(pathToModule),
                moduleSettings: moduleValue.moduleSettings,
                additionalSettings: moduleValue.additionalSettings,
              };
              // Additional settings
              parseSettings(template.settings, moduleValue.additionalSettings)
              // Module settings
              let subTypes = template.moduleType.split('/');
              let moduleTemplate = this.templates.modules;
              subTypes.forEach(subType => {
                moduleTemplate = moduleTemplate[subType];
              });
              moduleTemplate = moduleTemplate[moduleValue.moduleName];
              parseSettings(moduleTemplate.settings, moduleValue.moduleSettings)
              // Add module
              values[template.name][index] = parsedModule;
            });
          }
        } else if (template.hasOwnProperty('settings')) {
          console.error(`Subsettings unsupported for setting (NAME: ${template.name}, TYPE: ${template.type})!`);
        }
      });
    };
    // Copy values
    let qlConfig = JSON.parse(JSON.stringify(this.values));
    parseValues(this.templates.main.settings, qlConfig.main.settings);
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

////////////////////////////////////////////////////////////////////////////////
// Exports
module.exports = QLConfiguration;