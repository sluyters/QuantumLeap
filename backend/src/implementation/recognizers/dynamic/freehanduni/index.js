const AbstractDynamicRecognizer = require('../../../../framework/modules/recognizers/dynamic/abstract-dynamic-recognizer').AbstractDynamicRecognizer;
const FreeHandUniRecognizer = require('./freehanduni/FreeHandUniRecognizer').FreeHandUniRecognizer;
const Point = require('./freehanduni/FreeHandUniRecognizer').Point;
const { parsePointsNames } = require('../../../../framework/utils');

class Recognizer extends AbstractDynamicRecognizer {

	static name = "FreeHandUniRecognizer";

	constructor(options, dataset) {
		super();
		this.samplingPoints = options.samplingPoints;
		this.pathName = parsePointsNames(options.points)[0];
		this.recognizer = new FreeHandUniRecognizer(this.samplingPoints);
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
		let points = convert(sample, this.pathName);
		this.recognizer.AddGesture(name, points);
	}

	removeGesture(name) {
		this.recognizer.RemoveGesture(name);
	}

	recognize(sample) {
		let points = convert(sample, this.pathName);
		if (points.length === 0) {
			return { name: "", score: 0.0, time: 0 };
		}
		let result = this.recognizer.Recognize(points);
		return (result.Name === "No match") ? { name: "", score: result.Score, time: result.Time } : { name: result.Name, score: result.Score, time: result.Time };
	}

	toString() {
		return `${Recognizer.name} [ samplingPoints = ${this.samplingPoints}, points = ${this.selectedPoints} ]`;
	}
}

function convert(sample, pathName) {
	let points = [];
	// Keep only one stroke
	sample.paths[pathName].strokes[0].points.forEach((point, index) => {
		points.push(new Point(point.x, point.y, point.z, index));
	});
	return points;
}

module.exports = Recognizer;