import React from 'react';
import { Box, Checkbox } from '@material-ui/core'; 
import { withStyles } from '@material-ui/core/styles';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import CircleCheckedFilled from '@material-ui/icons/CheckCircle';
import { ReactComponent as LeapHands } from './hands.svg';
import { ReactComponent as LeapBones } from './handsbones.svg';

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
  imageBones: {
    position: 'absolute',
    color: 'rgb(220, 220, 220)',
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
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftPinkyTipPosition' x={9} y={17.6} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftRingTipPosition' x={20} y={6.6} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftMiddleTipPosition' x={28.5} y={2} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftIndexTipPosition' x={36.1} y={8.8} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftThumbTipPosition' x={45} y={43.5} onToggle={clickHandler}/>
          {/* Pips */}
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftPinkyPipPosition' x={12.7} y={28.5} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftRingPipPosition' x={20.2} y={21} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftMiddlePipPosition' x={27.2} y={16.8} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftIndexPipPosition' x={33.7} y={21.7} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftThumbPipPosition' x={36.5} y={51} onToggle={clickHandler}/>
          {/* Mcps */}
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftPinkyMcpPosition' x={16.5} y={37.8} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftRingMcpPosition' x={21} y={35.1} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftMiddleMcpPosition' x={25.6} y={31.7} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftIndexMcpPosition' x={30.3} y={33.9} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='leftThumbMcpPosition' x={30} y={58.5} onToggle={clickHandler}/>

          {/* Right hand */}
          {/* Palm */}
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightPalmPosition' x={76} y={44} onToggle={clickHandler}/>
          {/* Tips */}
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightPinkyTipPosition' x={91} y={17.6} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightRingTipPosition' x={80} y={6.6} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightMiddleTipPosition' x={71.5} y={2} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightIndexTipPosition' x={63.9} y={8.8} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightThumbTipPosition' x={55} y={43.5} onToggle={clickHandler}/>
          {/* Pips */}
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightPinkyPipPosition' x={87.3} y={28.5} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightRingPipPosition' x={79.8} y={21} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightMiddlePipPosition' x={72.8} y={16.8} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightIndexPipPosition' x={66.3} y={21.7} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightThumbPipPosition' x={63.5} y={51} onToggle={clickHandler}/>
          {/* Mcps */}
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightPinkyMcpPosition' x={83.5} y={37.8} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightRingMcpPosition' x={79} y={35.1} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightMiddleMcpPosition' x={74.4} y={31.7} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightIndexMcpPosition' x={69.7} y={33.9} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} joint='rightThumbMcpPosition' x={70} y={58.5} onToggle={clickHandler}/>
          
          <LeapBones fill='currentColor' className={classes.imageBones}/>
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