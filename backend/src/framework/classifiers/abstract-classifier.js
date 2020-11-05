class AbstractClassifier {
    constructor(options, dataset) {
        // Empty
    }

    /**
     * Add a pose to the training set of this classifier.
     * @param {Object} name - The name of the pose to add.
     * @param {Object} frame - The frame containing the pose to add.
     */
    addPose(name, frame) {
        throw new Error('You have to implement this function');
    }

    /**
     * Remove a pose from the training set of this classifier.
     * @param {Object} name - The name of the pose to remove.
     */
    removePose(name) {
        throw new Error('You have to implement this function');
    }

    /**
     * Return the name of the pose that corresponds to the frame.
     * @param {Object} frame - A frame from the sensor.
     * @returns a JavaScript object with at least 2 properties: name (the name of the pose) and time (the execution time).
     */
    classify(frame) {
        throw new Error('You have to implement this function');
    }
}

module.exports = {
    AbstractClassifier
}