const path = require('path');
const fs = require('fs');

const GestureSet = require('../../../../framework/gestures/gesture-set').GestureSet;
const GestureClass = require('../../../../framework/gestures/gesture-class').GestureClass;
const StrokeData = require('../../../../framework/gestures/stroke-data').StrokeData;
const Stroke = require('../../../../framework/gestures/stroke-data').Stroke;
const Path = require('../../../../framework/gestures/stroke-data').Path;
const Point = require('../../../../framework/gestures/point').Point2D;

function loadDataset(name, datasetPath, identifier, sensorPointsNames) {
    let gestureSet = new GestureSet(name);
    let dirPath = datasetPath;
    let gestureIndex = 0;

    fs.readdirSync(dirPath, { withFileTypes: true }).filter(dirent => !dirent.isFile()).map(dirent => dirent.name).forEach((dir) => {
        let gestureClassDirPath = path.join(dirPath, dir);
        let gestureClass = new GestureClass(dir, gestureIndex);
        gestureIndex+=1;

        fs.readdirSync(gestureClassDirPath).forEach((file) => {
            let rawGesturePath = path.join(gestureClassDirPath, file);
            let rawGestureData = JSON.parse(fs.readFileSync(rawGesturePath));
            let gestureData = new StrokeData();
            let label = addIdentifier("main", identifier);
            let strokePath = new Path(label);
            gestureData.addPath(label, strokePath);

            for(let i = 0 ; i < rawGestureData[0].strokes.length ; i++) {
                let stroke = new Stroke(i);
                for(var j = 0 ; j < rawGestureData[0].strokes[i].length ; j++) {
                    let x = rawGestureData[0].strokes[i][j].x;
                    let y = rawGestureData[0].strokes[i][j].y;
                    let t = rawGestureData[0].strokes[i][j].t;
                    stroke.addPoint(new Point(x,y,t));
                }
                strokePath.addStroke(stroke);
            }
            gestureClass.addSample(gestureData)
        });

        gestureSet.addGestureClass(gestureClass)
    });
    
    return gestureSet;
}

function addIdentifier(name, identifier) {
    return identifier ? `${name}_${identifier}` : name;
}

module.exports = {
    loadDataset
};