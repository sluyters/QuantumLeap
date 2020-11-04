import React from 'react'
import { Typography, Button, Select, InputLabel, FormControl, FormControlLabel, Checkbox, Tooltip, TextField, Grid, Box, Paper, List, ListItem, ListItemIcon, ListItemText, Divider, Card, CardHeader } from '@material-ui/core'
import { withStyles, withTheme } from '@material-ui/core/styles'
import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons'

const styles = (theme) => ({
  root: {
    margin: 'auto',
  },
  cardHeader: {
    padding: theme.spacing(1, 2),
  },
  list: {
    width: 250,
    height: 230,
    backgroundColor: theme.palette.background.paper,
    overflow: 'auto',
  },
  button: {
    margin: theme.spacing(0.5, 0),
  },
});

const jsonModules = [
  {
    label: 'P3DollarPlus',
    name: 'p3dollarplus-recognizer',
    type: 'recognizer',
    description: 'WOOOOOOW.',
    settings: []
  },
  {
    label: 'Jackknife',
    name: 'jackknife-recognizer',
    type: 'recognizer',
    description: 'An all-purpose gesture recognizer that uses template-matching and Dynamic Time Warping (DTW).',
    settings: [
      {
        type: 'category',
        name: 'cat1',
        label: 'Category 1',
        settings: [
          {
            type: 'setting',
            name: 'samplingPoints',
            label: 'Number of sampling points',
            description: 'The number of points of the gesture after resampling.',
            data: {
              category: 'item',
              dataType: 'boolean',
              domain: {
                type: 'range',
                low: 2,
                high: null
              },
              default: true,
              current: true
            }
          },
          {
            type: 'setting',
            name: 'samplingPoints1',
            label: 'Number of sampling points',
            description: 'The number of points of the gesture after resampling.',
            data: {
              category: 'item',
              dataType: 'string',
              domain: {
                type: 'any'
              },
              default: 'test',
              current: 'yuio'
            }
          },
          {
            type: 'setting',
            name: 'samplingPoints11',
            label: 'Number of sampling points',
            description: 'The number of points of the gesture after resampling.',
            data: {
              category: 'item',
              dataType: 'integer',
              domain: {
                type: 'list',
                values: [1, 2, 3]
              },
              default: '2',
              current: '1'
            }
          },
        ]
      },
      {
        type: 'setting',
        name: 'samplingPoints2',
        label: 'Number of sampling points',
        description: 'The number of points of the gesture after resampling.',
        data: {
          category: 'item',
          dataType: 'integer',
          domain: {
            type: 'range',
            low: 2,
            high: null
          },
          default: 16,
          current: 8
        }
      },
      {
        type: 'setting',
        label: 'Articulations',
        name: 'articulations',
        description: 'The articulations that are used by the recognizer.',
        data: {
          category: 'list',
          dataType: 'string',
          domain: {
            type: 'list',
            values: ['leftPalmPosition', 'rightPalmPosition', 'leftIndexTipPosition', 'rightIndexTipPosition']
          },
          default: null,
          current: ['leftPalmPosition']
        }
      },
      // {
      //   label: 'Articulations',
      //   name: 'articulations',
      //   description: 'The articulations that are used by the recognizer.',
      //   data: {
      //     category: 'list',
      //     dataType: 'string',
      //     domain: {
      //       type: 'externalProperty',
      //       module: 'sensor',
      //       propertyName: 'points'
      //     },
      //     default: null,
      //     current: ['leftPalmPosition']
      //   }
      // },
    ],
  }
]

class Module extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modules: jsonModules,
      currentModuleId: 0,
    };
    this.updateSettings = this.updateSettings.bind(this);
    this.handleSettingChange = this.handleSettingChange.bind(this);
  }

  render() {
    const { classes, theme } = this.props;
    const { currentModuleId, modules } = this.state;
    const moduleType = this.props.match.params.type;
    return (
      <React.Fragment>
        <Paper style={{ marginTop: theme.spacing(4), padding: theme.spacing(2), backgroundColor: theme.palette.grey[100] }}>
          <Typography variant='h4'>Module {moduleType}</Typography>
          <SelectionPanel 
            classes={classes}
            moduleType={moduleType}
            modules={modules}
            currentModuleId={currentModuleId}
            handleModuleSelection={this.handleModuleSelection.bind(this)}
          />
        </Paper>
        <Paper style={{ marginTop: theme.spacing(2), padding: theme.spacing(2), backgroundColor: theme.palette.grey[20] }}>
          <ConfigPanel 
            classes={classes}
            settings={modules[currentModuleId].settings}
            handleSave={this.handleSave}
            handleChange={this.handleSettingChange}
            theme={theme}
          />
        </Paper>
      </React.Fragment>
    );
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    // Update state
    //this.setState();
  }

  handleModuleSelection(event) {
    console.log(JSON.stringify(event.target.value));
    this.setState({
      currentModuleId: event.target.value
    });
  }

  handleSettingChange(settingPath, value) {
    this.setState(prevState => {
      let modules = prevState.modules;
      let currentModuleId = prevState.currentModuleId;
      let currentModule = modules[currentModuleId];
      currentModule.settings = this.updateSettings(currentModule.settings, settingPath, value);
      return ({
        modules: modules
      });
    });
  }

  updateSettings(settingsList, path, value) {
    if (path.length != 0) {
      for (let i = 0; i < settingsList.length; i++) {
        if (settingsList[i].name == path[0]) {
          // The path matches
          if (path.length == 1) {
            // End of the path
            settingsList[i].data.current = value;
          } else {
            // Not at the end of the path
            settingsList[i].settings = this.updateSettings(settingsList[i].settings, path.slice(1), value);
          }
          return settingsList;
        }
      }
    }
    console.log(`Unable to find setting (path=${JSON.stringify(path)})`)
    return settingsList;
  }

  handleSave(config) {

  }
}

