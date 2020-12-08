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

class Testing extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      templates: '',
      values: ''
    };
    this.renderComponentSettings = this.renderComponentSettings.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.startBenchmarking = this.startBenchmarking.bind(this);
    this.sendValues = this.sendValues.bind(this);
    this.discardValues = this.discardValues.bind(this);
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
        <Button onClick={this.startBenchmarking}>Start testing</Button>
        <Button onClick={() => {}}>Stop testing</Button>
        <Button onClick={this.sendValues}>Save config</Button>
        <Button onClick={this.discardValues}>Discard changes</Button>
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
        {this.renderComponentSettings(['main', 'settings', 'general'], 'Testing')}
        {/* Static gesture dataset settings */}
        {this.renderComponentSettings(['main', 'settings', 'datasets', 'static'], "Static dataset(s)")}
        {/* Static gesture recognizer settings */}
        {this.renderComponentSettings(['main', 'settings', 'recognizers', 'static'], "Static recognizer")}
        {/* Dynamic gesture dataset settings */}
        {this.renderComponentSettings(['main', 'settings', 'datasets', 'dynamic'], "Dynamic dataset(s)")}
        {/* Dynamic gesture recognizer settings */}
        {this.renderComponentSettings(['main', 'settings', 'recognizers', 'dynamic'], "Dynamic recognizer")}
      </React.Fragment>
    );
  }

  renderComponentSettings(path, label) {
    const { classes, theme } = this.props;
    const { templates, values } = this.state;
    let componentTemplate = templates;
    let componentValue = values;
    for (let key of path) {
      componentTemplate = componentTemplate[key];
      componentValue = componentValue[key];
      if (!componentValue || !componentTemplate) {
        break;
      }
    }
    return (
      <Paper style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(3), padding: theme.spacing(2), backgroundColor: theme.palette.grey[50] }}>
        <Typography className={classes.componentName} variant='h2'>
          {label}
        </Typography>
        {(componentValue && componentTemplate) ? (
          componentTemplate.map(setting => {
            return <Setting
              templates={templates}
              values={values}
              handleChange={this.handleValueChange}
              level={0}
              path={path}
              value={componentValue[setting.name]}
              setting={setting}
            />
          })
        ) : (
          <Typography variant='body1'>
            No settings available.
          </Typography>
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
    let promise1 = axios.get(`${URL}/testing/templates`);
    let promise2 = axios.get(`${URL}/testing/values`);
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

  startBenchmarking() {
    return axios.post(`${URL}/testing/actions/start`)
    .then((res) => {
      console.log('Testing starting');
    })
    .catch((err) => {
      console.error(err.message);
    });
  }

  discardValues() {
    return axios.get(`${URL}/testing/values`)
    .then((res) => {
      this.setState({
        values: res.data
      });
    })
    .catch((err) => {
      console.error(err.message);
    });
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
        let previousValues = this.state.values;
        try {
          let values = JSON.parse(event.target.result)
          this.setState({
            values: values,
          });
        } catch (err) {
          alert('Invalid file.');
          this.setState({
            values: previousValues,
          });
        }
      };
      fileReader.readAsText(file);
    }
    console.log(event.target.files[0])
  }

  sendValues() {
    return axios.put(`${URL}/testing/values`, { data: this.state.values })
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

export default withTheme(withStyles(styles)(Testing))