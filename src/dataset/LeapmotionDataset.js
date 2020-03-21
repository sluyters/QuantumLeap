const path = require('path');
const fs = require('fs');
const cdollar = require('../framework/recognizers/cdollar');
const pdollarplus = require('../framework/recognizers/pdollarplus');

const gestureset = require('../framework/gestures/GestureSet');
const gestureclass = require('../framework/gestures/GestureClass');
const strokedata = require('../framework/gestures/StrokeData');


class LeapmotionDataset {

    constructor(datasetFolder){
        this.datasetFolder = datasetFolder;
    }

    loadDataset(){
        let currentGestureSet = new gestureset.GestureSet("smartphone");
        const directoryPath = path.join(__dirname, this.datasetFolder);

        fs.readdirSync(directoryPath).forEach(dir => {
            let subDirPath = directoryPath + '/' + dir;

            let currentGestureClass = new gestureclass.GestureClass(dir);

            fs.readdirSync(subDirPath).forEach(file => {
                let raw_gesture = JSON.parse(fs.readFileSync(subDirPath + '/' + file));
                let data = new strokedata.StrokeData();

                for(let j=0 ; j<raw_gesture[0].strokes.length ; j++) {
                    let stroke = new strokedata.Stroke();
                    for(var k=0 ; k<raw_gesture[0].strokes[j].length ; k++) {
                        let x = raw_gesture[0].strokes[j][k].x;
                        let y = raw_gesture[0].strokes[j][k].y;
                        let t = raw_gesture[0].strokes[j][k].t;
                        stroke.addPoint(new strokedata.Point2D(x,y,t));
                    }
                    data.addStroke(stroke);
                }
                currentGestureClass.addSample(data);
            });
            currentGestureSet.addGestureClass(currentGestureClass);
        });

        return currentGestureSet;
    }

}

module.exports = {
    LeapmotionDataset
};