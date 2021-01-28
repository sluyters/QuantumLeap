import React from 'react';
import axios from 'axios';
import { Typography, Button, ButtonGroup, Paper, IconButton, Divider, Snackbar, CircularProgress } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { withRouter } from "react-router";
import PipelineImage from './res/pipeline-svg';
import { Pause, PlayArrow } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';

// Change
const URL = 'http://127.0.0.1:6442'

const styles = (theme) => ({
  pageTitle: {
    marginBottom: theme.spacing(2),
  },
  pipeline: {
    padding: theme.spacing(1.5, 2),
  },
  controlButtons: {
    padding: theme.spacing(1),
  },
  pipelineImage: {
    display: 'block',
  },
  actionButtons: {
    marginTop: theme.spacing(2),
  },
  playPauseIcon: {
    height: '80%',
  },
  toggleStartButton: {
    width: '64px', 
    height: '64px', 
    padding: '8px',
  },
  toggleStartIcon: {
    width: '48px', 
    height: '48px',
  },
  loadingIcon: {
    width: '48px', 
    height: '48px',
    verticalAlign: 'middle',
  }
});

class Overview extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      alert: '',
      alertMessage: '',
      loading: false,
      isRunning: false,
    };
    this.handleAlertClose = this.handleAlertClose.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.fetchValues = this.fetchValues.bind(this);
    this.sendValues = this.sendValues.bind(this);
    this.downloadValues = this.downloadValues.bind(this);
    this.loadValues = this.loadValues.bind(this);
    this.startQuantumLeap = this.startQuantumLeap.bind(this);
    this.stopQuantumLeap = this.stopQuantumLeap.bind(this);
    this.isQuantumLeapRunning = this.isQuantumLeapRunning.bind(this);
  }

  componentDidMount() {
    this.fetchData();
    this.isQuantumLeapRunning();
  }

  render() {
    const { history, classes } = this.props;
    const { loading, alert, alertMessage, isRunning } = this.state;

    const clickHandler = (name) => {
      console.log(name);
      switch (name) {
        case 'sensors':
          history.push('/pipeline/sensors');
          break;
        case 'filters':
          history.push('/pipeline/filters');
          break;
        case 'static-datasets':
          history.push('/pipeline/datasets/static');
          break;
        case 'static-recognizers':
          history.push('/pipeline/recognizers/static');
          break;
        case 'analyzers':
          history.push('/pipeline/analyzers');
          break;
        case 'segmenters':
          history.push('/pipeline/segmenters');
          break;
        case 'dynamic-datasets':
          history.push('/pipeline/datasets/dynamic');
          break;
        case 'dynamic-recognizers':
          history.push('/pipeline/recognizers/dynamic');
          break;
        case 'api':
          history.push('/api');
          break;
        default:
          console.error(name);
      }
    };
    const toggleRun = () => {
      this.setState({
        loading: true,
      });
      if (isRunning) {
        this.stopQuantumLeap();
      } else {
        this.startQuantumLeap();
      }
    };
    return (
      <div>
        <Typography variant='h2' className={classes.pageTitle}>
          Overview
        </Typography>
        <Paper>
          <div className={classes.pipeline}>
            <PipelineImage className={classes.pipelineImage} onClick={clickHandler}/>
          </div>
          <Divider/>
          <div className={classes.controlButtons}>
            {/* {loading ? (
              <div className={classes.toggleStartButton}>
                <CircularProgress size={48}/>
              </div>
            ) : (
              <IconButton className={classes.toggleStartButton} onClick={toggleRun}>
                {!isRunning ? <PlayArrow className={classes.toggleStartIcon}/> : <Pause className={classes.toggleStartIcon}/>}
              </IconButton>
            )} */}
            <IconButton className={classes.toggleStartButton} onClick={toggleRun}>
              {!isRunning ? <PlayArrow className={classes.toggleStartIcon}/> : <Pause className={classes.toggleStartIcon}/>}
            </IconButton>
          </div>
        </Paper>
        <div className={classes.actionButtons}>
          <ButtonGroup variant="contained" color="primary">
            <Button component='label'>
              Load configuration
              <input type='file' accept='.json' hidden onChange={this.loadValues}/>
            </Button>
            <Button onClick={this.downloadValues}>Download configuration</Button>
          </ButtonGroup>
        </div>
        {/* <Snackbar open={alert ? true : false} autoHideDuration={5000} disableWindowBlurListener={true} onClose={this.handleAlertClose}>
          <Alert variant='filled' severity={alert}>
            {alertMessage}
          </Alert>
        </Snackbar> */}
      </div>
    );
  }

  isQuantumLeapRunning() {
    this.setState({
      loading: true,
    });
    return axios.get(`${URL}/quantumleap/state/running`)
    .then((res) => {
      this.setState({
        isRunning: res.data.running,
        loading: false,
      });
    })
    .catch((err) => {
      this.setState({
        alert: 'error',
        alertMessage: 'Unable to check if QuantumLeap is running!',
        isRunning: false,
        loading: false,
      });
      console.error(err.message);
    });
  }

  startQuantumLeap() {
    return axios.post(`${URL}/quantumleap/actions/start`)
    .then((res) => {
      console.log('QuantumLeap starting');
      this.setState({
        alert: 'success',
        alertMessage: 'QuantumLeap started!',
        isRunning: true,
        loading: false,
      });
    })
    .catch((err) => {
      this.setState({
        alert: 'error',
        alertMessage: 'Unable to start QuantumLeap!',
        loading: false,
      });
      console.error(err.message);
    });
  }

  stopQuantumLeap() {
    return axios.post(`${URL}/quantumleap/actions/stop`)
    .then((res) => {
      console.log('QuantumLeap stopping');
      this.setState({
        alert: 'success',
        alertMessage: 'QuantumLeap stopped!',
        isRunning: false,
        loading: false,
      });
    })
    .catch((err) => {
      this.setState({
        alert: 'error',
        alertMessage: 'Unable to stop QuantumLeap!',
        loading: false,
      });
      console.error(err.message);
    });
  }

  handleAlertClose() {
    console.log('hmmmmmmm')
    this.setState({
      alert: '',
      alertMessage: '',
    });
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
    let promise1 = axios.get(`${URL}/quantumleap/templates`);
    let promise2 = axios.get(`${URL}/quantumleap/values`);
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

  fetchValues() {
    return axios.get(`${URL}/quantumleap/values`)
    .then((res) => {
      this.setState({
        values: res.data
      });
    })
    .catch((err) => {
      console.error(err.message);
    });
  }

  sendValues() {
    return axios.put(`${URL}/quantumleap/values`, { data: this.state.values })
    .then((res) => {
        console.log(res);
        console.log('Data saved');
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
          this.sendValues();
        } catch (err) {
          alert('Invalid file.');
          this.setState({
            values: previousValues,
          });
        }
      };
      fileReader.readAsText(file);
    }
  }
}

function setObjectProperty(object, value, keys, index = 0) {
  if (index === keys.length - 1) {
    object[keys[index]] = value;
  } else {
    setObjectProperty(object[keys[index]], value, keys, index + 1);
  }
}

export default withRouter(withStyles(styles)(withTheme(Overview)));