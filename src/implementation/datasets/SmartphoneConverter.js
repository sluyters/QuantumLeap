const path = require('path');
const fs = require('fs');

const GestureSet = require('../../framework/gestures/GestureSet').GestureSet;
const GestureClass = require('../../framework/gestures/GestureClass').GestureClass;
const StrokeData = require('../../framework/gestures/StrokeData').StrokeData;
const Stroke = require('../../framework/gestures/StrokeData').Stroke;
const Point = require('../../framework/gestures/Point').Point2D;


function loadDataset(name, directory) {
    let gestureSet = new GestureSet(name);
    let dirPath = path.join(__dirname, directory);
    let gestureIndex = 0;

    fs.readdirSync(dirPath).forEach((dir) => {
        let gestureClassDirPath = path.join(dirPath, dir);
        let gestureClass = new GestureClass(dir, gestureIndex);
        gestureIndex+=1;

        fs.readdirSync(gestureClassDirPath).forEach((file) => {
            let rawGesturePath = path.join(gestureClassDirPath, file);
            let rawGestureData = JSON.parse(fs.readFileSync(rawGesturePath));
            let gestureData = new StrokeData();

            for(let i = 0 ; i < rawGestureData[0].strokes.length ; i++) {
                let stroke = new Stroke();
                for(var j = 0 ; j < rawGestureData[0].strokes[i].length ; j++) {
                    let x = rawGestureData[0].strokes[i][j].x;
                    let y = rawGestureData[0].strokes[i][j].y;
                    let t = rawGestureData[0].strokes[i][j].t;
                    stroke.addPoint(new Point(x,y,t));
                }
                gestureData.addStroke(stroke);
            }
            gestureClass.addSample(gestureData)
        });

        gestureSet.addGestureClass(gestureClass)
    })
    
    return gestureSet;
}

module.exports = {
    loadDataset
};