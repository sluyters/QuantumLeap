import React from 'react';
import axios from 'axios'
import { Typography, Button, ButtonGroup, Snackbar } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { Setting } from '../../components/Settings';
import { withRouter } from "react-router";
import { Alert } from '@material-ui/lab';

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
    marginTop: theme.spacing(2),
  },
  componentName: {
    marginBottom: theme.spacing(2),
  },
});

class Module extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alert: '',
      alertMessage: '',
      templates: '',
      values: '',
      componentKey: Date.now(), // Necessary to ensure that state is reset across all sub-components
    };
    this.handleAlertClose = this.handleAlertClose.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.fetchValues = this.fetchValues.bind(this);
    this.sendValues = this.sendValues.bind(this);
  }

  componentDidMount() {
    const { moduleType, gestureType } = this.props.match.params;
    this.fetchData(moduleType, gestureType).then(res => {
      this.setState({
        componentKey: Date.now(),
      });
    });
  }

  componentDidUpdate(prevProps) {
    const { moduleType, gestureType } = this.props.match.params;
    if (moduleType !== prevProps.match.params.moduleType || gestureType !== prevProps.match.params.gestureType) {
      this.setState({
        templates: '',
        values: '',
      })
      this.fetchData(moduleType, gestureType).then(res => {
        this.setState({
          componentKey: Date.now(),
        });
      });
    }
  }

  render() {
    const { classes, history, routesInfos } = this.props;
    const { alert, alertMessage, templates, values, componentKey } = this.state;

    let path = [ 'main', 'settings' ];
    const route = history.location.pathname;
    const routeInfo = routesInfos[route];
    const componentName = routeInfo ? routeInfo.label : 'Unknown component'
    const { moduleType, gestureType } = this.props.match.params;
    if (moduleType) {
      path.push(moduleType);
    }
    if (gestureType) {
      path.push(gestureType);
    }
    let componentTemplate = templates;
    let componentValue = values;
    for (let key of path) {
      componentTemplate = componentTemplate[key];
      componentValue = componentValue[key];
      if (!componentValue || !componentTemplate) {
        break;
      }
    }
    const discardChanges = () => {
      this.fetchValues().then(res => {
        this.setState({
          componentKey: Date.now(),
        });
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
                  handleChange={this.handleValueChange}
                  level={0}
                  path={path}
                  value={componentValue[setting.name]}
                  setting={setting}
                />
              );
            })}
            <div className={classes.actionButtons}>
              <ButtonGroup variant="contained" color="primary">
                <Button key='save' onClick={this.sendValues}>Save changes</Button>
                <Button key='discard' onClick={discardChanges}>Discard changes</Button>
              </ButtonGroup>
            </div>
          </React.Fragment>
        ) : (
          <Typography variant='body1'>
            No settings available.
          </Typography>
        )}
        {/* <Snackbar open={alert ? true : false} autoHideDuration={5000} onClose={this.handleAlertClose}>
          <Alert variant='filled' severity={alert}>
            {alertMessage}
          </Alert>
        </Snackbar> */}
      </div>
    );
  }

  handleAlertClose() {
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

  fetchData(moduleType, gestureType) {
    // let moduleURL = gestureType ? `${moduleType}/${gestureType}` : moduleType;
    // let promise1 = axios.get(`${URL}/quantumleap/templates/${moduleURL}`);
    // let promise2 = axios.get(`${URL}/quantumleap/values/${moduleURL}`);
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
        this.setState({
          alert: 'success',
          alertMessage: 'Changes saved!'
        });
        console.log('Data saved');
      })
      .catch((err) => {
        this.setState({
          alert: 'error',
          alertMessage: 'Failed to save the changes!'
        });
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

export default withTheme(withStyles(styles)(withRouter(Module)));