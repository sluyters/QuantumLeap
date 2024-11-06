import React, { useEffect, useState } from 'react';
import { Tooltip, Card, CardHeader, Button, IconButton, Typography, Paper, Divider, List, ListItem, ListItemIcon, Checkbox, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import { makeStyles, useTheme } from '@mui/styles'

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
const useStyles = makeStyles(styles);

// TODO rename into GesturesSelector
function GesturesSelector2({ templates, values, onChange, level, path, value, datasetType }) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  // // Unchanged for each setting
  // const { templates, values } = this.props;
  // // Each module has the props, but their value can change
  // const { onChange, level, path, value } = this.props;
  // // Unique to each module
  // const { datasetType } = this.props;

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
    setOpen(true);
  }
  const handleClose = () => {
    setOpen(false);
  }
  const handleApply = (newValue) => {
    onChange(path, newValue);
    handleClose();
  }
  const handleDelete = (gesture) => {
    let newValue = JSON.parse(JSON.stringify(value));
    newValue = not(newValue, [gesture]);
    onChange(path, newValue);
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
        open={open}
        value={value}
        availableGestures={availableGestures}
        onClose={handleClose}
        onApply={handleApply}
      />
    </div>
  );
}

function SelectedGestures({ availableGestures, gestures, onDelete }) {
  const classes = useStyles();
  const theme = useTheme();
  let error = false; // TODO display error if a gesture is not in the selected dataset(s)
  return (
    (<Paper className={classes.gesturesOverview} style={{border: error ? '1px solid red' : ''}} elevation={0}>
      <List disablePadding>
        {/* For each element in value, display it */}
        {gestures.map((gesture) => (
          <ListItem 
            key={gesture} 
            classes={{ root: { padding: 0 } }}
            secondaryAction={
              <IconButton edge="end" onClick={() => onDelete(gesture)} size="large">
                <DeleteIcon/>
              </IconButton>
            }
          >
            {availableGestures.indexOf(gesture) === -1 && 
              <ListItemIcon>
                <Tooltip title={<Typography>{`No "${gesture}" gesture in the selected dataset(s).`}</Typography>} style={{ marginLeft: theme.spacing(1)}} arrow>
                  <WarningIcon color='error'/>
                </Tooltip>
              </ListItemIcon>
            }
            <ListItemText primary={gesture}/>
          </ListItem>
        ))}
        {gestures.length === 0 && 
          <Typography style={{padding: theme.spacing(1)}}>
            No gesture selected. All available gestures will be used to train the recognizer.
          </Typography>
        }
      </List>
    </Paper>)
  );
}

function SelectionWindow({ value, open, availableGestures, onClose, onApply }) {
  const classes = useStyles();
  const [bufferValue, setBufferValue] = useState(JSON.parse(JSON.stringify(value)));

  // Update internal state when opened
  useEffect(
    () => {
      if (open)  {
        setBufferValue(JSON.parse(JSON.stringify(value)));
      }
    },
    [open]
  )

  // Handlers
  const selectGestures = (gestures) => {
    let newGestures = union(bufferValue, gestures);
    setBufferValue(newGestures);
  }
  const deselectGestures = (gestures) => {
    let newGestures = not(bufferValue, gestures);
    setBufferValue(newGestures);
  }
  const handleToggleAll = (event) => {
    event.stopPropagation()
    if (bufferValue.length === availableGestures.length) {
      deselectGestures(bufferValue);
    } else {
      selectGestures(availableGestures);
    }
  };
  const handleToggle = (event, gesture) => {
    event.stopPropagation()
    if (bufferValue.indexOf(gesture) !== -1) {
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
                checked={bufferValue.length === availableGestures.length} 
                indeterminate={bufferValue.length !== availableGestures.length && bufferValue.length > 0}
                tabIndex={-1}
                disableRipple
              />
            }
            title='Gestures'
            subheader={`${bufferValue.length}/${availableGestures.length} selected`}
          />
          <Divider />
          <List className={classes.list}>
            {/* For each element in value, display it */}
            {availableGestures.map((gesture, index) => (
              <ListItem key={index} role='listitem' onClick={(event) => handleToggle(event, gesture)}>
                <ListItemIcon>
                  <Checkbox color='primary' checked={bufferValue.indexOf(gesture) !== -1} disableRipple />
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
        <Button variant='outlined' onClick={() => onApply(bufferValue)} color='primary'>
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
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

export default GesturesSelector2;