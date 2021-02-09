const AbstractStaticRecognizer = require('../../../../framework/modules/recognizers/static/abstract-static-recognizer').AbstractStaticRecognizer;

class Recognizer extends AbstractStaticRecognizer {

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

    recognize(frame) {
        return { name: "", time: 0.0 };
    }

    toString() {
        return `${Recognizer.name}`;
    }
}

module.exports = Recognizer;