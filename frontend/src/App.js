// Style
import './App.css';
// Components
import { Switch, Route } from "react-router-dom";
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
  { name: 'settings', route: '/settings', label: 'Settings', icon: Settings },
  { name: 'pipeline', route: '/pipeline', label: 'Pipeline', icon: Settings },
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
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Layout sidebarItems={pages}>
          <Switch>
            <Route exact path="/" component={GeneralSettings}/>
            <Route path="/pipeline" component={Pipeline}/>
            <Route component={NotFound}/>
          </Switch>
        </Layout>
      </ThemeProvider>
    </div>
  );
}

export default App;
