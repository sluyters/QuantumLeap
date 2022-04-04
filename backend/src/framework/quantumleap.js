const WSServer = require('ws').Server;
const FrameProcessor = require('./frame-processor').FrameProcessor;
const SensorGroup = require('./modules/sensors/sensor-group');
const LogHelper = require('./log-helper');

class QuantumLeap {
  constructor(httpServer) {
    this.server = httpServer;
  }

  start(config) {
    if (this.wss) {
      LogHelper.log('warn', 'WebSocket server already running!');
    } else {
      LogHelper.log('info', 'WebSocket server starting.');
      this.wss = setupWSS(config.main.settings, this.server);
    }
  }

  stop(callback=()=>{}) {
    LogHelper.log('info', 'WebSocket server stopping.');
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
    perMessageDeflate: false,
    clientTracking: true,
  });
  wss.on('connection', async function connection(ws, request) {
    LogHelper.log('info', 'Connected to client.');
    // Handle messages from the client
    ws.on('message', function (message) {
      if (config.general.general.debug) {
        LogHelper.log('debug', `Received message from client: ${message}`);
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
    frameProcessor.resetContext();
    // // Debugging
    // let staticGestureDebug = {
    //   timeout: undefined,
    //   previousGesture: undefined
    // };
    // let handleEndOfStaticGesture = () => {
    //   clearTimeout(staticGestureDebug.timeout);
    //   LogHelper.log('debug', `Static gesture recognized (end): ${staticGestureDebug.previousGesture}.`);
    //   staticGestureDebug.previousGesture = undefined;
    // };
    // Process sensor frames
    sensor.loop((frame, appData) => {
      let message = getMessage('data');
      if (appData && config.general.general.sendContinuousData) {
        // If there is continuous data to send to the application
        message.data.push({
          type: 'frame',
          data: appData
        });
      }
      // Gesture recognition
      var ret = frameProcessor.processFrame(frame);
      if (ret) {
        // If there is gesture data to send to the application
        message.data.push(ret);
        // if (config.general.general.debug) {
        //   if (ret.type === 'dynamic') {
        //     // Handle previous static gesture
        //     if (staticGestureDebug.previousGesture !== undefined) {
        //       handleEndOfStaticGesture();
        //     }
        //     LogHelper.log('debug', `Dynamic gesture recognized: ${ret.name}.`);
        //   } else if (ret.type === 'static') {
        //     if (staticGestureDebug.previousGesture !== undefined) {
        //       // Handle previous static gesture
        //       if (ret.name !== staticGestureDebug.previousGesture) {
        //         handleEndOfStaticGesture();
        //         LogHelper.log('debug', `Static gesture recognized (start): ${ret.name}.`);
        //       }
        //     } else {
        //       LogHelper.log('debug', `Static gesture recognized (start): ${ret.name}.`);
        //     }
        //     staticGestureDebug.previousGesture = ret.name;
        //     clearTimeout(staticGestureDebug.timeout);
        //     staticGestureDebug.timeout = setTimeout(() => {
        //       LogHelper.log('debug', `Static gesture recognized (end): ${ret.name}.`);
        //       staticGestureDebug.previousGesture = undefined;
        //     }, 100);
        //   }
        // }
      }
      if (message.data.length > 0) {
        ws.send(JSON.stringify(message));
      }
    });
    // Stop processing frames after disconnection
    ws.on('close', function (event) {
      if (wss.clients.size === 0) {
        sensor.stop();
        frameProcessor.resetContext();
      }
      LogHelper.log('info', 'Disconnected from client.');
    });
    // Connection error
    ws.on('error', function (error) {
      LogHelper.log('error', `Connection error. ${JSON.stringify(error)}`);
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
