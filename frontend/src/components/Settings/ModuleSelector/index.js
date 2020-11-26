import React from 'react';
import { withTheme } from '@material-ui/core/styles'
import { Typography, Select, FormControl, Divider, IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import Setting from '../Setting';

class ModuleSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    const { theme } = this.props;
    // Unchanged for each setting
    const { templates, values } = this.props;
    // Each module has the props, but their value can change
    const { handleChange, level, path, value } = this.props;
    // Unique to each module
    const { moduleType, minModules, maxModules, settings } = this.props;

    // Get the available modules
    const modules = templates.modules[moduleType];
    const modulesNames = Object.keys(modules);
    // Get selected module(s)
    let selectedModules = value;
    // Module selection handler
    const handleModuleSelection = function(index, event) {
      // Get module template
      let moduleName = modulesNames[event.target.value];
      let moduleTemplate = modules[moduleName];
      // Build default values
      let newValue = value.slice();
      let moduleConfig = {
        moduleName: moduleName,
        moduleType: moduleType,
        moduleSettings: getValuesFromSettings(moduleTemplate.settings),
        additionalSettings: getValuesFromSettings(settings)
      };
      newValue[index] = moduleConfig;
      handleChange(path, newValue);
    }
    // Render selected modules
    let renderedSelected = [];
    selectedModules.forEach((module, moduleIndex) => {
      // Get the name of the module
      let moduleName = module.moduleName;
      // Get the template of the module
      const template = modules[moduleName];
      // Rename variables for to avoid conflicts in the handlers
      let moduleSelectorValue = value;
      let moduleSelectorPath = path;
      // Event handlers
      const handleSettingChange = function(path, value) {
        let newModuleSelectorValue = moduleSelectorValue.slice();
        setObjectProperty(newModuleSelectorValue[moduleIndex], value, path);
        handleChange(moduleSelectorPath, newModuleSelectorValue);
      }
      const handleModuleDeletion = function() {
        let newModuleSelectorValue = moduleSelectorValue.slice();
        newModuleSelectorValue.splice(moduleIndex, 1);
        handleChange(moduleSelectorPath, newModuleSelectorValue);
      }
      // Render the module
      renderedSelected.push(
        <React.Fragment>
          {/* Divider */}
          {moduleIndex > 0 ? (
            <Divider light={true} style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}/>
          ) : (
            ''
          )}
          {/* Render the dropdown list */}
          <FormControl variant="outlined">
            <Select native value={modulesNames.indexOf(module.moduleName)} onChange={(event) => handleModuleSelection(moduleIndex, event)}>
              {modulesNames.map((moduleName, optionIndex) => (
                <option value={optionIndex}>
                  {modules[moduleName].label}
                </option>
              ))}
            </Select>
          </FormControl>
          {/* Render the "delete" button */}
          <IconButton onClick={handleModuleDeletion}>
            <DeleteIcon/>
          </IconButton>
          {/* Render the description of the module */}
          <Typography variant='body1'>
            {template.description}
          </Typography>
          {/* Render the settings of the module */}
          {(template.settings.length > 0) ? (
            template.settings.map(setting => (
              <Setting 
                templates={templates}
                values={values}
                handleChange={handleSettingChange}
                level={level + 1}
                path={['moduleSettings']}
                value={module.moduleSettings[setting.name]}
                setting={setting}
              />
            ))
          ) : (
            ''
          )}
          {/* Render the additional settings of the ModuleSelector */}
          {(settings.length > 0) ? (
            settings.map(setting => (
              <Setting 
                templates={templates}
                values={values}
                handleChange={handleSettingChange}
                level={level + 1}
                path={['additionalSettings']}
                value={module.additionalSettings[setting.name]}
                setting={setting}
              />
            ))
          ) : (
            ''
          )}
        </React.Fragment>
      );
    })

    // Render
    return (
      <React.Fragment>
        {renderedSelected}
        {/* If less modules selected than the maximum amount, just render the dropdown list */}
        {(!maxModules || selectedModules.length < maxModules) ? (
          <React.Fragment>
            {/* Divider */}
            {selectedModules.length > 0 ? (
              <Divider light={true} style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}/>
            ) : (
              ''
            )}
            <FormControl variant="outlined">
            <Select native value={''} onChange={(event) => handleModuleSelection(selectedModules.length, event)}>
              <option value={''}>
                {'Select a module...'}
              </option>
              {modulesNames.map((moduleName, index) => (
                <option value={index}>
                  {modules[moduleName].label}
                </option>
              ))}
            </Select>
          </FormControl>
          </React.Fragment>
        ) : (
          ''
        )}
      </React.Fragment>
    );
  }
}

function setObjectProperty(object, value, keys, index = 0) {
  if (index === keys.length - 1) {
    object[keys[index]] = value;
  } else {
    setObjectProperty(object[keys[index]], value, keys, index + 1);
  }
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

export default withTheme(ModuleSelector);