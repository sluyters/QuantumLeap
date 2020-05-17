const fs = require('fs');
const path = require('path');

const GestureSet = require('../../framework/gestures/gesture-set').GestureSet;
const GestureClass = require('../../framework/gestures/gesture-class').GestureClass;
const StrokeData = require('../../framework/gestures/stroke-data').StrokeData;
const Stroke = require('../../framework/gestures/stroke-data').Stroke;
const Path = require('../../framework/gestures/stroke-data').Path;
const Point = require('../../framework/gestures/point').Point3D;
const UnifiedDatasetLoader = require('../../framework/datasets/UnifiedDatasetLoader');

const palms = ["rightPalmPosition", "leftPalmPosition"];
const fingers = ["rightThumbPosition", "rightIndexPosition", "rightMiddlePosition", "rightRingPosition", "rightPinkyPosition", "leftThumbPosition", "leftIndexPosition", "leftMiddlePosition", "leftRingPosition", "leftPinkyPosition"];

const device = {
    'osBrowserInfo': 'Leap Motion Controller', 'resolutionHeight': null,
    'resolutionWidth': null, 'windowHeight': null, 'windowWidth': null,
    'pixelRatio': null, 'mouse': false, 'pen': false, 'finger': false,
    'acceleration': false, 'webcam': true
};

function loadDataset(name, directory) {
    let gestureSet = new GestureSet(name);
    let gestureIndex = 0;
    fs.readdirSync(directory).forEach((user_dir) => {
        let gestureSampleDirPath = path.join(directory, user_dir);
        fs.readdirSync(gestureSampleDirPath).forEach((sample) => {
            let rawGesturePath = path.join(gestureSampleDirPath, sample);
            let rawGestureData = JSON.parse(fs.readFileSync(rawGesturePath));

            let gesture = sample.split(".")[0].split("-");
            let gestureName = gesture[0].split("#")[0];
            let infosupp = undefined;
            if (gesture[0].split("#").length > 1) {
                infosupp = gesture[0].split("#")[1];
            }
            let id = gesture[1];

            let gestureData = new StrokeData(parseInt(user_dir), id, infosupp);
            if (gestureSet.getGestureClasses().has(gestureName)) {
                gestureSet.getGestureClasses().get(gestureName).addSample(gestureData);
            } else {
                let gestureClass = new GestureClass(gestureName, gestureIndex);
                gestureIndex += 1;
                gestureClass.addSample(gestureData);
                gestureSet.addGestureClass(gestureClass);
            }

            // Init stroke paths
            fingers.forEach((fingerName) => {
                let strokePath = new Path(fingerName);
                gestureData.addPath(fingerName, strokePath);
                let stroke = new Stroke(0);
                strokePath.addStroke(stroke);
            });
            for (const palm of palms) {
                let strokePath = new Path(palm);
                gestureData.addPath(palm, strokePath);
                let stroke = new Stroke(0);
                strokePath.addStroke(stroke);
            }


            for (let i = 0; i < rawGestureData['data'].length; i++) {
                let frame = rawGestureData['data'][i];

                let points = {};
                for (const palm of palms) {
                    points[palm] = null;
                }
                for (const finger of fingers) {
                    points[finger] = null;
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

                for (const pointable of frame['pointables']) {
                    if (!pointable.tool) {
                        // Get the name of the finger from handId and type
                        let fingerName = getFingerName(pointable.handId == rightHandId, pointable.type);
                        let tipPosition = pointable['tipPosition'];
                        points[fingerName] = new Point(tipPosition[0], tipPosition[1], tipPosition[2], frame['timestamp']);
                    }
                }

                // Add points to paths (with default point w/ coordinates (x=0, y=0, z=0))
                Object.keys(points).forEach((articulation) => {
                    let stroke = gestureData.paths[articulation].strokes[0];
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

function getFingerName(isRight, type) {
    if (isRight) {
        return fingers[type];
    } else {
        return fingers[5 + type];
    }
}


if (require.main === module) {
    const dirPath = path.join(__dirname, '../../datasets', 'guinevere');
    const convertedPath = path.join(__dirname, '../../datasets', 'guinevere_unified');

    let dataset = loadDataset("guinevere_unified", dirPath);
    UnifiedDatasetLoader.writeDataset(dataset, convertedPath);
}