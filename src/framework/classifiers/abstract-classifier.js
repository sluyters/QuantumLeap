class AbstractClassifier {
    constructor(config) {
        // Empty
    }

    classify(frame) {
        throw new Error('You must implement this function');
    }
}

module.exports = {
    AbstractClassifier
}