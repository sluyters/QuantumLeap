import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { makeStyles, useTheme } from '@mui/styles'
import { Paper, Button, Typography, Divider, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
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
const useStyles = makeStyles(styles);

function CompoundSetting({ templates, values, onChange, level, path, value, itemName, minNumber, maxNumber, settings }) {
  const classes = useStyles();
  const theme = useTheme();
  // // Unchanged for each setting
  // const { templates, values } = this.props;
  // // Each module has the props, but their value can change
  // const { onChange, level, path, value } = this.props;
  // // Unique to each module
  // const { itemName, minNumber, maxNumber, settings } = this.props;

  // Event handlers
  const handleSettingChange = (index) => (itemPath, itemValue) => {
    let newValue = value.slice();
    setObjectProperty(newValue[index], itemValue, itemPath);
    onChange(path, newValue);
  }
  const addItem = () => {
    let newValue = value.slice();
    let settingsValues = getValuesFromSettings(settings);
    settingsValues['uuid'] = uuidv4();
    newValue.push(settingsValues);
    onChange(path, newValue);
  };
  const deleteItem = (index) => () => {
    let newValue = value.slice();
    newValue.splice(index, 1);
    onChange(path, newValue);
  }

  let error = '';
  let errorMessage = '';
  if (minNumber && value.length < minNumber) {
    error = true
    errorMessage = `At least ${minNumber} ${itemName}(s) should be selected!`;
  } else if (maxNumber && value.length > maxNumber) {
    error = true
    errorMessage = `At most ${maxNumber} ${itemName}(s) should be selected!`;
  }

  return (
    (<div className={classes.root}>
      <Paper className={classes.itemsOverview} style={{border: error ? '1px solid red' : ''}} elevation={0}>
        {/* For each element in value, display it */}
        {value.map((item, index) => (
          <div key= {item.uuid}>
            <div className={classes.item}>
              <Typography variant='h6'>
                {itemName} {index + 1}
                <IconButton onClick={deleteItem(index)} size="large">
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
                    onChange={handleSettingChange(index)}
                    level={level + 1}
                    path={[]}
                    value={item[setting.name]}
                    setting={setting}
                  />
                ))
              )}
            </div>
            {index < value.length - 1 && <Divider/>}
          </div>
        ))}
        {value.length === 0 && 
          <Typography style={{padding: theme.spacing(1)}}>
            No {itemName} selected.
          </Typography>
        }
      </Paper>
      {error && 
        <div style={{marginLeft: theme.spacing(2), marginRight: theme.spacing(2)}}>
          <Typography color='error' variant='caption'>{errorMessage}</Typography>
        </div>  
      }
      {/* Button to add an element */}
      <Button className={classes.addItemButton} variant='outlined' onClick={addItem}>
        Add {itemName}
      </Button>
    </div>)
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

export default CompoundSetting;