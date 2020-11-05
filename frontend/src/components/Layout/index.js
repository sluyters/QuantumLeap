import "./style.css"
import React from 'react'
import Sidebar from "../Sidebar";
import Container from '@material-ui/core/Container'

class Layout extends React.Component {
  render() {
    return (
      <React.Fragment>
        <div id='sidebar'>
          <Sidebar items={this.props.sidebarItems}/>
        </div>
        <Container id='content'>
          {this.props.children}
        </Container>
      </React.Fragment>
    );
  }
}

export default Layout