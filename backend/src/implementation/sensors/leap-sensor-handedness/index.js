const AbstractSensor = require('../../../framework/modules/sensors/abstract-sensor').AbstractSensor
const Point = require('../../../framework/gestures/point').Point3D;
const Leap = require('leapjs');

const fingerNames = ["Thumb", "Index", "Middle", "Ring", "Pinky"];
const fingerArticulations = ["Mcp", "Pip", "Tip"];

class Sensor extends AbstractSensor {
  constructor(options) {
    super("Leap-Interface");
    this.controller = new Leap.Controller({
      frameEventName: 'deviceFrame',
      loopWhileDisconnected: false
    });
    this.switchHandedness = options.switchHandedness;
  }

  getPoints(timestamp) {
    let hasLeftHand, hasRightHand = false;
    let frame = this.controller.frame();
    let points = [];
    let fingers = [];
    // Get points
    for (const hand of frame.hands) {
      if (hand.valid) {
        // Switch handedness if required 
        if (this.switchHandedness) {
          if (hand.type === 'right') {
            hand.type = 'left';
          } else {
            hand.type = 'right';
          }
        }
        // Check if a hand is visible
        hasRightHand = hasRightHand || hand.type === 'right';
        hasLeftHand = hasLeftHand || hand.type === 'left';
        // Palm positions
        points.push({
          name: hand.type === 'right' ? 'rightPalmPosition' : 'leftPalmPosition',
          point: new Point(...addHandedness(this.switchHandedness, hand.palmPosition), timestamp)
        });
        // Finger positions
        hand.fingers.forEach((finger) => {
          // Get data usable by the application
          let position = finger.stabilizedTipPosition;
          let normalized = frame.interactionBox.normalizePoint(position);
          fingers.push({
            'hand': hand.type,
            'type': finger.type,
            'normalizedPosition': normalized,
            'touchDistance': finger.touchDistance,
            'tipVelocity': finger.tipVelocity
          });
          // Get data for each articulation of each finger
          for (const fingerArticulation of fingerArticulations) {
            points.push({
              name: `${hand.type}${fingerNames[finger.type]}${fingerArticulation}Position`,
              point: new Point(...addHandedness(this.switchHandedness, finger[`${fingerArticulation.toLowerCase()}Position`]), timestamp)
            });
          }
        });
      }
    }
    // Add missing points
    const addMissingPoints = (type) => {
      let valueMissing = Number.MIN_SAFE_INTEGER;
      let palmName = `${type}PalmPosition`;
      points.push({
        name: palmName,
        point: new Point(valueMissing, valueMissing, valueMissing, timestamp)
      });
      for (const fingerName of fingerNames) {
        for (const fingerArticulation of fingerArticulations) {
          points.push({
            name: `${type}${fingerName}${fingerArticulation}Position`,
            point: new Point(valueMissing, valueMissing, valueMissing, timestamp)
          });
        }
      }
    }
    if (!hasRightHand) {
      addMissingPoints('right');
    }
    if (!hasLeftHand) {
      addMissingPoints('left');
    }
    // TODO find better method to send app data
    let appData = {
      fingers: fingers
    };
    return { 
      hasData: hasLeftHand || hasRightHand,
      points: points,
      appData: appData
    };
  }

  connect() {
    this.controller.connect();
  }

  disconnect() {
    this.controller.disconnect();
  }
}

function addHandedness(switchHandedness, coordinates) {
  if (switchHandedness) {
    coordinates[0] = - coordinates[0]; 
  }
  return coordinates;
}

module.exports = Sensor;