const path = require('path');
const fs = require('fs');

const GestureSet = require('../../../framework/gestures/gesture-set').GestureSet;
const GestureClass = require('../../../framework/gestures/gesture-class').GestureClass;
const { Frame, Articulation } = require('../../../framework/frames/frame');
const Point = require('../../../framework/gestures/point').Point3D;

const fingers = ["Thumb", "Index", "Middle", "Ring", "Pinky"]

function loadDataset(name, directory) {
    let gestureSet = new GestureSet(name);
    let dirPath = path.join(directory, name);
    let gestureIndex = 0;

    fs.readdirSync(dirPath).forEach((gesture) => {
        let gestureDirPath = path.join(dirPath, gesture);
        let gestureClass = new GestureClass(gesture, gestureIndex);
        gestureSet.addGestureClass(gestureClass);
        fs.readdirSync(gestureDirPath).forEach((user) => {
            let userDirPath = path.join(gestureDirPath, user);
            fs.readdirSync(userDirPath).forEach((file) => {
                let rawGesturePath = path.join(userDirPath, file);
                let parsedFile = JSON.parse(fs.readFileSync(rawGesturePath));
                for (const frame of parsedFile.data) {
                    let parsedFrame = parseFrame(frame);
                    gestureClass.addSample(parsedFrame);
                }
            });
        });
        gestureIndex += 1;
    });
    return gestureSet;
}

function parseFrame(frame) {
    let parsedFrame = new Frame(frame.id);
    let rightHandId = -1;
    // Add palms
    for (const hand of frame.hands) {
        // Save id of right hand
        if (hand.type === "right") {
            rightHandId = hand.id;
        }
        let label = getArticulationLabel(hand.type === "right", "Palm");
        let position = new Point(...hand.palmPosition);
        let articulation = new Articulation(label, position);
        parsedFrame.addArticulation(articulation);
    }
    // Add fingers
    for (const pointable of frame.pointables) {
        if (!pointable.tool) {
            let label = getArticulationLabel(pointable.handId == rightHandId, fingers[pointable.type]);
            let position = new Point(...pointable.tipPosition);
            let articulation = new Articulation(label, position);
            parsedFrame.addArticulation(articulation);
        }
    }
    return parsedFrame;
}

function getArticulationLabel(isRight, name) {
    return `${isRight ? "right" : "left"}${name}Position`;
}

module.exports = {
    loadDataset
}