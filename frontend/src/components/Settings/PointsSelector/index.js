import React from 'react';
import { Typography, Collapse, List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction, IconButton, Checkbox, TextField, FormControlLabel, Grid, Paper } from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@material-ui/icons';
import { withTheme, withStyles } from '@material-ui/core/styles';
import Autocomplete from '@material-ui/lab/Autocomplete';
import LeapMotionPoints from './LeapMotionPoints';

const TIMEOUT_VALUE = 500;

const styles = (theme) => ({
  pointsList: {
    backgroundColor: 'rgb(240, 240, 240)',
  },
  pointsVisualization: {
    backgroundColor: 'rgb(240, 240, 240)',
    overflow: 'hidden',
  },
});

class PointsSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      typingTimeout: ''
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
        console.log(points)
        let newValue = {};
        if (points.length > 0) {
          newValue[datasetName] = points;
        }
        if (this.state.typingTimeout) {
          clearTimeout(this.state.typingTimeout);
        }
        this.setState({
          value: newValue,
          typingTimeout: setTimeout(() => handleChange(path, newValue), TIMEOUT_VALUE)
        });
      }
      return (
        <React.Fragment>
          <TextField
            fullWidth
            multiline
            type='text'
            variant='outlined'
            value={this.state.value[datasetName] ? this.state.value[datasetName].join(',') : ''} 
            onChange={changePoints}
          />
        </React.Fragment>
      );
    } else {
      // Get the selected sensors (quantumleap config)
      const sensors = values.main.settings.sensors.modules;
      // Remove points from sensors that do not exist anymore
      let sensorsIds = sensors.map(sensor => sensor.additionalSettings.id);
      Object.keys(value).forEach(sensorId => {
        if (sensorsIds.indexOf(sensorId) === -1) {
          // Remove points
          delete value[sensorId];
        }
      })
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
          if (maxNumber && newPoints.length > maxNumber) {
            newPoints.splice(0, newPoints.length - maxNumber);
          }
          value[sensorId] = newPoints;
          handleChange(path, value);
        }
        const deselectPoints = (points) => {
          let newPoints = not(selectedPoints, points);
          if (newPoints.length === 0) {
            delete value[sensorId];
          } else {
            value[sensorId] = newPoints;
          }
          handleChange(path, value);
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
          <React.Fragment>
            <Typography variant='subtitle1' >
              {`${name} (${sensorId})`}
            </Typography>
            <Grid container spacing={2}>
              {/* The list of points */}
              <Grid item xs={12} md={12} lg={5}>
                <Paper className={classes.pointsList}>
                  <List dense style={{width: '100%'}}>
                    {availablePoints.map(item => (
                      <PointsItem
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
          </React.Fragment>
        );
      });
      return (
        <React.Fragment>
          {renderedSensors}
        </React.Fragment>
      );
    }
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
          {item.points.map((subItem) => (
            <PointsItem
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

export default withTheme(withStyles(styles)(PointsSelector));