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
import Pipeline from './pages/Pipeline';
import Testing from './pages/Testing';
import NotFound from './pages/NotFound';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';

const pages = [
  { name: 'home', route: '/', label: 'Home', icon: HomeIcon },
  { name: 'pipeline', route: '/pipeline', label: 'Recognition pipeline', icon: PipelineIcon },
  { name: 'datasets', route: '/datasets', label: 'Gesture sets', icon: GestureSetsIcon },
  { name: 'testing', route: '/testing', label: 'Testing', icon: TestingIcon, items: [
      { name: 'staticTesting', route: '/testing/static', label: 'Static gestures', icon: null },
      { name: 'dynamicTesting', route: '/testing/dynamic', label: 'Dynamic gestures', icon: null },
    ] 
  },
]

const routesNames = {
  '/': 'Home',
  '/': 'Recognition pipeline',
  '/': 'Gesture sets',
  '/testing/static': 'Testing (static recognizers)',
  '/testing/dynamic': 'Testing (dynamic recognizers)',
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
        <Layout sidebarItems={pages} actions={currentActions}>
          <Switch>
            <Route 
              exact
              path='/' 
              render={(props) => (<NotFound {...props} setActions={setCurrentActions} />)}
            />
            <Route 
              exact
              key='pipeline'
              path='/pipeline' 
              render={(props) => (<Pipeline {...props} setActions={setCurrentActions} />)}
            />
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
