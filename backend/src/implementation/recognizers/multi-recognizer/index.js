const AbstractRecognizer = require('../../../framework/recognizers/abstract-recognizer').AbstractRecognizer;

class Recognizer extends AbstractRecognizer {

	static label = "Multi";
	static name = "multi-recognizer";
	static description = "A module that allows the combination of multiple recognizers.";
	static configuration = new Configuration(label, name, description);
	configuration.addSetting();

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
