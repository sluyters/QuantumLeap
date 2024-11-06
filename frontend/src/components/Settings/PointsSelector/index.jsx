import React, { useEffect, useMemo, useState } from 'react';
import { Typography, Collapse, List, ListItem, ListItemText, ListItemIcon, IconButton, Checkbox, TextField, Grid, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, useTheme } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, Delete as DeleteIcon, Warning as WarningIcon } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import LeapMotionPoints from './LeapMotionPoints';

const styles = (theme) => ({
  root: {
    margin: theme.spacing(1),
  },
  pointsOverview: {
    border: `solid 1px ${theme.palette.divider}`,
    maxHeight: '300px',
    overflowY: 'auto',
  },
  selectPointsButton: {
    marginTop: theme.spacing(1),
  },
  pointsList: {
    backgroundColor: theme.palette.background.default
  },
  pointsVisualization: {
    overflow: 'hidden',
  },
});
const useStyles = makeStyles(styles);


function PointsSelector({ templates, values, onChange, path, value, minNumber, maxNumber }) {
  const classes = useStyles();
  const theme = useTheme();

  const [open, setOpen] = useState(false);

  if (!values.main.settings.sensors) {
    // let dataset = undefined;
    // if (values.main.settings.datasets.hasOwnProperty('static')) {
    //   dataset = values.main.settings.datasets.static.modules[0]
    // } else {
    //   dataset = values.main.settings.datasets.dynamic.modules[0]
    // }
    // let datasetName = dataset ? dataset.additionalSettings.sensorId : '';
    let datasetName = 'default';
    const changePoints = (event) => {
      let text = event.target.value.replace(/^[, ]*/, '');
      let points = text ? text.split(/[, ]+/) : [];
      let newValue = {};
      if (points.length > 0) {
        newValue[datasetName] = points;
      }
      onChange(path, newValue);
    }
    return (
      <div className={classes.root}>
        <TextField
          fullWidth
          multiline
          type='text'
          variant='outlined'
          value={value[datasetName] ? value[datasetName].join(',') : ''} 
          onChange={changePoints}
        />
      </div>
    );
  } else {
    // Get the selected sensors (quantumleap config)
    const sensors = values.main.settings.sensors.modules;

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
    const handleDelete = (sensorId, pointName) => {
      let newValue = JSON.parse(JSON.stringify(value));
      newValue[sensorId] = not(newValue[sensorId], [pointName]);
      if (newValue[sensorId].length === 0) {
        delete newValue[sensorId];
      }
      onChange(path, newValue);
    }

    // Get ids of selected sensors
    let sensorsIds = sensors.map(sensor => sensor.additionalSettings.id);
    // Build list of points
    let points = Object.keys(value).flatMap((sensorId) => value[sensorId].map((pointName) => ({ name: pointName, sensorId: sensorId })));
    // Check number of points
    let error = minNumber !== undefined && points.length < minNumber;
    
    return (
      <div className={classes.root}>
        <SelectionOverview 
          points={points} 
          sensorsIds={sensorsIds} 
          onDelete={handleDelete}
          error={error}
        />
        {error && 
          <div style={{marginLeft: theme.spacing(2), marginRight: theme.spacing(2)}}>
            <Typography color='error' variant='caption'>At least {minNumber} point(s) should be selected!</Typography>
          </div>  
        }
        <Button className={classes.selectPointsButton} variant="outlined" onClick={handleOpen}>
          Select point(s)
        </Button>
        <SelectionTool 
          open={open}
          value={value}
          sensors={sensors}
          maxPoints={maxNumber}
          onClose={handleClose}
          onApply={handleApply}
          templates={templates}
        />   
      </div>
    );
  }
}


