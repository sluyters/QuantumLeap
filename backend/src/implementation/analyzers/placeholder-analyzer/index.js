const AbstractAnalyzer = require('../../../framework/analyzers/abstract-analyzer').AbstractAnalyzer;

class Analyzer extends AbstractAnalyzer {

    constructor(options) {
        super(options);
    }

    analyze(frame) {
        return {};
    }

    reset() {
        // Nothing
    }
}

module.exports = Analyzer;