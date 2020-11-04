// Style
import './App.css';
// Components
import { Switch, Route, Redirect } from "react-router-dom";
import Layout from './components/Layout'
import { Home as HomeIcon, Settings, FindInPage, Gesture, Extension, Camera, FilterNone } from '@material-ui/icons'
// Pages
import Home from './pages/Home'
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
      { name: 'overview', route: '/modules', label: 'Overview', icon: Camera },
      { name: 'sensors', route: '/modules/sensors', label: 'Sensors', icon: Camera },
      { name: 'classifiers', route: '/modules/classifiers', label: 'Classifiers', icon: HomeIcon },
      { name: 'datasets', route: '/modules/datasets', label: 'Datasets', icon: HomeIcon },
      { name: 'analyzers', route: '/modules/analyzers', label: 'Analyzers', icon: FindInPage },
      { name: 'segmenters', route: '/modules/segmenters', label: 'Segmenters', icon: FilterNone },
      { name: 'recognizers', route: '/modules/recognizers', label: 'Recognizers', icon: HomeIcon },
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
            <Route path="/settings" component={Modules}/>
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