function SelectionOverview({ points, sensorsIds, onDelete, error }) {
  const classes = useStyles();
  const theme = useTheme();

  return (
    (<Paper className={classes.pointsOverview} style={{border: error ? '1px solid red' : ''}} elevation={0}>
      <List disablePadding>
        {/* For each element in value, display it */}
        {points.map((item) => (
          <ListItem 
            key={`${item.name}-${item.sensorId}`} 
            classes={{ root: { padding: 0 } }}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={() => onDelete(item.sensorId, item.name)}
                size="large">
                <DeleteIcon/>
              </IconButton>
            }
          >
            {sensorsIds.indexOf(item.sensorId) === -1 && 
              <ListItemIcon>
                <Tooltip title={<Typography>{`No sensor with identifier "${item.sensorId}" selected.`}</Typography>} style={{ marginLeft: theme.spacing(1)}} arrow>
                  <WarningIcon color='error'/>
                </Tooltip>
              </ListItemIcon>
            }
            <ListItemText primary={item.name} secondary={item.sensorId}/>
          </ListItem>
        ))}
        {points.length === 0 && 
          <Typography style={{padding: theme.spacing(1)}}>
            No point selected.
          </Typography>
        }
      </List>
    </Paper>)
  );
}


function SelectionTool({ open, sensors, maxPoints, onClose, onApply, templates, value }) { 
  // State
  const [bufferValue, setBufferValue] = useState(JSON.parse(JSON.stringify(value)));

  useEffect(
    () => {
      setBufferValue(JSON.parse(JSON.stringify(value)));
    },
    [open]
  );

  const handleSelect = (points, sensorId) => {
    const selectedPoints = bufferValue[sensorId] || [];
    let newPoints = union(selectedPoints, points); // TODO only checks number of points from one sensor instead of all
    if (maxPoints && newPoints.length > maxPoints) {
      newPoints.splice(0, newPoints.length - maxPoints);
    }
    bufferValue[sensorId] = newPoints;
    setBufferValue({...bufferValue});
  }

  const handleDeselect = (points, sensorId) => {
    const selectedPoints = bufferValue[sensorId] || [];
    let newPoints = not(selectedPoints, points);
    if (newPoints.length === 0) {
      delete bufferValue[sensorId];
    } else {
      bufferValue[sensorId] = newPoints;
    }
    setBufferValue({...bufferValue});
  }

  return (
    <Dialog fullWidth={true} maxWidth={'md'} open={open}>
      <DialogTitle>
        Select points
      </DialogTitle>
      <DialogContent>
        {sensors.map(sensor => {
          const sensorId = sensor.additionalSettings.id;
          const template = templates.modules.sensors[sensor.moduleName];
          return (
            <SensorPoints 
              sensorLabel={template.label} 
              sensorId={sensorId} 
              moduleName={sensor.moduleName}
              availablePoints={template.properties.points}
              selectedPoints={bufferValue[sensorId] || []} 
              onSelect={handleSelect} 
              onDeselect={handleDeselect} 
              key={sensorId} 
            />
          );
        })}
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

function SensorPoints({ sensorLabel='unknown', sensorId='unknown', moduleName='', availablePoints, selectedPoints, onSelect, onDeselect }) {
  const classes = useStyles();

  const handleSelect = (points) => onSelect(points, sensorId);
  const handleDeselect = (points) => onDeselect(points, sensorId);

  return (
    <div key={`points-${sensorId}`}>
      <Typography variant='subtitle1' >
        {`${sensorLabel} (${sensorId})`}
      </Typography>
      <Grid container spacing={2}>
        {/* The list of points */}
        <Grid item xs={12} md={12} lg={5}>
          <Paper className={classes.pointsList}>
            <List dense style={{width: '100%'}}>
              {availablePoints.map((item, index) => (
                <SensorPointsTree
                  key={index}
                  item={item}
                  sensorId={sensorId}
                  onSelect={handleSelect}
                  onDeselect={handleDeselect}
                  selectedPoints={selectedPoints}
                  depth={0}
                  depthStep={2}
                />
              ))}
            </List>
          </Paper>
        </Grid>
        {/* A visual representation of the points */}
        <Grid item xs={12} md={12} lg={7}>
          <Paper className={classes.pointsVisualization} >
            <SensorPointsVisualization moduleName={moduleName} sensorId={sensorId} selectedPoints={selectedPoints} onSelect={handleSelect} onDeselect={handleDeselect} />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}


function SensorPointsVisualization({ moduleName, sensorId, selectedPoints, onSelect, onDeselect }) {
  switch (moduleName) {
    case 'leap-sensor':
      return (
        <LeapMotionPoints
          selectedPoints={selectedPoints}
          sensorId={sensorId}
          onSelect={onSelect}
          onDeselect={onDeselect}
        />
      );
    case 'leapv5':
      return (
        <LeapMotionPoints
          selectedPoints={selectedPoints}
          sensorId={sensorId}
          onSelect={onSelect}
          onDeselect={onDeselect}
        />
      );
    default:
      return (
        <Typography variant='subtitle1' align='center'>
          No visualization available.
        </Typography>
      );
  }
}


function SensorPointsTree({ item, sensorId, onSelect, onDeselect, selectedPoints, depth, depthStep }) {
  const [collapsed, setCollapsed] = useState(true);

  const theme = useTheme();

  const availablePoints = useMemo(
    () => getAvailablePoints(sensorId, item),
    [sensorId, item]
  );

  // Get only points that belong to this item
  let subsetSelectedPoints = intersection(availablePoints, selectedPoints);

  const handleClick = (event) => {
    event.stopPropagation();
    setCollapsed(collapsed => !collapsed);
  };

  const handleToggle = (event) => {
    event.stopPropagation()
    if (subsetSelectedPoints.length === availablePoints.length) {
      onDeselect(subsetSelectedPoints);
    } else {
      onSelect(availablePoints);
    }
  };

  if (item.type === 'category') {
    return (
      <React.Fragment>
        <ListItem 
          className='sidebar-item' 
          onClick={handleClick} 
          style={{ paddingLeft: theme.spacing(2 + depth * depthStep)}}
          secondaryAction={
            <IconButton edge="end" onClick={handleClick} size="large">
              {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
          }
        >
          <ListItemIcon>
            <Checkbox
              edge="start"
              color='primary'
              onClick={handleToggle}
              checked={subsetSelectedPoints.length === availablePoints.length}
              indeterminate={subsetSelectedPoints.length !== availablePoints.length && subsetSelectedPoints.length > 0}
              tabIndex={-1}
              disableRipple
            />
          </ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItem>
        {/* Render a list of items */}
        <Collapse in={!collapsed} timeout='auto' unmountOnExit>
          <List dense> 
          {item.points.map((subItem, index) => (
            <SensorPointsTree
              key={index}
              item={subItem}
              sensorId={sensorId}
              onSelect={onSelect}
              onDeselect={onDeselect}
              selectedPoints={subsetSelectedPoints}
              depth={depth + 1}
              depthStep={4}
            />
          ))}
          </List>
        </Collapse>
      </React.Fragment>
    );
  } else {
    return (
      <SensorPointsItem 
        label={item.label} 
        id={availablePoints[0]}
        selected={subsetSelectedPoints.length === availablePoints.length}
        onToggle={handleToggle}
        depth={depth}
        depthStep={depthStep}
      />
    );
  }
}


function SensorPointsItem({ label, id, selected, onToggle, depth, depthStep }) {
  const theme = useTheme();
  return(
    <ListItem className='sidebar-item' onClick={onToggle} style={{ paddingLeft: theme.spacing(2 + depth * depthStep)}}>
      <ListItemIcon>
        <Checkbox
          color='primary'
          edge="start"
          checked={selected}
          tabIndex={-1}
          disableRipple
        />
      </ListItemIcon>
      <ListItemText primary={`${label} (${id})`}/>
    </ListItem> 
  );
}


// Helpers
function getAvailablePoints(sensorId, pointItem) {
  if (pointItem.type === 'category') {
    let points = [];
    pointItem.points.forEach(subItem => {
      points.push(...getAvailablePoints(sensorId, subItem));
    });
    return points;
  } else {
    return [ pointItem.name ];
  }
}

function intersection(a, b) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

function not(a, b) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function union(a, b) {
  return [...a, ...not(b, a)];
}

export default PointsSelector;