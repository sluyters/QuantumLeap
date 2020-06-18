class AbstractAnalyzer {
    constructor(options) {
        // Empty
    }

    /**
     * Extract and return information from a frame.
     * @param {Object} frame - A frame from the sensor.
     */
    analyze(frame) {
        throw new Error('You have to implement this function');
    }
}

module.exports = {
    AbstractAnalyzer
}