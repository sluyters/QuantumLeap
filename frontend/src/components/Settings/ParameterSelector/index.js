import React from 'react';
import { withStyles } from '@material-ui/core/styles'
import { Accordion, AccordionDetails, AccordionSummary, Typography, Select, FormControl, Box, IconButton, MenuItem } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { v4 as uuidv4 } from 'uuid';
import Setting from '../Setting';

const styles = (theme) => ({
  root: {
    margin: theme.spacing(1),
  },
});

class ParameterSelector extends React.Component {
  render() {
    const { classes } = this.props;
    // Unchanged for each setting
    const { templates, values } = this.props;
    // Each module has the props, but their value can change
    const { handleChange, level, path, value } = this.props;
    // Unique to each module
    const { minParams, maxParams, params, settings } = this.props;

    // Build dictionary for quick access to params
    let paramsTemplates = {};
    params.forEach(param => {
      paramsTemplates[param.name] = param;
    });
    const paramsNames = params.map(param => param.name);
    
    // Get selected param(s)
    let selectedParams = value;
    // Param selection handler
    const handleParamSelection = function(index, event) {
      let paramName = paramsNames[event.target.value];
      // Get param template
      let paramTemplate = paramsTemplates[paramName];
      // Build default values
      let newValue = value.slice();
      let paramConfig = {
        uuid: uuidv4(),
        paramName: paramName,
        paramSettings: getValuesFromSettings(paramTemplate.settings),
        additionalSettings: getValuesFromSettings(settings)
      };
      newValue[index] = paramConfig;
      handleChange(path, newValue);
    }
    // Render selected params
    let renderedSelected = [];
    selectedParams.forEach((param, paramIndex) => {
      // Get key
      let key = param.uuid;
      // Get the name of the param
      let paramName = param.paramName;
      // Get the template of the param
      const template = paramsTemplates[paramName];
      // Rename variables for to avoid conflicts in the handlers
      let paramSelectorValue = value;
      let paramSelectorPath = path;
      // Event handlers
      const handleSettingChange = function(path, value) {
        let newParamSelectorValue = paramSelectorValue.slice();
        setObjectProperty(newParamSelectorValue[paramIndex], value, path);
        handleChange(paramSelectorPath, newParamSelectorValue);
      }
      const handleParamDeletion = function() {
        let newParamSelectorValue = paramSelectorValue.slice();
        newParamSelectorValue.splice(paramIndex, 1);
        handleChange(paramSelectorPath, newParamSelectorValue);
      }
      // Render the param
      renderedSelected.push(
        <Accordion key={key} defaultExpanded={true}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box width={1}>
              <Typography variant='h6'>
                Value {paramIndex + 1}
              </Typography>
              {/* Render the dropdown list */}
              <FormControl variant="outlined">
                <Select value={paramsNames.indexOf(param.paramName)} onClick={(event) => event.stopPropagation()} onChange={(event) => handleParamSelection(paramIndex, event)}>
                  {paramsNames.map((paramName, optionIndex) => (
                    <MenuItem key={optionIndex} value={optionIndex}>
                      {paramsTemplates[paramName].label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/* Render the "delete" button */}
              <IconButton onClick={handleParamDeletion}>
                <DeleteIcon/>
              </IconButton>
              {/* Render the description of the param */}
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
              {((!template.settings || template.settings.length === 0) && (!settings || settings.length === 0)) ? (
                <Typography variant='body1'>
                  No settings available.
                </Typography>
              ) : (
                ''
              )}
              {/* Render the settings of the param */}
              {(template.settings && template.settings.length > 0) ? (
                template.settings.map(setting => (
                  <Setting 
                    key={`param-setting-${setting.name}`}
                    templates={templates}
                    values={values}
                    handleChange={handleSettingChange}
                    level={level + 1}
                    path={['paramSettings']}
                    value={param.paramSettings[setting.name]}
                    setting={setting}
                  />
                ))
              ) : (
                ''
              )}
              {/* Render the additional settings of the ParamSelector */}
              {(settings && settings.length > 0) ? (
                settings.map(setting => (
                  <Setting 
                  key={`additional-setting-${setting.name}`}
                    templates={templates}
                    values={values}
                    handleChange={handleSettingChange}
                    level={level + 1}
                    path={['additionalSettings']}
                    value={param.additionalSettings[setting.name]}
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
        {/* If less params selected than the maximum amount, just render the dropdown list */}
        {(!maxParams || selectedParams.length < maxParams) && (
          <Accordion key='add-param' expanded={false}>
            <AccordionSummary>
              <Box width={1}>
                <FormControl variant="outlined">
                  <Select value='no-value-selected' onClick={(event) => event.stopPropagation()} onChange={(event) => handleParamSelection(selectedParams.length, event)}>
                    <MenuItem value='no-value-selected'>
                      {'Select a value...'}
                    </MenuItem>
                    {paramsNames.map((paramName, index) => (
                      <MenuItem key={index} value={index}>
                        {paramsTemplates[paramName].label}
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
}

function setObjectProperty(object, value, keys, index = 0) {
  if (index === keys.length - 1) {
    object[keys[index]] = value;
  } else {
    setObjectProperty(object[keys[index]], value, keys, index + 1);
  }
}

function getValuesFromSettings(settings) {
  if (settings == undefined) {
    settings = []
  }
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

export default withStyles(styles)(ParameterSelector);