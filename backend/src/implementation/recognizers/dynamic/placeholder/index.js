const AbstractDynamicRecognizer = require('../../../../framework/recognizers/dynamic/abstract-dynamic-recognizer').AbstractDynamicRecognizer;

class Recognizer extends AbstractDynamicRecognizer {

    static name = "PlaceholderRecognizer";

    constructor(options) {
        super(options);
    }

    addGesture(name, sample) {
        // Nothing
    }

    removeGesture(name) {
        // Nothing
    }

    recognize(sample) {
        return { name: "", time: 0.0 };
    }

    toString() {
        return `${Recognizer.name}`;
    }
}

module.exports = Recognizer;