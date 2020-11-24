import React from 'react';

// TODO Display when input is incorrect for TextInput
import { Checkbox, TextField } from '@material-ui/core';
import { render } from '@testing-library/react';

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
      value: props.value
    };
    this.validateData = this.validateData.bind(this);
  }

  render() {
    // // Unchanged for each setting
    // const { templates, values } = this.props;
    // // Each module has the props, but their value can change
    // const { handleChange, level, path, value } = this.props;
    // // Unique to each module
    // const { minLength, maxLength } = this.props;
    const value = this.state.value;
    return (
      <TextField 
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
    this.setState({
      value: newValue
    });
    if (minLength && newValue.length < minLength) {
      console.error('Text input too short!');
    } else if (maxLength && newValue.length > maxLength) {
      console.error('Text input too long!');
    } else {
      handleChange(path, newValue);
    }
  }
}

function FloatInput(props) {
  // Unchanged for each setting
  const { templates, values } = props;
  // Each module has the props, but their value can change
  const { handleChange, level, path, value } = props;
  // Unique to each module
  const { minValue, maxValue } = props;
  const validateData = function(event) {
    let newValue = event.target.value ? parseFloat(event.target.value) : 0;
    // Validate data
    if (minValue && newValue < minValue) {
      console.error('Float input too small!');
      newValue = minValue;
    } else if (maxValue && newValue > maxValue) {
      console.error('Float input too big!');
      newValue = maxValue;
    }
    if (newValue != value) {
      handleChange(path, newValue);
    }
  }
  return (
    <TextField 
      type='number'
      variant='outlined'
      value={value}
      onChange={validateData}
    />
  );
}

function IntegerInput(props) {
  // Unchanged for each setting
  const { templates, values } = props;
  // Each module has the props, but their value can change
  const { handleChange, level, path, value } = props;
  // Unique to each module
  const { minValue, maxValue } = props;
  const validateData = function(event) {
    let newValue = event.target.value ? parseInt(event.target.value) : 0;
    // Validate data
    if (minValue && newValue < minValue) {
      console.error('Integer input too small!');
      newValue = minValue;
    } else if (maxValue && newValue > maxValue) {
      console.error('Integer input too big!');
      newValue = maxValue;
    }
    if (newValue != value) {
      handleChange(path, newValue);
    }
  }
  return (
    <TextField 
      type='number'
      variant='outlined'
      value={value}
      onChange={validateData}
    />
  );
}

export {
  BooleanInput,
  TextInput,
  FloatInput,
  IntegerInput,
}