const AbstractDynamicRecognizer = require('../../../../framework/recognizers/dynamic/abstract-dynamic-recognizer').AbstractDynamicRecognizer;
const P3DollarPlusRecognizer = require('./p3dollarplus/p3dollarplus').P3DollarPlusRecognizer;
const Point = require('./p3dollarplus/p3dollarplus').Point;
const { parsePointsNames } = require('../../../../framework/utils');

class Recognizer extends AbstractDynamicRecognizer {

	static name = "P3DollarPlusRecognizer";

	constructor(options, dataset) {
		super();
		this.samplingPoints = options.samplingPoints;
		this.selectedPoints = parsePointsNames(options.points);
		this.recognizer = new P3DollarPlusRecognizer(this.samplingPoints);
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
		this.recognizer.AddGesture(name, points);
	}

	removeGesture(name) {
		this.recognizer.RemoveGesture(name);
	}

	recognize(sample) {
		let points = convert(sample, this.selectedPoints);
		if (points.length === 0) {
			return { name: "", score: 0.0, time: 0 };
		}
		let result = this.recognizer.Recognize(points);
		return (result.Name === "No match.") ? { name: "", score: result.Score, time: result.Time } : { name: result.Name, score: result.Score, time: result.Time };
	}

	toString() {
		return `${Recognizer.name} [ samplingPoints = ${this.samplingPoints}, points = ${this.selectedPoints} ]`;
	}
}

function convert(sample, selectedPoints) {
	let points = [];
	selectedPoints.forEach((articulation, articulationID) => {
		sample.paths[articulation].strokes.forEach((stroke, strokeId) => {
			stroke.points.forEach((point) => {
				// If multipoint, one stroke per articulation, otherwise, keep original strokes
				let index = selectedPoints.length > 1 ? articulationID : strokeId;
				points.push(new Point(point.x, point.y, point.z, index));
			});
		});
	});
	return points;
}

module.exports = Recognizer;