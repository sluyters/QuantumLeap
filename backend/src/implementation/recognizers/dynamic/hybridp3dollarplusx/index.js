const AbstractDynamicRecognizer = require('../../../../framework/recognizers/dynamic/abstract-dynamic-recognizer').AbstractDynamicRecognizer;
const P3DollarPlusXRecognizer = require('./p3dollarplusx/p3dollarplusx').P3DollarPlusXRecognizer;
const Point = require('./p3dollarplusx/p3dollarplusx').Point;

class Recognizer extends AbstractDynamicRecognizer {

    static name = "HybridP3DollarPlusX";

	constructor(options, dataset) {
		super();
        this.samplingPoints = options.samplingPoints;
        this.palmThreshold = options.palmThreshold;
        this.fingerThreshold = options.fingerThreshold;

        // Initialize recognizer for large scale movement
        this.largeScaleRecognizer = new P3DollarPlusXRecognizer(this.samplingPoints);

        // Initialize recognizer for fine movements
        this.smallScaleRecognizer = new P3DollarPlusXRecognizer(this.samplingPoints);

        // Initialize recognizer for static gestures
        //this.staticRecognizer = new P3DollarPlusXRecognizer();

        // Load templates
		if (dataset !== undefined){
			dataset.getGestureClasses().forEach((gesture) => {
				gesture.getSamples().forEach(sample => {
						this.addGesture(gesture.name, sample);
					}
				);
            });
        }
	}

	addGesture(name, sample){
        const { scale, gestureData } = parseData(sample, this.palmThreshold, this.fingerThreshold);
        // Add gesture
        if (scale === "small") {
            this.smallScaleRecognizer.AddGesture(name, gestureData);
        } else if (scale === "large") {
            this.largeScaleRecognizer.AddGesture(name, gestureData);
        } else {
            //console.log("static gesture ?");
        }
    }

    removeGesture(name) {
        this.smallScaleRecognizer.RemoveGesture(name);
        this.largeScaleRecognizer.RemoveGesture(name);
    }

    recognize(sample){
        const { scale, gestureData } = parseData(sample, this.palmThreshold, this.fingerThreshold);
        if (scale === "small") {
            let result = this.smallScaleRecognizer.Recognize(gestureData);
            return (result.Name === "No match.") ? { name: "", time: result.Time, score: result.Score } : { name: result.Name, time: result.Time, score: result.Score };
        } else if (scale === "large") {
            let result = this.largeScaleRecognizer.Recognize(gestureData);
            return (result.Name === "No match.") ? { name: "", time: result.Time, score: result.Score } : { name: result.Name, time: result.Time, score: result.Score };
        } else {
            //console.log("static gesture ?")
            return { name: "", time: 0.0, score: 0.0 };
        }
    }
    
    toString() {
        return `${Recognizer.name} [ samplingPoints = ${this.samplingPoints}, palmThreshold = ${this.palmThreshold}, fingerThreshold = ${this.fingerThreshold} ]`;
    }
}

function parseData(sample, palmThreshold, fingerThreshold) {
    // Determine max palm translation
    let maxPalmTranslation = 0;
    let palmData = [];
    for (const point of sample.paths['rightPalmPosition'].strokes[0].points) {
        palm = new Point(point.x, point.y, point.z, 0);
        palmData.push(palm);
        let palmTranslation = distance(palmData[0], palm);
        maxPalmTranslation = Math.max(palmTranslation, maxPalmTranslation);
    }

    // Determine max finger translation
    let maxFingerTranslation = 0;
    let fingerId = 0;
    let fingersData = {};
    for (const finger of ["rightThumbTipPosition", "rightIndexTipPosition"]) {
        fingersData[finger] = [];
        for (let i = 0; i < sample.paths[finger].strokes[0].points.length; i++) {
            let palmPoint = sample.paths['rightPalmPosition'].strokes[0].points[i];
            let fingerPoint = sample.paths[finger].strokes[0].points[i];
            // Compute translated point
            let x = fingerPoint.x - palmPoint.x;
            let y = fingerPoint.y - palmPoint.y;
            let z = fingerPoint.z - palmPoint.z;
            // Add translated point to list
            let translatedPoint = new Point(x, y, z, fingerPoint.id);
            fingersData[finger].push(translatedPoint);
            let fingerTranslation = distance(fingersData[finger][0], translatedPoint);
            maxFingerTranslation = Math.max(fingerTranslation, maxFingerTranslation);
        }
        fingerId++;
    }

    if (maxPalmTranslation > maxFingerTranslation * 1.2 && maxPalmTranslation > palmThreshold) {
        // Large scale gesture
        return { scale: "large", gestureData: palmData };
    } else if (maxFingerTranslation > fingerThreshold) {
        // Small scale gesture
        let smallScaleGestureData = [];
        Object.keys(fingersData).forEach((finger) => {
			smallScaleGestureData = smallScaleGestureData.concat(fingersData[finger]);
		});
        return { scale: "small", gestureData: smallScaleGestureData };
    } else {
        // Neither large nor small
        return { scale: "", gestureData: [] };
    }
}

function distance(p1, p2) {
	var dx = p2.X - p1.X;
	var dy = p2.Y - p1.Y;
	var dz = p2.Z - p1.Z;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

module.exports = Recognizer;