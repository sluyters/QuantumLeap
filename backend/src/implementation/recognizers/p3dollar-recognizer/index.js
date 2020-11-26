const AbstractRecognizer = require('../../../framework/recognizers/abstract-recognizer').AbstractRecognizer;
const P3DollarRecognizer = require('./p3dollar/p3dollar').P3DollarRecognizer;
const Point = require('./p3dollar/p3dollar').Point;

class Recognizer extends AbstractRecognizer {

	static name = "P3DollarRecognizer";

    constructor(options, dataset) {
		super();
		this.samplingPoints = options.samplingPoints;
		this.articulations = options.articulations;
		this.recognizer = new P3DollarRecognizer(this.samplingPoints);
		console.log(this.articulations)
		if (dataset !== undefined){
			console.log(dataset)
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
		if(points.length === 0) {
            return { name: "", time: 0, score: 0.0 };
        }
        let result = this.recognizer.Recognize(points);
		return (result.Name === "No match.") ? { name: "", time: result.Time, score: result.Score } : { name: result.Name, time: result.Time, score: result.Score };
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