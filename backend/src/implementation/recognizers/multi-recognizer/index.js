const AbstractRecognizer = require('../../../framework/recognizers/abstract-recognizer').AbstractRecognizer;

class Recognizer extends AbstractRecognizer {
	static name = "MultiRecognizer";

  constructor(options, dataset) {
    super();
    this.recognizers = [];
    this.weights = [];
	}

	addGesture(name, sample) {

	}

	removeGesture(name) {

	}

	recognize(sample) {
		
	}

	toString() {
		//return `${Recognizer.name} [ samplingPoints = ${this.samplingPoints}, articulations = ${this.articulations} ]`;
    return `${Recognizer.name}`;
  }
}
