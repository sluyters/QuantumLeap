const StrokeData = require('../framework/gestures/StrokeData').StrokeData;
const Recognizer = require('../framework/recognizers/Recognizer').Recognizer;
const P3DollarPlusRecognizer = require('./P3DollarPlusRecognizer').P3DollarPlusRecognizer;

class Hybrid3DollarRecognizer extends Recognizer {

	constructor(N) {
		super();
        this.numPoints = N;
        
        // Initialize recognizer for large scale movement
        this.largeScaleRecognizer = new P3DollarPlusRecognizer(N);

        // Initialize recognizer for fine movements
        this.smallScaleRecognizer = new P3DollarPlusRecognizer(N);
	}

	addGesture(name, sample){
        // Process points
        let largeScaleGestureData = new StrokeData();
        let smallScaleGestureData = new StrokeData();

        largeScaleGestureData.addStroke(sample.strokes[0]);
        smallScaleGestureData.addStroke(sample.strokes[1]);
        smallScaleGestureData.addStroke(sample.strokes[2]);

        // Add gesture
		this.largeScaleRecognizer.addGesture(name, largeScaleGestureData);
        this.smallScaleRecognizer.addGesture(name, smallScaleGestureData);
    }

    recognize(sample){
        // Process points
        let largeScaleGestureData = new StrokeData();
        let smallScaleGestureData = new StrokeData();

        largeScaleGestureData.addStroke(sample.strokes[0]);
        smallScaleGestureData.addStroke(sample.strokes[1]);
        smallScaleGestureData.addStroke(sample.strokes[2]);

        // Feed points to both recognizers
        var lScaleRes = this.largeScaleRecognizer.recognize(largeScaleGestureData);
        var sScaleRes = this.smallScaleRecognizer.recognize(smallScaleGestureData);

        if (lScaleRes['Score'] > sScaleRes['Score']) {
            return lScaleRes;
        } else {
            return sScaleRes;
        }
        
        // If confidence of largeScaleRecognizer > threshold, choose it
        // Otherwise, choose gesture from smallScaleRecognizer
	}
}

module.exports = {
    Hybrid3DollarRecognizer
}