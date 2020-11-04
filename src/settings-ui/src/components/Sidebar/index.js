import "./style.css"
import React from 'react'
import { withStyles, withTheme } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import Collapse from "@material-ui/core/Collapse"
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import { withRouter } from 'react-router'
import { Typography } from "@material-ui/core"

// TODO, make styling consistent
const styles = (theme) => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  h1: {
    fontFamily: theme.typography.fontFamily,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
});

class Sidebar extends React.Component { 
  render() {
    let { items, depthStep, depth, history, theme } = this.props;
    // Go through each of the items
    let renderedItems = [];
    items.forEach(item => {
      renderedItems.push(
        <SidebarItem 
          item={item}
          depthStep={depthStep}
          depth={depth}
          history={history} 
          theme={theme}
        />
      );
    });
    // Render the item
    return (
      <div class='sidebar'>
        <Typography variant='h4'>
          QuantumLeap
        </Typography>
        <List disablePadding>
          {renderedItems}
        </List>             
      </div>
    ); 
  }
}

// An item in the sidebar
class SidebarItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: true
    };
  }

  render() {
    let { item, depthStep, depth, history, theme } = this.props;
    let { collapsed } = this.state;
    // Build list of subitems (if any)
    let renderedSubItems = [];
    let expandIcon;
    if (Array.isArray(item.items) && item.items.length) {
      item.items.forEach(subItem => {
        renderedSubItems.push(
          <SidebarItem 
            item={subItem}
            depthStep={depthStep}
            depth={depth + 1}
            history={history} 
            theme={theme}
          />
        );
      });
      expandIcon = collapsed ? (<ExpandMore/>) : (<ExpandLess/>);
    }
    // Render the item and its subitems
    const ItemIcon = item.icon;
    return (  
      <>
        <ListItem key={item.name} className='sidebar-item' style={{ paddingLeft: theme.spacing(2 + depth * depthStep)}} onClick={this.onClick.bind(this)} button>
          {ItemIcon && <ListItemIcon><ItemIcon/></ListItemIcon>}
          <ListItemText primary={item.label}/>
          {expandIcon}
        </ListItem> 
        <Collapse in={!collapsed} timeout='auto' unmountOnExit>
          {renderedSubItems.length > 0 ? (<List disablePadding>{renderedSubItems}</List>) : ''} 
        </Collapse>
      </>
    );
  }

  onClick(e) {
    if (Array.isArray(this.props.item.items)) {
      // Toggle collapse
      this.setState(prevState => ({
        ...prevState,
        collapsed: !prevState.collapsed
      }));
    } else {
      // Open corresponding page
      this.props.history.push(this.props.item.route);
    }
  }
}

// Default values for props
Sidebar.defaultProps = {
  depthStep: 2,
  depth: 0
};

export default withTheme(withStyles(styles)(withRouter(Sidebar)));