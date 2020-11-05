import React from 'react'
import axios from 'axios'
import { Typography, Select, FormControl, Paper } from '@material-ui/core'
import { withStyles, withTheme } from '@material-ui/core/styles'
import ConfigPanel from '../../components/ConfigPanel'

// Change
const URL = 'http://127.0.0.1:6442'

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

class Module extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modules: [],
      currentModuleId: 0,
    };
    this.handleSettingChange = this.handleSettingChange.bind(this);
    this.handleModuleSelection = this.handleModuleSelection.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  render() {
    const { classes, theme } = this.props;
    const { currentModuleId, modules } = this.state;
    const moduleType = this.props.match.params.type;
    return (
      <React.Fragment>
        <Paper style={{ marginTop: theme.spacing(4), padding: theme.spacing(2), backgroundColor: theme.palette.grey[100] }}>
          <Typography variant='h4'>
            {moduleType.slice(0,1).toUpperCase() + moduleType.slice(1, moduleType.length)}
          </Typography>
          {modules.length !== 0 ? (
            <SelectionPanel 
              classes={classes}
              moduleType={moduleType}
              modules={modules}
              currentModuleId={currentModuleId}
              handleModuleSelection={this.handleModuleSelection}
            />
          ) : (
            <span></span>
          )}
        </Paper>
        <Paper style={{ marginTop: theme.spacing(2), padding: theme.spacing(2), backgroundColor: theme.palette.grey[20] }}>
          {modules.length !== 0 ? (
            <ConfigPanel 
              classes={classes}
              settings={modules[currentModuleId].settings}
              handleSave={this.handleSave}
              handleChange={this.handleSettingChange}
              theme={theme}
            />
          ) : (
            <span></span>
          )}
        </Paper>
      </React.Fragment>
    );
  }

  componentDidMount() {
    this.fetchData(this.props.match.params.type);
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.type !== prevProps.match.params.type) {
      this.fetchData(this.props.match.params.type);
    }
  }

  saveModule(module) {
    return axios.put(`${URL}/modules/${module.type}/${module.name}`, { config: module })
      .then((res) => {
        console.log(res)
        console.log('data saved');
      })
      .catch((err) => {
        console.error(err.message);
      })
  }

  fetchData(moduleType) {
    return axios.get(`${URL}/modules/${moduleType}?withConfigs=true`)
      .then((res) => {
        console.log('data fetched');
        this.setState({
          modules: res.data.modules,
          currentModuleId: 0
        });
      })
      .catch((err) => {
        this.setState({
          modules: [],
          currentModuleId: 0
        });
        console.error(err.message);
      })
  }

  handleModuleSelection(event) {
    this.setState({
      currentModuleId: event.target.value
    });
  }

  handleSettingChange(settingPath, value) {
    // Recursive function to update the setting
    const updateSettings = (settingsList, path, value) => {
      if (path.length !== 0) {
        for (let i = 0; i < settingsList.length; i++) {
          if (settingsList[i].name === path[0]) {
            // The path matches
            if (path.length === 1) {
              // End of the path
              settingsList[i].data.current = value;
            } else {
              // Not at the end of the path
              settingsList[i].settings = updateSettings(settingsList[i].settings, path.slice(1), value);
            }
            return settingsList;
          }
        }
      }
      console.log(`Unable to find setting (path=${JSON.stringify(path)})`)
      return settingsList;
    };
    // Update the state
    this.setState(prevState => {
      let modules = prevState.modules;
      let currentModuleId = prevState.currentModuleId;
      let currentModule = modules[currentModuleId];
      currentModule.settings = updateSettings(currentModule.settings, settingPath, value);
      return ({
        modules: modules
      });
    });
  }

  handleSave() {
    const { modules, currentModuleId } = this.state;
    const currentModule = modules[currentModuleId];
    console.log(currentModule)
    this.saveModule(currentModule);
  }
}

class SelectionPanel extends React.Component {
  render() {
    const { classes, moduleType, modules, currentModuleId, handleModuleSelection } = this.props;
    let currentModule = modules[currentModuleId]; 
    return (
      <React.Fragment>
        <FormControl variant="outlined">
          <Select
            native
            value={currentModuleId}
            onChange={handleModuleSelection}
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

export default withTheme(withStyles(styles)(Module))