import { Typography, Collapse, List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction, IconButton, Checkbox, FormControlLabel } from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@material-ui/icons';
import { withTheme } from '@material-ui/core/styles'
import React from 'react';

class PointsSelector extends React.Component {
  render() {
    console.log(this.props)
    const { theme } = this.props;
    // Unchanged for each setting
    const { templates, values } = this.props;
    // Each module has the props, but their value can change
    const { handleChange, level, path, value } = this.props;

    const selectPoints = (points) => {
      let newValue = union(value, points);
      handleChange(path, newValue);
    }

    const deselectPoints = (points) => {
      let newValue = not(value, points);
      handleChange(path, newValue);
    }

    // Get the selected sensors
    const sensors = values.quantumLeap.sensorsSettings.modules;
    let renderedSensors = [];
    sensors.forEach(sensor => {
      let template = templates.modules.sensors[sensor.name];
      let points = template.properties.points;
      renderedSensors.push(
        <React.Fragment>
          <Typography variant='subtitle1' >
            {sensor.name}
          </Typography>
          <List dense>
            {points.map(item => (
              <PointsItem
                item={item}
                onSelect={selectPoints}
                onDeselect={deselectPoints}
                selectedPoints={value}
                depth={0}
                depthStep={2}
                theme={theme}
              />
            ))}
          </List>
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

class PointsItem extends React.Component {
  constructor(props) {
    super(props);
    let availablePoints = getAvailablePoints(props.item);
    this.state = {
      availablePoints: availablePoints,
      collapsed: true,
    };
    this.renderCategory = this.renderCategory.bind(this);
    this.renderPoint = this.renderPoint.bind(this);
  }

  renderCategory(selectedPoints, onClick, handleToggle) {
    const { item, onSelect, onDeselect, depth, depthStep, theme } = this.props;
    let { collapsed, availablePoints } = this.state;

    return (
      <React.Fragment>
        <ListItem className='sidebar-item' onClick={onClick} style={{ paddingLeft: theme.spacing(2 + depth * depthStep)}} button>
          <ListItemIcon>
            <Checkbox
              edge="start"
              onClick={handleToggle}
              checked={selectedPoints.length === availablePoints.length}
              indeterminate={selectedPoints.length !== availablePoints.length && selectedPoints.length > 0}
              tabIndex={-1}
              disableRipple
            />
          </ListItemIcon>
          <ListItemText primary={item.label}/>
          <ListItemSecondaryAction>
            <IconButton edge="end">
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
              edge="start"
              checked={selectedPoints.length === availablePoints.length}
              tabIndex={-1}
              disableRipple
            />
          </ListItemIcon>
          <ListItemText primary={item.label}/>
        </ListItem> 
      </React.Fragment>
    );
  }

  render() {
    const { item, onSelect, onDeselect } = this.props;
    let { availablePoints } = this.state;

    // Get only points that belong to this item
    let selectedPoints = intersection(availablePoints, this.props.selectedPoints);

    const onClick = (event) => {
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
}


function getAvailablePoints(pointItem) {
  if (pointItem.type === 'category') {
    let points = [];
    pointItem.points.forEach(subItem => {
      points.push(...getAvailablePoints(subItem));
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



















const TEST = {
  points: [
    {
      type: 'category',
      name: 'left',
      label: 'Left',
      points: [
        {
          type: 'category',
          name: 'hand',
          label: 'Hand',
          points: [
            {
              type: 'joint',
              name: 'leftPalmPosition',
              label: 'Left palm'
            },
            {
              type: 'joint',
              name: 'leftIndexPosition',
              label: 'Left index'
            },
            {
              type: 'joint',
              name: 'leftPinkyPosition',
              label: 'Left pinky'
            }
          ]
        },
        {
          type: 'category',
          name: 'foot',
          label: 'Foot',
          points: [
            {
              type: 'joint',
              name: 'test1',
              label: 'Left foot 1'
            },
            {
              type: 'joint',
              name: 'test2',
              label: 'Left foot 2'
            },
            {
              type: 'joint',
              name: 'test3',
              label: 'Left foot 3'
            }
          ]
        }
      ]
    }
  ]
}


export default withTheme(PointsSelector);