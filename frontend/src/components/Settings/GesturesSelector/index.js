import React from 'react';
import { Grid, Button, IconButton, TextField, Typography } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import Autocomplete from '@material-ui/lab/Autocomplete';

const TIMEOUT_VALUE = 500;

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
    const { datasetType } = this.props;

    // Retrieve dataset-loaders & datasets infos
    const datasetLoaders = values.main.settings.datasets[datasetType].modules;
    const datasets = templates.datasets[datasetType];
    // Retrieve the datasets names
    let datasetsNames = [];
    datasetLoaders.forEach(datasetLoader => {
      datasetsNames.push(...datasetLoader.additionalSettings.datasets);
    });
    // Retrieve the available gestures
    let availableGestures = [];
    datasetsNames.forEach(datasetName => {
      availableGestures.push(...datasets[datasetName].gestures);
    });

    const addGesture = () => {
      let newValue = this.state.value.slice();
      newValue.push({
        name: '',
        classes: []
      });
      if (this.state.typingTimeout) {
        clearTimeout(this.state.typingTimeout);
      }
      this.setState({
        value: newValue,
        typingTimeout: setTimeout(() => handleChange(path, newValue), TIMEOUT_VALUE)
      });
    }

    const changeGesture = (index) => (name, classes) => {
      let newValue = this.state.value.slice();
      let gesture = newValue[index];
      gesture.name = name;
      gesture.classes = classes;
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
      <React.Fragment>
        {/* For each element in value, display it */}
        {this.state.value.map((gesture, index) => (
          <Gesture
            name={gesture.name}
            classes={gesture.classes}
            availableGestures={availableGestures}
            onChange={changeGesture(index)}
            onDelete={deleteGesture(index)}
          />
        ))}
        {/* Button to add an element */}
        <Button variant="outlined" color="primary" onClick={addGesture}>
          Add
        </Button>
      </React.Fragment>
    );
  }
}

class Gesture extends React.Component {
  render() {
    const { name, classes, availableGestures, onChange, onDelete } = this.props;
    return (
      <React.Fragment>
        <Grid
          container
          spacing={1}
          alignItems='center'
          wrap='nowrap'
        >
          {/* The input for the name of the gesture */}
          <Grid item xs={3}>
            <TextField 
              type='text'
              variant='outlined'
              value={name}
              onChange={(event) => {onChange(event.target.value, classes)}}
              placeholder="Name"
            />
          </Grid>
          {/* The input for the names of the gestures that it groups */}
          <Grid item xs={8}>
            <Autocomplete
              multiple
              value={classes}
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
          {/* The "delete" button */}
          <Grid item xs={1}>
            <IconButton onClick={onDelete}>
              <DeleteIcon/>
            </IconButton>
          </Grid>
        </Grid>       
      </React.Fragment>
    );
  }
}

export default GesturesSelector;