const AbstractRecognizer = require('../../../framework/recognizers/abstract-recognizer').AbstractRecognizer;

class Recognizer extends AbstractRecognizer {

    static name = "PlaceholderRecognizer";

    constructor(options) {
        super(options);
    }

    addGesture(name, sample) {
        // Nothing
    }

    removePose(name) {
        // Nothing
    }

    classify(sample) {
        return { name: "", time: 0.0 };
    }

    toString() {
        return `${Recognizer.name}`;
    }
}

module.exports = {
    Recognizer
}