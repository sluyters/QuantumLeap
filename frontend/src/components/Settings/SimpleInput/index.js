import React from 'react';

import { Checkbox, TextField } from '@material-ui/core';

const TIMEOUT_VALUE = 500;

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

class TextInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      typingTimeout: '',
    };
  }

  render() {
    const { handleChange, path, minLength, maxLength } = this.props;
    // Helper functions
    const checkValue = (value) => {
      let error = '';
      if (minLength !== null && minLength !== undefined && value.length < minLength) {
        console.error('Text input too short!');
        error = `Value should be longer than ${minLength}!`;
      } else if (maxLength !== null && maxLength !== undefined && value.length > maxLength) {
        console.error('Text input too long!');
        error = `Value should be shorter than ${maxLength}!`;
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
    const { handleChange, path, minValue, maxValue } = this.props;
    // Helper functions
    const checkValue = (value) => {
      let error = '';
      if (value === null || value === undefined || value.length === 0) {
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
    const { handleChange, path, minValue, maxValue } = this.props;
    // Helper functions
    const checkValue = (value) => {
      let error = '';
      if (value === null || value === undefined || value.length === 0) {
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

export {
  BooleanInput,
  TextInput,
  FloatInput,
  IntegerInput,
}