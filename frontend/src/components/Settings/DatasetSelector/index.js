import React from 'react';
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Typography, Select, FormControl, Divider, IconButton, MenuItem } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

const styles = (theme) => ({
  root: {
    margin: theme.spacing(1),
  },
});

class DatasetSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    const { theme, classes } = this.props;
    // Unchanged for each setting
    const { templates, values } = this.props;
    // Each module has the props, but their value can change
    const { handleChange, level, path, value } = this.props;
    // Unique to each module
    const { datasetType, minDatasets, maxDatasets } = this.props;

    // Get the available datasets
    console.log(datasetType)
    const datasets = templates.datasets[datasetType];
    const datasetsNames = Object.keys(datasets);
    // Get selected dataset(s)
    let selectedDatasets = value;
    // Module selection handler
    const handleDatasetSelection = function(index, event) {
      let newValue = value.slice();
      newValue[index] = datasetsNames[event.target.value];
      handleChange(path, newValue);
    }
    // Render selected datasets
    let renderedSelected = [];
    selectedDatasets.forEach((datasetName, datasetIndex) => {
      // Get the description of the dataset
      const description = datasets[datasetName].description;
      // Get the gestures in the dataset
      const gestures = datasets[datasetName].gestures;
      // Rename variables for to avoid conflicts in the handlers
      let datasetSelectorValue = value;
      let datasetSelectorPath = path;
      // Event handlers
      const handleDatasetDeletion = function() {
        let newDatasetSelectorValue = datasetSelectorValue.slice();
        newDatasetSelectorValue.splice(datasetIndex, 1);
        handleChange(datasetSelectorPath, newDatasetSelectorValue);
      }
      // Render the dataset
      renderedSelected.push(
        <div key={datasetName}>
          {/* Divider */}
          {datasetIndex > 0 && (
            <Divider light={true} style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}/>
          )}
          {/* Render the dropdown list */}
          <FormControl variant="outlined">
            <Select value={datasetsNames.indexOf(datasetName)} onChange={(event) => handleDatasetSelection(datasetIndex, event)}>
              {datasetsNames.map((datasetName, optionIndex) => (
                <MenuItem key={optionIndex} value={optionIndex}>
                  {datasets[datasetName].label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* Render the "delete" button */}
          <IconButton onClick={handleDatasetDeletion}>
            <DeleteIcon/>
          </IconButton>
          {/* Render the description of the dataset */}
          <Typography variant='body1'>
            {description}
          </Typography>
          {/* Render the gestures in the dataset */}
          <Typography variant='body1'>
            Gestures: <i>{gestures.join(', ')}</i>.
          </Typography>
        </div>
      );
    })

    // Render
    return (
      <div className={classes.root}>
        {renderedSelected}
        {/* If less datasets selected than the maximum amount, just render the dropdown list */}
        {(!maxDatasets || selectedDatasets.length < maxDatasets) && (
          <React.Fragment>
            {/* Divider */}
            {selectedDatasets.length > 0 && (
              <Divider light={true} style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}/>
            )}
            <FormControl variant="outlined">
            <Select value='no-value-selected' onChange={(event) => handleDatasetSelection(selectedDatasets.length, event)}>
              <MenuItem key='select-dataset' value='no-value-selected'>
                {'Select a dataset...'}
              </MenuItem>
              {datasetsNames.map((datasetName, index) => (
                <MenuItem key={index} value={index}>
                  {datasets[datasetName].label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(withTheme(DatasetSelector));