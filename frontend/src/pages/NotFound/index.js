import React from 'react'
import { Typography, Paper, } from '@material-ui/core'
import { withTheme } from '@material-ui/core/styles'

class NotFound extends React.Component {
  render() {
    const { theme } = this.props;
    return (
      <div style={{ padding: theme.spacing(2) }}>
        <Typography variant='h2'>
          Not found.
        </Typography>
      </div>
    );
  }

  componentDidMount() {
    const { setActions } = this.props;
    setActions('');
  }
}

export default withTheme(NotFound);