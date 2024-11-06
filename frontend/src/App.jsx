import React, { useState } from 'react'
// Style
import './App.css';
import CssBaseline from '@mui/material/CssBaseline';
// Components
import { Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout'
import { Home as HomeIcon, Settings as PipelineIcon, Gesture as GestureSetsIcon, Extension, Speed as TestingIcon } from '@mui/icons-material'
// Pages
import Api from './pages/Api'
import Testing from './pages/Testing';
import NotFound from './pages/NotFound';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider, StyledEngineProvider } from '@mui/material';
import Overview from './pages/Overview';
import Module from './pages/Module';

const pages = [
  { name: 'quantumleap', route: '/quantumleap', label: 'QuantumLeap', icon: Extension, items: [
      { name: 'overview', route: '/overview', label: 'Overview', icon: null },
      { name: 'api', route: '/api', label: 'API', icon: null },
      { name: 'pipeline', route: '/pipeline', label: 'Pipeline', icon: null, items: [
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
      }
    ]
  },
  { name: 'testing', route: '/testing', label: 'Testing', icon: TestingIcon, items: [
      { name: 'staticTesting', route: '/testing/static', label: 'Static gestures', icon: null },
      { name: 'dynamicTesting', route: '/testing/dynamic', label: 'Dynamic gestures', icon: null },
    ] 
  },
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

const routes = createBrowserRouter([
    {
      element: <Layout sidebarItems={pages} />,
      children: [
        {
          exact: true,
          path: '/',
          element: <Navigate to='./overview' />,
        },
        {
          exact: true,
          path: '/api',
          element: <Api />,
        },
        {
          exact: true,
          path: '/overview',
          element: <Overview />,
        },
        {
          exact: true,
          path: '/pipeline/:moduleType/:gestureType?',
          element: <Module key={Date.now()} routesInfos={routesInfos} />,
        },
        {
          exact: true,
          path: '/testing/:gestureType',
          element: <Testing type='static' />,
        },

        {
          exact: true,
          path: '/not-found',
          element: <NotFound />,
        },
        {
          path: '*',
          element: <Navigate to='not-found' />
        },
      ]
    },
]);

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: light)');
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          primary: {
            light: '#bdcdda',
            main: '#0d5581',
            dark: '#003051',
            contrastText: '#ffffff'
          },
          secondary: {
            light: '#ebebeb',
            main: '#5a5a5a',
            dark: '#070707',
            contrastText: '#ffffff'
          },
        },
      }),
    [prefersDarkMode],
  );
  return (
    (<div className='App'>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <RouterProvider router={routes} />
        </ThemeProvider>
      </StyledEngineProvider>
    </div>)
  );
}

export default App;
