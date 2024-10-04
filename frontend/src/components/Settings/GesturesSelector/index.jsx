import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Grid, Button, IconButton, TextField, Typography, Box, Paper, Divider } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { withStyles, withTheme } from '@material-ui/core/styles'

const TIMEOUT_VALUE = 500;

const styles = (theme) => ({
  root: {
    margin: theme.spacing(1)
  },
  gesturesOverview: {
    border: `solid 1px ${theme.palette.divider}`,
    maxHeight: '300px',
    overflowY: 'auto',
  },
  gesture: {
    padding: theme.spacing(1.5, 2),
  },
  gestureInfo: {
    width: '100%'
  },
  addGestureButton: {
    marginTop: theme.spacing(1),
  }
});

class GesturesSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      typingTimeout: ''
    };
  }
  render() {
    // Unchanged for each setting
    const { templates, values } = this.props;
    // Each module has the props, but their value can change
    const { handleChange, level, path, value } = this.props;
    // Unique to each module
    const { datasetType, relPathsToRefs } = this.props;
    const { classes, theme } = this.props;

    // Retrieve dataset-loaders & datasets infos
    const datasetLoaders = [];
    if (relPathsToRefs) {
      relPathsToRefs.forEach(relPathToRef => {
        let tmpPath = path.slice();
        console.log(tmpPath)
        relPathToRef.forEach(elem => {
          if (elem === '..' && tmpPath.length > 0) {
            tmpPath.pop();
          } else if (elem !== '.') {
            tmpPath.push(elem);
          }
        });
        let tmpValues = values;
        try {
          tmpPath.forEach(elem => {
            tmpValues = tmpValues[elem];
          });
          datasetLoaders.push(...tmpValues);
        } catch(e) {
          console.error(`Invalid relPathToRef in GestureSelector: ${relPathToRef}, ${tmpPath}.`);
          console.log(values);
        }
      });
    } else {
      datasetLoaders.push(...values.main.settings.datasets[datasetType].modules);
    }
    const datasets = templates.datasets[datasetType];
    // Retrieve the datasets names and ids
    let datasetsInfos = [];
    datasetLoaders.forEach(datasetLoader => {
      console.log(datasetLoader)
      if (datasetLoader.additionalSettings.datasets.length > 0) {
        datasetsInfos.push({ name: datasetLoader.additionalSettings.datasets[0], id: datasetLoader.additionalSettings.datasetId });
      }
    });
    
    // Retrieve the available gestures
    let availableGestures = [];
    datasetsInfos.forEach(datasetInfo => {
      if (datasetInfo.name in datasets) {
        availableGestures.push(...datasets[datasetInfo.name].gestures.map((gesture) => datasetInfo.id ? `${gesture}_${datasetInfo.id}` : gesture));
      }
    });
    let uniqueAvailableGestures = new Set(availableGestures);
    availableGestures = [...uniqueAvailableGestures];

    const addGesture = () => {
      let newValue = this.state.value.slice();
      newValue.push({
        uuid: uuidv4(),
        name: '',
        gestureClasses: []
      });
      if (this.state.typingTimeout) {
        clearTimeout(this.state.typingTimeout);
      }
      this.setState({
        value: newValue,
        typingTimeout: setTimeout(() => handleChange(path, newValue), TIMEOUT_VALUE)
      });
    }

    const changeGesture = (index) => (name, gestureClasses) => {
      let newValue = this.state.value.slice();
      let gesture = newValue[index];
      gesture.name = name;
      gesture.gestureClasses = gestureClasses;
      if (this.state.typingTimeout) {
        clearTimeout(this.state.typingTimeout);
      }
      this.setState({
        value: newValue,
        typingTimeout: setTimeout(() => handleChange(path, newValue), TIMEOUT_VALUE)
      });
    }

    const deleteGesture = (index) => () => {
      let newValue = this.state.value.slice();
      newValue.splice(index, 1);
      if (this.state.typingTimeout) {
        clearTimeout(this.state.typingTimeout);
      }
      this.setState({
        value: newValue,
        typingTimeout: setTimeout(() => handleChange(path, newValue), TIMEOUT_VALUE)
      });
    }
    // The level will impact the size, boldness, of the setting
    return (
      <div className={classes.root}>
        <Paper className={classes.gesturesOverview} elevation={0}>
          {/* For each element in value, display it */}
          {this.state.value.map((gesture, index) => (
            <div key={gesture.uuid}>
              <Gesture
                classes={classes}
                name={gesture.name}
                gestureClasses={gesture.gestureClasses}
                availableGestures={availableGestures}
                onChange={changeGesture(index)}
                onDelete={deleteGesture(index)}
              />
              {index < this.state.value.length - 1 && <Divider/>}
            </div>
          ))}
          {this.state.value.length === 0 && 
            <Typography style={{padding: theme.spacing(1)}}>
              No gesture selected.
            </Typography>
          }
        </Paper>
        {/* Button to add an element */}
        <Button className={classes.addGestureButton} variant='outlined' onClick={addGesture}>
          Add gesture
        </Button>
      </div>
    );
  }
}

class Gesture extends React.Component {
  render() {
    const { name, classes, gestureClasses, availableGestures, onChange, onDelete } = this.props;
    return (
      <Box
        className={classes.gesture}
        display='flex'
        alignItems='center'
        flexWrap='nowrap'
      >
        <Box flexGrow={1}>
          <Grid
            className={classes.gestureInfo}
            container
            spacing={1}
            alignItems='center'
            wrap='nowrap'
          >
            {/* The input for the name of the gesture */}
            <Grid item xs={4}>
              <TextField 
                fullWidth
                type='text'
                variant='outlined'
                value={name}
                onChange={(event) => {onChange(event.target.value, gestureClasses)}}
                placeholder="Name"
              />
            </Grid>
            {/* The input for the names of the gestures that it groups */}
            <Grid item xs={8}>
              <Autocomplete
                multiple
                value={gestureClasses}
                options={availableGestures}
                onChange={(event, value, reason) => {
                  switch (reason) {
                    case 'remove-option':
                      onChange(name, value);
                      break;
                    case 'select-option':
                      onChange(name, value);
                      break;
                    case 'clear':
                      onChange(name, []);
                      break;
                    default:
                      console.log(reason);
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} variant="outlined" placeholder="Gestures" />
                )}
              />     
            </Grid>
          </Grid>
        </Box>
        {/* The "delete" button */}
        <Box>
          <IconButton onClick={onDelete}>
            <DeleteIcon/>
          </IconButton>
        </Box>
      </Box>       
    );
  }
}

export default withTheme(withStyles(styles)(GesturesSelector));