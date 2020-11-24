import React from 'react'
import axios from 'axios'
import { Typography, Paper } from '@material-ui/core'
import { withStyles, withTheme } from '@material-ui/core/styles'
import ConfigPanel from '../../components/ConfigPanel'
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
    this.resetValues = this.resetValues.bind(this);
    this.sendValues = this.sendValues.bind(this);
  }

  renderComponentSettings(name, label) {
    const { theme } = this.props;
    const { templates, values } = this.state;
    let path = ['quantumLeap', name];
    let level = 0;    
    return (
      <Paper style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2), padding: theme.spacing(2), backgroundColor: theme.palette.grey[50] }}>
        <Typography variant='h4'>
          {label}
        </Typography>
        {(templates && values) ? (
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

  render() {
    const { classes, theme } = this.props;
    const { templates, values } = this.state;
    return (
      <React.Fragment>
        {/* General settings */}
        {this.renderComponentSettings('generalSettings', 'General Settings')}
        {/* Sensor settings */}
        {this.renderComponentSettings('sensorsSettings', "Sensor(s)")}
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

  componentDidMount() {
    this.fetchData();
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

  resetValues(path = '') {
    // TODO
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