const WebSocket = require('ws');
const http = require('http');
const config = require('./config');

//const Recognizer = require('./framework/recognizers/FakeRecognizer').FakeRecognizer;
const Recognizer = require('./implementation/recognizers/uvplus-flexible-cloud/recognizer').DollarRecognizer;
const Sensor = require('./implementation/sensors/LeapSensor').LeapSensor;
const GestureSegmenter = require('./implementation/gesture-segmenter/zoning-segmenter').Segmenter;

//let datasetName = "test";
const datasetConverter = require('./framework/datasets/UnifiedDatasetLoader');
let N = 8; //Points/Shapes
const DEBUG = true;

// Port and ip of the websocket server
const APP_INTERFACE_IP = '127.0.0.1';
const APP_INTERFACE_PORT = 6442;

const fingers = ["rightThumbPosition", "rightIndexPosition", "rightMiddlePosition", "rightRingPosition", "rightPinkyPosition", "leftThumbPosition", "leftIndexPosition", "leftMiddlePosition", "leftRingPosition", "leftPinkyPosition", "rigthPalmPosition", "leftPalmPosition"];


// Load the training set and feed it to the recognizer
let dataset = datasetConverter.loadDataset(config.dataset.options.name, config.dataset.options.directory);
let recognizer = new Recognizer(config.recognizer.options, dataset);

var sensor = new Sensor(new GestureSegmenter());

var wsServer = getWebSocketServer(APP_INTERFACE_IP, APP_INTERFACE_PORT);
wsServer.on('connection', function connection(ws) {
    console.log("Connected!");

    // Set callback
    ws.on('message', function incoming(message) {
        var data = JSON.parse(message.utf8Data);
        if (data.hasOwnProperty('context')) {
            // TODO
        }
    });

    sensor.onGesture(data => {
        let result = recognizer.recognize(data);
        if (result.Name!==undefined) {
            console.log(result.Name + " sent");
            ws.send(JSON.stringify({ 'gesture': result.Name }));
        }
    });

    ws.on('close', function() {
        sensor.stop();
    });

    ws.on('error', function(error) {
        sensor.stop();
    });

    sensor.acquireData();
});



// Helpers
function getWebSocketServer(ip, port) {
    // Create an HTTP server
    var server = http.createServer();
    server.listen(port, ip, function () {
        console.log("WebSocket server listening on port " + port);
    });

    // Create WebSocket server
    var wsServer = new WebSocket.Server({ server });

    return wsServer;
}

if(DEBUG)
{
    sensor.onGesture(data => {
        //console.log(JSON.stringify(data));
        let result = recognizer.recognize(data);
        if (result.name) {
            console.log(result.name + " detected");
        }
    });
    sensor.acquireData();
}