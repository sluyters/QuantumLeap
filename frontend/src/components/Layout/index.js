import React from 'react'
import clsx from 'clsx';
import Sidebar from "../Sidebar";
import Container from '@material-ui/core/Container'
import { AppBar, IconButton, SwipeableDrawer, Toolbar, Typography } from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles } from '@material-ui/core/styles';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    minHeight: '100vh',
    display: 'flex',
  },
  appBar: {
    zIndex: 1400,
  },
  drawerContainer: {
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
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));

export default function Layout({ actions, sidebarItems, children }) {
  const classes = useStyles();
  const [state, setState] = React.useState({
    open: false,
  });
  const toggleDrawer = (open) => (event) => {
    setState({ ...state, open: open });
  };
  return (
    <div className={classes.root}>
      <AppBar className={classes.appBar} position='fixed' color='primary'>
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={toggleDrawer(!state.open)}>
            <MenuIcon />
          </IconButton> 
          <Typography variant="h6" className={classes.title}>
            TITLE OF THE PAGE
          </Typography>
        </Toolbar>
      </AppBar>
      <SwipeableDrawer
        className={classes.drawer}
        variant='persistent'
        anchor='left'
        open={state.open}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
      >
        <Toolbar/>
        <div className={classes.drawerContainer}>
          <Sidebar items={sidebarItems}>
            {actions}
          </Sidebar>
        </div>
      </SwipeableDrawer>
      {/* <div className={classes.sidebar}>
        <Sidebar items={sidebarItems}>
          {actions}
        </Sidebar>
      </div> */}
      <div className={clsx(classes.content, {
          [classes.contentShift]: state.open,
        })}
      >
        <Toolbar/>
        <Container>
          {children}
        </Container>
      </div>
    </div>
  );
}