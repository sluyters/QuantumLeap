class AbstractSensor {

    constructor(name) {
        this.name = name;
    }

    /**
     * Process one frame from the sensor.
     * @callback frameCallback
     * @param {Object} frame - The frame to process.
     */

    /**
     * Process frames from the sensor. Executes the callback for each frame.
     * @param {frameCallback} callback - The callback that handles the frame from the sensor.
     * @param {Object} options - A set of options for the sensor.
     */
    loop(callback, options) {
        throw new Error('You have to implement this function');
    }

    /**
     * Stop processing frames from the sensor.
     */
    stop() {
        throw new Error('You have to implement this function');
    }

}

module.exports = {
    AbstractSensor
}