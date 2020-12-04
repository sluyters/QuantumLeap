class AbstractSegmenter {
    constructor(options) {
        // Empty
    }

    /**
     * Process a frame and return a StrokeData object if the frame marks the end of a dynamic gesture .
     * @param {Object} frame - A frame from the sensor. 
     * @returns null if the frame and the current set of frames do not correspond to a dynamic gesture , a StrokeData object otherwise.
     */
    segment(frame) {
        throw new Error('You have to implement this function');
    }

    /**
     * Indicate to the segmenter that a dynamic gesture  has been recognized.
     */
    notifyRecognition() {
        throw new Error('You have to implement this function');
    }
}

module.exports = {
    AbstractSegmenter
};