import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Typography, Button, ButtonGroup } from '@mui/material'
import { makeStyles, useTheme } from '@mui/styles'
import { Setting } from '../../components/Settings'
import { useParams } from 'react-router'

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

function Testing({ setActions = () => {} }) {
  const classes = useStyles();
  const { gestureType } = useParams();
  const [templates, setTemplates] = useState();
  const [values, setValues] = useState();

  const handleValueChange = (valuePath, value) => {
    setValues(values => {
      let newValues = values;
      setObjectProperty(newValues, value, valuePath);
      return {...newValues}
    });
  }

  const fetchData = () => {
    let promise1 = axios.get(`${URL}/testing/${gestureType}/templates`);
    let promise2 = axios.get(`${URL}/testing/${gestureType}/values`);
    return Promise.all([promise1, promise2])
      .then(res => {
        console.log(res)
        setTemplates(res[0].data);
        setValues(res[1].data);
      })
      .catch(err => {
        console.error(err.message);
        setTemplates('');
        setValues('res[1].data');
      });
  }

  const startBenchmarking = () => {
    return axios.post(`${URL}/testing/${gestureType}/actions/start`)
    .then((res) => {
      console.log('Testing starting'); // TODO display toast notification
    })
    .catch((err) => {
      console.error(err.message);
    });
  }

  const discardValues = () => {
    return axios.get(`${URL}/testing/${gestureType}/values`)
    .then((res) => {
      setValues(res.data);
    })
    .catch((err) => {
      console.error(err.message);
    });
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
        console.log(res);
        console.log('Data saved');
      })
      .catch((err) => {
        console.error(err.message);
      });
  }

  // TODO improve, add stop button
  useEffect(
    () => {
      fetchData();
      setActions(
        <ButtonGroup
          orientation="vertical"
          color="primary"
          disableElevation 
          className={classes.actionButtons}
        >
          <Button onClick={startBenchmarking}>Start testing</Button>
          <Button onClick={() => {}}>Stop testing</Button>
          <Button onClick={sendValues}>Save config</Button>
          <Button onClick={discardValues}>Discard changes</Button>
          <Button onClick={downloadValues}>Download config</Button>
          <Button component="label">
            Load config 
            <input type="file" accept=".json" hidden onChange={loadValues}/>
          </Button>
        </ButtonGroup>
      );
    },
    []
  );

  if (templates && values) {
    return (
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
            <Button onClick={discardValues}>Discard changes</Button>
            <Button component="label">
              Load config 
              <input type="file" accept=".json" hidden onChange={loadValues}/>
            </Button>
            <Button onClick={downloadValues}>Export config</Button>
          </ButtonGroup>
        </div>
      </React.Fragment>
    );
  } else {
    return false;
  }
}

function TestingSection({ templates, values, label, path, onChange, disableMargin = false }) {
  const classes = useStyles();
  const theme = useTheme();
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
        componentTemplate.map(setting => {
          return <Setting
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

function setObjectProperty(object, value, keys, index = 0) {
  if (index === keys.length - 1) {
    object[keys[index]] = value;
  } else {
    setObjectProperty(object[keys[index]], value, keys, index + 1);
  }
}

export default Testing