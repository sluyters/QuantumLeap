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
      config: '',
    };
    this.handleSettingChange = this.handleSettingChange.bind(this);
  }

  render() {
    const { classes, theme } = this.props;
    const { config } = this.state;
    return (
      <React.Fragment>
        <Paper style={{ marginTop: theme.spacing(4), padding: theme.spacing(2), backgroundColor: theme.palette.grey[100] }}>
          <Typography variant='h4'> General settings </Typography>
        </Paper>
        <Paper style={{ marginTop: theme.spacing(2), padding: theme.spacing(2), backgroundColor: theme.palette.grey[20] }}>
          {config ? (
            <ConfigPanel 
              classes={classes}
              settings={config.settings}
              handleSave={() => {this.saveConfig(config)}}
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
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.type !== prevProps.match.params.type) {
      this.fetchData();
    }
  }

  saveConfig(config) {
    return axios.put(`${URL}/settings`, { config: config })
      .then((res) => {
        console.log(res)
        console.log('data saved');
      })
      .catch((err) => {
        console.error(err.message);
      })
  }

  fetchData() {
    return axios.get(`${URL}/settings`)
      .then((res) => {
        console.log('data fetched');
        this.setState({
          config: res.data.config,
        });
      })
      .catch((err) => {
        this.setState({
          config: '',
        });
        console.error(err.message);
      })
  }

  handleSettingChange(settingPath, value) {
    // Recursive function to update the setting
    const updateSettings = (settingsList, path, value) => {
      if (path.length !== 0) {
        for (let i = 0; i < settingsList.length; i++) {
          if (settingsList[i].name === path[0]) {
            // The path matches
            if (path.length === 1) {
              // End of the path
              settingsList[i].data.current = value;
            } else {
              // Not at the end of the path
              settingsList[i].settings = updateSettings(settingsList[i].settings, path.slice(1), value);
            }
            return settingsList;
          }
        }
      }
      console.log(`Unable to find setting (path=${JSON.stringify(path)})`)
      return settingsList;
    };
    // Update the state
    this.setState(prevState => {
      let config = prevState.config;
      config.settings = updateSettings(config.settings, settingPath, value);
      return ({
        config: config
      });
    });
  }
}

export default withTheme(withStyles(styles)(GeneralSettings))