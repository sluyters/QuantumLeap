import React from 'react';
import { Typography } from '@mui/material';
import Setting from '../Setting';

/**
 * 
 * @param {Object} props
 * @property templates
 * @property values
 * @property onChange
 * @property level: number - An integer representing the depth of the category within the Settings tree
 * @property path 
 * @property value 
 * @property label: string - The label displayed on the screen for this category
 * @property settings: Setting[] - A list of sub-settings within this category
 */
function Category({ templates, values, onChange, level, path, value, label, settings }) {
    // The level will impact the size, boldness, of the setting
    return (
      <React.Fragment>
        <Typography variant={level < 3 ? `h${level + 4}` : 'h6'}>
          {label}
        </Typography>
        {
          settings.map(setting => (
            <Setting 
              key={setting.name}
              templates={templates}
              values={values}
              onChange={onChange}
              level={level + 1}
              path={path}
              value={value[setting.name]}
              setting={setting}
            />
          ))
        }
      </React.Fragment>
    );
}

export default Category;