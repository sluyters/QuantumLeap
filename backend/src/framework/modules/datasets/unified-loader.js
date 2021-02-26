const path = require('path');
const fs = require('fs-extra');

const GestureSet = require('../../gestures/gesture-set').GestureSet;
const GestureClass = require('../../gestures/gesture-class').GestureClass;
const StrokeData = require('../../gestures/stroke-data').StrokeData;


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

function writeDataset(dataset, directory) {
    if (fs.existsSync(directory)) {
        fs.removeSync(directory);
    }
    fs.mkdirSync(directory);

    dataset.getGestureClasses().forEach(gestureClass => {
        fs.mkdirSync(path.join(directory, gestureClass.name));
        gestureClass.samples.forEach(sample =>{
            let userDirPath = path.join(directory, gestureClass.name, sample.user.toString().padStart(2, "0"));
            if(!fs.existsSync(userDirPath)){
                fs.mkdirSync(userDirPath);
            }
            let newFilename = gestureClass.name + "-";
            if(sample.infosupp)
                newFilename = newFilename + sample.infosupp + "-";
            newFilename = newFilename + sample.id.toString().padStart(2, "0") + ".json";
            newFilename = path.join(userDirPath, newFilename);
            let toWrite = {};
            toWrite.name = gestureClass.name;
            toWrite.subject = sample.user;

            toWrite.paths = [];
            for(let path in sample.paths){
                toWrite.paths.push({
                    "label": sample.paths[path].label,
                    "strokes": sample.paths[path].strokes
                });
            }

            fs.writeFileSync(newFilename, JSON.stringify(toWrite, null, 2), function (err) {
                if (err) throw err;
                //console.log('Saved!');
            });
        })
    });
}

module.exports = {
    loadDataset,
    writeDataset
};