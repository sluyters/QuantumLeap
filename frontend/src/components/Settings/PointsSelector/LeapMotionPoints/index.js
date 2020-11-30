import React from 'react';
import { Box, Checkbox } from '@material-ui/core'; 
import { withStyles } from '@material-ui/core/styles';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import CircleCheckedFilled from '@material-ui/icons/CheckCircle';
import { ReactComponent as LeapHands } from './hands.svg';

const styles = (theme) => ({
  root: {
    width: '100%',
    position: 'relative',
    backgroundColor: 'rgb(150, 150, 150)',
    paddingTop: '30px',
    boxSizing: 'border-box',
  },
  container: {
    width: '100%',
    position: 'relative',
  },
  image: {
    color: 'white',
    verticalAlign: 'top',
  },
  checkboxes: {
    position: 'absolute',
    fontSize: '2em',
    transform: 'translate(-50%, -50%)'
  },
});

class LeapMotionPoints extends React.Component {
  render() {
    const { classes, selectedJoints, onSelect, onDeselect } = this.props;
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
          {/* Left hand */}
          {/* Palm */}
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftPalmPosition' x={24} y={44} onToggle={clickHandler}/>
          {/* Tips */}
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftPinkyTipPosition' x={9} y={17} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftRingTipPosition' x={20} y={6} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftMiddleTipPosition' x={28.5} y={1.5} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftIndexTipPosition' x={36.2} y={8} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftThumbTipPosition' x={45} y={43.5} onToggle={clickHandler}/>
          {/* Pips */}
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftPinkyPipPosition' x={13.2} y={29} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftRingPipPosition' x={20.2} y={21} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftMiddlePipPosition' x={27.1} y={18} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftIndexPipPosition' x={33.9} y={21} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftThumbPipPosition' x={37} y={50.7} onToggle={clickHandler}/>
          {/* Mcps */}
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftPinkyMcpPosition' x={16.5} y={36.5} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftRingMcpPosition' x={21} y={32} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftMiddleMcpPosition' x={26} y={30} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftIndexMcpPosition' x={31.2} y={31.5} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftThumbMcpPosition' x={30} y={54} onToggle={clickHandler}/>

          {/* Right hand */}
          {/* Palm */}
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightPalmPosition' x={76} y={44} onToggle={clickHandler}/>
          {/* Tips */}
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightPinkyTipPosition' x={91} y={17} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightRingTipPosition' x={80} y={6} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightMiddleTipPosition' x={71.5} y={1.5} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightIndexTipPosition' x={63.8} y={8} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightThumbTipPosition' x={55} y={43.5} onToggle={clickHandler}/>
          {/* Pips */}
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightPinkyPipPosition' x={86.8} y={29} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightRingPipPosition' x={79.8} y={21} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightMiddlePipPosition' x={72.9} y={18} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightIndexPipPosition' x={66.1} y={21} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightThumbPipPosition' x={63} y={50.7} onToggle={clickHandler}/>
          {/* Mcps */}
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightPinkyMcpPosition' x={83.5} y={36.5} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightRingMcpPosition' x={79} y={32} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightMiddleMcpPosition' x={74} y={30} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightIndexMcpPosition' x={68.8} y={31.5} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightThumbMcpPosition' x={70} y={54} onToggle={clickHandler}/>

          <LeapHands fill='currentColor' className={classes.image}/>
        </div>
      </div>
    );
  }
}

function CustomCheckbox({classes, selectedJoints, joint, x, y, onToggle}) {
  return (
    <Checkbox 
      className={classes.checkboxes} 
      onClick={(event) => onToggle(event.target.checked, joint)}
      checked={selectedJoints.indexOf(joint) !== -1}
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