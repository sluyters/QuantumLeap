const AbstractDynamicRecognizer = require('../../../../framework/modules/recognizers/dynamic/abstract-dynamic-recognizer').AbstractDynamicRecognizer;
const uFRecognizer = require('./uF/uF').uFRecognizer;
const Point = require('./uF/uF').Point;
const { parsePointsNames } = require('../../../../framework/utils');

class Recognizer extends AbstractDynamicRecognizer {

	static name = "µFRecognizer";

	constructor(options, dataset) {
		super();

		// Get sampling rate
		this.samplingPoints = options.samplingPoints;

		// Get uni-/multi-path articulations
		this.articulations = [];
		
		//let allRawArticulations = options.articulations.unipath.concat(options.articulations.multipath);
		this.selectedPaths = [];	// Ordered list of paths

		// this.simplePaths = [];
		// this.compoundPaths = [];

		// Multipath
		options.articulations.multipath.forEach(rawArticulation => {
			let articulation = parsePointsNames(rawArticulation.paths).map(path => {
				let index = this.selectedPaths.indexOf(path);
				if (index === -1) {
					index = this.selectedPaths.length;
					this.selectedPaths.push(path);
				}
				return index;
			});
			this.articulations.push(articulation);
		});

		// Unipath
		options.articulations.unipath.forEach(rawArticulation => {
			let paths = parsePointsNames(rawArticulation.paths);
			let path = undefined;
			if (paths.length === 1) {
				// Simple path
				path = paths[0];
			} else if (paths.length > 1) {
				// Compound path
				path = paths;
			}
			let index = this.selectedPaths.indexOf(path);
			if (index === -1) {
				index = this.selectedPaths.length;
				this.selectedPaths.push(path);
			}
			this.articulations.push([index]);
		});
		

		// Get weights
		this.alpha = options.weights.alpha;
		this.beta = options.weights.beta;
		this.gamma = options.weights.gamma;
		this.delta = options.weights.delta;

		// Initialize recognizer
		this.recognizer = new uFRecognizer(this.samplingPoints, this.alpha, this.beta, this.gamma, this.delta, this.articulations);
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
		let paths = convert(sample, this.selectedPaths);
		this.recognizer.addTemplate(paths, name);
	}

	removeGesture(name) {
		this.recognizer.removeTemplates(name);
	}

	recognize(sample) {
		let paths = convert(sample, this.selectedPaths);
		if (paths.length === 0) {	// TODO
			return { name: "", score: 0.0, time: 0 };
		}
		let result = this.recognizer.recognize(paths);
		return (result[0] === "No match") ? { name: "", score: result[4], time: result[3] } : { name: result[0], score: result[4], time: result[3] };
	}

	toString() {
		return `${Recognizer.name} [ samplingPoints = ${this.samplingPoints}, paths = ${this.selectedPaths} ]`;
	}
}

function convert(sample, selectedPaths) {
	let paths = [];

	selectedPaths.forEach(pathOrPaths => {
		let newPath = [];
		if (Array.isArray(pathOrPaths)) {
			let pathNames = pathOrPaths; 
			// Compound path (path where each point corresponds to points of different paths)
			let nStrokes = sample.paths[pathNames[0]].strokes.length;
			for (let i = 0; i < nStrokes; i++) {
				let nFrames = sample.paths[pathNames[0]].strokes[i].points.length;
				// For each frame
				for (let j = 0; j < nFrames; j++) {
					coordinates = [];
					// Build compound coordinates
					pathNames.forEach(pathName => {
						let point = sample.paths[pathName].strokes[i].points[j];
						coordinates.push(...point.getCoordinates());
					});
					newPath.push(new Point(coordinates, i + 1));
				}
			}				
		} else {
			let pathName = pathOrPaths; 
			// Simple path
			sample.paths[pathName].strokes.forEach((stroke, strokeId) => {
				stroke.points.forEach(point => {
					newPath.push(new Point(point.getCoordinates(), strokeId + 1));
				});
			});
		}
		paths.push(newPath);
	});
	return paths;
}

module.exports = Recognizer;