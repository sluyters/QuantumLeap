const AbstractStaticRecognizer = require('../../../../framework/modules/recognizers/static/abstract-static-recognizer').AbstractStaticRecognizer;

const { performance } = require('perf_hooks');

class Recognizer extends AbstractStaticRecognizer {
	static name = "MultiRecognizer";

  constructor(options, dataset) {
    super();
    this.recognizers = [];
		this.weights = [];
		options.recognizers.forEach(recognizer => {
			this.recognizers.push(new recognizer.module(recognizer.moduleSettings));
			this.weights.push(recognizer.additionalSettings.weight);
		});
		if (dataset !== undefined) {
			dataset.getGestureClasses().forEach((gesture) => {
				gesture.getSamples().forEach(sample => {
					this.addGesture(gesture.name, sample);
				}
				);
			});
		}
	}

	addGesture(name, sample) {
		this.recognizers.forEach(recognizer => {
			recognizer.addGesture(name, sample);
		});
	}

	removeGesture(name) {
		this.recognizers.forEach(recognizer => {
			recognizer.removeGesture(name);
		});
	}

	recognize(sample) {
		let results = {};
		let bestFit = '';
		let t0 = performance.now();
		this.recognizers.forEach((recognizer, index) => {
			let result = recognizer.recognize(sample);
			if (result.name) {
				let weightedScore = this.weights[index] * (result.score ? result.score : 1);
				if (results.hasOwnProperty(result.name)) {
					weightedScore = results[result.name] + weightedScore;
				}
				results[result.name] = weightedScore;
				if (!bestFit || weightedScore > results[bestFit]) {
					bestFit = result.name;
				}
			}
		});
		let t1 = performance.now();
		return {
			name: bestFit ? bestFit : '',
			score: bestFit ? results[bestFit] / this.recognizers.length : 0.0,
			time: t1 - t0
		};
	}

	toString() {
    return `${Recognizer.name}`;
  }
}

module.exports = Recognizer;