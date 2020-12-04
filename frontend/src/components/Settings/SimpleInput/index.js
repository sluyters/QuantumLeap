import React from 'react';

import { Checkbox, TextField } from '@material-ui/core';

const TIMEOUT_VALUE = 500;

function BooleanInput(props) {
  // Unchanged for each setting
  const { templates, values } = props;
  // Each module has the props, but their value can change
  const { handleChange, level, path, value } = props;

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
      typingTimeout: ''
    };
    this.validateData = this.validateData.bind(this);
  }

  render() {
    // // Unchanged for each setting
    // const { templates, values } = this.props;
    // // Each module has the props, but their value can change
    // const { handleChange, level, path, value } = this.props;
    // Unique to each module
    const { minLength, maxLength } = this.props;
    const value = this.state.value;
    let valid = !(minLength && value.length < minLength) && !(maxLength && value.length > maxLength)
    return (
      <TextField 
        error={!valid}
        helperText={valid ? '' : 'Please enter a valid value.'}
        type='text'
        variant='outlined'
        value={value}
        onChange={this.validateData}
      />
    );
  }

  validateData(event) {
    const newValue = event.target.value;
    const { handleChange, path } = this.props;
    const { minLength, maxLength } = this.props;
    if (minLength !== null && minLength !== undefined && newValue.length < minLength) {
      console.error('Text input too short!');
    } else if (maxLength !== null && maxLength !== undefined && newValue.length > maxLength) {
      console.error('Text input too long!');
    }
    if (this.state.typingTimeout) {
      clearTimeout(this.state.typingTimeout);
    }
    this.setState({
      value: newValue,
      typingTimeout: setTimeout(() => handleChange(path, newValue), TIMEOUT_VALUE)
    });
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
    // Unchanged for each setting
    const { templates, values } = this.props;
    // Each module has the props, but their value can change
    const { handleChange, level, path, value } = this.props;
    // Unique to each module
    const { minValue, maxValue } = this.props;
    const validateData = (event) => {
      let newValue = event.target.value ? parseFloat(event.target.value) : 0;
      // Validate data
      if (minValue !== null && minValue !== undefined && newValue < minValue) {
        console.error('Float input too small!');
        newValue = minValue;
      } else if (maxValue !== null && maxValue !== undefined && newValue > maxValue) {
        console.error('Float input too big!');
        newValue = maxValue;
      }
      if (this.state.typingTimeout) {
        clearTimeout(this.state.typingTimeout);
      }
      this.setState({
        value: newValue.toString(),
        typingTimeout: setTimeout(() => handleChange(path, newValue), TIMEOUT_VALUE)
      });
    }
    return (
      <TextField 
        type='number'
        variant='outlined'
        value={this.state.value}
        onChange={validateData}
      />
    );
  }
}

class IntegerInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      typingTimeout: ''
    };
  }

  render() {
    // Unchanged for each setting
    const { templates, values } = this.props;
    // Each module has the props, but their value can change
    const { handleChange, level, path, value } = this.props;
    // Unique to each module
    const { minValue, maxValue } = this.props;

    const validateData = (event) => {
      let newValue = event.target.value ? parseInt(event.target.value) : 0;
      // Validate data
      console.log(newValue, minValue)
      if (minValue !== null && minValue !== undefined && newValue < minValue) {
        console.error('Integer input too small!');
        newValue = minValue;
      } else if (maxValue !== null && maxValue !== undefined && newValue > maxValue) {
        console.error('Integer input too big!');
        newValue = maxValue;
      }
      if (this.state.typingTimeout) {
        clearTimeout(this.state.typingTimeout);
      }
      this.setState({
        value: newValue.toString(),
        typingTimeout: setTimeout(() => handleChange(path, newValue), TIMEOUT_VALUE)
      });
    }
    return (
      <TextField 
        type='number'
        variant='outlined'
        value={this.state.value}
        onChange={validateData}
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