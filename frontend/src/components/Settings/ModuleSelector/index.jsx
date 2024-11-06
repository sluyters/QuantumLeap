import React from 'react';
import { makeStyles } from '@mui/styles'
import { Accordion, AccordionDetails, AccordionSummary, Typography, Select, FormControl, Box, IconButton, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { v4 as uuidv4 } from 'uuid';
import Setting from '../Setting';

const styles = (theme) => ({
  root: {
    margin: theme.spacing(1),
  },
});
const useStyles = makeStyles(styles);

// TODO divide into subcomponents
function ModuleSelector({ templates, values, onChange, level, path, value, moduleType, minModules, maxModules, settings }) {
  const classes = useStyles();

  // // Unchanged for each setting
  // const { templates, values } = this.props;
  // // Each module has the props, but their value can change
  // const { onChange, level, path, value } = this.props;
  // // Unique to each module
  // const { moduleType, minModules, maxModules, settings } = this.props;

  // Get the available modules
  let modulePath = moduleType.split('/');
  let modules = templates.modules;
  for (let key of modulePath) {
    modules = modules[key];
  }
  const modulesNames = Object.keys(modules).filter(name => 
    (modules[name].display === true || modules[name].display === undefined || modules[name].display === null)
  );
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
      uuid: uuidv4(),
      moduleName: moduleName,
      moduleType: moduleType,
      moduleSettings: getValuesFromSettings(moduleTemplate.settings),
      additionalSettings: getValuesFromSettings(settings)
    };
    newValue[index] = moduleConfig;
    onChange(path, newValue);
  }
  // Render selected modules
  let renderedSelected = [];
  selectedModules.forEach((module, moduleIndex) => {
    // Get key
    let key = module.uuid;
    // Get the name of the module
    let moduleName = module.moduleName;
    // Get the template of the module
    const template = modules[moduleName];
    // Rename variables for to avoid conflicts in the handlers
    let moduleSelectorValue = value;
    let moduleSelectorPath = path;
    // Event handlers
    const handleSettingChange = function(path, value) {
      let pathDiff = path.slice((moduleSelectorPath.length - path.length) + 1); // + 1 needed to remove the paramIndex from the path
      let newModuleSelectorValue = moduleSelectorValue.slice();
      setObjectProperty(newModuleSelectorValue[moduleIndex], value, pathDiff);
      onChange(moduleSelectorPath, newModuleSelectorValue);
    }
    const handleModuleDeletion = function() {
      let newModuleSelectorValue = moduleSelectorValue.slice();
      newModuleSelectorValue.splice(moduleIndex, 1);
      onChange(moduleSelectorPath, newModuleSelectorValue);
    }
    // Render the module
    renderedSelected.push(
      <Accordion key={key} defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box width={1}>
            <Typography variant='h6'>
              Module {moduleIndex + 1}
            </Typography>
            {/* Render the dropdown list */}
            <FormControl variant="outlined">
              <Select value={modulesNames.indexOf(module.moduleName)} onClick={(event) => event.stopPropagation()} onChange={(event) => handleModuleSelection(moduleIndex, event)}>
                {modulesNames.map((moduleName, optionIndex) => (
                  <MenuItem key={optionIndex} value={optionIndex}>
                    {modules[moduleName].label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Render the "delete" button */}
            <IconButton onClick={handleModuleDeletion} size="large">
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
            <Typography variant='h6'>
              Settings
            </Typography>
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
                  key={`module-setting-${setting.name}`}
                  templates={templates}
                  values={values}
                  onChange={handleSettingChange}
                  level={level + 1}
                  path={path.concat(moduleIndex, 'moduleSettings')}
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
                  key={`additional-setting-${setting.name}`}
                  templates={templates}
                  values={values}
                  onChange={handleSettingChange}
                  level={level + 1}
                  path={path.concat(moduleIndex, 'additionalSettings')}
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
    <div className={classes.root}>
      {renderedSelected}
      {/* If less modules selected than the maximum amount, just render the dropdown list */}
      {(!maxModules || selectedModules.length < maxModules) && (
        <Accordion key='add-module' expanded={false}>
          <AccordionSummary>
            <Box width={1}>
              <FormControl variant="outlined">
                <Select value='no-value-selected' onClick={(event) => event.stopPropagation()} onChange={(event) => handleModuleSelection(selectedModules.length, event)}>
                  <MenuItem value='no-value-selected'>
                    {'Select a module...'}
                  </MenuItem>
                  {modulesNames.map((moduleName, index) => (
                    <MenuItem key={index} value={index}>
                      {modules[moduleName].label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </AccordionSummary>
        </Accordion>
      )}
    </div>
  );
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
      // If the default value is an object, perform a deep copy
      if (typeof item.default === 'object' && item.default !== null) {
        parsedSettings[item.name] = JSON.parse(JSON.stringify(item.default));
      } else {
        parsedSettings[item.name] = item.default;
      }
    }
  });
  return parsedSettings;
}

export default ModuleSelector;