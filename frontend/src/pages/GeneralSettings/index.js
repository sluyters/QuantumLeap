import React from 'react'
import axios from 'axios'
import { Typography, Paper } from '@material-ui/core'
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

class GeneralSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      generalDescription: '',
      parsedGeneralDescription: '',
      generalValues: '',
      currentGeneralInstance: 'default' // TODO change
    };
    this.handleSettingChange = this.handleSettingChange.bind(this);
    this.fetchGeneralData = this.fetchGeneralData.bind(this);
    this.sendConfig = this.sendConfig.bind(this);
  }

  render() {
    const { classes, theme } = this.props;
    const { generalDescription, parsedGeneralDescription, generalValues } = this.state;
    return (
      <React.Fragment>
        <Paper style={{ marginTop: theme.spacing(4), padding: theme.spacing(2), backgroundColor: theme.palette.grey[100] }}>
          <Typography variant='h4'> General settings </Typography>
        </Paper>
        <Paper style={{ marginTop: theme.spacing(2), padding: theme.spacing(2), backgroundColor: theme.palette.grey[20] }}>
          {generalDescription && parsedGeneralDescription && generalValues ? (
            <ConfigPanel 
              classes={classes}
              settings={parsedGeneralDescription.settings}
              settingsValues={generalValues}
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
    this.fetchGeneralData();
  }

  fetchGeneralData() {
    let { currentGeneralInstance } = this.state; // TODO update instance
    fetchGeneralSettings(currentGeneralInstance,
      (description, parsedDescription, values) => { 
        this.setState({ 
          generalDescription: description, 
          parsedGeneralDescription: parsedDescription,
          generalValues: values 
        }); 
      },
      (err) => { 
        this.setState({ 
          generalDescription: '', 
          parsedGeneralDescription: '',
          generalValues: '' 
        }); 
      }
    );
  }

  sendConfig() {
    let { currentGeneralInstance, generalValues } = this.state;
    axios.put(`${URL}/configurations/all/general/${currentGeneralInstance}/values`, { data: generalValues })
      // .then((res) => {
      //   console.log(res)
      //   console.log('data saved');
      // })
      // .catch((err) => {
      //   console.error(err.message);
      // })
  }

  handleSettingChange(settingPath, value) {
    this.setState(
      (prevState) => {
        let generalValues = prevState.generalValues;
        setObjectProperty(generalValues, value, settingPath);
        return ({ generalValues: generalValues });
      }, 
      () => {
        let { generalDescription, generalValues } = this.state;
        parseExternalProperties(generalDescription, generalValues)
          .then(res => {
            let parsedGeneralDescription = res;
            this.setState({ parsedGeneralDescription: parsedGeneralDescription });
          });
      }
    );
  }
}

///////////////////////////////////////////////////////////////////////////////
// HELPERS
const defaultOnErr = (err) => { console.error(err.message); };

function fetchGeneralSettings(generalInstance, onSuccess, onErr = defaultOnErr) {
  let promise1 = axios.get(`${URL}/configurations/all/general/description`)
  let promise2 = axios.get(`${URL}/configurations/all/general/${generalInstance}/values`);
  Promise.all([promise1, promise2])
    .then(results => {
      let generalDescription = results[0].data;
      let generalValues = results[1].data;
      onSuccess(generalDescription, generalValues);
      parseExternalProperties(generalDescription, generalValues)
        .then(res => {
          let parsedGeneralDescription = res;
          onSuccess(generalDescription, parsedGeneralDescription, generalValues);
        });
    })
    .catch(err => {
      console.error(err.stack)
      onErr(err);
    });
}

// Maybe update in the future (properties that have to be fetched depending on a choice)
function parseExternalProperties(object, settingsValues) {
  let parsedObject;
  // Quick hack because arrays are also objects
  if (Array.isArray(object)) {
    parsedObject = [];
  } else {
    parsedObject = {};
  }
  let promises = [];
  Object.keys(object).forEach(key => {
    parsedObject[key] = object[key];
    if (object[key] && typeof object[key] === 'object') {
      let newPromise;
      if (object[key].hasOwnProperty('uri')) {
        let uri = parseURI(object[key], settingsValues);
        newPromise = axios.get(`${URL}${uri}`)
          .then(res => {
            parsedObject[key] = res.data;
          })
          .catch(err => {
            console.error(err);
            parsedObject[key] = [];
          });
      } else {
        newPromise = parseExternalProperties(object[key], settingsValues)
          .then(res => {
            parsedObject[key] = res;
          });
      }
      promises.push(newPromise);
    }
  });
  return Promise.all(promises).then(() => {
    return parsedObject;
  });
}

// function getExternalProperty(settingDescription, settingValues) {

// }

function parseURI(uriObject, settingsValues) {
  const uriParameterRegex = /\$\{[^\{\}]*\}/g;
  let rawURI = uriObject.uri;
  return rawURI.replace(uriParameterRegex, (match) => {
    let parameterName = match.slice(2,-1);
    let parameterValue = uriObject.parameters[parameterName];
    let setting = getObjectPropertyFromString(settingsValues, parameterValue.settingPath);
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

export default withTheme(withStyles(styles)(GeneralSettings))