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
      moduleType: this.props.match.params.type,
      moduleNames: '',
      currentModuleInstance: 'default', // TODO UPDATE
      currentModuleDescription: '',
      currentModuleValues: '',
      currentModuleId: 0,
    };
    this.handleSettingChange = this.handleSettingChange.bind(this);
    this.handleModuleSelection = this.handleModuleSelection.bind(this);
    this.fetchModuleData = this.fetchModuleData.bind(this);
    this.sendConfig = this.sendConfig.bind(this);
  }

  render() {
    const { classes, theme } = this.props;
    const { moduleType, moduleNames, currentModuleInstance, currentModuleDescription, currentModuleValues, currentModuleId } = this.state;
    return (
      <React.Fragment>
        <Paper style={{ marginTop: theme.spacing(4), padding: theme.spacing(2), backgroundColor: theme.palette.grey[100] }}>
          <Typography variant='h4'>
            {moduleType.slice(0,1).toUpperCase() + moduleType.slice(1, moduleType.length)}
          </Typography>
          {moduleNames ? (
            <SelectionPanel 
              classes={classes}
              moduleNames={moduleNames}
              moduleInstance={currentModuleInstance}
              moduleDescription={currentModuleDescription.description}
              moduleId={currentModuleId}
              handleModuleSelection={this.handleModuleSelection}
            />
          ) : (
            <span></span>
          )}
        </Paper>
        <Paper style={{ marginTop: theme.spacing(2), padding: theme.spacing(2), backgroundColor: theme.palette.grey[20] }}>
          {currentModuleDescription && currentModuleValues ? (
            <ConfigPanel 
              classes={classes}
              settings={currentModuleDescription.settings}
              settingsValues={currentModuleValues}
              handleSave={this.sendConfig}
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
    fetchModuleNames(this.state.moduleType, 
      (names) => { 
        this.setState({ moduleNames: names });
        fetchCurrentModuleName(this.state.moduleType, 
          (name) => {
            this.setState({ currentModuleId: names.indexOf(name) });
            this.fetchModuleData(name);
          }
        );
      }
    );
  }

  componentDidUpdate(prevProps) {
    let newModuleType = this.props.match.params.type;
    if (newModuleType !== prevProps.match.params.type) {
      this.setState({ 
        moduleNames: [],
        moduleType: newModuleType,
        currentModuleId: 0
      });
      fetchModuleNames(newModuleType, 
        (names) => { 
          this.setState({ moduleNames: names });
          fetchCurrentModuleName(newModuleType, 
            (name) => {
              this.setState({ currentModuleId: names.indexOf(name) });
              this.fetchModuleData(name);
            }
          );
        }
      );
    }
  }

  sendConfig() {
    let { moduleType, moduleNames, currentModuleId, currentModuleInstance, currentModuleValues } = this.state;
    let moduleName = moduleNames[currentModuleId];
    return axios.put(`${URL}/configurations/all/modules/${moduleType}/${moduleName}/${currentModuleInstance}/values`, { data: currentModuleValues })
      .then((res) => {
        console.log(res)
        console.log('data saved');
      })
      .catch((err) => {
        console.error(err.message);
      })
  }

  handleModuleSelection(event) {
    let { moduleNames } = this.state;
    let moduleId = event.target.value;
    let moduleName = moduleNames[moduleId];
    // Change number of module
    this.setState({
      currentModuleId: moduleId,
      currentModuleDescription: '',
      currentModuleValues: ''
    });
    // Fetch module data
    this.fetchModuleData(moduleName);
  }

  fetchModuleData(moduleName) {
    let { moduleType, currentModuleInstance } = this.state; // TODO update instance
    fetchModuleSettings(moduleType, moduleName, currentModuleInstance,
      (description, values) => { 
        this.setState({ 
          currentModuleDescription: description, 
          currentModuleValues: values 
        }); 
      },
      (err) => { 
        this.setState({ 
          currentModuleDescription: '', 
          currentModuleValues: '' 
        }); 
      }
    );
  }

  handleSettingChange(settingPath, value) {
    this.setState(prevState => {
      let currentModuleValues = prevState.currentModuleValues;
      setObjectProperty(currentModuleValues, value, settingPath);
      return ({
        currentModuleValues: currentModuleValues
      });
    });
  }
}

class SelectionPanel extends React.Component {
  render() {
    const { classes, moduleNames, moduleInstance, moduleDescription, moduleId, handleModuleSelection } = this.props;
    return (
      <React.Fragment>
        <FormControl variant="outlined">
          <Select
            native
            value={moduleId}
            onChange={ handleModuleSelection }
            inputProps={{
              name: 'module',
              id: 'module-selector',
            }}
          >
            {moduleNames.map((moduleName, index) => (
              <option value={index}>
                {moduleName}
              </option>
            ))}
          </Select>
        </FormControl>
        <Typography variant='body1'>
          {moduleDescription}
        </Typography>
      </React.Fragment>
    );
  }
}


///////////////////////////////////////////////////////////////////////////////
// HELPERS
const defaultOnErr = (err) => { console.error(err.message); };

function fetchCurrentModuleName(moduleType, onSuccess, onErr = defaultOnErr) {
  return axios.get(`${URL}/configurations/current/general/values?setting=selectedModules.${moduleType}.module`)
    .then(res => {
      onSuccess(res.data);
    })
    .catch(err => {
      onErr(err);
    });
}

function fetchModuleNames(moduleType, onSuccess, onErr = defaultOnErr) {
  return axios.get(`${URL}/configurations/all/modules/${moduleType}`)
    .then(res => {
      onSuccess(res.data);
    })
    .catch(err => {
      onErr(err);
    });
}

function fetchModuleSettings(moduleType, moduleName, moduleInstance, onSuccess, onErr = defaultOnErr) {
  let promise1 = axios.get(`${URL}/configurations/all/modules/${moduleType}/${moduleName}/description`)
  let promise2 = axios.get(`${URL}/configurations/all/modules/${moduleType}/${moduleName}/${moduleInstance}/values`);
  Promise.all([promise1, promise2])
    .then(results => {
      let moduleDescription = results[0].data;
      let moduleValues = results[1].data;
      parseExternalProperties(moduleDescription, moduleValues)
        .then(res => {
          moduleDescription = res;
          onSuccess(moduleDescription, moduleValues);
        });
    })
    .catch(err => {
      console.error(err.stack)
      onErr(err);
    });
}

function fetchModuleInstances(moduleType, moduleName, onSuccess, onErr = defaultOnErr) {
  return axios.get(`${URL}/configurations/all/modules/${moduleType}/${moduleName}/instances`)
    .then(res => {
      onSuccess(res.data);
    })
    .catch(err => {
      onErr(err);
    });
}

// Maybe update in the future (properties that have to be fetched depending on a choice)
function parseExternalProperties(object, settingsValues) {
  let promises = [];
  Object.keys(object).forEach(key => {
    const subObject = object[key];
    if (subObject && typeof subObject === 'object') {
      let newPromise;
      if (subObject.hasOwnProperty('uri')) {
        let uri = parseURI(subObject, settingsValues);
        console.log(uri)
        newPromise = axios.get(`${URL}${uri}`)
          .then(res => {
            object[key] = res.data;
          })
          .catch(err => {
            console.error(err);
            object[key] = [];
          });
      } else {
        newPromise = parseExternalProperties(subObject, settingsValues)
          .then(res => {
            object[key] = res;
          });
      }
      promises.push(newPromise);
    }
  });
  return Promise.all(promises).then(() => {
    return object;
  });
}

function parseURI(uriObject, settingsValues) {
  const uriParameterRegex = /\$\{[^\{\}]*\}/g;
  let rawURI = uriObject.uri;
  console.log(uriObject)
  return rawURI.replace(uriParameterRegex, (match) => {
    let parameterName = match.slice(2,-1);
    let parameterValue = uriObject.parameters[parameterName];
    let setting = getObjectPropertyFromString(settingsValues, parameterValue.settingPath);
    console.log(setting)
    return setting;
  });
}

function getObjectPropertyFromString(object, inputString) {
  const keys = inputString.split('.');
  return getObjectProperty(object, keys);
}

function getObjectProperty(object, keys, index = 0) {
  if (index === keys.length - 1) {
    return object[keys[index]];
  } else {
    return getObjectProperty(object[keys[index]], keys, index + 1);
  }
}

function setObjectProperty(object, value, keys, index = 0) {
  if (index === keys.length - 1) {
    object[keys[index]] = value;
  } else {
    setObjectProperty(object[keys[index]], value, keys, index + 1);
  }
}

export default withTheme(withStyles(styles)(Module))