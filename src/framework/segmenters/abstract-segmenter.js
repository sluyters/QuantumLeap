class AbstractSegmenter {
    constructor(options) {
        // Empty
    }

    segment(frame) {
        throw new Error('You must implement this function');
    }

    notifyRecognition() {
        throw new Error('You must implement this function');
    }
}

module.exports = {
    AbstractSegmenter
};