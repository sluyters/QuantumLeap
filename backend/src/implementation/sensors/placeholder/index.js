const AbstractSensor = require('../../../framework/modules/sensors/abstract-sensor').AbstractSensor
const Point = require('../../../framework/gestures/point').Point3D;

class Sensor extends AbstractSensor {
  constructor(options) {
    super("Placeholder");
  }

  getPoints(timestamp) {
    return { 
      hasData: false,
      points: [],
      appData: {}
    };
  }

  connect() {
    // Do nothing
  }

  disconnect() {
    // Do nothing
  }
}

module.exports = Sensor;