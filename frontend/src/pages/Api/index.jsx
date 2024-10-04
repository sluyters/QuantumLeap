import React from 'react'
import { Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './renderers/codeblock';
import Heading from './renderers/heading';
import ApiDoc from './res/README.md'

const styles = (theme) => ({
  pageTitle: {
    marginBottom: theme.spacing(2),
  },
});

class Api extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      doc: '',
    };
  }

  componentDidMount() {
    fetch(ApiDoc).then(res => res.text()).then(text => this.setState({ doc: text }));
  }

  render() {
    const { doc } = this.state;
    const { classes } = this.props;
    return (
      <div>
        <Typography variant='h2' className={classes.pageTitle}>
          API
        </Typography>
        <ReactMarkdown 
          source={doc} 
          renderers={{ 
            code: CodeBlock,
            heading: Heading 
          }}
        />
      </div>
    );
  }
}

export default withStyles(styles)(Api);