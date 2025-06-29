const path = require('path');
const fs = require('fs');

const GestureSet = require('../../../../framework/gestures/gesture-set').GestureSet;
const GestureClass = require('../../../../framework/gestures/gesture-class').GestureClass;
const StrokeData = require('../../../../framework/gestures/stroke-data').StrokeData;
const Stroke = require('../../../../framework/gestures/stroke-data').Stroke;
const Path = require('../../../../framework/gestures/stroke-data').Path;
const Point = require('../../../../framework/gestures/point').Point3D;

//const gestureNames = ["Tap","Swipe Right", "Swipe Left", "Swipe Up", "Swipe Down", "Swipe X", "Swipe +", "Swipe V", "Shake"];
const gestureNames = ["Grab", "Tap", "Expand", "Pinch", "Rotation Clockwise", "Rotation Counter Clockwise",
    "Swipe Right", "Swipe Left", "Swipe Up", "Swipe Down", "Swipe X", "Swipe +", "Swipe V", "Shake"];

function loadDataset(name, datasetPath, sensorId, datasetId, sensorsPointsNames) {
    let gestureSet = new GestureSet(name);
    let dirPath = datasetPath;
    let gestureIndex = 0;

    fs.readdirSync(dirPath, { withFileTypes: true }).filter(dirent => !dirent.isFile()).map(dirent => dirent.name).forEach((dir) => {
        let gestureClassDirPath = path.join(dirPath, dir);
        var stat = fs.lstatSync(gestureClassDirPath);
        if (!stat.isDirectory())
            return;
        gestureClassDirPath = path.join(gestureClassDirPath, "finger_1");
        let gestureName = addIdentifier(gestureNames[gestureIndex], datasetId);
        let gestureClass = new GestureClass(gestureName, gestureIndex);
        gestureIndex+=1;
        fs.readdirSync(gestureClassDirPath).forEach((file) => {
            let rawGesturePath = path.join(gestureClassDirPath, file);
            let filename = file.split(".")[0].split("_");
            let lines = fs.readFileSync(rawGesturePath, 'utf-8').split(/\r?\n/);
            lines = lines.slice(1, lines.length - 1); //remove header and last line
            let gestureData = new StrokeData(parseInt(filename[1]), parseInt(filename[3]));
            let pointName = sensorId ? `main_${sensorId}` : 'main';
            let strokePath = new Path(pointName);
            gestureData.addPath(pointName, strokePath);
            // TODO: add missing paths, rename paths
            let stroke = new Stroke(0);

            lines.forEach(line =>{
                line = line.split(",");
                //index tip
                let x = parseFloat(line[27]);
                let y = parseFloat(line[28]);
                let z = parseFloat(line[29]);
                let t = 0;
                stroke.addPoint(new Point(x, y, z, t));
            });

            strokePath.addStroke(stroke);
            gestureClass.addSample(gestureData);

        });

        gestureSet.addGestureClass(gestureClass);
    });
    
    return gestureSet;
}

function addIdentifier(name, identifier) {
    return identifier ? `${name}_${identifier}` : name;
}

module.exports = {
    loadDataset
};