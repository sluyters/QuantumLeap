import React, { useEffect, useState } from 'react'
import { Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './renderers/codeblock';
import Heading from './renderers/heading';
import ApiDoc from './res/README.md'

const styles = (theme) => ({
  pageTitle: {
    marginBottom: theme.spacing(2),
  },
});
const useStyles = makeStyles(styles);

function Api() {
  const [document, setDocument] = useState('');
  const classes = useStyles();

  // Fetch data once the component is mounted
  useEffect(
    () => {
      fetch(ApiDoc)
        .then(res => res.text())
        .then(text => setDocument(text));
    },
    []
  );

  return (
    <div>
      <Typography variant='h2' className={classes.pageTitle}>
        API
      </Typography>
      <ReactMarkdown 
        renderers={{ 
          code: CodeBlock,
          heading: Heading 
        }}
      >
        {document} 
      </ReactMarkdown>
    </div>
  );
}

export default Api;