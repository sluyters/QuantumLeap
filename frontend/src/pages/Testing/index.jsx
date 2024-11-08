import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Typography, Button, ButtonGroup, Snackbar, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material'
import { Alert } from '@mui/lab';
import { makeStyles, useTheme } from '@mui/styles'
import { Setting } from '../../components/Settings'
import { useBlocker, useParams } from 'react-router'

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
    position: 'sticky',
    bottom: 0,
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
  },
  componentName: {
    marginBottom: theme.spacing(2),
  }
});
const useStyles = makeStyles(styles);

function Testing() {
  const classes = useStyles();

  // State
  const [changes, setChanges] = useState(false);
  const [alert, setAlert] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const { gestureType } = useParams();
  const [templates, setTemplates] = useState();
  const [values, setValues] = useState();

  // Block navigation if there are unsaved changes
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    return changes && currentLocation.pathname !== nextLocation.pathname;
  });

  const handleAlertClose = () => {
    setAlert('');
    setAlertMessage('');
  };

  const startBenchmarking = () => {
    return axios.post(`${URL}/testing/${gestureType}/actions/start`)
    .then((res) => {
      setAlert('success');
      setAlertMessage('Testing starting!');
    })
    .catch((err) => {
      setAlert('error');
      setAlertMessage(err.message);
    });
  }

  const discardChanges = () => {
    fetchData(gestureType)
      .then(({ templates, values, error }) => {
        setTemplates(templates);
        setValues(values);
        if (error) {
          setAlert('error');
          setAlertMessage(error);
        }
      });
    setChanges(false);
  }

  const handleValueChange = (valuePath, value) => {
    setValues(values => {
      let newValues = values;
      setObjectProperty(newValues, value, valuePath);
      return {...newValues}
    });
    setChanges(true);
  }
  
  const downloadValues = () => {
    const fileData = JSON.stringify(values, null, 2);
    const blob = new Blob([fileData], {type: "text/plain"});
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'config.json';
    link.href = url;
    link.click();
  }

  const loadValues = (event) => {
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
        let savedValues = values;
        try {
          let newValues = JSON.parse(event.target.result)
          setValues(newValues);
        } catch (err) {
          alert('Invalid file.');
          setValues(savedValues);
        }
      };
      fileReader.readAsText(file);
    }
    console.log(event.target.files[0])
  }

  const sendValues = () => {
    return axios.put(`${URL}/testing/${gestureType}/values`, { data: values })
      .then((res) => {
        setChanges(false);
        setAlert('success');
        setAlertMessage('Changes saved!');
      })
      .catch((err) => {
        setAlert('error');
        setAlertMessage('Failed to save the changes!');
        console.error(err.message);
      });
  }

  // TODO improve, add stop button
  useEffect(
    () => {
      fetchData(gestureType)
        .then(({ templates, values, error }) => {
          setTemplates(templates);
          setValues(values);
          if (error) {
            console.log('wtf')
            setAlert('error');
            setAlertMessage(error);
          }
        });
      setChanges(false);
    },
    [gestureType]
  );

  return (
    <React.Fragment>
      {(templates && values) ? (
        <React.Fragment>
          {/* General settings */}
          <TestingSection templates={templates} values={values} label='General' path={['main', 'settings', 'general']} onChange={handleValueChange} disableMargin />
          {/* Gesture dataset settings */}
          <TestingSection templates={templates} values={values} label={`${gestureType === 'static' ? 'Static' : 'Dynamic'} dataset`} path={['main', 'settings', 'datasets', gestureType]} onChange={handleValueChange} disableMargin />
          {/* Gesture recognizer settings */}
          <TestingSection templates={templates} values={values} label={`${gestureType === 'static' ? 'Static' : 'Dynamic'} recognizer(s)`} path={['main', 'settings', 'recognizers', gestureType]} onChange={handleValueChange} disableMargin />
          <div className={classes.actionButtons}>
            <ButtonGroup variant='contained' color='primary'>
              <Button onClick={startBenchmarking}>Start</Button>
              <Button disabled onClick={() => {}}>Stop</Button>
            </ButtonGroup>
            <ButtonGroup variant='contained' color='primary'>
              <Button onClick={sendValues}>Save changes</Button>
              <Button onClick={discardChanges}>Discard changes</Button>
              <Button component="label">
                Load config 
                <input type="file" accept=".json" hidden onChange={loadValues}/>
              </Button>
              <Button onClick={downloadValues}>Export config</Button>
            </ButtonGroup>
          </div>
        </React.Fragment>
      ) : (
        <Typography variant='body1'>
          No settings available.
        </Typography>
      )}
      {/* https://michaelchan-13570.medium.com/using-react-router-v4-prompt-with-custom-modal-component-ca839f5faf39 */}
      <Dialog open={blocker.state === 'blocked'}>
        <DialogTitle>
          Unsaved changes
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            There are unsaved changes! Do you really want to leave the page?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => blocker.reset()}>
            Stay
          </Button>
          <Button variant='outlined' onClick={() => { setChanges(false); blocker.proceed(); }}>
            Leave
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={alert ? true : false} disableWindowBlurListener={true} autoHideDuration={5000} onClose={handleAlertClose}>
        <Alert variant='filled' severity={alert}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
}

function TestingSection({ templates, values, label, path, onChange, disableMargin = false }) {
  const classes = useStyles();
  const theme = useTheme();

  const [componentKey, setComponentKey] = useState(Date.now()); // Necessary to ensure that state is reset across all sub-components TODO check if could not be removed and/or optimized

  useEffect(() => {
    setComponentKey(Date.now());
  }, [templates]);

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
    <div style={{ padding: theme.spacing(2), marginTop: disableMargin ? 0 : theme.spacing(3) }}>
      <Typography className={classes.componentName} variant='h2'>
        {label}
      </Typography>
      {(componentValue && componentTemplate) ? (
        componentTemplate.map((setting, index) => {
          return <Setting
            key={`${componentKey}-${index}`}
            templates={templates}
            values={values}
            onChange={onChange}
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
    </div>
  );
}

function fetchData(gestureType) {
  let promise1 = axios.get(`${URL}/testing/${gestureType}/templates`);
  let promise2 = axios.get(`${URL}/testing/${gestureType}/values`);
  return Promise.all([promise1, promise2])
    .then(res => {
      return {
        templates: res[0].data,
        values: res[1].data,
        error: ''
      };
    })
    .catch(err => {
      console.error(err.message);
      return {
        templates: '',
        values: '',
        error: err.message
      };
    });
}

function setObjectProperty(object, value, keys, index = 0) {
  if (index === keys.length - 1) {
    object[keys[index]] = value;
  } else {
    setObjectProperty(object[keys[index]], value, keys, index + 1);
  }
}

export default Testing