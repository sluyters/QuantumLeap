const AbstractSensor = require('../../../framework/modules/sensors/abstract-sensor').AbstractSensor
const Point = require('../../../framework/gestures/point').Point3D;
const WebSocket = require('ws');

const fingerNames = ["Thumb", "Index", "Middle", "Ring", "Pinky"];
const fingerArticulations = ["Mcp", "Pip", "Tip"];
const interactionBox = [
  [-100, 100],
  [200, 400],
  [-150, 80]
];

class Sensor extends AbstractSensor {
  constructor(options) {
    super("LeapV5");
    this.ws = undefined;
    this.lastFrame = undefined;
  }

  getPoints(timestamp) {
    let hasLeftHand, hasRightHand = false;
    let frame = this.lastFrame;
    let points = [];
    let fingers = [];
    // Get points
    if (frame !== undefined) {
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
        frame.pointables.forEach((pointable) => {
          // Get data usable by the application
          let position = pointable.tipPosition;
          let normalized = normalizePoint(position);
          fingers.push({
            'type': pointable.type,
            'normalizedPosition': normalized,
            'touchDistance': 0.5,//finger.touchDistance,
            'tipVelocity': [0,0,0]//finger.tipVelocity
          });
          // Get data for each articulation of each finger
          for (const fingerArticulation of fingerArticulations) {
            points.push({
              name: `${hand.type}${fingerNames[pointable.type]}${fingerArticulation}Position`,
              point: new Point(...pointable[`${fingerArticulation.toLowerCase()}Position`], timestamp)
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
      appData: appData,
    };
  }

  connect() {
    this.ws = new WebSocket("ws://localhost:6437/v7.json");
    this.ws.on('open', (event) => {
      // Receive messages even in background
      this.ws.send(JSON.stringify({background: true}))
    });
    this.ws.on('message', (event) => {
      let data = JSON.parse(event);
      if (data.hasOwnProperty('timestamp')) {
        // Get frame data
        this.lastFrame = data;
      }
    });
  }

  disconnect() {
    // this.controller.disconnect();
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
      this.lastFrame = undefined;
    }
  }
}

function normalizePoint(position) {
  const normalizeValue = (v, min, max) => {
    let nv = (v - min) / (max - min);
    if (nv > 1) {
      return 1.0;
    } else if (nv < 0) {
      return 0.0;
    } else {
      return nv;
    }
  }
  return position.map((value, index) => {
    return normalizeValue(value, interactionBox[index][0], interactionBox[index][1]);
  });
}

module.exports = Sensor;