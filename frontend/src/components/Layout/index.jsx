import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import Container from '@mui/material/Container';
import { AppBar, IconButton, SwipeableDrawer, Toolbar, Typography, useTheme } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import List from '@mui/material/List';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Collapse from "@mui/material/Collapse";
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { makeStyles } from '@mui/styles';
import { useNavigate, useLocation, Outlet } from 'react-router';

const drawerWidth = 280;

const styles = (theme) => ({
  root: {
    display: 'flex',
    height: '100%',
    width: '100%',
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

function Layout({ sidebarItems, children }) {
  const classes = useStyles();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [pathName, setPathName] = useState(location.pathname);

  useEffect(
    () => {
      setPathName(location.pathname);
    },
    [location]
  );

  const toggleDrawer = () => setOpen(open => !open);
  return (
    (<div className={classes.root}>
      <AppBar className={classes.appBar} position='fixed' color='primary'>
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            size="large">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {pathName}
          </Typography>
        </Toolbar>
      </AppBar>
      <SwipeableDrawer
        className={classes.drawer}
        variant='persistent'
        anchor='left'
        open={open}
        onClose={toggleDrawer}
        onOpen={toggleDrawer}
      >
        <Toolbar />
        <div className={classes.drawerContainer}>
          <Navigation items={sidebarItems} pathName={pathName} depthStep={4}>
          </Navigation>
        </div>
      </SwipeableDrawer>
      <div className={clsx(classes.content, {
        [classes.contentShift]: open,
      })}
      >
        <Toolbar />
        <Container>
          <Outlet />
        </Container>
      </div>
    </div>)
  );
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
  let navigate = useNavigate();
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
          navigate={navigate}
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
      navigate(item.route);
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
        // button
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


export default Layout;