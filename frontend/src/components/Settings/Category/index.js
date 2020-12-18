import React from 'react';
import { Typography } from '@material-ui/core';
import Setting from '../Setting';

class Category extends React.Component {
  render() {
    // Unchanged for each setting
    const { templates, values } = this.props;
    // Each module has the props, but their value can change
    const { handleChange, level, path, value } = this.props;
    // Unique to each module
    const { label, settings } = this.props;

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
              handleChange={handleChange}
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
}

export default Category;