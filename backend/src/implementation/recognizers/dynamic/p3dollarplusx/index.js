const AbstractDynamicRecognizer = require('../../../../framework/recognizers/dynamic/abstract-dynamic-recognizer').AbstractDynamicRecognizer;
const P3DollarPlusXRecognizer = require('./p3dollarplusx/p3dollarplusx').P3DollarPlusXRecognizer;
const Point = require('./p3dollarplusx/p3dollarplusx').Point;
const { parsePointsNames } = require('../../../../framework/utils');

class Recognizer extends AbstractDynamicRecognizer {

	static name = "P3DollarPlusXRecognizer";

	constructor(options, dataset) {
		super();
		this.samplingPoints = options.samplingPoints;
		this.articulations = parsePointsNames(options.articulations);
		this.recognizer = new P3DollarPlusXRecognizer(this.samplingPoints);
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
		let points = convert(sample, this.articulations);
		this.recognizer.AddGesture(name, points);
	}

	removeGesture(name) {
		this.recognizer.RemoveGesture(name);
	}

	recognize(sample) {
		let points = convert(sample, this.articulations);
		if (points.length < 2) {
			return { name: "", score: 0.0, time: 0 };
		}
		let result = this.recognizer.Recognize(points);
		return (result.Name === "No match.") ? { name: "", score: result.Score, time: result.Time } : { name: result.Name, score: result.Score, time: result.Time };
	}

	toString() {
		return `${Recognizer.name} [ samplingPoints = ${this.samplingPoints}, articulations = ${this.articulations} ]`;
	}

}

function convert(sample, articulations) {
	let points = [];
	articulations.forEach((articulation, articulationID) => {
		sample.paths[articulation].strokes.forEach((stroke, strokeId) => {
			stroke.points.forEach((point) => {
				// If multipoint, one stroke per articulation, otherwise, keep original strokes
				let index = articulations.length > 1 ? articulationID : strokeId;
				points.push(new Point(point.x, point.y, point.z, index));
			});
		});
	});
	return points;
}

module.exports = Recognizer;