class AbstractRecognizer {
    constructor(options, dataset) {
        // Empty
    }

    /**
     * Add a gesture to the training set of this recognizer.
     * @param {Object} name - The name of the gesture to add.
     * @param {Object} sample - The gesture to add.
     */
    addGesture(name, sample) {
        throw new Error('You have to implement this function');
    }

    /**
     * Remove a gesture from the training set of this recognizer.
     * @param {Object} name - The name of the gesture to remove.
     */
    removeGesture(name) {
        throw new Error('You have to implement this function');
    }

    /**
     * Check whether the sample corresponds to a known gesture.
     * @param {Object} sample - A gesture sample from the sensor.
     */
    recognize(sample) {
        throw new Error('You have to implement this function');
    }

}

module.exports = {
    AbstractRecognizer
};