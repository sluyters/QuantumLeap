import { FormControl, Select } from '@material-ui/core';

function ValueSelection(props) {
  const { value, choices, path, handleChange } = props;
  return (
    <FormControl variant="outlined">
      <Select
        native
        value={value}
        onChange={(event) => handleChange(path, event.target.value)}
      >
        {choices.map((choice) => (
          <option value={choice}>
            {choice}
          </option>
        ))}
      </Select>
    </FormControl>
  );
}

export default ValueSelection;