const WebSocket = require('ws');
const http = require('http');
const config = require('./config');
const FrameProcessor = require('./framework/frame-processor').FrameProcessor;

// Load the modules
const Sensor = config.sensor.module;

// Main function
function run() {
    console.log("TEst")
    // Initialize the sensor interface, dataset, recognizer and segmenter
    var sensor = new Sensor(config.sensor.options);
    var frameProcessor = new FrameProcessor(config);
    // Start the websocket server
    var wsServer = getWebSocketServer(config.server.ip, config.server.port);
    wsServer.on('connection', async function connection(ws) {
        console.log('Connected!')
        // Handle messages from the client
        ws.on('message', function(message) {
            if (config.general.debug) {
                console.log(message)
            }
            var msg = JSON.parse(message);
            if (msg.type === 'operation') {
                for (const operation of msg.data) {
                    if (operation.type === 'addPose') {
                        frameProcessor.enablePose(operation.name);
                    } else if (operation.type === 'addGesture') {
                        frameProcessor.enableGesture(operation.name);
                    } else if (operation.type === 'removePose') {
                        frameProcessor.disablePose(operation.name);
                    } else if (operation.type === 'removeGesture') {
                        frameProcessor.disableGesture(operation.name);
                    }
                }
            }
        });
        // Process sensor frames
        sensor.loop((frame, appData) => {
            let message = getMessage('data');
            if (appData && config.general.sendContinuousData) {
                // If there is continuous data to send to the application
                message.data.push({
                    'type': 'frame',
                    'data': appData
                })
            }
            // Gesture recognition
            var ret = frameProcessor.processFrame(frame);
            if (ret) {
                // If there is gesture data to send to the application
                message.data.push(ret);
                if (config.general.debug) {
                    console.log(JSON.stringify(message));
                }
            }
            if (message.data.length > 0) {
                ws.send(JSON.stringify(message));
            }
        });
        // Stop processing frames after disconnection
        ws.on('close', function() {
            console.log("Disconnected!")
            sensor.stop();
            frameProcessor.resetContext();
        });
        // Connection error
        ws.on('error', function(error) {
            console.log(JSON.stringify(error));
        });
    });
}

function getMessage(type) {
    return { 
        'type': type,
        'data' : []
    };
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