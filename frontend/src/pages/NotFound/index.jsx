import React, { useEffect } from 'react'
import { Typography, useTheme } from '@mui/material'

function NotFound() {
  const theme = useTheme();

  return (
    <div style={{ padding: theme.spacing(2) }}>
      <Typography variant='h2'>
        Not found.
      </Typography>
    </div>
  );
}

export default NotFound;