class SelectionPanel extends React.Component {
  render() {
    const { classes, moduleType, modules, currentModuleId, handleModuleSelection } = this.props;
    let currentModule = modules[currentModuleId]; 
    console.log(currentModule)
    return (
      <React.Fragment>
        <FormControl variant="outlined">
          <InputLabel htmlFor="module-selector">
            {moduleType}
          </InputLabel>
          <Select
            native
            value={currentModuleId}
            onChange={handleModuleSelection}
            label={moduleType}
            inputProps={{
              name: 'module',
              id: 'module-selector',
            }}
          >
            {modules.map((module, index) => (
              <option value={index}>
                {module.label}
              </option>
            ))}
          </Select>
        </FormControl>
        <Typography variant='body1'>
            {currentModule.description}
        </Typography>
      </React.Fragment>
    );
  }
}

class ConfigPanel extends React.Component {
  render() {
    const { classes, settings, handleSave, depthStep, depth, handleChange, theme } = this.props
    return (
      <React.Fragment>
        <div>
          {settings.map(setting => (
            <ConfigItem 
              classes={classes}
              setting={setting}
              depthStep={depthStep}
              depth={depth}
              handleChange={handleChange}
              theme={theme}
            />
          ))}
        </div>
        <div>
          <Button variant="contained" color="secondary">
            Restore default values
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </React.Fragment>
    );
  }
}

function ConfigItem(props) {
  const { classes, setting, depthStep, depth, path, handleChange, theme } = props;
  let newPath = path.slice();
  newPath.push(setting.name);
  if (setting.type == 'category') {
    return (
      <React.Fragment>
        <Typography 
          variant='subtitle1' 
          style={{ paddingLeft: theme.spacing(depth * depthStep)}}>
            {setting.label}
        </Typography>
        {setting.settings.map(setting => (
            <ConfigItem 
              classes={classes}
              setting={setting}
              depthStep={depthStep}
              depth={depth + 1}
              path={newPath}
              handleChange={handleChange}
              theme={theme}
            />
          ))}
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        <Box style={{ paddingLeft: theme.spacing(depth * depthStep)}}>
          <Typography 
            variant='subtitle2' 
            style={{display:'flex', alignItems:'center'}}
          >
              {setting.label}
              <Tooltip title={setting.description} style={{ marginLeft: theme.spacing(1)}} > 
                <InfoOutlinedIcon fontSize='small'/>
              </Tooltip>
          </Typography>
          <Setting
            classes={classes}
            data={setting.data}
            path={newPath}
            handleChange={handleChange}
          />
        </Box>
      </React.Fragment>
    );
  }
}

function Setting(props) {
  const { classes, data, path, handleChange } = props;
  switch (data.dataType) {
    case 'boolean':
      return (<BooleanSetting
        classes={classes}
        data={data}
        handleChange={handleChange}
        path={path}
      />);
    case 'integer':
      return (<NonBooleanSetting
        classes={classes}
        data={data}
        handleChange={handleChange}
        path={path}
      />);
    case 'float':
      return (<NonBooleanSetting
        classes={classes}
        data={data}
        handleChange={handleChange}
        path={path}
      />);
    case 'string':
      return (<NonBooleanSetting
        classes={classes}
        data={data}
        handleChange={handleChange}
        path={path}
      />);
    default:
      console.log(`Invalid data type: ${data.dataType}`);
      return <span>Error.</span>
  }
}

// Add index of setting in checkbox
class BooleanSetting extends React.Component {
  render() {
    const { classes, data, handleChange, path } = this.props;
    return (
      <Checkbox 
        checked={data.current}
        onClick={(event) => handleChange(path, event.target.checked)}
        name={data.name}
        color='primary'
      />
    );
  }
}

