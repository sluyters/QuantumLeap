const path = require('path');
const fs = require('fs');

const GestureSet = require('../../framework/gestures/GestureSet').GestureSet;
const GestureClass = require('../../framework/gestures/GestureClass').GestureClass;
const StrokeData = require('../../framework/gestures/StrokeData').StrokeData;
const Stroke = require('../../framework/gestures/StrokeData').Stroke;
const Point = require('../../framework/gestures/Point').Point3D;
const Path = require('../../framework/gestures/StrokeData').Path;


function loadDataset(name, directory) {
    let gestureSet = new GestureSet(name);
    let dirPath = path.join(directory, name);
    let gestureIndex = 0;

    fs.readdirSync(dirPath).forEach((gesture) => {
        let gestureDirPath = path.join(dirPath, gesture);
        let gestureClass = new GestureClass(gesture, gestureIndex);
        gestureSet.addGestureClass(gestureClass);
        fs.readdirSync(gestureDirPath).forEach((user) => {
            let userDirPath = path.join(gestureDirPath, user);
            fs.readdirSync(userDirPath).forEach((file) => {
                let rawGesturePath = path.join(userDirPath, file);
                let strokeData = JSON.parse(fs.readFileSync(rawGesturePath));

                let filenameParsed = file.split(".")[0].split("-");
                let gestureName = filenameParsed[0];
                let infosupp;
                if(filenameParsed.length > 2){
                    infosupp = filenameParsed[1];
                }
                let id = parseInt(filenameParsed[filenameParsed.length-1]);

                let gestureData = new StrokeData(parseInt(user), id, infosupp);

                strokeData.paths.forEach(path =>{
                    gestureData.addPath(path.label, path);
                });
                gestureClass.addSample(gestureData);
            });
        });
        gestureIndex+=1;
    });
    
    return gestureSet;
}

module.exports = {
    loadDataset
};