const { Frame, Articulation } = require('../frames/frame');

class SensorGroup {
  constructor(config) {
    this.framerate = config.framerate;
    // Init sensors
    let sensorsModules = config.modules;
    this.sensors = [];
    sensorsModules.forEach(sensorsModule => {
      let sensorConfig = sensorsModule.moduleSettings;
      let sensorId = sensorsModule.additionalSettings.id;
      let sensor = new sensorsModule.module(sensorConfig);
      this.sensors.push({
        sensor: sensor,
        id: sensorId
      });
    });
    this.sensorLoop = null;
  }

  /**
   * Process one frame from the sensors.
   * @callback frameCallback
   * @param {Object} frame - The frame to process.
   */

  /**
   * Process frames from the sensors. Execute the callback for each frame.
   * @param {frameCallback} callback - The callback that handles the frame from
   * the sensors.
   */
  loop(callback) {
    // Connect to each sensor
    this.sensors.forEach(({sensor, id}) => {
      sensor.connect();
    })
    let processFrame = function () {
      let hasData = false;
      let timestamp = Date.now();
      // Initialize the frame
      let frame = new Frame(timestamp);
      // Get points from each sensor
      this.sensors.forEach(({sensor, id}) => {
        let sensorData = sensor.getPoints(timestamp);
        hasData = hasData || sensorData.hasData;
        sensorData.points.forEach(({name, point}) => {
          let pointName = id ? `${name}_${id}` : name;
          frame.addArticulation(new Articulation(pointName, point));
        })
      })
      frame.hasData = hasData;
      // Callback only if data was sensed by a sensor
      let appData = { 'fingers': [] }; // TODO remove in the future
      if (hasData) {
        callback(frame, appData);
      }
    }.bind(this);

    this.sensorLoop = setInterval(processFrame, 1000 / this.framerate);
  }

  /**
   * Stop processing frames from the sensors.
   */
  stop() {
    if (this.sensorLoop !== null) {
      clearInterval(this.sensorLoop);
      // For each sensor, call disconnect
      this.sensors.forEach(({sensor, id}) => {
        sensor.disconnect();
      })
      this.sensorLoop = null;
    }
  }
}

module.exports = SensorGroup;