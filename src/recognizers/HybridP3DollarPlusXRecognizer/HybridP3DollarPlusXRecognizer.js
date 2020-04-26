const Recognizer = require('../../framework/recognizers/Recognizer').Recognizer;
const P3DollarPlusXRecognizer = require('./P3DollarPlusXRecognizer').P3DollarPlusXRecognizer;
const Point = require('./P3DollarPlusXRecognizer').Point;

class HybridP3DollarPlusXRecognizer extends Recognizer {

	constructor(N, useless_argument, dataset) {
		super();
        this.N = N;

        // Initialize recognizer for large scale movement
        this.largeScaleRecognizer = new P3DollarPlusXRecognizer(N);

        // Initialize recognizer for fine movements
        this.smallScaleRecognizer = new P3DollarPlusXRecognizer(N);

        // Initialize recognizer for static gestures
        //this.staticRecognizer = new P3DollarPlusXRecognizer();

        // Load templates
		if (dataset !== undefined){
			dataset.getGestureClass().forEach((gesture) => {
				gesture.getSample().forEach(sample => {
						this.addGesture(gesture.name, sample);
					}
				);
            });
        }
	}

	addGesture(name, sample){
        const { scale, gestureData } = parseData(sample);
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
        const { scale, gestureData } = parseData(sample);
        if (scale === "small") {
            return this.smallScaleRecognizer.recognize(gestureData);
        } else if (scale === "large") {
            return this.largeScaleRecognizer.recognize(gestureData);
        } else {
            //console.log("static gesture ?")
            
            return { 'Name': 'No match', 'Time': 0.0, 'Score': 0.0 }
        }
	}
}

function parseData(sample) {
    const palmThreshold = 50;
    const fingerThreshold = 15;

    let stroke = sample.strokes[0];

    // Determine max palm translation
    let maxPalmTranslation = 0;
    let palmData = [];
    for (const point of stroke.paths['rigthPalmPosition'].points) {
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
        for (let i = 0; i < stroke.paths[finger].points.length; i++) {
            let palmPoint = stroke.paths['rigthPalmPosition'].points[i];
            let fingerPoint = stroke.paths[finger].points[i];
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
    HybridP3DollarPlusXRecognizer
}