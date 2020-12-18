import React, { useState } from 'react'
// Style
import './App.css';
import CssBaseline from '@material-ui/core/CssBaseline';
// Components
import { Switch, Route, Redirect } from 'react-router-dom';
import Layout from './components/Layout'
import { Home as HomeIcon, Settings as PipelineIcon, Gesture as GestureSetsIcon, Extension, Speed as TestingIcon } from '@material-ui/icons'
// Pages
import Home from './pages/Home'
import Testing from './pages/Testing';
import NotFound from './pages/NotFound';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import Overview from './pages/Overview';
import Module from './pages/Module';

const pages = [
  // { name: 'home', route: '/', label: 'Home', icon: HomeIcon },
  { name: 'overview', route: '/overview', label: 'Overview', icon: HomeIcon },
  { name: 'pipeline', route: '/pipeline', label: 'Pipeline', icon: PipelineIcon, items: [
      { name: 'overview', route: '/pipeline/general', label: 'General', icon: null },
      { name: 'sensors', route: '/pipeline/sensors', label: 'Sensor(s)', icon: null },
      { name: 'filters', route: '/pipeline/filters', label: 'Filter', icon: null },
      { name: 'static-datasets', route: '/pipeline/datasets/static', label: 'Static dataset(s)', icon: null },
      { name: 'static-recognizers', route: '/pipeline/recognizers/static', label: 'Static recognizer', icon: null },
      { name: 'analyzers', route: '/pipeline/analyzers', label: 'Analyzer', icon: null },
      { name: 'segmenters', route: '/pipeline/segmenters', label: 'Segmenter', icon: null },
      { name: 'dynamic-datasets', route: '/pipeline/datasets/dynamic', label: 'Dynamic dataset(s)', icon: null },
      { name: 'dynamic-recognizers', route: '/pipeline/recognizers/dynamic', label: 'Dynamic recognizer', icon: null },
    ] 
  },
  // { name: 'pipeline2', route: '/pipeline2', label: 'Recognition pipeline', icon: PipelineIcon },
  // { name: 'datasets', route: '/datasets', label: 'Gesture sets', icon: GestureSetsIcon },
  // { name: 'testing', route: '/testing', label: 'Testing', icon: TestingIcon, items: [
  //     { name: 'staticTesting', route: '/testing/static', label: 'Static gestures', icon: null },
  //     { name: 'dynamicTesting', route: '/testing/dynamic', label: 'Dynamic gestures', icon: null },
  //   ] 
  // },
]

const routesInfos = {
  '/pipeline/general': { label: 'General settings' },
  '/pipeline/sensors': { label: 'Sensor(s)' },
  '/pipeline/filters': { label: 'Filter' },
  '/pipeline/datasets/static': { label: 'Static dataset(s)' },
  '/pipeline/recognizers/static': { label: 'Static Recognizer' },
  '/pipeline/analyzers': { label: 'Analyzer' },
  '/pipeline/segmenters': { label: 'Segmenter' },
  '/pipeline/datasets/dynamic': { label: 'Dynamic dataset(s)' },
  '/pipeline/recognizers/dynamic': { label: 'Dynamic recognizer' },
}

function App() {
  const [currentActions, setCurrentActions] = useState('');
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: light)');
  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );
  return (
    <div className='App'>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Layout sidebarItems={pages} actions={currentActions} >
          <Switch>
            <Route 
              exact
              path='/' 
              render={(props) => (<Overview {...props} setActions={setCurrentActions} />)}
            />
            <Route 
              exact
              path='/overview' 
              render={(props) => (<Overview {...props} setActions={setCurrentActions} />)}
            />
            <Route 
              exact
              key={Date.now()}
              path='/pipeline/:moduleType/:gestureType?' 
              render={(props) => (<Module {...props} routesInfos={routesInfos} />)}
            />
            {/* <Route 
              exact
              key='pipeline2'
              path='/pipeline2' 
              render={(props) => (<Pipeline {...props} setActions={setCurrentActions} />)}
            /> */}
            <Route 
              exact
              key='testing-static'
              path='/testing/static' 
              render={(props) => (<Testing {...props} type='static' setActions={setCurrentActions} />)}
            />
            <Route 
              exact
              key='testing-dynamic'
              path='/testing/dynamic' 
              render={(props) => (<Testing {...props} type='dynamic' setActions={setCurrentActions} />)}
            />
            <Route 
              exact
              key='not-found'
              path='/not-found'
              render={(props) => (<NotFound {...props} setActions={setCurrentActions} />)}
            />
            <Redirect to='not-found' />
          </Switch>
        </Layout>
      </ThemeProvider>
    </div>
  );
}

export default App;
