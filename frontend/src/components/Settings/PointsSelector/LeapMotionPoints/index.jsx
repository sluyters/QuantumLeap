import React from 'react';
import { Checkbox } from '@material-ui/core'; 
import { withStyles } from '@material-ui/core/styles';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import LeapHands from './LeapHands.jsx';
import LeapBones from './LeapBones.jsx';

const styles = (theme) => ({
  root: {
    width: '100%',
    position: 'relative',
    // backgroundColor: 'rgb(150, 150, 150)',
    backgroundColor: theme.palette.background.default,
    paddingTop: '30px',
    boxSizing: 'border-box',
  },
  container: {
    width: '100%',
    position: 'relative',
  },
  image: {
    color: theme.palette.action.selected,
    verticalAlign: 'top',
  },
  imageBones: {
    position: 'absolute',
    color: theme.palette.action.disabled,
    // color: 'rgb(220, 220, 220)',
    verticalAlign: 'top',
    zIndex: 0
  },
  checkboxes: {
    position: 'absolute',
    fontSize: '2em',
    transform: 'translate(-50%, -50%)',
    zIndex: 1
  },
});

const HAND_JOINT_COORDINATES = [
  // Left hand
  // Palm
  { name: 'leftPalmPosition', x: 24, y: 44 },
  // Tips
  { name: 'leftPinkyTipPosition', x: 9, y: 17.6 },
  { name: 'leftRingTipPosition', x: 20, y: 6.6 },
  { name: 'leftMiddleTipPosition', x: 28.5, y: 2 },
  { name: 'leftIndexTipPosition', x: 36.1, y: 8.8 },
  { name: 'leftThumbTipPosition', x: 45, y: 43.5 },
  // Pips
  { name: 'leftPinkyPipPosition', x: 12.7, y: 28.5 },
  { name: 'leftRingPipPosition', x: 20.2, y: 21 },
  { name: 'leftMiddlePipPosition', x: 27.2, y: 16.8 },
  { name: 'leftIndexPipPosition', x: 33.7, y: 21.7 },
  { name: 'leftThumbPipPosition', x: 36.5, y: 51 },
  // Mcps
  { name: 'leftPinkyMcpPosition', x: 16.5, y: 37.8 },
  { name: 'leftRingMcpPosition', x: 21, y: 35.1 },
  { name: 'leftMiddleMcpPosition', x: 25.6, y: 31.7 },
  { name: 'leftIndexMcpPosition', x: 30.3, y: 33.9 },
  { name: 'leftThumbMcpPosition', x: 30, y: 58.5 },
  // Right hand
  // Palm
  { name: 'rightPalmPosition', x: 76, y: 44 },
  // Tips
  { name: 'rightPinkyTipPosition', x: 91, y: 17.6 },
  { name: 'rightRingTipPosition', x: 80, y: 6.6 },
  { name: 'rightMiddleTipPosition', x: 71.5, y: 2 },
  { name: 'rightIndexTipPosition', x: 63.9, y: 8.8 },
  { name: 'rightThumbTipPosition', x: 55, y: 43.5 },
  // Pips
  { name: 'rightPinkyPipPosition', x: 87.3, y: 28.5 },
  { name: 'rightRingPipPosition', x: 79.8, y: 21 },
  { name: 'rightMiddlePipPosition', x: 72.8, y: 16.8 },
  { name: 'rightIndexPipPosition', x: 66.3, y: 21.7 },
  { name: 'rightThumbPipPosition', x: 63.5, y: 51 },
  // Mcps
  { name: 'rightPinkyMcpPosition', x: 83.5, y: 37.8 },
  { name: 'rightRingMcpPosition', x: 79, y: 35.1 },
  { name: 'rightMiddleMcpPosition', x: 74.4, y: 31.7 },
  { name: 'rightIndexMcpPosition', x: 69.7, y: 33.9 },
  { name: 'rightThumbMcpPosition', x: 70, y: 58.5 },
];

class LeapMotionPoints extends React.Component {
  render() {
    const { classes, selectedPoints, onSelect, onDeselect } = this.props;
    const clickHandler = function(selected, jointName) {
      if (selected) {
        onSelect([jointName]);
      } else {
        onDeselect([jointName]);
      }
    };
    return (
      <div className={classes.root}>
        <div className={classes.container}>
          {HAND_JOINT_COORDINATES.map((joint, index) => <CustomCheckbox classes={classes} selectedPoints={selectedPoints} joint={joint.name} x={joint.x} y={joint.y} onToggle={clickHandler} key={index} />)}        
          <LeapBones fill='currentColor' className={classes.imageBones}/>
          <LeapHands fill='currentColor' className={classes.image}/>
        </div>
      </div>
    );
  }
}

function CustomCheckbox({classes, selectedPoints, joint, x, y, onToggle}) {
  return (
    <Checkbox 
      className={classes.checkboxes} 
      onClick={(event) => onToggle(event.target.checked, joint)}
      checked={selectedPoints.indexOf(joint) !== -1}
      disableRipple
      size='small'
      color='primary' 
      icon={<RadioButtonUncheckedIcon />}
      checkedIcon={<RadioButtonCheckedIcon />} 
      style={{ left: `${x}%`, top: `${y}%` }} 
    />
  )
}

export default withStyles(styles)(LeapMotionPoints);