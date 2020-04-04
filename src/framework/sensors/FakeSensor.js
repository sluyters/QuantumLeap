const Sensor = require('./Sensor').Sensor;
const path = require('path');
const express = require('express');

class FakeSensor extends Sensor{

    static gestureset = [];
    static callback = undefined;
    static dataset = undefined;
    constructor(dataset) {
        super();
        FakeSensor.dataset = dataset;
        FakeSensor.gestureset = [];
        dataset.getGestureClass().forEach((gesture, key, self) => {
            FakeSensor.gestureset.push(gesture.name);
        });

        this.app = express();
        this.app.use(express.static((path.join(__dirname, 'public'))));

        this.app.get('/', function (req, res) {
            res.sendFile(path.join(__dirname + '/index.html'));
        });
        this.app.get('/gestureset', function (req, res) {
            res.send(JSON.stringify({"gestureset": FakeSensor.gestureset}));
        });
        // e.g.: /controls/focus?override=true
        this.app.post('/play/:gesture', function (req, res) {
            let gesture = req.params.gesture;
            console.log(gesture + " received");
            if(FakeSensor.callback!==undefined)
                FakeSensor.callback(FakeSensor.dataset.getGestureClass().get(gesture).getSample()[1]);
            res.sendStatus(200);

        });
    }

    onGesture(callback){
        FakeSensor.callback=callback;
    }

    async acquireData(){
        this.app.listen(3001, function () {
            console.log('FakeSensor available at http://localhost:3001');
        });
    }

    stop(){
        console.log("End sensor");
    }
}

module.exports = {
    FakeSensor
};