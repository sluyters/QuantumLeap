// Style
import './App.css';
// Components
import { Switch, Route } from "react-router-dom";
import Layout from './components/Layout'
import { Home as HomeIcon, Settings, Gesture, Extension } from '@material-ui/icons'
// Pages
import Home from './pages/Home'
import GeneralSettings from './pages/GeneralSettings'
import Modules from './pages/Modules'
import Module from './pages/Module'
import NotFound from './pages/NotFound'
import { createMuiTheme, ThemeProvider } from '@material-ui/core';

const theme = createMuiTheme();

const pages = [
  { name: 'home', route: '/', label: 'Home', icon: HomeIcon },
  { name: 'settings', route: '/settings', label: 'Settings', icon: Settings },
  { 
    name: 'modules', 
    label: 'Modules', 
    icon: Extension,
    items: [
      { name: 'overview', route: '/modules', label: 'Overview', icon: null },
      { name: 'sensors', route: '/modules/sensors', label: 'Sensors', icon: null },
      { name: 'classifiers', route: '/modules/classifiers', label: 'Classifiers', icon: null },
      { name: 'datasets', route: '/modules/datasets', label: 'Datasets', icon: null },
      { name: 'analyzers', route: '/modules/analyzers', label: 'Analyzers', icon: null },
      { name: 'segmenters', route: '/modules/segmenters', label: 'Segmenters', icon: null },
      { name: 'recognizers', route: '/modules/recognizers', label: 'Recognizers', icon: null },
    ], 
  },
  { name: 'gestures', route: '/gestures', label: 'Gestures', icon: Gesture },
]

function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Layout sidebarItems={pages}>
          <Switch>
            <Route exact path="/" component={Home}/>
            <Route path="/settings" component={GeneralSettings}/>
            <Route exact path="/modules" component={Modules}/>
            <Route path="/modules/:type" component={Module}/>
            <Route path="/gestures" component={Modules}/>
            <Route component={NotFound}/>
          </Switch>
        </Layout>
      </ThemeProvider>
    </div>
  );
}

export default App;
