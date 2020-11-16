import React from 'react'
import { Typography, Button, Select, FormControl, Checkbox, Tooltip, TextField, Grid, Box, List, ListItem, ListItemIcon, ListItemText, Divider, Card, CardHeader } from '@material-ui/core'
import { withStyles, withTheme } from '@material-ui/core/styles'
import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons'

const styles = (theme) => ({
  root: {
    margin: 'auto',
  },
  cardHeader: {
    padding: theme.spacing(1, 2),
  },
  list: {
    width: 250,
    height: 230,
    backgroundColor: theme.palette.background.paper,
    overflow: 'auto',
  },
  button: {
    margin: theme.spacing(0.5, 0),
  },
});

class ConfigPanel extends React.Component {
  render() {
    const { classes, settings, settingsValues, handleSave, depthStep, depth, handleChange, theme } = this.props;
    return (
      <React.Fragment>
        <div>
          {settings.map(setting => (
            <ConfigItem 
              classes={classes}
              setting={setting}
              settingValue={settingsValues[setting.name]}
              depthStep={depthStep}
              depth={depth}
              handleChange={handleChange}
              theme={theme}
            />
          ))}
        </div>
        <div>
          <Button variant="contained" color="secondary">
            Restore default values
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </React.Fragment>
    );
  }
}

function ConfigItem(props) {
  const { classes, setting, settingValue, depthStep, depth, path, handleChange, theme } = props;
  let newPath = path.slice();
  newPath.push(setting.name);
  if (setting.type === 'category') {
    return (
      <React.Fragment>
        <Typography 
          variant='subtitle1' 
          style={{ paddingLeft: theme.spacing(depth * depthStep)}}>
            {setting.label}
        </Typography>
        {setting.settings.map(subSetting => (
            <ConfigItem 
              classes={classes}
              setting={subSetting}
              settingValue={settingValue[subSetting.name]}
              depthStep={depthStep}
              depth={depth + 1}
              path={newPath}
              handleChange={handleChange}
              theme={theme}
            />
          ))}
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        <Box style={{ paddingLeft: theme.spacing(depth * depthStep)}}>
          <Typography 
            variant='subtitle2' 
            style={{display:'flex', alignItems:'center'}}
          >
              {setting.label}
              <Tooltip title={setting.description} style={{ marginLeft: theme.spacing(1)}} > 
                <InfoOutlinedIcon fontSize='small'/>
              </Tooltip>
          </Typography>
          <Setting
            classes={classes}
            description={setting.data}
            settingValue={settingValue}
            path={newPath}
            handleChange={handleChange}
          />
        </Box>
      </React.Fragment>
    );
  }
}

function Setting(props) {
  const { classes, description, settingValue, path, handleChange } = props;
  switch (description.dataType) {
    case 'boolean':
      return (<BooleanSetting
        classes={classes}
        description={description}
        settingValue={settingValue}
        handleChange={handleChange}
        path={path}
      />);
    case 'integer':
      return (<NonBooleanSetting
        classes={classes}
        description={description}
        settingValue={settingValue}
        handleChange={handleChange}
        path={path}
      />);
    case 'float':
      return (<NonBooleanSetting
        classes={classes}
        description={description}
        settingValue={settingValue}
        handleChange={handleChange}
        path={path}
      />);
    case 'string':
      return (<NonBooleanSetting
        classes={classes}
        description={description}
        settingValue={settingValue}
        handleChange={handleChange}
        path={path}
      />);
    default:
      console.log(`Invalid data type: ${description.dataType}`);
      return <span>Error.</span>
  }
}

// Add index of setting in checkbox
class BooleanSetting extends React.Component {
  render() {
    const { classes, description, settingValue, handleChange, path } = this.props;
    return (
      <Checkbox 
        checked={settingValue}
        onClick={(event) => handleChange(path, event.target.checked)}
        name={description.name}
        color='primary'
      />
    );
  }
}

// Add index of setting in checkbox
function NonBooleanSetting(props) {
  const { classes, description, settingValue, handleChange, path } = props;
  if (description.category === 'item') {
    if (description.domain.type === 'list') {
      // Item output / List domain
      return (
        <FormControl variant="outlined">
          <Select
            native
            value={settingValue}
            onChange={(event) => handleChange(path, event.target.value)}
          >
            {description.domain.values.map((value) => (
              <option value={value}>
                {value}
              </option>
            ))}
          </Select>
        </FormControl>
      );
    } else if (description.domain.type === 'any' || description.domain.type === 'range') {
      // Item output / Any or range domain
      return (
        <TextField
          type={description.dataType === 'string' ? 'text' : 'number'}
          variant='outlined'
          value={settingValue}
          onChange={(event) => handleChange(path, event.target.value)}
        />
      );
    } else {
      console.log(`Invalid domain type: ${description.domain.type}`);
      return <span>Error.</span>
    }
  } else if (description.category === 'list') {
    if (description.domain.type === 'list') {
      // List output / List domain
      return (
        <TransferList 
          classes={classes}
          description={description}
          settingValue={settingValue}
          handleChange={handleChange}
          path={path}
        />
      )
    } else if (description.domain.type === 'any' || description.domain.type === 'range') {
      // List output / Any or range domain
      return <span>Not implemented.</span>
    } else {
      console.log(`Invalid domain type: ${description.domain.type}`);
      return <span>Error.</span>
    }
  } else {
    console.log(`Invalid data category: ${description.category}`);
    return <span>Error.</span>
  }
}

