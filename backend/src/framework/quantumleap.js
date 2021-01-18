const WSServer = require('ws').Server;
const FrameProcessor = require('./frame-processor').FrameProcessor;
const SensorGroup = require('./modules/sensors/sensor-group');

class QuantumLeap {
  constructor(httpServer) {
    this.server = httpServer;
  }

  start(config) {
    if (this.wss) {
      console.log('WebSocket server already running!');
    } else {
      console.log('WebSocket server starting...');
      this.wss = setupWSS(config.main.settings, this.server);
    }
  }

  stop(callback=()=>{}) {
    console.log('WebSocket server stopping...');
    if (this.wss) {
      this.wss.close(() => {
        callback();
      });
      this.wss = '';
    } else {
      callback();
    }
  }

  isRunning() {
    return this.wss ? true : false;
  }
}

function setupWSS(config, server) {
  // Initialize sensor and frame processor
  var sensor = new SensorGroup(config.sensors)
  var frameProcessor = new FrameProcessor(config);
  // Initialize WebSocket server
  let wss = new WSServer({
    server: server,
    perMessageDeflate: false
  });
  wss.on('connection', async function connection(ws, request) {
    console.log('Connected!')
    // Handle messages from the client
    ws.on('message', function (message) {
      if (config.general.general.debug) {
        console.log(message);
      }
      var msg = JSON.parse(message);
      if (msg.type === 'operation') {
        for (const operation of msg.data) {
          if (operation.type === 'addPose') {
            frameProcessor.enableGesture('static', operation.name);
          } else if (operation.type === 'addGesture') {
            frameProcessor.enableGesture('dynamic', operation.name);
          } else if (operation.type === 'removePose') {
            frameProcessor.disableGesture('static', operation.name);
          } else if (operation.type === 'removeGesture') {
            frameProcessor.disableGesture('dynamic', operation.name);
          }
        }
      }
    });
    // Stop previous sensor loop (if any) TODO In the future, find a better solution
    sensor.stop();
    // Process sensor frames
    sensor.loop((frame, appData) => {
      let message = getMessage('data');
      if (appData && config.general.general.sendContinuousData) {
        // If there is continuous data to send to the application
        message.data.push({
          'type': 'frame',
          'data': appData
        });
      }
      // Gesture recognition
      var ret = frameProcessor.processFrame(frame);
      if (ret) {
        // If there is gesture data to send to the application
        message.data.push(ret);
        if (config.general.general.debug) {
          console.log(JSON.stringify(message));
        }
      }
      if (message.data.length > 0) {
        ws.send(JSON.stringify(message));
      }
    });
    // Stop processing frames after disconnection
    ws.on('close', function () {
      console.log("Disconnected!");
      sensor.stop();
      frameProcessor.resetContext();
    });
    // Connection error
    ws.on('error', function (error) {
      console.log(JSON.stringify(error));
    });
  });
  return wss;
}

function getMessage(type) {
  return {
    'type': type,
    'data': []
  };
}


module.exports = QuantumLeap;
