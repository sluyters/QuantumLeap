import React, { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Grid, Button, IconButton, TextField, Typography, Box, Paper, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Autocomplete } from '@mui/material';
import { makeStyles, useTheme } from '@mui/styles'

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
const useStyles = makeStyles(styles);

// TODO rename into DatasetBuilder
function GesturesSelector({ templates, values, onChange, level, path, value, datasetType, relPathsToRefs }) {
  const classes = useStyles();
  const theme = useTheme();

  const [bufferValue, setBufferValue] = useState(value);
  const [typingTimeout, setTypingTimeout] = useState('');

  // // Unchanged for each setting
  // const { templates, values } = this.props;
  // // Each module has the props, but their value can change
  // const { onChange, level, path, value } = this.props;
  // // Unique to each module
  // const { datasetType, relPathsToRefs } = this.props;

  const datasets = templates.datasets[datasetType];

  // Retrieve dataset-loaders
  const datasetLoaders = useMemo(
    () => {
      const loaders = [];
      if (relPathsToRefs) {
        relPathsToRefs.forEach(relPathToRef => {
          let tmpPath = path.slice();
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
            loaders.push(...tmpValues);
          } catch(e) {
            console.error(`Invalid relPathToRef in GestureSelector: ${relPathToRef}, ${tmpPath}.`);
          }
        });
      } else {
        loaders.push(...values.main.settings.datasets[datasetType].modules);
      }
      return loaders;
    },
    [relPathsToRefs, path, values]
  );

  // Retrieve the datasets names and ids
  const datasetsInfos = useMemo(
    () => {
      let infos = [];
      datasetLoaders.forEach(datasetLoader => {
        if (datasetLoader.additionalSettings.datasets.length > 0) {
          infos.push({ name: datasetLoader.additionalSettings.datasets[0], id: datasetLoader.additionalSettings.datasetId });
        }
      });
      return infos;
    },
    [datasetLoaders]
  );
  
  // Retrieve the available gestures
  const availableGestures = useMemo(
    () => {
      let gestures = [];
      datasetsInfos.forEach(datasetInfo => {
        if (datasetInfo.name in datasets) {
          gestures.push(...datasets[datasetInfo.name].gestures.map((gesture) => datasetInfo.id ? `${gesture}_${datasetInfo.id}` : gesture));
        }
      });
      let uniqueGestures = new Set(gestures);
      return [...uniqueGestures];
    },
    [datasetsInfos]
  );
  
  // TODO Remove redundancy between these functions
  const addGesture = () => {
    let newValue = bufferValue.slice();
    newValue.push({
      uuid: uuidv4(),
      name: '',
      gestureClasses: []
    });
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    setBufferValue(newValue);
    setTypingTimeout(setTimeout(() => onChange(path, newValue), TIMEOUT_VALUE));
  }

  const changeGesture = (index) => (name, gestureClasses) => {
    let newValue = bufferValue.slice();
    let gesture = newValue[index];
    gesture.name = name;
    gesture.gestureClasses = gestureClasses;
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    setBufferValue(newValue);
    setTypingTimeout(setTimeout(() => onChange(path, newValue), TIMEOUT_VALUE));
  }

  const deleteGesture = (index) => () => {
    let newValue = bufferValue.slice();
    newValue.splice(index, 1);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    setBufferValue(newValue);
    setTypingTimeout(setTimeout(() => onChange(path, newValue), TIMEOUT_VALUE));
  }
  // The level will impact the size, boldness, of the setting
  return (
    <div className={classes.root}>
      <Paper className={classes.gesturesOverview} elevation={0}>
        {/* For each element in value, display it */}
        {bufferValue.map((gesture, index) => (
          <div key={gesture.uuid}>
            <Gesture
              name={gesture.name}
              gestureClasses={gesture.gestureClasses}
              availableGestures={availableGestures}
              onChange={changeGesture(index)}
              onDelete={deleteGesture(index)}
            />
            {index < bufferValue.length - 1 && <Divider/>}
          </div>
        ))}
        {bufferValue.length === 0 && 
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

function Gesture({ name, gestureClasses, availableGestures, onChange, onDelete }) {
  const classes = useStyles();
  return (
    (<Box
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
                  case 'removeOption':
                    onChange(name, value);
                    break;
                  case 'selectOption':
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
        <IconButton onClick={onDelete} size="large">
          <DeleteIcon/>
        </IconButton>
      </Box>
    </Box>)
  );
}

export default GesturesSelector;