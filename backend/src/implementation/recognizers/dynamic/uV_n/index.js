const AbstractDynamicRecognizer = require('../../../../framework/modules/recognizers/dynamic/abstract-dynamic-recognizer').AbstractDynamicRecognizer;
const uVRecognizer = require('./uV/uV').uVRecognizer;
const Point = require('./uV/uV').Point;
const { parsePointsNames } = require('../../../../framework/utils');

class Recognizer extends AbstractDynamicRecognizer {

	static name = "µVRecognizer";

	constructor(options, dataset) {
		super();
		this.numShapes = options.numShapes;
		this.selectedPoints = parsePointsNames(options.points);
		this.recognizer = new uVRecognizer(this.numShapes);
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
		let points = convert(sample, this.selectedPoints);
		this.recognizer.addTemplate(points, name);
	}

	removeGesture(name) {
		this.recognizer.removeTemplates(name);
	}

	recognize(sample) {
		let points = convert(sample, this.selectedPoints);
		if (points.length === 0) {
			return { name: "", score: 0.0, time: 0 };
		}
		let result = this.recognizer.recognize(points);
		return (result[0] === "No match") ? { name: "", score: result[4], time: result[3] } : { name: result[0], score: result[4], time: result[3] };
	}

	toString() {
		return `${Recognizer.name} [ numShapes = ${this.numShapes}, points = ${this.selectedPoints} ]`;
	}
}

function convert(sample, selectedPoints) {
	let points = [];
	selectedPoints.forEach((articulation, articulationID) => {
		sample.paths[articulation].strokes.forEach((stroke, strokeId) => {
			stroke.points.forEach((point) => {
				// If multipoint, one stroke per articulation, otherwise, keep original strokes
				let index = selectedPoints.length > 1 ? articulationID + 1 : strokeId + 1;
				points.push(new Point(point.getCoordinates(), index));
			});
		});
	});
	return points;
}

module.exports = Recognizer;