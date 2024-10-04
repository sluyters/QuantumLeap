import React from 'react';
import { Checkbox, Select, MenuItem, TextField } from '@material-ui/core';
import { makeStyles, withStyles } from '@material-ui/core/styles';

const TIMEOUT_VALUE = 500;

const styles = (theme) => ({
  input: {
    margin: theme.spacing(1),
    minWidth: 150,
  },
});

const useStyles = makeStyles(styles);

function BooleanInput(props) {
  // Each module has the props, but their value can change
  const { handleChange, path, value } = props;
  return (
    <Checkbox 
      checked={value}
      onClick={(event) => handleChange(path, event.target.checked)}
      color='primary'
    />
  );
}

function SelectInput(props) {
  const { handleChange, path, value, items } = props;
  const classes = useStyles();
  return (
    <Select
      className={classes.input}
      variant='outlined'
      value={value}
      onChange={(event) => handleChange(path, event.target.value)}
    >
      {items.map((item, index) => (
        <MenuItem key={index} value={item.name}>{item.label}</MenuItem>
      ))}
    </Select>
  )
} 

class TextInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      typingTimeout: '',
    };
  }

  render() {
    const { handleChange, path, minLength, maxLength, classes } = this.props;
    // Helper functions
    const checkValue = (value) => {
      let error = '';
      if (value === null || value === undefined) {
        console.error('Invalid text input');
        error = `The value could not be read!`;
      } else if (minLength !== null && minLength !== undefined && value.length < minLength) {
        console.error('Text input too short!');
        error = `Value should be longer than ${minLength}!`;
      } else if (maxLength !== null && maxLength !== undefined && value.length > maxLength) {
        console.error('Text input too long!');
        error = `Value should be shorter than ${maxLength}!`;
      }
      return error;
    }
    const updateData = (event) => {
      let newValue = event.target.value;
      if (this.state.typingTimeout) {
        clearTimeout(this.state.typingTimeout);
      }
      this.setState({
        value: event.target.value,
        typingTimeout: setTimeout(() => handleChange(path, newValue), TIMEOUT_VALUE)
      });
    }
    let error = checkValue(this.state.value);
    return (
      <TextField 
        className={classes.input}
        error={error ? true : false}
        helperText={error}
        type='text'
        variant='outlined'
        value={this.state.value}
        onChange={updateData}
      />
    );
  }
}

class FloatInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      typingTimeout: ''
    };
  }
  render() {
    const { handleChange, path, minValue, maxValue, required, classes } = this.props;
    // Helper functions
    const checkValue = (value) => {
      let error = '';
      if (required && (value === null || value === undefined || value.length === 0)) {
        console.error('No float input!');
        error = `A value is required!`;
      } else if (minValue !== null && minValue !== undefined && value < minValue) {
        console.error('Float input too small!');
        error = `Value should be greater than ${minValue}!`;
      } else if (maxValue !== null && maxValue !== undefined && value > maxValue) {
        console.error('Float input too big!');
        error = `Value should be smaller than ${maxValue}!`;
      }
      return error;
    }
    const updateData = (event) => {
      let newValue = event.target.value ? parseFloat(event.target.value) : 0;
      if (this.state.typingTimeout) {
        clearTimeout(this.state.typingTimeout);
      }
      this.setState({
        value: event.target.value,
        typingTimeout: setTimeout(() => handleChange(path, newValue), TIMEOUT_VALUE)
      });
    }
    let error = checkValue(this.state.value);
    return (
      <TextField 
        className={classes.input}
        type='number'
        variant='outlined'
        error={error ? true : false}
        helperText={error}
        value={this.state.value}
        onChange={updateData}
        inputProps={{ min: minValue, max: maxValue }}
      />
    );
  }
}

class IntegerInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      typingTimeout: '',
    };
  }

  render() {
    const { handleChange, path, minValue, maxValue, required, classes } = this.props;
    // Helper functions
    const checkValue = (value) => {
      let error = '';
      if (required && (value === null || value === undefined || value.length === 0)) {
        console.error('No integer input!');
        error = `A value is required!`;
      } else if (minValue !== null && minValue !== undefined && value < minValue) {
        console.error('Integer input too small!');
        error = `Value should be greater than ${minValue}!`;
      } else if (maxValue !== null && maxValue !== undefined && value > maxValue) {
        console.error('Integer input too big!');
        error = `Value should be smaller than ${maxValue}!`;
      }
      return error;
    }
    const updateData = (event) => {
      let newValue = event.target.value ? parseInt(event.target.value) : 0;
      if (this.state.typingTimeout) {
        clearTimeout(this.state.typingTimeout);
      }
      this.setState({
        value: event.target.value,
        typingTimeout: setTimeout(() => handleChange(path, newValue), TIMEOUT_VALUE)
      });
    }
    let error = checkValue(this.state.value);
    return (
      <TextField 
        className={classes.input}
        type='number'
        variant='outlined'
        error={error ? true : false}
        helperText={error}
        value={this.state.value}
        onChange={updateData}
        inputProps={{ min: minValue, max: maxValue }}
      />
    );
  }
}

TextInput = withStyles(styles)(TextInput);
FloatInput = withStyles(styles)(FloatInput);
IntegerInput = withStyles(styles)(IntegerInput);

export {
  BooleanInput,
  SelectInput,
  TextInput,
  FloatInput,
  IntegerInput,
}