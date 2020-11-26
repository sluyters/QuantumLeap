const AbstractSensor = require('../../../framework/sensors/abstract-sensor').AbstractSensor
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
    })
  }

  getPoints(timestamp) {
    let hasLeftHand, hasRightHand = false;
    let frame = this.controller.frame();
    let points = [];
    // Get points
    for (const hand of frame.hands) {
      // Check if a hand is visible
      hasRightHand = hasRightHand || hand.type === 'right';
      hasLeftHand = hasLeftHand || hand.type === 'left';
      // Palm positions
      points.push({
        name: hand.type === 'right' ? 'rightPalmPosition' : 'leftPalmPosition',
        point: new Point(...hand.palmPosition, timestamp)
      });
      // Finger positions
      hand.fingers.forEach((finger) => {
        for (const fingerArticulation of fingerArticulations) {
          points.push({
            name: `${hand.type}${fingerNames[finger.type]}${fingerArticulation}Position`,
            point: new Point(...finger[`${fingerArticulation.toLowerCase()}Position`], timestamp)
          })
        }
      });
    }
    // Add missing points
    const addMissingPoints = (type) => {
      let palmName = `${type}PalmPosition`;
      points.push({
        name: palmName,
        point: new Point(0.0, 0.0, 0.0, timestamp)
      });
      for (const fingerName of fingerNames) {
        for (const fingerArticulation of fingerArticulations) {
          points.push({
            name: `${type}${fingerName}${fingerArticulation}Position`,
            point: new Point(0.0, 0.0, 0.0, timestamp)
          });
        }
      }
    }
    if (!hasRightHand) {
      addMissingPoints('right');
    }
    if (!hasRightHand) {
      addMissingPoints('left');
    }
    return { 
      hasData: hasLeftHand || hasRightHand,
      points: points
    };
  }

  connect() {
    this.controller.connect()
  }

  disconnect() {
    this.controller.disconnect();
  }
}

module.exports = Sensor;