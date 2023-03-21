const AbstractSensor = require('../../../framework/modules/sensors/abstract-sensor').AbstractSensor
const Point = require('../../../framework/gestures/point').Point3D;
const Leap = require('leapjs');
const LogHelper = require('../../../framework/log-helper');

const fingerNames = ["Thumb", "Index", "Middle", "Ring", "Pinky"];
const fingerJoints = ["Carp", "Mcp", "Pip", "Dip", "Tip"];

class Sensor extends AbstractSensor {
  constructor(options) {
    super("Leap-Interface");
    this.controller = new Leap.Controller({
      frameEventName: 'deviceFrame',
      loopWhileDisconnected: false
    });
  }

  getPoints(timestamp) {
    let hasLeftHand, hasRightHand = false;
    let frame = {};
    try {
      frame = this.controller.frame();
    } catch (err) {
      LogHelper.log('error', `Failed to retrieve LMC frame: ${err}`);
      return { 
        hasData: false,
        points: [],
        appData: {}
      };
    }
    
    let points = [];
    let fingers = [];
    let rawFrame = {
      timestamp: timestamp,
      hands: [],
    };
    // Get points
    frame.hands.forEach((hand) => {
      if (hand.valid) {
        let rawHand = {
          type: hand.type,
          palm: {},
          fingers: [],
        };
        // Check if a hand is visible
        hasRightHand = hasRightHand || hand.type === 'right';
        hasLeftHand = hasLeftHand || hand.type === 'left';
        // Palm positions
        points.push({
          name: hand.type === 'right' ? 'rightPalmPosition' : 'leftPalmPosition',
          point: new Point(...hand.palmPosition, timestamp)
        });
        rawHand.palm = {
          name: 'palm',
          position: hand.palmPosition,
          normalizedPosition: frame.interactionBox.normalizePoint(hand.palmPosition),
        };
        // Finger positions
        hand.fingers.forEach((finger) => {
          let rawFinger = {
            type: fingerNames[finger.type],
            joints: [],
          };
          // Get data usable by the application
          let position = finger.stabilizedTipPosition;
          let normalized = frame.interactionBox.normalizePoint(position);
          fingers.push({
            hand: hand.type,
            type: finger.type,
            normalizedPosition: normalized,
            touchDistance: finger.touchDistance,
            tipVelocity: finger.tipVelocity
          });
          // Get data for each joint of each finger
          for (const fingerJoint of fingerJoints) {
            points.push({
              name: `${hand.type}${fingerNames[finger.type]}${fingerJoint}Position`,
              point: new Point(...finger[`${fingerJoint.toLowerCase()}Position`], timestamp)
            });
            rawFinger.joints.push({
              name: fingerJoint,
              position: finger[`${fingerJoint.toLowerCase()}Position`],
              normalizedPosition: frame.interactionBox.normalizePoint(finger[`${fingerJoint.toLowerCase()}Position`]),
            });
          }
          rawHand.fingers.push(rawFinger);
        });
        rawFrame.hands.push(rawHand);
      }
    });
    // Add missing points
    const addMissingPoints = (type) => {
      let valueMissing = Number.MIN_SAFE_INTEGER;
      let palmName = `${type}PalmPosition`;
      points.push({
        name: palmName,
        point: new Point(valueMissing, valueMissing, valueMissing, timestamp)
      });
      for (const fingerName of fingerNames) {
        for (const fingerJoint of fingerJoints) {
          points.push({
            name: `${type}${fingerName}${fingerJoint}Position`,
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
      sensor: 'Leap Motion Controller',
      fingers: fingers,
      rawFrame: rawFrame
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

module.exports = Sensor;