const AbstractAnalyzer = require('../../../framework/modules/analyzers/abstract-analyzer').AbstractAnalyzer;

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