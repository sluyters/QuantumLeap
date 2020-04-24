const Recognizer = require('../../framework/recognizers/Recognizer').Recognizer;
const jackknife_blades = require('./jackknife').jackknife_blades;
const Jackknife = require('./jackknife_recognizer').Jackknife;
const Vector = require('./vector').Vector;
const Sample = require('./sample').Sample;


const StrokeData = require('../../framework/gestures/StrokeData').StrokeData;
const Stroke = require('../../framework/gestures/StrokeData').Stroke;
const Path = require('../../framework/gestures/StrokeData').Path;
const Point = require('../../framework/gestures/Point').Point3D;

NumPoints = 8;

class JackknifeRecognizer extends Recognizer {

    static name = "JackknifeRecognizer";

    constructor(N, dataset) {
		super();
        NumPoints = N;

        let blades = new jackknife_blades();
        blades.set_ip_defaults();
        this.jackknifeRecognizer = new Jackknife(blades)
        
		if (dataset!==undefined){
			dataset.getGestureClass().forEach((gesture, key, self) => {
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
        let t0 = Date.now();
        let ret = this.jackknifeRecognizer.classify(jackknifeSample);
        let t1 = Date.now();
		return (ret == -1) ? { 'Name': 'No match', 'Time': t1-t0, 'Score': 0.0 } : { 'Name': ret, 'Time': t1-t0, 'Score': 1.0 };
	}

	addGesture(name, sample, train = false) {
        let jackknifeSample = convert(sample, name);
        this.jackknifeRecognizer.add_template(jackknifeSample);
        if (train) {
            //this.jackknifeRecognizer.train(6, 2, 1.0);
        }
	}
}

// let gestureData = new StrokeData();
// let stroke = new Stroke();
// let un = new Path("un");
// let deux = new Path("deux");
// let trois = new Path("trois");
// stroke.addPath("un", un);
// stroke.addPath("deux", deux);
// stroke.addPath("trois", trois);
// gestureData.addStroke(stroke)

// deux.addPoint(new Point(2, 2, 2, 10))
// deux.addPoint(new Point(2, 2, 2, 20))
// deux.addPoint(new Point(2, 2, 2, 30))
// deux.addPoint(new Point(2, 2, 2, 50))

// trois.addPoint(new Point(3, 3, 3, 00))
// trois.addPoint(new Point(3, 3, 3, 20))
// trois.addPoint(new Point(3, 3, 3, 30))
// trois.addPoint(new Point(3, 3, 3, 40))

// un.addPoint(new Point(1, 1, 1, 20))
// un.addPoint(new Point(1, 1, 1, 30))
// un.addPoint(new Point(1, 1, 1, 40))
// un.addPoint(new Point(1, 1, 1, 50))

// convert(gestureData);


// function convert(sample, name) {
//     let jackknifeSample;
//     if (name) {
//         jackknifeSample = new Sample();
//     } else {
//         jackknifeSample = new Sample(0, name);
//     }

//     sample.strokes.forEach((stroke) => {
//         console.log(stroke);
//         let currentTimeStamp = -Infinity;
//         let labels = Object.keys(stroke.paths).sort();

//         // Init indexes
//         let indexes = {}
//         labels.forEach((pathLabel) => {
//             indexes[pathLabel] = 0;
//         })

//         // Generate vectors
//         let trajectory = []
//         let hasVector = true;
//         while (hasVector) {
//             let vCoordinates = [];
//             let i;
//             for (i = 0; i < labels.length; i++) {
//                 let pathLabel = labels[i];
//                 let points = stroke.paths[pathLabel].points;
//                 let index = indexes[pathLabel];
//                 if (index >= points.length) {
//                     // Stop
//                     hasVector = false;
//                 } else {
//                     let point = points[index];
//                     if (point.t > currentTimeStamp) {
//                         currentTimeStamp = point.t;
//                         if (i != 0) {
//                             break;
//                         }                    
//                     } else if (point.t < currentTimeStamp) {
//                         indexes[pathLabel] += 1;
//                         break;
//                     } 
//                     vCoordinates.push(point.x);
//                     vCoordinates.push(point.y);
//                     vCoordinates.push(point.z);
//                 }
//             }
//             if (i == labels.length) {
//                 // Increment indexes
//                 console.log(vCoordinates)
//                 labels.forEach((pathLabel) => {
//                     indexes[pathLabel] += 1;
//                 })
//                 // Create vector
//                 trajectory.push(new Vector(vCoordinates));
//             }
//         }
//         jackknifeSample.add_trajectory(trajectory)
//     });
//     return jackknifeSample;
// }

function convert(sample, name) {
    let jackknifeSample;
    if (name) {
        jackknifeSample = new Sample(0, name);
    } else {
        jackknifeSample = new Sample();
    }

    sample.strokes.forEach((stroke) => {
        let currentTimeStamp = -Infinity;
        let labels = Object.keys(stroke.paths).sort();

        // Init indexes
        let indexes = new Array(labels.length).fill(0);

        // Generate vectors
        let trajectory = []
        let hasVector = true;
        while (hasVector) {
            let vCoordinates = [];
            let increments = new Array(labels.length).fill(0);
            let endCount = 0;
            for (let i = 0; i < labels.length; i++) {
                let pathLabel = labels[i];
                let points = stroke.paths[pathLabel].points;
                let index = indexes[i];
                if (index >= points.length) {
                    vCoordinates.push(0.0);
                    vCoordinates.push(0.0);
                    vCoordinates.push(0.0);
                    endCount += 1;    
                } else {
                    let point = points[index];
                    if (point.t > currentTimeStamp) {
                        if (endCount == i) {
                            currentTimeStamp = point.t;
                        } else {
                            vCoordinates.push(0.0);
                            vCoordinates.push(0.0);
                            vCoordinates.push(0.0);    
                            continue;
                        }                
                    } else if (point.t < currentTimeStamp) {
                        currentTimeStamp = point.t
                        increments.fill(0);
                        vCoordinates.fill(0.0); // Default value
                    } else {
                    }
                    increments[i] = 1;
                    vCoordinates.push(point.x);
                    vCoordinates.push(point.y);
                    vCoordinates.push(point.z);
                }
            }
            if (endCount != labels.length && currentTimeStamp != -Infinity) {
                // Increment indexes
                for (let i = 0; i < labels.length; i++) {
                    indexes[i] += increments[i];
                }
                // Create vector
                trajectory.push(new Vector(vCoordinates));
            } else {
                hasVector = false;
            }
        }
        jackknifeSample.add_trajectory(trajectory)
    });
    return jackknifeSample;
}

module.exports = {
	JackknifeRecognizer
};