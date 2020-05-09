const AbstractRecognizer = require('../../../framework/recognizers/Recognizer').Recognizer;
const jackknife_blades = require('./jackknife/jackknife').jackknife_blades;
const Jackknife = require('./jackknife/jackknife_recognizer').Jackknife;
const Vector = require('./jackknife/vector').Vector;
const Sample = require('./jackknife/sample').Sample;

class Recognizer extends AbstractRecognizer {

    static name = "JackknifeRecognizer";

    constructor(options, dataset) {
        super();
        this.N = options.samplingPoints;
        let blades = new jackknife_blades();
        blades.set_ip_defaults();
        this.jackknifeRecognizer = new Jackknife(blades)
		if (dataset !== undefined){
			dataset.getGestureClasses().forEach((gesture) => {
				gesture.getSample().forEach(sample => {
						this.addGesture(gesture.name, sample, false);
					}
				);
            });
            this.jackknifeRecognizer.train(6, 2, 1.0);
        }
    }
    
    recognize(sample) {
        let jackknifeSample = convert(sample);
        if (!jackknifeSample) {
            return { name: "", time: 0.0 };
        }
        let t0 = Date.now();
        let ret = this.jackknifeRecognizer.classify(jackknifeSample);
        let t1 = Date.now();
		return (ret == -1) ? { name: "", time: t1-t0 } : { name: ret, time: t1-t0 };
	}

	addGesture(name, sample, train = false) {
        let jackknifeSample = convert(sample, name);
        if (jackknifeSample) {
            this.jackknifeRecognizer.add_template(jackknifeSample);
            if (train) {
                this.jackknifeRecognizer.train(6, 2, 1.0);
            }
        }
	}
}

function convert(sample, name) {
    let jackknifeSample;
    if (name) {
        jackknifeSample = new Sample(0, name);
    } else {
        jackknifeSample = new Sample();
    }

    let pathsLabels = Object.keys(sample.paths).sort();
    // check min distance START
    let maxMovement = 0;
    let threshold = 40;
    let initPoints = {};
    for (const articulation of pathsLabels) {
        initPoints[articulation] = sample.paths[articulation].strokes[0].points[0];
    }
    // check min distance END

    let nFrames = sample.paths[pathsLabels[0]].strokes[0].points.length;
    let trajectory = [];
    for (let i = 0; i < nFrames; i++) {
        let vCoordinates = [];
        for (const articulation of pathsLabels) {
            let point = sample.paths[articulation].strokes[0].points[i];
            // check min distance START
            let articulationMovement = distance(point, initPoints[articulation]);
            maxMovement = Math.max(maxMovement, articulationMovement);
            // check min distance END
            vCoordinates.push(point.x);
            vCoordinates.push(point.y);
            vCoordinates.push(point.z);
        }
        trajectory.push(new Vector(vCoordinates));
    }
    jackknifeSample.add_trajectory(trajectory);
    
    return maxMovement > threshold ? jackknifeSample : null;
    //return jackknifeSample;
}

function distance(p1, p2) // Euclidean distance between two points
{
	var dx = p2.x - p1.x;
	var dy = p2.y - p1.y;
	var dz = p2.z - p1.z;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

module.exports = {
	Recognizer
};