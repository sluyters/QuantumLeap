const AbstractDynamicRecognizer = require('../../../../framework/modules/recognizers/dynamic/abstract-dynamic-recognizer').AbstractDynamicRecognizer;

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
        return { name: "", score: 0.0, time: 0.0 };
    }

    toString() {
        return `${Recognizer.name}`;
    }
}

module.exports = Recognizer;