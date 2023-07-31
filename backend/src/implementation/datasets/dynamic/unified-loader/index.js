const path = require('path');
const fs = require('fs-extra');

const GestureSet = require('../../../../framework/gestures/gesture-set').GestureSet;
const GestureClass = require('../../../../framework/gestures/gesture-class').GestureClass;
const StrokeData = require('../../../../framework/gestures/stroke-data').StrokeData;
const { Path, Stroke } = require('../../../../framework/gestures/stroke-data');
const { Point2D, Point3D, PointND } = require('../../../../framework/gestures/Point');


function loadDataset(name, datasetPath, sensorId, datasetId, sensorPointsNames) {
    let gestureSet = new GestureSet(name);
    let dirPath = datasetPath;

    // Load info.json file
    let info = JSON.parse(fs.readFileSync(path.join(dirPath, 'info.json')));

    fs.readdirSync(dirPath).forEach((gesture) => {
        let gestureDirPath = path.join(dirPath, gesture);
        if (fs.existsSync(gestureDirPath) && fs.lstatSync(gestureDirPath).isDirectory()) {
            let gestureName = addIdentifier(gesture, datasetId);
            let gestureIndex = info.gestures.indexOf(gesture);
            if (gestureIndex === -1) {
                throw new Error(`Gesture '${gesture}' not listed in info.json file!`);
            }
            let gestureClass = new GestureClass(gestureName, gestureIndex);
            gestureSet.addGestureClass(gestureClass);
            fs.readdirSync(gestureDirPath).forEach((user) => {
                let userDirPath = path.join(gestureDirPath, user);
                fs.readdirSync(userDirPath).forEach((file) => {
                    let rawGesturePath = path.join(userDirPath, file);
                    let rawStrokeData = JSON.parse(fs.readFileSync(rawGesturePath));

                    let filenameParsed = file.split(".")[0].split("-");
                    // let gestureName = filenameParsed[0];
                    let infosupp;
                    if(filenameParsed.length > 2){
                        infosupp = filenameParsed[1];
                    }
                    let id = parseInt(filenameParsed[filenameParsed.length-1]);

                    let strokeData = new StrokeData(user, id, infosupp);
                    rawStrokeData.paths.forEach(rawPath =>{
                        let label = addIdentifier(rawPath.label, sensorId);
                        let path = new Path(label);
                        rawPath.strokes.forEach(rawStroke => {
                            let stroke = new Stroke(rawStroke.id);
                            rawStroke.points.forEach(point => {
                                if (point.hasOwnProperty('coordinates')) {
                                    // ND
                                    stroke.addPoint(new PointND(point.coordinates, point.t));
                                }
                                // TODO remove all non-generic coordinates ?
                                else if (point.hasOwnProperty('z')) {
                                    // 3D
                                    stroke.addPoint(new Point3D(point.x, point.y, point.z, point.t));
                                } else {
                                    // 2D
                                    stroke.addPoint(new Point2D(point.x, point.y, point.t));
                                }
                            })
                            path.addStroke(stroke);
                        });
                        strokeData.addPath(label, path);
                    });
                    gestureClass.addSample(strokeData);
                });
            });
        }
    });
    return gestureSet;
}

function addIdentifier(name, identifier) {
    return identifier ? `${name}_${identifier}` : name;
}

module.exports = {
    loadDataset
};