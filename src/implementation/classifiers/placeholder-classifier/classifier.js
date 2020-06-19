const AbstractClassifier = require('../../../framework/classifiers/abstract-classifier').AbstractClassifier;

class Classifier extends AbstractClassifier {

    static name = "PlaceholderClassifier";

    constructor(options) {
        super(options);
    }

    addPose(name, frame) {
        // Nothing
    }

    classify(frame) {
        return { 'name': "", 'time': 0.0 };
    }

    toString() {
        return `${Classifier.name}`;
    }
}

module.exports = {
    Classifier
}