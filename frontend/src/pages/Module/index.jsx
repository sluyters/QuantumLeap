import React, { useEffect, useState } from 'react';
import axios from 'axios'
import { Typography, Button, ButtonGroup, Snackbar, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Setting } from '../../components/Settings';
import { useBlocker, useLocation, useParams } from "react-router";
import { Alert } from '@mui/lab';
import { makeStyles } from '@mui/styles';

// Change
const URL = 'http://127.0.0.1:6442'

const styles = (theme) => ({
  root: {
    margin: 'auto',
  },
  cardHeader: {
    padding: theme.spacing(1, 2),
  },
  button: {
    margin: theme.spacing(0.5, 0),
  },
  actionButtons: {
    position: 'sticky',
    bottom: 0,
    marginTop: theme.spacing(2),
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
  },
  componentName: {
    marginBottom: theme.spacing(2),
  },
});
const useStyles = makeStyles(styles);

function Module({ routesInfos }) {
  // Classes
  const classes = useStyles();

  // URL params
  const { moduleType, gestureType } = useParams();

  const location = useLocation();

  // State
  const [changes, setChanges] = useState(false);
  const [alert, setAlert] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [templates, setTemplates] = useState('');
  const [values, setValues] = useState('');
  const [componentKey, setComponentKey] = useState(Date.now()); // Necessary to ensure that state is reset across all sub-components TODO check if could not be removed and/or optimized

  // Block navigation if there are unsaved changes
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    return changes && currentLocation.pathname !== nextLocation.pathname;
  });
  
  // Fetch templates and values
  useEffect(
    () => {
      fetchData(moduleType, gestureType)
        .then(({ templates, values, error }) => {
          setTemplates(templates);
          setValues(values);
          setComponentKey(Date.now());
        });
    },
    [moduleType, gestureType]
  );

  // Build base path
  let path = [ 'main', 'settings' ];
  const route = location.pathname;
  const routeInfo = routesInfos[route];
  const componentName = routeInfo ? routeInfo.label : 'Unknown component'
  if (moduleType) {
    path.push(moduleType);
  }
  if (gestureType) {
    path.push(gestureType);
  }

  // Select templates and values of this component
  let componentTemplate = templates;
  let componentValue = values;
  for (let key of path) {
    componentTemplate = componentTemplate[key];
    componentValue = componentValue[key];
    if (!componentValue || !componentTemplate) {
      break;
    }
  }

  // Helpers TODO duplicate code
  const discardChanges = () => {
    fetchValues()
      .then(({ templates, values, error }) => {
        setTemplates(templates);
        setValues(values);
        setComponentKey(Date.now());
      });
    setChanges(false);
  };

  const handleAlertClose = () => {
    setAlert('');
    setAlertMessage('');
  };

  const handleValueChange = (valuePath, value) => {
    console.log(value)
    setValues(values => {
      let newValues = values;
      setObjectProperty(newValues, value, valuePath);
      return {...newValues};
    });
    setChanges(true);
  };

  const fetchValues = () => {
    return axios.get(`${URL}/quantumleap/values`)
      .then((res) => {
        setValues(res.data);
      })
      .catch((err) => {
        console.error(err.message);
      });
  };

  const sendValues = () => {
    return axios.put(`${URL}/quantumleap/values`, { data: values })
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

  return (
    <div>
      <Typography className={classes.componentName} variant='h2'>
        {componentName}
      </Typography>
      {(componentValue && componentTemplate) ? (
        <React.Fragment>
          {componentTemplate.map((setting, index) => {
            return (
              <Setting
                key={`${componentKey}-${index}`}
                templates={templates}
                values={values}
                onChange={handleValueChange}
                level={0}
                path={path}
                value={componentValue[setting.name]}
                setting={setting}
              />
            );
          })}
          <div className={classes.actionButtons}>
            <ButtonGroup variant='contained' color='primary'>
              <Button key='save' onClick={sendValues}>Save changes</Button>
              <Button key='discard' onClick={discardChanges}>Discard changes</Button>
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
      <Snackbar open={alert ? true : false} disableWindowBlurListener={true} autoHideDuration={5000} onClose={handleAlertClose}>
        <Alert variant='filled' severity={alert}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

function fetchData(moduleType, gestureType) {
  let promise1 = axios.get(`${URL}/quantumleap/templates`);
  let promise2 = axios.get(`${URL}/quantumleap/values`);
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

export default Module;