import React from 'react'
import axios from 'axios'
import { Typography, Paper, Button, ButtonGroup } from '@material-ui/core'
import { withStyles, withTheme } from '@material-ui/core/styles'
import { Setting } from '../../components/Settings'

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
  actionButtons: {
    width: '100%',
  },
  componentName: {
    marginBottom: theme.spacing(2),
  }
});

class Pipeline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      templates: '',
      values: ''
    };
    this.renderComponentSettings = this.renderComponentSettings.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.restartQuantumLeap = this.restartQuantumLeap.bind(this);
    this.sendValues = this.sendValues.bind(this);
    this.resetValues = this.resetValues.bind(this);
    this.downloadValues = this.downloadValues.bind(this);
    this.loadValues = this.loadValues.bind(this);
  }

  componentDidMount() {
    const { setActions, classes } = this.props;
    this.fetchData();
    setActions(
      <ButtonGroup
        orientation="vertical"
        color="primary"
        disableElevation 
        className={classes.actionButtons}
      >
        <Button onClick={this.restartQuantumLeap}>Restart QuantumLeap</Button>
        <Button onClick={this.sendValues}>Save config</Button>
        <Button onClick={this.resetValues} disabled>Reset config</Button>
        <Button onClick={this.downloadValues}>Download config</Button>
        <Button component="label">
          Load config 
          <input type="file" accept=".json" hidden onChange={this.loadValues}/>
        </Button>
      </ButtonGroup>
    );
  }

  render() {
    const { classes, theme } = this.props;
    const { templates, values } = this.state;
    return (
      <React.Fragment>
        {/* General settings */}
        {this.renderComponentSettings('generalSettings', 'General Settings')}
        {/* Sensor settings */}
        {this.renderComponentSettings('sensorsSettings', "Sensor(s)")}
        {/* Pose dataset settings */}
        {this.renderComponentSettings('poseDatasetsSettings', "Pose dataset(s)")}
        {/* Gesture dataset settings */}
        {this.renderComponentSettings('gestureDatasetsSettings', "Gesture dataset(s)")}
        {/* Classifier settings */}
        {this.renderComponentSettings('classifiersSettings', "Classifier")}
        {/* Analyzer settings */}
        {this.renderComponentSettings('analyzersSettings', "Analyzer")}
        {/* Segmenter settings */}
        {this.renderComponentSettings('segmentersSettings', "Segmenter")}
        {/* Recognizer settings */}
        {this.renderComponentSettings('recognizersSettings', "Recognizer")}
      </React.Fragment>
    );
  }

  renderComponentSettings(name, label) {
    const { classes, theme } = this.props;
    const { templates, values } = this.state;
    let path = ['quantumLeap', name];
    let level = 0;    
    console.log(templates)
    return (
      <Paper style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(3), padding: theme.spacing(2), backgroundColor: theme.palette.grey[50] }}>
        <Typography className={classes.componentName} variant='h2'>
          {label}
        </Typography>
        {(templates && values && templates.quantumLeap && values.quantumLeap && templates.quantumLeap[name] && values.quantumLeap[name]) ? (
          templates.quantumLeap[name].map(setting => {
            return <Setting
              templates={templates}
              values={values}
              handleChange={this.handleValueChange}
              level={level}
              path={path}
              value={values.quantumLeap[name][setting.name]}
              setting={setting}
            />
          })
        ) : (
          ''
        )}
      </Paper>
    );
  }

  handleValueChange(valuePath, value) {
    this.setState(prevState => {
      let values = prevState.values;
      setObjectProperty(values, value, valuePath);
      return ({
        values: values
      });
    });
  }

  fetchData() {
    let promise1 = axios.get(`${URL}/templates`);
    let promise2 = axios.get(`${URL}/values`);
    return Promise.all([promise1, promise2])
      .then(res => {
        this.setState({
          templates: res[0].data,
          values: res[1].data
        });
      })
      .catch(err => {
        console.error(err.message);
        this.setState({
          templates: '',
          values: ''
        });
      });
  }

  restartQuantumLeap() {
    return axios.post(`${URL}/actions/restart`)
    .then((res) => {
      console.log('QuantumLeap restarting');
    })
    .catch((err) => {
      console.error(err.message);
    });
  }

  resetValues() {
    // TODO
  }
  
  downloadValues() {
    const { values } = this.state;
    const fileData = JSON.stringify(values, null, 2);
    const blob = new Blob([fileData], {type: "text/plain"});
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'config.json';
    link.href = url;
    link.click();
  }

  loadValues(event) {
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
      alert('The File APIs are not fully supported in this browser.');
      return;
    } else if (!event.target.files) {
      alert("This browser doesn't seem to support the `files` property of file inputs.");
    } else if (!event.target.files[0]) {
      alert("Please select a file before clicking 'Load'");               
    } else {
      var file = event.target.files[0];
      var fileReader = new FileReader();
      fileReader.onload = (event) => {
        try {
          let values = JSON.parse(event.target.result)
          this.setState({
            values: values,
          });
        } catch (err) {
          alert('Invalid file.');
        }
      };
      fileReader.readAsText(file);
    }
    console.log(event.target.files[0])
  }

  sendValues() {
    return axios.put(`${URL}/values`, { data: this.state.values })
    .then((res) => {
        console.log(res);
        console.log('Data saved');
      })
      .catch((err) => {
        console.error(err.message);
      });
  }
}

function setObjectProperty(object, value, keys, index = 0) {
  if (index === keys.length - 1) {
    object[keys[index]] = value;
  } else {
    setObjectProperty(object[keys[index]], value, keys, index + 1);
  }
}

export default withTheme(withStyles(styles)(Pipeline))