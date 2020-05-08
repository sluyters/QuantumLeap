const path = require('path');
const fs = require('fs');

const GestureSet = require('../../framework/gestures/GestureSet').GestureSet;
const GestureClass = require('../../framework/gestures/GestureClass').GestureClass;
const StrokeData = require('../../framework/gestures/StrokeData').StrokeData;
const Stroke = require('../../framework/gestures/StrokeData').Stroke;
const Point = require('../../framework/gestures/Point').Point3D;


function loadDataset(name, directory) {
    let gestureSet = new GestureSet(name);
    let dirPath = path.join(directory, name);
    let gestureIndex = 0;

    fs.readdirSync(dirPath).forEach((dir) => {
        let gestureClassDirPath = path.join(dirPath, dir);
        let gestureClass = new GestureClass(dir, gestureIndex);
        gestureIndex+=1;
        fs.readdirSync(gestureClassDirPath).forEach((file) => {
            let rawGesturePath = path.join(gestureClassDirPath, file);
            let rawGestureData = JSON.parse(fs.readFileSync(rawGesturePath));
            let gestureData = new StrokeData();
            let stroke = new Stroke();

            for (let i = 0; i < rawGestureData['data'].length; i++) {
                let frame = rawGestureData['data'][i];

                for (const hand of frame['hands']) {
                    if (hand['type'] === 'right') {

                        let palmPosition = hand['palmPosition']
                        let x = palmPosition[0];
                        let y = palmPosition[1];
                        let z = palmPosition[2];
                        let t = frame['timestamp'];
                        stroke.addPoint(new Point(x, y, z, t));
                    }
                }
            }
            gestureData.addStroke(stroke);
            gestureClass.addSample(gestureData);

        });

        gestureSet.addGestureClass(gestureClass);
    })
    
    return gestureSet;
}

module.exports = {
    loadDataset
};