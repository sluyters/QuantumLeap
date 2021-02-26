class AbstractDynamicRecognizer {
  constructor(options, dataset) {
    // Empty
  }

  /**
   * Add a dynamic gesture  to the training set of this recognizer.
   * @param {Object} name - The name of the dynamic gesture  to add.
   * @param {Object} sample - The dynamic gesture  to add.
   */
  addGesture(name, sample) {
    throw new Error('You have to implement this function');
  }

  /**
   * Remove a dynamic gesture  from the training set of this recognizer.
   * @param {Object} name - The name of the dynamic gesture  to remove.
   */
  removeGesture(name) {
    throw new Error('You have to implement this function');
  }

  /**
   * Check whether the sample corresponds to a known dynamic gesture .
   * @param {Object} sample - A dynamic gesture  sample from the sensor.
   * @returns a JavaScript object with at least 3 properties: name (the name of the dynamic gesture), score (how confident the recognizer is of the result, between 0 and 1), and time (the execution time).
   */
  recognize(sample) {
    throw new Error('You have to implement this function');
  }
}

module.exports = {
  AbstractDynamicRecognizer
};