import FakeSensor from './sensors/FakeSensor'
import FakeRecognizer from './recognizers/FakeRecognizer'
const fs = require('fs');

function init() {
    let recogniser = new FakeRecognizer();
    new FakeSensor(recogniser);
    addGestures(recogniser);
}

function addGestures(recogniser){
    let gestures = ["!", "H", "D", "I"];

    gestures.forEach((gesture) => {
        fs.readdirSync(gesture).forEach(file => {
            console.log(file);
        });
    });
    /*var contents = fs.readFileSync('DATA', 'utf8');
    let raw_gesture = JSON.parse(e.target.result);
    let $PP_points = [];
    let $C_points = [];
    for(let j=0 ; j<raw_gesture[0].strokes.length ; j++) {
        for(var k=0 ; k<raw_gesture[0].strokes[j].length ; k++) {
            $PP_points[$PP_points.length] = new $PP_Point(raw_gesture[0].strokes[j][k].x, raw_gesture[0].strokes[j][k].y, raw_gesture[0].strokes[j][k].stroke_id);
            $C_points[$C_points.length] = new $C_Point(raw_gesture[0].strokes[j][k].x, raw_gesture[0].strokes[j][k].y, raw_gesture[0].strokes[j][k].t, raw_gesture[0].strokes[j][k].stroke_id)
        }
    }
    $C_recognizer.SaveAs(dataset[1][p][training][1], dataset[1][p][training][0]);*/
}

export default init;