const Recognizer = require('./framework/recognizers/FakeRecognizer').FakeRecognizer;
const Sensor = require('./framework/sensors/FakeSensor').FakeSensor;

const datasetConverter = require('./datasets/LeapmotionConverter');
let datasetName = "test";
let datasetFolder = "leapmotion";

const WebSocket = require('ws');
const http = require('http');

// Port and ip of the websocket server
const APP_INTERFACE_IP = '127.0.0.1';
const APP_INTERFACE_PORT = 6442;

// Load the training set and feed it to the recognizer
let dataset = datasetConverter.loadDataset(datasetName, datasetFolder);
var recognizer = new Recognizer(dataset);

var sensor = new Sensor(dataset);

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
        var { success, name, time } = recognizer.recognize(data);
        if (success) {
            console.log(name);
            ws.send(JSON.stringify({ 'gesture': name }));
        }
    });

    ws.on('close', function() {
        sensorIF.stop();
    });

    ws.on('error', function(error) {
        sensorIF.stop();
    });

    sensor.acquireData();
    console.log("test");
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

sensor.onGesture(data => {
    console.log(recognizer.recognize(data));
});
sensor.acquireData();
console.log("debug");

