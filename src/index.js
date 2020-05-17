const WebSocket = require('ws');
const http = require('http');
const config = require('./config');
const FrameProcessor = require('./framework/frame-processor').FrameProcessor;

// Load the modules
const Sensor = config.sensor.module;

// Main function
function run() {
    // Initialize the sensor interface, dataset, recognizer and segmenter
    var sensor = new Sensor(config.sensor.options);
    var frameProcessor = new FrameProcessor(config);
    // Start the websocket server
    var wsServer = getWebSocketServer(config.server.ip, config.server.port);
    wsServer.on('connection', async function connection(ws) {
        frameProcessor.resetContext();
        // Handle messages from the client
        ws.on('message', function(message) {
            var data = JSON.parse(message);
            if (data.hasOwnProperty('addPose')) {
                let poseName = data.addPose;
                frameProcessor.enablePose(poseName);
            } else if (data.hasOwnProperty('addGesture')) {
                let gestureName = data.addGesture;
                frameProcessor.enableGesture(gestureName);
            } else if (data.hasOwnProperty('removePose')) {
                let poseName = data.removePose;
                frameProcessor.disablePose(poseName);
            } else if (data.hasOwnProperty('removeGesture')) {
                let gestureName = data.removeGesture;
                frameProcessor.disableGesture(gestureName);
            }
        });
        // Process sensor frames
        sensor.loop((frame, appData) => {
            if (appData) {
                // If there is data to send to the application
                let message = { frame: appData };
                ws.send(JSON.stringify(message));
            }
            // Gesture recognition
            var ret = frameProcessor.processFrame(frame);
            if (ret) {
                // If there is gesture data to send to the application
                let message = { gesture: ret };
                if (config.general.debug) {
                    console.log(JSON.stringify(message));
                }
                ws.send(JSON.stringify(message));
            }
        });
        // Stop processing frames after disconnection
        ws.on('close', function() {
            console.log("Disconnected!")
            sensor.stop();
        });
        // Stop processing frames after connection error
        ws.on('error', function(error) {
            console.log(JSON.stringify(error));
            sensor.stop();
        });
    });
}

function getWebSocketServer(ip, port) {
    // Create HTTP server 
    var server = http.createServer();
    server.listen(port, ip, function () {
        console.log("WebSocket server listening on port " + port);
    });

    // Create WebSocket server
    var wsServer = new WebSocket.Server({ server });

    return wsServer;
}

if (require.main === module) {
    run();
}