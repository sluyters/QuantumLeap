import React from 'react';
import { withTheme } from '@material-ui/core/styles'
import { Accordion, AccordionDetails, AccordionSummary, Typography, Select, FormControl, Divider, Box, IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Setting from '../Setting';

class ModuleSelector extends React.Component {
  render() {
    const { theme } = this.props;
    // Unchanged for each setting
    const { templates, values } = this.props;
    // Each module has the props, but their value can change
    const { handleChange, level, path, value } = this.props;
    // Unique to each module
    const { moduleType, minModules, maxModules, settings } = this.props;

    // Get the available modules
    let modulePath = moduleType.split('/');
    let modules = templates.modules;
    for (let key of modulePath) {
      modules = modules[key];
    }
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
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box width={1}>
              {/* Render the dropdown list */}
              <FormControl variant="outlined">
                <Select native value={modulesNames.indexOf(module.moduleName)} onClick={(event) => event.stopPropagation()} onChange={(event) => handleModuleSelection(moduleIndex, event)}>
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
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box width={1}>
            {(template.settings.length === 0 && settings.length === 0) ? (
                <Typography variant='body1'>
                  No settings available.
                </Typography>
              ) : (
                ''
              )}
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
            </Box>
          </AccordionDetails>
        </Accordion>
      );
    })

    // Render
    return (
      <div>
        {renderedSelected}
        {/* If less modules selected than the maximum amount, just render the dropdown list */}
        {(!maxModules || selectedModules.length < maxModules) ? (
          <Accordion expanded={false}>
            <AccordionSummary>
              <Box width={1}>
                <FormControl variant="outlined">
                  <Select native value={''} onClick={(event) => event.stopPropagation()} onChange={(event) => handleModuleSelection(selectedModules.length, event)}>
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
              </Box>
            </AccordionSummary>
          </Accordion>
        ) : (
          ''
        )}
      </div>
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