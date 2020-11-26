class AbstractSensor {
  constructor(name) {
    this.name = name;
  }

  /**
   * Get points from the sensor.
   * @param {*} timestamp 
   */
  getPoints(timestamp) {
    throw new Error('You have to implement this function');
  }

  connect() {
    throw new Error('You have to implement this function');
  }

  disconnect() {
    throw new Error('You have to implement this function');
  }
}

module.exports = {
  AbstractSensor
}