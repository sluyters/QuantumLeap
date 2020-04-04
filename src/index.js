//const Recognizer = require('./framework/recognizers/FakeRecognizer').FakeRecognizer;
const Recognizer = require('./recognizers/P3DollarPlusRecognizer').P3DollarPlusRecognizer;
const Sensor = require('./framework/sensors/FakeSensor').FakeSensor;

const datasetConverter = require('./datasets/LeapmotionConverter');
let datasetName = "test";
let datasetFolder = "leapmotion";
let N = 8; //Points/Shapes

const WebSocket = require('ws');
const http = require('http');

// Port and ip of the websocket server
const APP_INTERFACE_IP = '127.0.0.1';
const APP_INTERFACE_PORT = 6442;

// Load the training set and feed it to the recognizer
let dataset = datasetConverter.loadDataset(datasetName, datasetFolder);
let recognizer = new Recognizer(N, dataset);

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