import { Typography, Collapse, List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction, IconButton, Checkbox, FormControlLabel } from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@material-ui/icons';
import { withTheme } from '@material-ui/core/styles'
import React from 'react';

class PointsSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPoints: props.value
    }
  }

  render() {
    console.log(this.props)
    const { theme } = this.props;
    // Unchanged for each setting
    const { templates, values } = this.props;
    // Each module has the props, but their value can change
    const { handleChange, level, path, value } = this.props;

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
    this.state = {
      collapsed: true
    };
    this.renderCategory = this.renderCategory.bind(this);
    this.renderPoint = this.renderPoint.bind(this);
  }

  renderCategory() {
    const { item, depth, depthStep, theme } = this.props;
    let { collapsed } = this.state;

    const onClick = (event) => {
      this.setState(prevState => ({
        ...prevState,
        collapsed: !prevState.collapsed
      }));
    };

    const handleToggle = () => {
      
    };

    return (
      <React.Fragment>
        <ListItem className='sidebar-item' onClick={onClick} style={{ paddingLeft: theme.spacing(2 + depth * depthStep)}} button>
          <ListItemIcon>
            <Checkbox
              edge="start"
              onClick={handleToggle}
              checked={false}
              indeterminate={false}
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

  renderPoint() {
    const { item, depth, depthStep, theme } = this.props;
    let { collapsed } = this.state;

    const handleToggle = () => {
      
    };

    return (
      <React.Fragment>
        <ListItem className='sidebar-item' onClick={handleToggle} style={{ paddingLeft: theme.spacing(2 + depth * depthStep)}} button>
          <ListItemIcon>
            <Checkbox
              edge="start"
              checked={false}
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
    const { item, depth, depthStep, theme } = this.props;
    let { collapsed } = this.state;

    if (item.type === 'category') {
      return this.renderCategory();
    } else {
      return this.renderPoint();
    }
  }
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