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

    fs.readdirSync(dirPath).forEach((dir) => {
        let gestureClassDirPath = path.join(dirPath, dir);
        let gestureClass = new GestureClass(dir);
        fs.readdirSync(gestureClassDirPath).forEach((file) => {
            let rawGesturePath = path.join(gestureClassDirPath, file);
            let rawGestureData = JSON.parse(fs.readFileSync(rawGesturePath));
            let gestureData = new StrokeData();
            let palmStroke = new Stroke();
            let indexStroke = new Stroke();
            let thumbStroke = new Stroke();

            for (let i = 0; i < rawGestureData['data'].length; i++) {
                let frame = rawGestureData['data'][i];
                let handId = -1;
                for (const hand of frame['hands']) {
                    if (hand['type'] === 'right') {
                        let t = frame['timestamp'];

                        handId = hand.id;
                        let palmPosition = hand['palmPosition']
                        let x = palmPosition[0];
                        let y = palmPosition[1];
                        let z = palmPosition[2];
                        let palm = new Point(x, y, z, t)
                        palmStroke.addPoint(palm);

                        for (const pointable of frame['pointables']) {
                            if (!pointable.tool && pointable.handId == handId) {
                                let tipPosition = pointable['tipPosition'];
                                if (pointable.type == 1) { 
                                    // Index
                                    indexStroke.addPoint(translate(new Point(tipPosition[0], tipPosition[1], tipPosition[2], t), palm));

                                } else if (pointable.type == 0) {
                                    // Thumb
                                    thumbStroke.addPoint(translate(new Point(tipPosition[0], tipPosition[1], tipPosition[2], t), palm));
                                }
                                
                            }
                        }
                    }
                }
            }
            gestureData.addStroke(palmStroke);
            gestureData.addStroke(indexStroke);
            gestureData.addStroke(thumbStroke);
            gestureClass.addSample(gestureData);

        });

        gestureSet.addGestureClass(gestureClass);
    })
    
    return gestureSet;
}

function translate(from, by) {
    x = from.x - by.x;
    y = from.y - by.y;
    z = from.z - by.z;
    return new Point(x, y, z, from.t)
}

module.exports = {
    loadDataset
};