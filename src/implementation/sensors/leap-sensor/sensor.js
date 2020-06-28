const AbstractSensor = require('../../../framework/sensors/abstract-sensor').AbstractSensor
const Point = require('../../../framework/gestures/point').Point3D;
const { Frame, Articulation } = require('../../../framework/frames/frame');
const Leap = require('leapjs');

const rArticulations = ["rightPalmPosition", "rightThumbPosition", "rightIndexPosition", "rightMiddlePosition", "rightRingPosition", "rightPinkyPosition"];
const lArticulations = ["leftPalmPosition", "leftThumbPosition", "leftIndexPosition", "leftMiddlePosition", "leftRingPosition", "leftPinkyPosition"];

class Sensor extends AbstractSensor {
    constructor(options) {
        super("Leap-Interface");
        this.framerate = options.framerate;
        this.controller = new Leap.Controller({
            frameEventName: 'deviceFrame',
            loopWhileDisconnected: false
        })
        this.sensorLoop = null;
    }

    loop(callback) {
        this.controller.connect()
        this.callback = callback;

        let hadRightHand = false;

        let processLeapFrame = function () {
            let frame = this.controller.frame();
            let parsedFrame = new Frame(frame.timestamp);
            let fingers = [];
            // Palm positions
            for (const hand of frame.hands) {
                let palmName;
                if (hand.type === 'right') {
                    palmName = "rightPalmPosition";
                    hadRightHand = true;
                    parsedFrame.hasRightHand = true;
                }
                else {
                    palmName = "leftPalmPosition";
                    parsedFrame.hasLeftHand = true;
                }
                let palmPosition = hand.palmPosition;
                parsedFrame.articulations.push({ label: palmName, point: new Point(palmPosition[0], palmPosition[1], palmPosition[2], frame.timestamp) });                
                
                hand.fingers.forEach((finger) => {
                    if (hand.type === 'right') {
                        // Get data usable by the application
                        let position = finger.stabilizedTipPosition;
                        let normalized = frame.interactionBox.normalizePoint(position);
                        fingers.push({ 
                            'type': finger.type, 
                            'normalizedPosition': normalized, 
                            'touchDistance': finger.touchDistance, 
                            'tipVelocity': finger.tipVelocity 
                        });
                    }
                    let fingerName = getFingerName(hand.type === 'right', finger.type);
                    let tipPosition = finger.tipPosition;   
                    parsedFrame.addArticulation(new Articulation(fingerName, new Point(tipPosition[0], tipPosition[1], tipPosition[2], frame.timestamp)));
                });
            }
            // Add points if articulation not visible
            if (!parsedFrame.hasRightHand) {
                for (const articulation of rArticulations) {
                    parsedFrame.addArticulation(new Articulation(articulation, new Point(0.0, 0.0, 0.0, frame.timestamp)));
                }
            } 
            if (!parsedFrame.hasLeftHand) {
                for (const articulation of lArticulations) {
                    parsedFrame.addArticulation(new Articulation(articulation, new Point(0.0, 0.0, 0.0, frame.timestamp)));
                }
            }
            let appData = { 'fingers': fingers };
            // Callback only if a hand is visible
            if (parsedFrame.hasRightHand || parsedFrame.hasLeftHand) {
                callback(parsedFrame, appData);
            } else if (fingers.length == 0 && hadRightHand) {
                callback(parsedFrame, appData);
                hadRightHand = false;
            }
        }.bind(this);

        this.sensorLoop = setInterval(processLeapFrame, 1000/this.framerate);
    }

    stop() {
        if (this.sensorLoop !== null) {
            clearInterval(this.sensorLoop);
            this.controller.disconnect();
            this.sensorLoop = null;
        }
    }
}

function getFingerName(isRight, type) {
    if (isRight) {
        return rArticulations[type + 1];
    } else {
        return lArticulations[type + 1];
    }
}

module.exports = {
    Sensor
}