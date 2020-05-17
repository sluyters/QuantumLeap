const AbstractClassifier = require('../../../framework/classifiers/abstract-classifier').AbstractClassifier;

class Classifier extends AbstractClassifier {
    constructor(options) {
        super(options);
    }

    classify(frame) {
        return "";
    }
}

module.exports = {
    Classifier
}