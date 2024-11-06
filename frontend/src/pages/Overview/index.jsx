import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Button, ButtonGroup, Paper, IconButton, Divider, Snackbar, CircularProgress } from '@mui/material';
import PipelineDiagram from './PipelineDiagram';
import { Pause, PlayArrow } from '@mui/icons-material';
import { Alert } from '@mui/lab';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router';

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
  pipelineDiagram: {
    display: 'block',
  },
  actionButtons: {
    position: 'sticky',
    bottom: 0,
    marginTop: theme.spacing(2),
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
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
const useStyles = makeStyles(styles);

function Overview() {
  const classes = useStyles();
  const navigate = useNavigate();
  // State
  const [alert, setAlert] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Run when mounted
  useEffect(
    () => {
      // fetchData();
      isQuantumLeapRunning();
    },
    []
  );

  const isQuantumLeapRunning = () => {
    setLoading(true);
    return axios.get(`${URL}/quantumleap/state/running`)
      .then((res) => {
        setIsRunning(res.data.running);
        setLoading(false);
      })
      .catch((err) => {
        setAlert('error');
        setAlertMessage('Unable to check if QuantumLeap is running!');
        setIsRunning(false);
        setLoading(false);
        console.error(err.message);
      });
  }

  const startQuantumLeap = () => {
    return axios.post(`${URL}/quantumleap/actions/start`)
      .then((res) => {
        setAlert('success');
        setAlertMessage('QuantumLeap started!');
        setIsRunning(true);
        setLoading(false);
      })
      .catch((err) => {
        setAlert('error');
        setAlertMessage('Unable to start QuantumLeap!');
        setIsRunning(false);
        setLoading(false);
        console.error(err.message);
      });
  }

  const stopQuantumLeap = () => {
    return axios.post(`${URL}/quantumleap/actions/stop`)
      .then((res) => {
        setAlert('success');
        setAlertMessage('QuantumLeap stopped!');
        setIsRunning(false);
        setLoading(false);
      })
      .catch((err) => {
        setAlert('error');
        setAlertMessage('Unable to stop QuantumLeap!');
        setLoading(false);
        console.error(err.message);
      });
  }

  const handleAlertClose = () => {
    setAlert('');
    setAlertMessage('');
  }

  const fetchValues = (callback) => {
    return axios.get(`${URL}/quantumleap/values`)
      .then((res) => {
        let values = res.data;
        callback(values, '')
      })
      .catch((err) => {
        callback('', err.message);
      });
  };

  const sendValues = (values) => {
    return axios.put(`${URL}/quantumleap/values`, { data: values })
    .then((res) => {
        console.log(res);
        console.log('Data saved');
      })
      .catch((err) => {
        console.error(err.message);
      });
  };

  const exportValues = () => {
    fetchValues((values, error) => {
      if (values) {
        const fileData = JSON.stringify(values, null, 2);
        const blob = new Blob([fileData], {type: "text/plain"});
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'config.json';
        link.href = url;
        link.click();
      } else {
        console.error(error);
      }
    });
  };

  const importValues = (event) => {
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
          sendValues(values);
        } catch (err) {
          alert('Invalid file.');
        }
      };
      fileReader.readAsText(file);
    }
  }

  const clickHandler = (name) => {
    switch (name) {
      case 'sensors':
        navigate('/pipeline/sensors');
        break;
      case 'filters':
        navigate('/pipeline/filters');
        break;
      case 'static-datasets':
        navigate('/pipeline/datasets/static');
        break;
      case 'static-recognizers':
        navigate('/pipeline/recognizers/static');
        break;
      case 'analyzers':
        navigate('/pipeline/analyzers');
        break;
      case 'segmenters':
        navigate('/pipeline/segmenters');
        break;
      case 'dynamic-datasets':
        navigate('/pipeline/datasets/dynamic');
        break;
      case 'dynamic-recognizers':
        navigate('/pipeline/recognizers/dynamic');
        break;
      case 'api':
        navigate('/api');
        break;
      default:
        console.error(name);
    }
  };

  const toggleRun = () => {
    setLoading(true);
    if (isRunning) {
      stopQuantumLeap();
    } else {
      startQuantumLeap();
    }
  };

  return (
    (<div>
      <Typography variant='h2' className={classes.pageTitle}>
        Overview
      </Typography>
      <Paper>
        <div className={classes.pipeline}>
          <PipelineDiagram className={classes.pipelineDiagram} onClick={clickHandler}/>
        </div>
        <Divider/>
        <div className={classes.controlButtons}>
          {loading ? (
            <div className={classes.toggleStartButton}>
              <CircularProgress size={48}/>
            </div>
          ) : (
            <IconButton className={classes.toggleStartButton} onClick={toggleRun} size="large">
              {!isRunning ? <PlayArrow className={classes.toggleStartIcon}/> : <Pause className={classes.toggleStartIcon}/>}
            </IconButton>
          )}
        </div>
      </Paper>
      <div className={classes.actionButtons}>
        <ButtonGroup variant="contained" color="primary">
          <Button component='label'>
            Import configuration
            <input type='file' accept='.json' hidden onChange={importValues}/>
          </Button>
          <Button onClick={exportValues}>
            Export configuration
          </Button>
        </ButtonGroup>
      </div>
      <Snackbar open={alert ? true : false} autoHideDuration={5000} disableWindowBlurListener={true} onClose={handleAlertClose}>
        <Alert variant='filled' severity={alert}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>)
  ); 
}

function setObjectProperty(object, value, keys, index = 0) {
  if (index === keys.length - 1) {
    object[keys[index]] = value;
  } else {
    setObjectProperty(object[keys[index]], value, keys, index + 1);
  }
}

export default Overview;