import React from 'react'
// Style
import './App.css';
// Components
import { Switch, Route, Redirect } from "react-router-dom";
import Layout from './components/Layout'
import { Home as HomeIcon, Settings, Gesture, Extension } from '@material-ui/icons'
// Pages
import Home from './pages/Home'
import GeneralSettings from './pages/GeneralSettings'
import Pipeline from './pages/Pipeline'
import NotFound from './pages/NotFound'
import { createMuiTheme, ThemeProvider } from '@material-ui/core';

const theme = createMuiTheme();

const pages = [
  //{ name: 'home', route: '/', label: 'Home', icon: HomeIcon },
  { name: 'pipeline', route: '/pipeline', label: 'Pipeline', icon: Settings },
  { name: 'datasets', route: '/datasets', label: 'Gesture sets', icon: Gesture },
  // { 
  //   name: 'modules', 
  //   label: 'Modules', 
  //   icon: Extension,
  //   items: [
  //     //{ name: 'overview', route: '/modules', label: 'Overview', icon: null },
  //     { name: 'sensors', route: '/modules/sensor', label: 'Sensors', icon: null },
  //     { name: 'classifiers', route: '/modules/classifier', label: 'Classifiers', icon: null },
  //     { name: 'datasets', label: 'Datasets', icon: null, items: [
  //         { name: 'gestures', route: '/modules/gesture-dataset', label: 'Gestures', icon: null },
  //         { name: 'poses', route: '/modules/pose-dataset', label: 'Poses', icon: null },
  //       ] 
  //     },
  //     { name: 'analyzers', route: '/modules/analyzer', label: 'Analyzers', icon: null },
  //     { name: 'segmenters', route: '/modules/segmenter', label: 'Segmenters', icon: null },
  //     { name: 'recognizers', route: '/modules/recognizer', label: 'Recognizers', icon: null },
  //   ], 
  // },
  //{ name: 'gestures', route: '/gestures', label: 'Gestures', icon: Gesture },
]

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentActions: '',
    };
    this.setCurrentActions = this.setCurrentActions.bind(this);
  }

  setCurrentActions(actions) {
    this.setState({
      currentActions: actions,
    });
  }

  render() {
    let { currentActions } = this.state;
    return (
      <div className="App">
        <ThemeProvider theme={theme}>
          <Layout sidebarItems={pages} actions={currentActions}>
            <Switch>
              <Route 
                exact
                path="/" 
                render={(props) => (<Pipeline {...props} setActions={this.setCurrentActions} />)}
              />
              <Route 
                exact
                path="/pipeline" 
                render={(props) => (<Pipeline {...props} setActions={this.setCurrentActions} />)}
              />
              <Route 
                exact
                path="/not-found"
                component={NotFound}
              />
              <Redirect to="not-found" />
            </Switch>
          </Layout>
        </ThemeProvider>
      </div>
    );
  }
}

export default App;
