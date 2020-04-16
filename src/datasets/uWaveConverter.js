const path = require('path');
const fs = require('fs');

const GestureSet = require('../framework/gestures/GestureSet').GestureSet;
const GestureClass = require('../framework/gestures/GestureClass').GestureClass;
const StrokeData = require('../framework/gestures/StrokeData').StrokeData;
const Stroke = require('../framework/gestures/StrokeData').Stroke;
const Point = require('../framework/gestures/Point').Point3D;


function loadDataset(name, directory) {
    let gestureSet = new GestureSet(name);
    let dirPath = path.join(__dirname, directory);
    let gestureIndex = 0;

    let gestureClasses = {};

    // Browse main directory
    fs.readdirSync(dirPath).forEach((dir) => {
        let gestureClassDirPath = path.join(dirPath, dir);
        // Subdirectories
        fs.readdirSync(gestureClassDirPath).forEach((file) => {
            let rawGesturePath = path.join(gestureClassDirPath, file);
            let lines = fs.readFileSync(rawGesturePath, 'utf-8').split(/\r?\n/);
            let gestureData = new StrokeData();
            let stroke = new Stroke();

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
                gestureData.addStroke(stroke);
                if (!gestureClasses.hasOwnProperty(gestureId)) {
                    gestureClasses[gestureId] = new GestureClass(`Gesture ${gestureId}`);
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

module.exports = {
    loadDataset
};