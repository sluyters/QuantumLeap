const path = require('path');
const fs = require('fs');

const GestureSet = require('../../../../framework/gestures/gesture-set').GestureSet;
const GestureClass = require('../../../../framework/gestures/gesture-class').GestureClass;
const StrokeData = require('../../../../framework/gestures/stroke-data').StrokeData;
const Stroke = require('../../../../framework/gestures/stroke-data').Stroke;
const Path = require('../../../../framework/gestures/stroke-data').Path;
const Point = require('../../../../framework/gestures/point').Point3D;

function loadDataset(name, datasetPath, sensorId, datasetId, sensorPointsNames) {
    let gestureSet = new GestureSet(name);
    let dirPath = datasetPath;
    let gestureClasses = {};

    // Browse main directory
    fs.readdirSync(dirPath, { withFileTypes: true }).filter(dirent => !dirent.isFile()).map(dirent => dirent.name).forEach((dir) => {
        let gestureClassDirPath = path.join(dirPath, dir);
        // Subdirectories
        fs.readdirSync(gestureClassDirPath).forEach((file) => {
            let rawGesturePath = path.join(gestureClassDirPath, file);
            let lines = fs.readFileSync(rawGesturePath, 'utf-8').split(/\r?\n/);
            let gestureData = new StrokeData();
            let strokePath = new Path("main");
            let stroke = new Stroke(0);
            strokePath.addStroke(stroke);

            let gestureId = file.slice(23, 24);

            let index = 0;
            for (const line of lines) {
                let data = line.split(' ');
                if(data.length == 3) {
                    let x = parseFloat(data[0]);
                    let y = parseFloat(data[1]);
                    let z = parseFloat(data[2]);
                    let t = index++;
                    stroke.addPoint(new Point(x, y, z, t));
                }
            }

            if (index < 10) {
                // Ignore, probably bad data
                console.log(`Too few datapoints (${index}) - ${rawGesturePath}`);
            } else {
                gestureData.addPath("main", strokePath);
                if (!gestureClasses.hasOwnProperty(gestureId)) {
                    let gestureName = addIdentifier(`Gesture ${gestureId}`, datasetId);
                    gestureClasses[gestureId] = new GestureClass(gestureName);
                }
                gestureClasses[gestureId].addSample(gestureData);
            }
        });
    })

    Object.keys(gestureClasses).forEach((key) => {
        gestureSet.addGestureClass(gestureClasses[key]);
    });
    
    return gestureSet;
}

function addIdentifier(name, identifier) {
    return identifier ? `${name}_${identifier}` : name;
}


module.exports = {
    loadDataset
};