const path = require('path');
const fs = require('fs');
const xml2js = require('xml2js');

const { Frame, Articulation } = require('../../../framework/frames/frame');
const GestureClass = require('../../../framework/gestures/gesture-class').GestureClass;
const GestureSet = require('../../../framework/gestures/gesture-set').GestureSet;
const PoseData = require('../../../framework/gestures/pose-data').PoseData;
const Point = require('../../../framework/gestures/point').Point3D;

const fingers = ["Thumb", "Index", "Middle", "Ring", "Pinky"];
//const classNames = ["C", "down", "fist_moved", "five", "four", "hang", "heavy", "index", "L", "ok", "palm", "palm_m", "palm_u", "three", "two", "up"];
const classNames = ["C", "down"];

function loadDataset(name, datasetPath) {
    console.log("Loading dataset (this might take some time)...");
    let dataset = parseGestureSet(datasetPath, "MultiModHandGestRecog");
    console.log("Data set loaded!");
    return dataset;
}

// Helper functions
function parseFrame(path) {
    let xml = fs.readFileSync(path);
    let parsedFrame;
    // Parse the xml file
    var parser = new xml2js.Parser({explicitArray: false, mergeAttrs: true});
    parser.parseString(xml, (err, res) => {
        // Extract the frame
        let frame = res.opencv_storage.Frame;
        // Initialize the parsed frame
        parsedFrame = new Frame(frame.ID);
        for (const hand of ["Left", "Right"]) {
            if (frame.Images.LeftImage.Hands.hasOwnProperty(hand)) {
                // Set hasXHand property
                if (hand === "Right") {
                    parsedFrame.hasRightHand = true;
                } else {
                    parsedFrame.hasLeftHand = true;
                }
                // Extract the position of the palm [x, y, z]
                let palmPosition = frame.Images.LeftImage.Hands[hand].Center.data.split(/\s+/g).slice(1).map(str => parseFloat(str));
                parsedFrame.addArticulation(new Articulation(getArticulationLabel(hand === "Right", "Palm"), new Point(...palmPosition)));
                // Extract the position of each finger
                let frameFingers = frame.Images.LeftImage.Hands[hand].Fingers;
                for (const finger of fingers) {
                    // [x, y, z]
                    let fingerPosition = frameFingers[finger].TipPosition.data.split(/\s+/g).slice(1).map(str => parseFloat(str));
                    parsedFrame.addArticulation(new Articulation(getArticulationLabel(hand === "Right", finger + "Tip"), new Point(...fingerPosition)));
                }
            }
        }
    })
    return parsedFrame;
}

function parseGestureSet(datasetPath, name) {
    let gestureSet = new GestureSet(name);
    let classIndex = 0;
    for (const className of classNames) {
        console.log(className)
        let gestureClass = new GestureClass(className, classIndex);
        classIndex += 1;
        fs.readdirSync(datasetPath, { withFileTypes: true }).filter(dirent => !dirent.isFile()).map(dirent => dirent.name).forEach((userDir) => {
            for (const type of ["train_pose", "test_pose"]) {
                let classPath = path.join(datasetPath, userDir, type, className);
                let id = 0;
                fs.readdirSync(classPath).forEach((frame) => {
                    let framePath = path.join(classPath, frame);
                    let parsedFrame = parseFrame(framePath);
                    let userId = parseInt(userDir.split("_"));
                    let poseData = new PoseData(userId, id, parsedFrame, undefined);
                    gestureClass.addSample(poseData);
                    id++;
                });
            }
        });
        gestureSet.addGestureClass(gestureClass);
    }
    return gestureSet;
}

function getArticulationLabel(isRight, name) {
    return `${isRight ? "right" : "left"}${name}Position`;
}

module.exports = {
    loadDataset
}