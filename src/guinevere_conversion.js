const fs = require('fs-extra');
const path = require('path');

const GestureSet = require('./framework/gestures/GestureSet').GestureSet;
const GestureClass = require('./framework/gestures/GestureClass').GestureClass;
const StrokeData = require('./framework/gestures/StrokeData').StrokeData;
const Stroke = require('./framework/gestures/StrokeData').Stroke;
const Path = require('./framework/gestures/StrokeData').Path;
const Point = require('./framework/gestures/Point').Point3D;

const dirPath = path.join(__dirname, 'datasets', 'guinevere');
const convertedPath = path.join(__dirname, 'datasets', 'guinevere_unified');

const fingers = ["rightThumbPosition", "rightIndexPosition", "rightMiddlePosition", "rightRingPosition", "rightPinkyPosition", "leftThumbPosition", "leftIndexPosition", "leftMiddlePosition", "leftRingPosition", "leftPinkyPosition"];

const device = {
    'osBrowserInfo': 'Leap Motion Controller', 'resolutionHeight': null,
    'resolutionWidth': null, 'windowHeight': null, 'windowWidth': null,
    'pixelRatio': null, 'mouse': false, 'pen': false, 'finger': false,
    'acceleration': false, 'webcam': true
};

let gestureSet = new GestureSet("guinevere_unified");
let gestureIndex = 0;

fs.readdirSync(dirPath).forEach((user_dir) => {
    let gestureSampleDirPath = path.join(dirPath, user_dir);
    fs.readdirSync(gestureSampleDirPath).forEach((sample) => {
        let rawGesturePath = path.join(gestureSampleDirPath, sample);
        let rawGestureData = JSON.parse(fs.readFileSync(rawGesturePath));

        let gesture = sample.split(".")[0].split("-");
        let gestureName = gesture[0].split("#")[0];
        let infosupp = undefined;
        if(gesture[0].split("#").length > 1){
            infosupp = gesture[0].split("#")[1];
        }
        let id = gesture[1];

        let gestureData = new StrokeData(parseInt(user_dir), id, infosupp);
        if(gestureSet.getGestureClass().has(gestureName)){
            gestureSet.getGestureClass().get(gestureName).addSample(gestureData);
        }
        else{
            let gestureClass = new GestureClass(gestureName, gestureIndex);
            gestureIndex+=1;
            gestureClass.addSample(gestureData);
            gestureSet.addGestureClass(gestureClass);
        }


        fingers.forEach((fingerName) => {
            let strokePath = new Path(fingerName);
            gestureData.addPath(fingerName, strokePath);
            let stroke = new Stroke(0);
            strokePath.addStroke(stroke);
        });

        let strokePath = new Path("rigthPalmPosition");
        gestureData.addPath("rigthPalmPosition", strokePath);
        let stroke = new Stroke(0);
        strokePath.addStroke(stroke);

        strokePath = new Path("leftPalmPosition");
        gestureData.addPath("leftPalmPosition", strokePath);
        stroke = new Stroke(0);
        strokePath.addStroke(stroke);

        for (let i = 0; i < rawGestureData['data'].length; i++) {
            let frame = rawGestureData['data'][i];
            let rightHandId = -1;
            let leftHandId = -1;
            for (const hand of frame['hands']) {
                if (hand['type'] === 'right') {
                    rightHandId = hand['id'];
                    stroke = gestureData.paths["rigthPalmPosition"].strokes[0];
                }
                else{
                    leftHandId = hand['id'];
                    stroke = gestureData.paths["leftPalmPosition"].strokes[0];
                }
                let palmPosition = hand['palmPosition'];
                let x = palmPosition[0];
                let y = palmPosition[1];
                let z = palmPosition[2];
                let t = frame['timestamp'];
                stroke.addPoint(new Point(x, y, z, t));
            }

            for (const pointable of frame['pointables']) {
                if (!pointable.tool) {
                    // Get the name of the finger from handId and type
                    let fingerName;
                    if (pointable.handId == rightHandId) {
                        fingerName = getFingerName("right", pointable.type);
                    } else if (pointable.handId == leftHandId) {
                        fingerName = getFingerName("left", pointable.type);
                    }
                    if(sample === "C_swipe_up-4.json" && user_dir === "03")
                        console.log(sample+ " " + user_dir + " " + fingerName + " " + pointable.type + " " + pointable.handId)
                    let stroke = gestureData.paths[fingerName].strokes[0];
                    let tipPosition = pointable['tipPosition'];   
                    stroke.addPoint(new Point(tipPosition[0], tipPosition[1], tipPosition[2], frame['timestamp']))
                }
            }
        }
    });
});

writeDataset();


function getFingerName(hand, type) {
    if (hand == "right") {
        return fingers[type];
    } else {
        return fingers[5 + type];
    }
}

function writeDataset() {
    if (fs.existsSync(convertedPath)) {
        fs.removeSync(convertedPath);
    }
    fs.mkdirSync(convertedPath);

    gestureSet.getGestureClass().forEach(gestureClass =>{
        fs.mkdirSync(path.join(convertedPath, gestureClass.name));
        gestureClass.samples.forEach(sample =>{
            let userDirPath = path.join(convertedPath, gestureClass.name, sample.user.toString().padStart(2, "0"));
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