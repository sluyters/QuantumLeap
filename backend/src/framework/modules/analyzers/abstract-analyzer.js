class AbstractAnalyzer {
    constructor(options) {
        // Empty
    }

    /**
     * Extract and return information from a frame.
     * @param {Object} frame - A frame from the sensor.
     * @returns a JavaScript object with the information extracted from the frame.
     */
    analyze(frame) {
        throw new Error('You have to implement this function');
    }

    /**
     * Reset the internal state of the analyzer.
     */
    reset() {
        throw new Error('You have to implement this function');
    }
}

module.exports = {
    AbstractAnalyzer
}