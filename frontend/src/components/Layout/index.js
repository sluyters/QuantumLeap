import "./style.css"
import React from 'react'
import Sidebar from "../Sidebar";
import Container from '@material-ui/core/Container'

class Layout extends React.Component {
  render() {
    let { actions, sidebarItems, children } = this.props;
    return (
      <React.Fragment>
        <div id='sidebar'>
          <Sidebar items={sidebarItems}>
            {actions}
          </Sidebar>
        </div>
        <Container id='content'>
          {children}
        </Container>
      </React.Fragment>
    );
  }
}

export default Layout