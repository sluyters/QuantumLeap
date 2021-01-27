import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Paper, Button, Typography, Divider, IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import Setting from '../Setting';

const styles = (theme) => ({
  root: {
    margin: theme.spacing(1),
  },
  itemsOverview: {
    border: `solid 1px ${theme.palette.divider}`,
    maxHeight: '500px',
    overflowY: 'auto',
  },
  item: {
    padding: theme.spacing(1.5, 2),
  },
  addItemButton: {
    marginTop: theme.spacing(1),
  }
});

class CompoundSetting extends React.Component {
  render() {
    const { classes, theme } = this.props;
    // Unchanged for each setting
    const { templates, values } = this.props;
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
      let settingsValues = getValuesFromSettings(settings);
      settingsValues['uuid'] = uuidv4();
      newValue.push(settingsValues);
      handleChange(path, newValue);
    };
    const deleteItem = (index) => () => {
      let newValue = this.props.value.slice();
      newValue.splice(index, 1);
      handleChange(path, newValue);
    }

    let error = minNumber !== undefined && this.props.value.length < minNumber;

    return (
      <div className={classes.root}>
        <Paper className={classes.itemsOverview} style={{border: error ? '1px solid red' : ''}} elevation={0}>
          {/* For each element in value, display it */}
          {this.props.value.map((item, index) => (
            <div key= {item.uuid}>
              <div className={classes.item}>
                <Typography variant='h6'>
                  {itemName} {index + 1}
                  <IconButton onClick={deleteItem(index)}>
                    <DeleteIcon/>
                  </IconButton>
                </Typography>
                {/* Render the settings for the item */}
                {(settings.length > 0) && (
                  settings.map((setting, settingIndex) => (
                    <Setting 
                      key={`${item.uuid}-${settingIndex}`}
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
              {index < this.props.value.length - 1 && <Divider/>}
            </div>
          ))}
          {this.props.value.length === 0 && 
            <Typography style={{padding: theme.spacing(1)}}>
              No {itemName} selected.
            </Typography>
          }
        </Paper>
        {error && 
          <div style={{marginLeft: theme.spacing(2), marginRight: theme.spacing(2)}}>
            <Typography color='error' variant='caption'>At least {minNumber} {itemName}(s) should be selected!</Typography>
          </div>  
        }
        {/* Button to add an element */}
        <Button className={classes.addItemButton} variant='outlined' onClick={addItem}>
          Add {itemName}
        </Button>
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

export default withStyles(styles)(withTheme(CompoundSetting));