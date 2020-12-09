import React, { useState } from 'react'
// Style
import './App.css';
// Components
import { Switch, Route, Redirect } from 'react-router-dom';
import Layout from './components/Layout'
import { Home as HomeIcon, Settings as PipelineIcon, Gesture as GestureSetsIcon, Extension, Speed as TestingIcon } from '@material-ui/icons'
// Pages
import Home from './pages/Home'
import Pipeline from './pages/Pipeline';
import Testing from './pages/Testing';
import NotFound from './pages/NotFound';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';

const pages = [
  //{ name: 'home', route: '/', label: 'Home', icon: HomeIcon },
  { name: 'pipeline', route: '/pipeline', label: 'Recognition pipeline', icon: PipelineIcon },
  { name: 'datasets', route: '/datasets', label: 'Gesture sets', icon: GestureSetsIcon },
  { name: 'testing', route: '/testing', label: 'Testing', icon: TestingIcon, items: [
      { name: 'staticTesting', route: '/testing/static', label: 'Static gestures', icon: null },
      { name: 'dynamicTesting', route: '/testing/dynamic', label: 'Dynamic gestures', icon: null },
    ] 
  },
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
        <Layout sidebarItems={pages} actions={currentActions}>
          <Switch>
            <Route 
              exact
              path='/' 
              render={(props) => (<Pipeline {...props} setActions={setCurrentActions} />)}
            />
            <Route 
              exact
              path='/pipeline' 
              render={(props) => (<Pipeline {...props} setActions={setCurrentActions} />)}
            />
            <Route 
              exact
              path='/testing' 
              render={(props) => (<Testing {...props} setActions={setCurrentActions} />)}
            />
            <Route 
              exact
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
