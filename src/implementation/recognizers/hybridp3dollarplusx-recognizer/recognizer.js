const AbstractRecognizer = require('../../../framework/recognizers/abstract-recognizer').AbstractRecognizer;
const { P3DollarPlusXRecognizer, Point } = require('./p3dollarplusx/p3dollarplusx-recognizer');

class Recognizer extends AbstractRecognizer {

    static name = "HybridP3DollarPlusX";

	constructor(options, dataset) {
		super();
        this.N = options.samplingPoints;
        this.palmThreshold = options.palmThreshold;
        this.fingerThreshold = options.fingerThreshold;

        // Initialize recognizer for large scale movement
        this.largeScaleRecognizer = new P3DollarPlusXRecognizer(options.samplingPoints);

        // Initialize recognizer for fine movements
        this.smallScaleRecognizer = new P3DollarPlusXRecognizer(options.samplingPoints);

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
            this.smallScaleRecognizer.addGesture(name, gestureData);
        } else if (scale === "large") {
            this.largeScaleRecognizer.addGesture(name, gestureData);
        } else {
            //console.log("static gesture ?");
        }
    }

    recognize(sample){
        const { scale, gestureData } = parseData(sample, this.palmThreshold, this.fingerThreshold);
        if (scale === "small") {
            return this.smallScaleRecognizer.recognize(gestureData);
        } else if (scale === "large") {
            return this.largeScaleRecognizer.recognize(gestureData);
        } else {
            //console.log("static gesture ?")
            return { success: false, name: "", time: 0.0 };
        }
    }
    
    toString() {
        return `${Recognizer.name} [ samplingPoints = ${this.N}, palmThreshold = ${this.palmThreshold}, fingerThreshold = ${this.fingerThreshold} ]`;
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
    for (const finger of ["rightThumbPosition", "rightIndexPosition"]) {
        fingersData[finger] = [];
        for (let i = 0; i < sample.paths[finger].strokes[0].points.length; i++) {
            let palmPoint = sample.paths['rightPalmPosition'].strokes[0].points[i];
            let fingerPoint = sample.paths[finger].strokes[0].points[i];
            // Compute translated point
            let x = fingerPoint.x - palmPoint.x;
            let y = fingerPoint.y - palmPoint.y;
            let z = fingerPoint.z - palmPoint.z;
            let translatedPoint = new Point(x, y, z, fingerId);
            // Add translated point to list
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

function distance(p1, p2) // Euclidean distance between two points
{
	var dx = p2.x - p1.x;
	var dy = p2.y - p1.y;
	var dz = p2.z - p1.z;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

module.exports = {
    Recognizer
}