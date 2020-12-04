const AbstractStaticRecognizer = require('../../../../framework/recognizers/static/abstract-static-recognizer').AbstractStaticRecognizer;

class Classifier extends AbstractStaticRecognizer {

    static name = "PlaceholderClassifier";

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
        return `${Classifier.name}`;
    }
}

module.exports = Classifier;