const path = require('path');
const fs = require('fs');

const GestureSet = require('../../framework/gestures/GestureSet').GestureSet;
const GestureClass = require('../../framework/gestures/GestureClass').GestureClass;
const StrokeData = require('../../framework/gestures/StrokeData').StrokeData;
const Stroke = require('../../framework/gestures/StrokeData').Stroke;
const Point = require('../../framework/gestures/Point').Point3D;

//const gestureNames = ["Tap","Swipe Right", "Swipe Left", "Swipe Up", "Swipe Down", "Swipe X", "Swipe +", "Swipe V", "Shake"];
const gestureNames = ["Grab", "Tap", "Expand", "Pinch", "Rotation Clockwise", "Rotation Counter Clockwise",
    "Swipe Right", "Swipe Left", "Swipe Up", "Swipe Down", "Swipe X", "Swipe +", "Swipe V", "Shake"];

function loadDataset(name, directory) {
    let gestureSet = new GestureSet(name);
    let dirPath = path.join(__dirname, directory);
    let gestureIndex = 0;

    fs.readdirSync(dirPath).forEach((dir) => {
        let gestureClassDirPath = path.join(dirPath, dir);
        var stat = fs.lstatSync(gestureClassDirPath);
        if (!stat.isDirectory())
            return;
        gestureClassDirPath = path.join(gestureClassDirPath, "finger_1");
        let gestureClass = new GestureClass(gestureNames[gestureIndex], gestureIndex);
        gestureIndex+=1;
        fs.readdirSync(gestureClassDirPath).forEach((file) => {
            let rawGesturePath = path.join(gestureClassDirPath, file);
            let lines = fs.readFileSync(rawGesturePath, 'utf-8').split(/\r?\n/);
            lines = lines.slice(1, lines.length - 1); //remove header and last line
            let gestureData = new StrokeData();
            let stroke = new Stroke();

            lines.forEach(line =>{
                line = line.split(",");
                //index tip
                let x = parseFloat(line[27]);
                let y = parseFloat(line[28]);
                let z = parseFloat(line[29]);
                let t = 0;
                stroke.addPoint(new Point(x, y, z, t));
            });
            gestureData.addStroke(stroke);
            gestureClass.addSample(gestureData);

        });

        gestureSet.addGestureClass(gestureClass);
    });
    
    return gestureSet;
}

module.exports = {
    loadDataset
};