const path = require('path');
const fs = require('fs');

const GestureSet = require('../../../framework/gestures/gesture-set').GestureSet;
const GestureClass = require('../../../framework/gestures/gesture-class').GestureClass;
const PoseData = require('../../../framework/gestures/pose-data').PoseData;
const { Frame, Articulation } = require('../../../framework/frames/frame');
const Point = require('../../../framework/gestures/point').Point3D;

const fingerNames = ["Thumb", "Index", "Middle", "Ring", "Pinky"];
const fingerArticulations = ["Mcp", "Pip", "Tip"];

function loadDataset(name, datasetPath, identifier, sensorPointsNames) {
    let gestureSet = new GestureSet(name);
    let dirPath = datasetPath;
    let gestureIndex = 0;
    fs.readdirSync(dirPath, { withFileTypes: true }).filter(dirent => !dirent.isFile()).map(dirent => dirent.name).forEach((gesture) => {
        let gestureDirPath = path.join(dirPath, gesture);
        let gestureClass = new GestureClass(gesture, gestureIndex);
        gestureSet.addGestureClass(gestureClass);
        fs.readdirSync(gestureDirPath).forEach((user) => {
            let userDirPath = path.join(gestureDirPath, user);
            fs.readdirSync(userDirPath).forEach((file) => {
                let rawGesturePath = path.join(userDirPath, file);
                let parsedFile = JSON.parse(fs.readFileSync(rawGesturePath));
                let id = 0;
                for (const frame of parsedFile.data) {
                    let parsedFrame = parseFrame(frame, identifier);
                    let poseData = new PoseData(parseInt(user), id, parsedFrame, undefined);
                    gestureClass.addSample(poseData);
                    id++;
                }
            });
        });
        gestureIndex += 1;
    });
    return gestureSet;
}

function parseFrame(frame, identifier) {
    let parsedFrame = new Frame(frame.id);
    let rightHandId = -1;
    // Add palms
    for (const hand of frame.hands) {
        // Save id of right hand
        if (hand.type === "right") {
            rightHandId = hand.id;
        }
        let label = addIdentifier(`${hand.type}PalmPosition`, identifier);
        let position = new Point(...hand.palmPosition);
        let articulation = new Articulation(label, position);
        parsedFrame.addArticulation(articulation);
    }
    // Add fingers
    for (const pointable of frame.pointables) {
        if (!pointable.tool) {
            for (const fingerArticulation of fingerArticulations) {
                // Get label (e.g., rightIndexPipPosition)
                let side = pointable.handId == rightHandId ? "right" : "left";
                let label = addIdentifier(`${side}${fingerNames[pointable.type]}${fingerArticulation}Position`, identifier);
                let position = new Point(...pointable[`${fingerArticulation.toLowerCase()}Position`]);
                let articulation = new Articulation(label, position);
                parsedFrame.addArticulation(articulation);
            }
        }
    }
    return parsedFrame;
}

function addIdentifier(name, identifier) {
    return identifier ? `${name}_${identifier}` : name;
}

module.exports = {
    loadDataset
}