class TransferList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: []
    };
    this.customList = this.customList.bind(this);
    this.intersection = this.intersection.bind(this);
    this.not = this.not.bind(this);
    this.union = this.union.bind(this);
  }

  render() {
    const { classes, description, settingValue, handleChange, path } = this.props;
    const { checked } = this.state;
    // Values chosen
    const right = settingValue;
    // Values to choose from
    console.log(description.domain.values)
    const left = description.domain.values.filter((value) => right.indexOf(value) === -1);
    // Checked items
    const leftChecked = this.intersection(checked, left);
    const rightChecked = this.intersection(checked, right);
    // 
    const handleCheckedRight = () => {
      this.setState((previousState) => ({
        checked: this.not(previousState.checked, leftChecked)
      }));
      handleChange(path, right.concat(leftChecked));
    }
    const handleCheckedLeft = () => {
      this.setState((previousState) => ({
        checked: this.not(previousState.checked, rightChecked)
      }));
      handleChange(path, right.filter((value) => rightChecked.indexOf(value) === -1));
    }
    // Render the TransferList
    return (
      <Grid container spacing={2} justify="center" alignItems="center" className={classes.root}>
        <Grid item>{this.customList('Available', left, leftChecked)}</Grid>
        <Grid item>
          <Grid container direction="column" alignItems="center">
            <Button
              variant="outlined"
              size="small"
              className={classes.button}
              onClick={handleCheckedRight}
              disabled={leftChecked.length === 0}
            >
              &gt;
            </Button>
            <Button
              variant="outlined"
              size="small"
              className={classes.button}
              onClick={handleCheckedLeft}
              disabled={rightChecked.length === 0}
            >
              &lt;
            </Button>
          </Grid>
        </Grid>
        <Grid item>{this.customList('Chosen', right, rightChecked)}</Grid>
      </Grid>
    );
  }

  not(a, b) {
    return a.filter((value) => b.indexOf(value) === -1);
  }

  intersection(a, b) {
    return a.filter((value) => b.indexOf(value) !== -1);
  }

  union(a, b) {
    return [...a, ...this.not(b, a)];
  }
  
  // Function to generate a list of items
  customList(title, items) {
    const { classes } = this.props;
    const { checked } = this.state;
    // Count the number of items that are checked
    const numberOfChecked = (items) => this.intersection(checked, items).length;
    // Handle toggle all checkboxes
    const handleToggleAll = (items) => () => {
      if (numberOfChecked(items) === items.length) {
        this.setState((prevState) => ({
          checked: this.not(prevState.checked, items)
        }))
      } else {
        this.setState((prevState) => ({
          checked: this.union(prevState.checked, items)
        }))
      }
    };
    // Handle toggle one checkbox
    const handleToggle = (value) => () => {
      this.setState((prevState) => {
        const currentIndex = prevState.checked.indexOf(value);
        const newChecked = [...prevState.checked];
        if (currentIndex === -1) {
          newChecked.push(value);
        } else {
          newChecked.splice(currentIndex, 1);
        }
        return {
          checked: newChecked
        }
      })
    };
    // Generate the list
    return (
      <Card>
        <CardHeader
          className={classes.cardHeader}
          avatar={
            <Checkbox
              onClick={handleToggleAll(items)}
              checked={numberOfChecked(items) === items.length && items.length !== 0}
              indeterminate={numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0}
              disabled={items.length === 0}
            />
          }
          title={title}
          subheader={`${numberOfChecked(items)}/${items.length} selected`}
        />
        <Divider />
        <List className={classes.list} dense component="div" role="list">
          {items.map((value) => {
            const labelId = `transfer-list-all-item-${value}-label`;
            return (
              <ListItem key={value} role="listitem" button onClick={handleToggle(value)}>
                <ListItemIcon>
                  <Checkbox
                    checked={checked.indexOf(value) !== -1}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={value} />
              </ListItem>
            );
          })}
          <ListItem />
        </List>
      </Card>
    );
  }
}

// Default values for props
ConfigPanel.defaultProps = {
  depthStep: 2,
  depth: 0
};

ConfigItem.defaultProps = {
  path: []
};

export default withTheme(withStyles(styles)(ConfigPanel))