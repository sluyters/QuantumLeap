import React, { useState } from 'react';
import clsx from 'clsx';
import Container from '@material-ui/core/Container';
import { AppBar, IconButton, SwipeableDrawer, Toolbar, Typography, useTheme } from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';
import List from '@material-ui/core/List';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Collapse from "@material-ui/core/Collapse";
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router';
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from "react-router";

const drawerWidth = 280;

const styles = (theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: 1250,
  },
  drawerContainer: {
    width: drawerWidth,
    overflow: 'auto',
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  title: {
    flexGrow: 1,
  },
  content: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
    overflowX: 'auto',
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  navigationContainer: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    boxSizing: 'border-box',
  },
  navigationItemContainer: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
});

const useStyles = makeStyles(styles);

class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
      pathName: props.history.location.pathname
    };
  }

  componentDidMount() {
    this.props.history.listen(() => {
      this.setState({
        pathName: this.props.history.location.pathname
      });
    });
  }

  render() {
    const { actions, classes, sidebarItems, children } = this.props;
    const toggleDrawer = (open) => (event) => {
      this.setState({
        open: open
      });
    };
    return (
      <div className={classes.root}>
        <AppBar className={classes.appBar} position='fixed' color='primary'>
          <Toolbar>
            <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={toggleDrawer(!this.state.open)}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              {this.state.pathName}
            </Typography>
          </Toolbar>
        </AppBar>
        <SwipeableDrawer
          className={classes.drawer}
          variant='persistent'
          anchor='left'
          open={this.state.open}
          onClose={toggleDrawer(false)}
          onOpen={toggleDrawer(true)}
        >
          <Toolbar />
          <div className={classes.drawerContainer}>
            <Navigation items={sidebarItems} pathName={this.state.pathName} depthStep={4}>
              {actions}
            </Navigation>
          </div>
        </SwipeableDrawer>
        <div className={clsx(classes.content, {
          [classes.contentShift]: this.state.open,
        })}
        >
          <Toolbar />
          <Container>
            {children}
          </Container>
        </div>
      </div>
    );
  }
}


function Navigation({ children, items, pathName, depthStep, depth }) {
  depthStep = depthStep !== undefined ? depthStep : 4;
  depth = depth !== undefined ? depth : 0;
  const theme = useTheme();
  const classes = useStyles();
  // Go through each of the items
  let renderedItems = [];
  items.forEach((item, index) => {
    renderedItems.push(
      <NavigationItem
        key={index}
        item={item}
        pathName={pathName}
        depthStep={depthStep}
        depth={depth}
        theme={theme}
      />
    );
  });
  // Render the item
  return (
    <div className={classes.navigationContainer}>
      <List disablePadding className={classes.sidebarNav} >
        {renderedItems}
      </List>
      <div className={classes.navigationItemContainer}>
        {children}
      </div>
    </div>
  );
}

function NavigationItem({ item, pathName, depthStep, depth, theme }) {
  let [collapsed, setCollapsed] = useState();
  let history = useHistory();
  // Build list of subitems (if any)
  let renderedSubItems = [];
  let expandIcon;
  if (Array.isArray(item.items) && item.items.length) {
    item.items.forEach((subItem, index) => {
      renderedSubItems.push(
        <NavigationItem
          key={index}
          item={subItem}
          pathName={pathName}
          depthStep={depthStep}
          depth={depth + 1}
          history={history}
          theme={theme}
        />
      );
    });
    expandIcon = collapsed ? (<ExpandMore />) : (<ExpandLess />);
  }
  // Handler
  let onClick = () => {
    if (Array.isArray(item.items)) {
      // Toggle collapse
      setCollapsed(!collapsed);
    } else {
      // Open corresponding page
      history.push(item.route);
    }
  }
  // Render the item and its subitems
  const ItemIcon = item.icon;
  return (
    <React.Fragment>
      <MenuItem
        key={item.name}
        style={{ paddingLeft: theme.spacing(2 + depth * depthStep) }}
        onClick={onClick}
        button
        selected={item.route === pathName}
      >
        {ItemIcon && <ListItemIcon><ItemIcon /></ListItemIcon>}
        <ListItemText primary={item.label} />
        {expandIcon}
      </MenuItem>
      <Collapse in={!collapsed} timeout='auto' unmountOnExit>
        {renderedSubItems.length > 0 ? (<List disablePadding>{renderedSubItems}</List>) : ''}
      </Collapse>
    </React.Fragment>
  );
}


export default withStyles(styles)(withRouter(Layout))