// Add index of setting in checkbox
function NonBooleanSetting(props) {
  const { classes, data, handleChange, path } = props;
  if (data.category == 'item') {
    if (data.domain.type == 'list') {
      // Item output / List domain
      return (
        <FormControl variant="outlined">
          <Select
            native
            value={data.current}
            onChange={(event) => handleChange(path, event.target.value)}
          >
            {data.domain.values.map((value) => (
              <option value={value}>
                {value}
              </option>
            ))}
          </Select>
        </FormControl>
      );
    } else if (data.domain.type == 'any' || data.domain.type == 'range') {
      // Item output / Any or range domain
      return (
        <TextField
          type={data.dataType == 'string' ? 'text' : 'number'}
          variant='outlined'
          value={data.current}
          onChange={(event) => handleChange(path, event.target.value)}
        />
      );
    } else {
      console.log(`Invalid domain type: ${data.domain.type}`);
      return <span>Error.</span>
    }
  } else if (data.category == 'list') {
    if (data.domain.type == 'list') {
      // List output / List domain
      return (
        <TransferList 
          classes={classes}
          data={data}
          handleChange={handleChange}
          path={path}
        />
      )
    } else if (data.domain.type == 'any' || data.domain.type == 'range') {
      // List output / Any or range domain
      return <span>Not implemented.</span>
    } else {
      console.log(`Invalid domain type: ${data.domain.type}`);
      return <span>Error.</span>
    }
  } else {
    console.log(`Invalid data category: ${data.category}`);
    return <span>Error.</span>
  }
}

class TransferList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: []
    };
    this.customList = this.customList.bind(this);
    this.intersection = this.intersection.bind(this);
    this.not = this.not.bind(this);
    this.union = this.union.bind(this);
  }

  render() {
    const { classes, data, handleChange, path } = this.props;
    const { checked } = this.state;
    // Values chosen
    const right = data.current;
    // Values to choose from
    const left = data.domain.values.filter((value) => right.indexOf(value) == -1);
    // Checked items
    const leftChecked = this.intersection(checked, left);
    const rightChecked = this.intersection(checked, right);
    // 
    const handleCheckedRight = () => {
      this.setState((previousState) => ({
        checked: this.not(previousState.checked, leftChecked)
      }));
      handleChange(path, right.concat(leftChecked));
    }
    const handleCheckedLeft = () => {
      this.setState((previousState) => ({
        checked: this.not(previousState.checked, rightChecked)
      }));
      handleChange(path, right.filter((value) => rightChecked.indexOf(value) == -1));
    }
    // Render the TransferList
    return (
      <Grid container spacing={2} justify="center" alignItems="center" className={classes.root}>
        <Grid item>{this.customList('Available', left, leftChecked)}</Grid>
        <Grid item>
          <Grid container direction="column" alignItems="center">
            <Button
              variant="outlined"
              size="small"
              className={classes.button}
              onClick={handleCheckedRight}
              disabled={leftChecked.length == 0}
            >
              &gt;
            </Button>
            <Button
              variant="outlined"
              size="small"
              className={classes.button}
              onClick={handleCheckedLeft}
              disabled={rightChecked.length == 0}
            >
              &lt;
            </Button>
          </Grid>
        </Grid>
        <Grid item>{this.customList('Chosen', right, rightChecked)}</Grid>
      </Grid>
    );
  }

  not(a, b) {
    return a.filter((value) => b.indexOf(value) === -1);
  }

  intersection(a, b) {
    return a.filter((value) => b.indexOf(value) !== -1);
  }

  union(a, b) {
    return [...a, ...this.not(b, a)];
  }
  
  // Function to generate a list of items
  customList(title, items) {
    const { classes } = this.props;
    const { checked } = this.state;
    // Count the number of items that are checked
    const numberOfChecked = (items) => this.intersection(checked, items).length;
    // Handle toggle all checkboxes
    const handleToggleAll = (items) => () => {
      if (numberOfChecked(items) === items.length) {
        this.setState((prevState) => ({
          checked: this.not(prevState.checked, items)
        }))
      } else {
        this.setState((prevState) => ({
          checked: this.union(prevState.checked, items)
        }))
      }
    };
    // Handle toggle one checkbox
    const handleToggle = (value) => () => {
      this.setState((prevState) => {
        const currentIndex = prevState.checked.indexOf(value);
        const newChecked = [...prevState.checked];
        if (currentIndex === -1) {
          newChecked.push(value);
        } else {
          newChecked.splice(currentIndex, 1);
        }
        return {
          checked: newChecked
        }
      })
    };
    // Generate the list
    return (
      <Card>
        <CardHeader
          className={classes.cardHeader}
          avatar={
            <Checkbox
              onClick={handleToggleAll(items)}
              checked={numberOfChecked(items) === items.length && items.length !== 0}
              indeterminate={numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0}
              disabled={items.length === 0}
            />
          }
          title={title}
          subheader={`${numberOfChecked(items)}/${items.length} selected`}
        />
        <Divider />
        <List className={classes.list} dense component="div" role="list">
          {items.map((value) => {
            const labelId = `transfer-list-all-item-${value}-label`;
            return (
              <ListItem key={value} role="listitem" button onClick={handleToggle(value)}>
                <ListItemIcon>
                  <Checkbox
                    checked={checked.indexOf(value) !== -1}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={value} />
              </ListItem>
            );
          })}
          <ListItem />
        </List>
      </Card>
    );
  }
}

// TODO
function fetchExternalProperty(externalProperty) {
  return 0;
}

// Default values for props
ConfigPanel.defaultProps = {
  depthStep: 2,
  depth: 0
};

ConfigItem.defaultProps = {
  path: []
};

export default withTheme(withStyles(styles)(Module))