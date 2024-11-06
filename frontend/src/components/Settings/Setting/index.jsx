import React from 'react';
import * as AllSettings from '../index';
import { Box, Typography, Tooltip } from '@mui/material';
import { useTheme } from '@mui/styles'
import { InfoOutlined as InfoOutlinedIcon } from '@mui/icons-material'

export default function Setting({ templates, values, value, path, level, onChange, setting }) {
  const theme = useTheme();
  let newPath = path.slice();
  newPath.push(setting.name);
  const SettingType = AllSettings[setting.type];
  return SettingType ? (
    <Box width={1} mt={1}>
      {(setting.type === 'Category') ? (
        '' 
      ) : ( 
        <Typography style={{display:'flex', alignItems:'center', fontWeight: 600}}>
          {setting.label}
        <Tooltip title={<Typography>{setting.description}</Typography>} style={{ marginLeft: theme.spacing(1)}} arrow> 
            <InfoOutlinedIcon fontSize='small'/>
          </Tooltip>
        </Typography>
      )}
      <SettingType
        templates={templates}
        values={values}
        onChange={onChange}
        level={level}
        path={newPath}
        value={value}
        {...setting}
      />
    </Box>
  ) : false;
}