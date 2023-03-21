const fs = require('fs');
const path = require('path');

const GestureSet = require('../../../../framework/gestures/gesture-set').GestureSet;
const GestureClass = require('../../../../framework/gestures/gesture-class').GestureClass;
const StrokeData = require('../../../../framework/gestures/stroke-data').StrokeData;
const Stroke = require('../../../../framework/gestures/stroke-data').Stroke;
const Path = require('../../../../framework/gestures/stroke-data').Path;
const Point = require('../../../../framework/gestures/point').Point3D;

const fingerNames = ["Thumb", "Index", "Middle", "Ring", "Pinky"];
const fingerArticulations = ["Mcp", "Pip", "Tip"];

const device = {
    'osBrowserInfo': 'Leap Motion Controller', 'resolutionHeight': null,
    'resolutionWidth': null, 'windowHeight': null, 'windowWidth': null,
    'pixelRatio': null, 'mouse': false, 'pen': false, 'finger': false,
    'acceleration': false, 'webcam': true
};

function loadDataset(name, datasetPath, sensorId, datasetId, sensorPointsNames) {
    let gestureSet = new GestureSet(name);
    let dirPath = datasetPath;
    let gestureIndex = 0;
    fs.readdirSync(dirPath, { withFileTypes: true }).filter(dirent => !dirent.isFile()).map(dirent => dirent.name).forEach((user_dir) => {
        let gestureSampleDirPath = path.join(dirPath, user_dir);
        fs.readdirSync(gestureSampleDirPath).forEach((sample) => {
            let rawGesturePath = path.join(gestureSampleDirPath, sample);
            try {
                var rawGestureData = JSON.parse(fs.readFileSync(rawGesturePath));
            } catch(err) {
                console.error(`Gesture path: "${rawGesturePath}".`);
                throw Error(err);
            }
            

            let filename = sample.split(".")[0].split("-");
            let gestureName = addIdentifier(filename[0].split("#")[0], datasetId);
            let infosupp = undefined;
            if (filename[0].split("#").length > 1) {
                infosupp = filename[0].split("#")[1];
            }
            let id = filename[1];

            let gestureData = new StrokeData(user_dir, id, infosupp);
            if (gestureSet.getGestureClasses().has(gestureName)) {
                gestureSet.getGestureClasses().get(gestureName).addSample(gestureData);
            } else {
                let gestureClass = new GestureClass(gestureName, gestureIndex);
                gestureIndex += 1;
                gestureClass.addSample(gestureData);
                gestureSet.addGestureClass(gestureClass);
            }
            // Init stroke paths
            for (const side of ["left", "right"]) {
                let label = addIdentifier(`${side}PalmPosition`, sensorId);
                let strokePath = new Path(label);
                gestureData.addPath(label, strokePath);
                let stroke = new Stroke(0);
                strokePath.addStroke(stroke);
                for (const fingerName of fingerNames) {
                    for (const fingerArticulation of fingerArticulations) {
                        let label = addIdentifier(`${side}${fingerName}${fingerArticulation}Position`, sensorId);
                        let strokePath = new Path(label);
                        gestureData.addPath(label, strokePath);
                        let stroke = new Stroke(0);
                        strokePath.addStroke(stroke);
                    }
                }
            }
            for (let i = 0; i < rawGestureData['data'].length; i++) {
                let frame = rawGestureData['data'][i];
                let points = {};
                for (const side of ["left", "right"]) {
                    points[`${side}PalmPosition`] = null;
                    for (const fingerName of fingerNames) {
                        for (const fingerArticulation of fingerArticulations) {
                            let label = `${side}${fingerName}${fingerArticulation}Position`;
                            points[label] = null;
                        }
                    }
                }
                let rightHandId = -1;
                let leftHandId = -1;
                for (const hand of frame['hands']) {
                    let palmName;
                    if (hand['type'] === 'right') {
                        rightHandId = hand['id'];
                        palmName = "rightPalmPosition";
                    }
                    else {
                        leftHandId = hand['id'];
                        palmName = "leftPalmPosition";
                    }
                    let palmPosition = hand['palmPosition'];
                    points[palmName] = new Point(palmPosition[0], palmPosition[1], palmPosition[2], frame['timestamp']);
                }
                for (const pointable of frame.pointables) {
                    if (!pointable.tool) {
                        for (const fingerArticulation of fingerArticulations) {
                            // Get label (e.g., rightIndexTipPosition)
                            let side = pointable.handId == rightHandId ? "right" : "left";
                            let label = `${side}${fingerNames[pointable.type]}${fingerArticulation}Position`;
                            let position = pointable[`${fingerArticulation.toLowerCase()}Position`];
                            points[label] = new Point(position[0], position[1], position[2], frame.timestamp);
                        }
                    }
                }
                // Add points to paths (with default point w/ coordinates (x=0, y=0, z=0))
                Object.keys(points).forEach((articulation) => {
                    let pathName = addIdentifier(articulation, sensorId);
                    let stroke = gestureData.paths[pathName].strokes[0];
                    if (points[articulation] === null) {
                        // Default coordinates
                        stroke.addPoint(new Point(0, 0, 0, frame['timestamp']));
                    } else {
                        // Coordinates from frame
                        stroke.addPoint(points[articulation]);
                    }
                });
            }
        });
    });
    return gestureSet;
}

function addIdentifier(name, identifier) {
    return identifier ? `${name}_${identifier}` : name;
}

module.exports = {
    loadDataset
};