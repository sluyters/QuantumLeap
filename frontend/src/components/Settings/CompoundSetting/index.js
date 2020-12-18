import React from 'react';
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Paper, Button, Accordion, AccordionDetails, AccordionSummary, Typography, Select, FormControl, Divider, Box, IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Setting from '../Setting';

const styles = (theme) => ({
  item: {
    padding: theme.spacing(1.5, 2),
  },
  addItemButton: {
    margin: theme.spacing(1.5, 2),
  },
});

class CompoundSetting extends React.Component {
  render() {
    // Unchanged for each setting
    const { templates, values, classes } = this.props;
    // Each module has the props, but their value can change
    const { handleChange, level, path, value } = this.props;
    // Unique to each module
    const { itemName, minNumber, maxNumber, settings } = this.props;

    // Event handlers
    const handleSettingChange = (index) => (itemPath, itemValue) => {
      let newValue = value.slice();
      setObjectProperty(newValue[index], itemValue, itemPath);
      handleChange(path, newValue);
    }
    const addItem = () => {
      let newValue = this.props.value.slice();
      newValue.push(getValuesFromSettings(settings));
      handleChange(path, newValue);
    };
    const deleteItem = (index) => () => {
      let newValue = this.props.value.slice();
      newValue.splice(index, 1);
      handleChange(path, newValue);
    }
    return (
      <Paper>
        {/* For each element in value, display it */}
        {this.props.value.map((item, index) => (
          <React.Fragment>
            <div className={classes.item}>
              <Typography variant='overline'>
                {`${itemName} ${index + 1}`}
                <IconButton onClick={deleteItem(index)}>
                  <DeleteIcon/>
                </IconButton>
              </Typography>
              {/* Render the settings for the item */}
              {(settings.length > 0) && (
                settings.map(setting => (
                  <Setting 
                    templates={templates}
                    values={values}
                    handleChange={handleSettingChange(index)}
                    level={level + 1}
                    path={[]}
                    value={item[setting.name]}
                    setting={setting}
                  />
                ))
              )}
            </div>
            <Divider/>
          </React.Fragment>
        ))}
        {/* Button to add an element */}
        <Button className={classes.addItemButton} variant='contained' color="secondary" onClick={addItem}>
          Add
        </Button>
      </Paper>
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

export default withStyles(styles)(withTheme(CompoundSetting));