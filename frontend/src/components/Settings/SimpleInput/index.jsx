import React, { useState, useMemo } from 'react';
import { Checkbox, Select, MenuItem, TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';

const TIMEOUT_VALUE = 500;

const styles = (theme) => ({
  input: {
    margin: theme.spacing(1),
    minWidth: 150,
  },
});
const useStyles = makeStyles(styles);

function BooleanInput({ onChange, path, value }) {
  return (
    <Checkbox 
      checked={value}
      onClick={(event) => onChange(path, event.target.checked)}
      color='primary'
    />
  );
}

function SelectInput({ onChange, path, value, items }) {
  const classes = useStyles();
  return (
    <Select
      className={classes.input}
      variant='outlined'
      value={value}
      onChange={(event) => onChange(path, event.target.value)}
    >
      {items.map((item, index) => (
        <MenuItem key={index} value={item.name}>{item.label}</MenuItem>
      ))}
    </Select>
  )
} 

function TextInput({ onChange, path, value, minLength, maxLength }) {
  const classes = useStyles();
  const [text, setText] = useState(value);
  const [typingTimeout, setTypingTimeout] = useState('');

  const validateInput = (input) => {
    let error = '';
    if (input === null || input === undefined) {
      console.error('Invalid text input');
      error = `The value could not be read!`;
    } else if (minLength !== null && minLength !== undefined && input.length < minLength) {
      console.error('Text input too short!');
      error = `Value should be longer than ${minLength}!`;
    } else if (maxLength !== null && maxLength !== undefined && input.length > maxLength) {
      console.error('Text input too long!');
      error = `Value should be shorter than ${maxLength}!`;
    }
    return error;
  }

  const updateData = (event) => {
    let newValue = event.target.value;
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    setText(event.target.value);
    setTypingTimeout(setTimeout(() => onChange(path, newValue), TIMEOUT_VALUE));
  }

  const error = useMemo(
    () => validateInput(value), 
    [value]
  );

  return (
    <TextField 
        className={classes.input}
        error={error ? true : false}
        helperText={error}
        type='text'
        variant='outlined'
        value={text}
        onChange={updateData}
      />
  );
}

function FloatInput({ onChange, path, value, minValue, maxValue, required }) {
  const classes = useStyles();
  const [float, setFloat] = useState(value);
  const [typingTimeout, setTypingTimeout] = useState('');

  const validateInput = (input) => {
    let error = '';
    if (required && (input === null || input === undefined || input.length === 0)) {
      console.error('No float input!');
      error = `A value is required!`;
    } else if (minValue !== null && minValue !== undefined && input < minValue) {
      console.error('Float input too small!');
      error = `Value should be greater than ${minValue}!`;
    } else if (maxValue !== null && maxValue !== undefined && input > maxValue) {
      console.error('Float input too big!');
      error = `Value should be smaller than ${maxValue}!`;
    }
    return error;
  }

  const updateData = (event) => {
    let newValue = event.target.value ? parseFloat(event.target.value) : 0;
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    setFloat(event.target.value);
    setTypingTimeout(setTimeout(() => onChange(path, newValue), TIMEOUT_VALUE))
  }

  const error = useMemo(
    () => validateInput(value),
    [value]
  );

  return (
    <TextField 
      className={classes.input}
      type='number'
      variant='outlined'
      error={error ? true : false}
      helperText={error}
      value={float}
      onChange={updateData}
      inputProps={{ min: minValue, max: maxValue }}
    />
  );
}

function IntegerInput({ onChange, path, value, minValue, maxValue, required }) {
  const classes = useStyles();
  const [integer, setInteger] = useState(value);
  const [typingTimeout, setTypingTimeout] = useState('');

  const validateInput = (input) => {
    let error = '';
    if (required && (input === null || input === undefined || input.length === 0)) {
      console.error('No integer input!');
      error = `A value is required!`;
    } else if (minValue !== null && minValue !== undefined && input < minValue) {
      console.error('Integer input too small!');
      error = `Value should be greater than ${minValue}!`;
    } else if (maxValue !== null && maxValue !== undefined && input > maxValue) {
      console.error('Integer input too big!');
      error = `Value should be smaller than ${maxValue}!`;
    }
    return error;
  };

  const updateData = (event) => {
    let newValue = event.target.value ? parseInt(event.target.value) : 0;
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    setInteger(event.target.value);
    setTypingTimeout(setTimeout(() => onChange(path, newValue), TIMEOUT_VALUE));
  };

  const error = useMemo(
    () => validateInput(value),
    [value]
  );

  return (
    <TextField 
      className={classes.input}
      type='number'
      variant='outlined'
      error={error ? true : false}
      helperText={error}
      value={integer}
      onChange={updateData}
      inputProps={{ min: minValue, max: maxValue }}
    />
  );
}

export {
  BooleanInput,
  SelectInput,
  TextInput,
  FloatInput,
  IntegerInput,
}