import React from 'react';
import { Typography, Collapse, List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction, IconButton, Checkbox, TextField, FormControlLabel, Grid, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Tooltip } from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, Delete as DeleteIcon, Warning as WarningIcon } from '@material-ui/icons';
import { withTheme, withStyles, useTheme } from '@material-ui/core/styles';
import Autocomplete from '@material-ui/lab/Autocomplete';
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

class PointsSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  render() {
    const { classes, theme } = this.props;
    // Unchanged for each setting
    const { templates, values } = this.props;
    // Each module has the props, but their value can change
    const { handleChange, level, path, value } = this.props;
    // Unique to each module
    const { minNumber, maxNumber } = this.props;

    if (!values.main.settings.sensors) {
      // Get the selected dataset (testing config) TODO
      const dataset = values.main.settings.datasets.static.modules[0];
      let datasetName = dataset.additionalSettings.id;
      const changePoints = (event) => {
        let text = event.target.value.replace(/^[, ]*/, '');
        let points = text ? text.split(/[, ]+/) : [];
        let newValue = {};
        if (points.length > 0) {
          newValue[datasetName] = points;
        }
        handleChange(path, newValue);
      }
      return (
        <div className={classes.root}>
          <TextField
            fullWidth
            multiline
            type='text'
            variant='outlined'
            value={this.state.value[datasetName] ? this.state.value[datasetName].join(',') : ''} 
            onChange={changePoints}
          />
        </div>
      );
    } else {
      // Get the selected sensors (quantumleap config)
      const sensors = values.main.settings.sensors.modules;

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
      const handleDelete = (sensorId, pointName) => {
        let newValue = JSON.parse(JSON.stringify(value));
        newValue[sensorId] = not(newValue[sensorId], [pointName]);
        if (newValue[sensorId].length === 0) {
          delete newValue[sensorId];
        }
        handleChange(path, newValue);
      }

      // Get ids of selected sensors
      let sensorsIds = sensors.map(sensor => sensor.additionalSettings.id);
      // Build list of points
      let points = Object.keys(value).flatMap((sensorId) => value[sensorId].map((pointName) => ({ name: pointName, sensorId: sensorId })));
      // Check number of points
      let error = minNumber !== undefined && points.length < minNumber;
      
      return (
        <div className={classes.root}>
          <SelectedPoints 
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
          <SelectionWindow 
            open={this.state.open}
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
}

// TODO Could be standardized
class SelectedPoints extends React.Component {
  render() {
    const { classes, theme, points, sensorsIds, onDelete, error } = this.props;
    return (
      // <Paper className={classes.pointsOverview} style={{border: error ? '1px solid red' : ''}} elevation={0}>
      //   {/* For each element in value, display it */}
      //   {points.map((item, index) => (
      //     <div key={index}>
      //       {/* The part to standardize */}
      //       <Typography style={{padding: theme.spacing(1), color: sensorsIds.indexOf(item.sensorId) === -1 ? 'red' : 'black' }}>
      //         {item.name} ({item.sensorId})
      //       </Typography>
      //       {index < points.length - 1 && <Divider/>}
      //     </div>
      //   ))}
      //   {points.length === 0 && 
      //     <Typography style={{padding: theme.spacing(1)}}>
      //       No point selected.
      //     </Typography>
      //   }
      // </Paper>
      <Paper className={classes.pointsOverview} style={{border: error ? '1px solid red' : ''}} elevation={0}>
        <List disablePadding>
          {/* For each element in value, display it */}
          {points.map((item) => (
            <ListItem key={`${item.name}-${item.sensorId}`} button classes={{ root: { padding: 0 } }}>
              {sensorsIds.indexOf(item.sensorId) === -1 && 
                <ListItemIcon>
                  <Tooltip title={<Typography>{`No sensor with identifier "${item.sensorId}" selected.`}</Typography>} style={{ marginLeft: theme.spacing(1)}} arrow>
                    <WarningIcon color='error'/>
                  </Tooltip>
                </ListItemIcon>
              }
              <ListItemText primary={item.name} secondary={item.sensorId}/>
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => onDelete(item.sensorId, item.name)}>
                  <DeleteIcon/>
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {points.length === 0 && 
            <Typography style={{padding: theme.spacing(1)}}>
              No point selected.
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
    const { open, sensors, maxPoints, onClose, onApply, templates, classes, theme } = this.props;
    const { value } = this.state;
    let renderedSensors = [];
    sensors.forEach(sensor => {
      let template = templates.modules.sensors[sensor.moduleName];
      let name = template.label;
      let sensorId = sensor.additionalSettings.id;
      let availablePoints = template.properties.points;
      let selectedPoints = value[sensorId] ? value[sensorId] : [];
      let pointsVisualization;
      // Handlers
      const selectPoints = (points) => {
        let newPoints = union(selectedPoints, points);
        if (maxPoints && newPoints.length > maxPoints) {
          newPoints.splice(0, newPoints.length - maxPoints);
        }
        value[sensorId] = newPoints;
        this.setState({
          value: value,
        });
      }
      const deselectPoints = (points) => {
        let newPoints = not(selectedPoints, points);
        if (newPoints.length === 0) {
          delete value[sensorId];
        } else {
          value[sensorId] = newPoints;
        }
        this.setState({
          value: value,
        });
      }
      switch (sensor.moduleName) {
        case 'leap-sensor':
          pointsVisualization = (
            <LeapMotionPoints
              selectedPoints={selectedPoints}
              sensorId={sensorId}
              onSelect={selectPoints}
              onDeselect={deselectPoints}
            />
          );
          break;
        default:
          pointsVisualization = (
            <Typography variant='subtitle1' align='center'>
              No visualization available.
            </Typography>
          );
      }
      renderedSensors.push(
        <div key={`points-${sensorId}`}>
          <Typography variant='subtitle1' >
            {`${name} (${sensorId})`}
          </Typography>
          <Grid container spacing={2}>
            {/* The list of points */}
            <Grid item xs={12} md={12} lg={5}>
              <Paper className={classes.pointsList}>
                <List dense style={{width: '100%'}}>
                  {availablePoints.map((item, index) => (
                    <PointsItem
                      key={index}
                      classes={classes}
                      item={item}
                      sensorId={sensorId}
                      onSelect={selectPoints}
                      onDeselect={deselectPoints}
                      selectedPoints={selectedPoints}
                      depth={0}
                      depthStep={2}
                      theme={theme}
                    />
                  ))}
                </List>
              </Paper>
            </Grid>
            {/* A visual representation of the points */}
            <Grid item xs={12} md={12} lg={7}>
              <Paper className={classes.pointsVisualization} >
                {pointsVisualization}
              </Paper>
            </Grid>
          </Grid>
        </div>
      );
    });


    return (
      <Dialog fullWidth={true} maxWidth={'md'} open={open}>
        <DialogTitle>
          Select points
        </DialogTitle>
        <DialogContent>
          {renderedSensors}
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

class PointsItem extends React.Component {
  constructor(props) {
    super(props);
    let availablePoints = getAvailablePoints(props.sensorId, props.item);
    this.state = {
      availablePoints: availablePoints,
      collapsed: true,
    };
    this.renderCategory = this.renderCategory.bind(this);
    this.renderPoint = this.renderPoint.bind(this);
  }

  render() {
    const { item, onSelect, onDeselect } = this.props;
    let { availablePoints } = this.state;

    // Get only points that belong to this item
    let selectedPoints = intersection(availablePoints, this.props.selectedPoints);
    //console.log(availablePoints, selectedPoints)

    const onClick = () => {
      this.setState(prevState => ({
        collapsed: !prevState.collapsed
      }));
    };

    const handleToggle = (event) => {
      event.stopPropagation()
      if (selectedPoints.length === availablePoints.length) {
        onDeselect(selectedPoints);
      } else {
        onSelect(availablePoints);
      }
    };

    if (item.type === 'category') {
      return this.renderCategory(selectedPoints, onClick, handleToggle);
    } else {
      return this.renderPoint(selectedPoints, handleToggle);
    }
  }

  renderCategory(selectedPoints, onClick, handleToggle) {
    const { classes, item, sensorId, onSelect, onDeselect, depth, depthStep, theme } = this.props;
    let { collapsed, availablePoints } = this.state;

    return (
      <React.Fragment>
        <ListItem className='sidebar-item' onClick={onClick} style={{ paddingLeft: theme.spacing(2 + depth * depthStep)}} button>
          <ListItemIcon>
            <Checkbox
              edge="start"
              color='primary'
              onClick={handleToggle}
              checked={selectedPoints.length === availablePoints.length}
              indeterminate={selectedPoints.length !== availablePoints.length && selectedPoints.length > 0}
              tabIndex={-1}
              disableRipple
            />
          </ListItemIcon>
          <ListItemText primary={item.label}/>
          <ListItemSecondaryAction>
            <IconButton edge="end" onClick={onClick}>
              {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem> 
        {/* Render a list of items */}
        <Collapse in={!collapsed} timeout='auto' unmountOnExit>
          <List dense> 
          {item.points.map((subItem, index) => (
            <PointsItem
              key={index}
              item={subItem}
              sensorId={sensorId}
              onSelect={onSelect}
              onDeselect={onDeselect}
              selectedPoints={selectedPoints}
              depth={depth + 1}
              depthStep={4}
              theme={theme}
            />
          ))}
          </List>
        </Collapse>
      </React.Fragment>
    );
  }

  renderPoint(selectedPoints, handleToggle) {
    const { item, depth, depthStep, theme } = this.props;
    let { availablePoints } = this.state;

    return (
      <React.Fragment>
        <ListItem className='sidebar-item' onClick={handleToggle} style={{ paddingLeft: theme.spacing(2 + depth * depthStep)}} button>
          <ListItemIcon>
            <Checkbox
              color='primary'
              edge="start"
              checked={selectedPoints.length === availablePoints.length}
              tabIndex={-1}
              disableRipple
            />
          </ListItemIcon>
          <ListItemText primary={`${item.label} (${availablePoints[0]})`}/>
        </ListItem> 
      </React.Fragment>
    );
  }
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

SelectedPoints = withTheme(withStyles(styles)(SelectedPoints));
SelectionWindow = withTheme(withStyles(styles)(SelectionWindow));

export default withTheme(withStyles(styles)(PointsSelector));