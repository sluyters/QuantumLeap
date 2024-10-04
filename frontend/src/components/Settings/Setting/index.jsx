import React from 'react';
import * as AllSettings from '../index';
import { Box, Typography, Tooltip } from '@material-ui/core';
import { withTheme } from '@material-ui/core/styles'
import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons'

class Setting extends React.Component {
  render() {
    const { theme } = this.props;
    // Unchanged for each setting
    const { templates, values } = this.props;
    // Each module has the props, but their value can change
    const { handleChange, level, path, value } = this.props;
    // Unique to each module
    const { setting } = this.props;

    let newPath = path.slice();
    newPath.push(setting.name);
    const SettingType = AllSettings[setting.type];
    if (SettingType) {
      return (
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
            handleChange={handleChange}
            level={level}
            path={newPath}
            value={value}
            {...setting}
          />
        </Box>
      );
    } else {
      console.error(`'${setting.type}' is not a valid type of setting.`);
      return (null);
    }
  }
}

export default withTheme(Setting);