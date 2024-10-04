import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Grid, Tooltip, Card, ListItemSecondaryAction, CardHeader, Button, IconButton, TextField, Typography, Box, Paper, Divider, List, ListItem, ListItemIcon, Checkbox, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import WarningIcon from '@material-ui/icons/Warning';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { withStyles, withTheme } from '@material-ui/core/styles'
import GesturesSelector from '../GesturesSelector';

const TIMEOUT_VALUE = 500;

const styles = (theme) => ({
  root: {
    margin: theme.spacing(1)
  },
  list: {
    width: '400 px',
    height: '230 px',
  },
  selectGesturesButton: {
    marginTop: theme.spacing(1),
  },
  gesturesOverview: {
    border: `solid 1px ${theme.palette.divider}`,
    maxHeight: '300px',
    overflowY: 'auto',
  },
});

class GesturesSelector2 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
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
    const { classes, theme } = this.props;

    // Retrieve the available gestures
    let availableGestures = [];
    const aggregateClasses = values.main.settings.datasets[datasetType].aggregateClasses;
    if (aggregateClasses.length === 0) {
      // If no aggregateClasses, retrieve dataset-loaders & datasets infos
      const datasetLoaders = values.main.settings.datasets[datasetType].modules;
      const datasets = templates.datasets[datasetType];
      // Retrieve the datasets names and ids
      let datasetsInfos = [];
      datasetLoaders.forEach(datasetLoader => {
        if (datasetLoader.additionalSettings.datasets.length > 0) {
          datasetsInfos.push({ name: datasetLoader.additionalSettings.datasets[0], id: datasetLoader.additionalSettings.datasetId });
        }
      });
      datasetsInfos.forEach(datasetInfo => {
        if (datasetInfo.name in datasets) {
          availableGestures.push(...datasets[datasetInfo.name].gestures.map((gesture) => datasetInfo.id ? `${gesture}_${datasetInfo.id}` : gesture));
        }
      });
    } else {
      // Else, use aggregateClasses
      availableGestures = aggregateClasses.map((aggregateClass) => aggregateClass.name);
    }

    // Handlers
    const handleOpen = () => {
      this.setState({
        open: true,
      });
    }
    const handleClose = () => {
      this.setState({
        open: false,
      });
    }
    const handleApply = (newValue) => {
      handleChange(path, newValue);
      handleClose();
    }
    const handleDelete = (gesture) => {
      let newValue = JSON.parse(JSON.stringify(value));
      newValue = not(newValue, [gesture]);
      handleChange(path, newValue);
    }

    // The level will impact the size, boldness, of the setting
    return (
      <div className={classes.root}>
        <SelectedGestures 
          gestures={value}
          availableGestures={availableGestures}
          onDelete={handleDelete}
        />
        <Button className={classes.selectGesturesButton} variant="outlined" onClick={handleOpen}>
          Select gesture(s)
        </Button>
        <SelectionWindow 
          open={this.state.open}
          value={value}
          availableGestures={availableGestures}
          onClose={handleClose}
          onApply={handleApply}
        />
      </div>
    );
  }
}

class SelectedGestures extends React.Component {
  render() {
    const { classes, theme, availableGestures, gestures, onDelete } = this.props;
    let error = false;
    return (
      <Paper className={classes.gesturesOverview} style={{border: error ? '1px solid red' : ''}} elevation={0}>
        <List disablePadding>
          {/* For each element in value, display it */}
          {gestures.map((gesture) => (
            <ListItem key={gesture} button classes={{ root: { padding: 0 } }}>
              {availableGestures.indexOf(gesture) === -1 && 
                <ListItemIcon>
                  <Tooltip title={<Typography>{`No "${gesture}" gesture in the selected dataset(s).`}</Typography>} style={{ marginLeft: theme.spacing(1)}} arrow>
                    <WarningIcon color='error'/>
                  </Tooltip>
                </ListItemIcon>
              }
              <ListItemText primary={gesture}/>
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => onDelete(gesture)}>
                  <DeleteIcon/>
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {gestures.length === 0 && 
            <Typography style={{padding: theme.spacing(1)}}>
              No gesture selected. All available gestures will be used to train the recognizer.
            </Typography>
          }
        </List>
      </Paper>
    );
  }
}

class SelectionWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: JSON.parse(JSON.stringify(props.value)),
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.open === false && this.props.open === true)  {
      // Update internal state
      this.setState({
        value: JSON.parse(JSON.stringify(this.props.value)),
      });
    }
  }

  render() {
    const { open, availableGestures, onClose, onApply, classes, theme } = this.props;
    const { value } = this.state;

    // Handlers
    const selectGestures = (gestures) => {
      let newGestures = union(value, gestures);
      this.setState({
        value: newGestures,
      });
    }
    const deselectGestures = (gestures) => {
      let newGestures = not(value, gestures);
      this.setState({
        value: newGestures,
      });
    }
    const handleToggleAll = (event) => {
      event.stopPropagation()
      if (value.length === availableGestures.length) {
        deselectGestures(value);
      } else {
        selectGestures(availableGestures);
      }
    };
    const handleToggle = (event, gesture) => {
      event.stopPropagation()
      if (value.indexOf(gesture) !== -1) {
        deselectGestures([gesture]);
      } else {
        selectGestures([gesture]);
      }
    }

    return (
      <Dialog fullWidth={true} maxWidth={'md'} open={open}>
        <DialogTitle>
          Select gestures
        </DialogTitle>
        <DialogContent>
          <Card>
            <CardHeader 
              avatar={
                <Checkbox 
                  edge='start'
                  color='primary'
                  onClick={handleToggleAll} 
                  checked={value.length === availableGestures.length} 
                  indeterminate={value.length !== availableGestures.length && value.length > 0}
                  tabIndex={-1}
                  disableRipple
                />
              }
              title='Gestures'
              subheader={`${value.length}/${availableGestures.length} selected`}
            />
            <Divider />
            <List className={classes.list}>
              {/* For each element in value, display it */}
              {availableGestures.map((gesture, index) => (
                <ListItem key={index} role='listitem' button onClick={(event) => handleToggle(event, gesture)}>
                  <ListItemIcon>
                    <Checkbox color='primary' checked={value.indexOf(gesture) !== -1} disableRipple />
                  </ListItemIcon>
                  <ListItemText primary={gesture} />
                </ListItem>
              ))}
              {availableGestures.length === 0 &&
                <ListItem role='listitem'>
                  <ListItemText primary='Please select a dataset first.' />
                </ListItem>
              }
            </List>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color='primary'>
            Cancel
          </Button>
          <Button variant='outlined' onClick={() => onApply(value)} color='primary'>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

// Helpers

function intersection(a, b) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

function not(a, b) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function union(a, b) {
  return [...a, ...not(b, a)];
}

SelectedGestures = withTheme(withStyles(styles)(SelectedGestures));
SelectionWindow = withTheme(withStyles(styles)(SelectionWindow));

export default withTheme(withStyles(styles)(GesturesSelector2));