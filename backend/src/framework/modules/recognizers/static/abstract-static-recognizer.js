class AbstractStaticRecognizer {
    constructor(options, dataset) {
        // Empty
    }

    /**
     * Add a static gesture to the training set of this classifier.
     * @param {Object} name - The name of the static gesture to add.
     * @param {Object} frame - The frame containing the static gesture to add.
     */
   addGesture(name, frame) {
        throw new Error('You have to implement this function');
    }

    /**
     * Remove a static gesture from the training set of this classifier.
     * @param {Object} name - The name of the static gesture to remove.
     */
    removeGesture(name) {
        throw new Error('You have to implement this function');
    }

    /**
     * Return the name of the static gesture that corresponds to the frame.
     * @param {Object} frame - A frame from the sensor.
     * @returns a JavaScript object with at least 2 properties: name (the name of the static gesture) and time (the execution time).
     */
    recognize(frame) {
        throw new Error('You have to implement this function');
    }
}

module.exports = {
    AbstractStaticRecognizer
}