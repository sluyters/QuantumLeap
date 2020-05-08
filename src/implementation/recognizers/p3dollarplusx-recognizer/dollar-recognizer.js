const AbstractRecognizer = require('../../framework/recognizer').AbstractRecognizer;
const DollarRecognizer = require('./P3DollarPlusXRecognizer').Recognizer;

class Recognizer extends AbstractRecognizer {

    constructor(trainingSet) {
        super("Dollar Recognizer");
        this.dollarRecognizer = new DollarRecognizer(trainingSet);
    }

    addGesture(template) {
        this.dollarRecognizer.recognize(template);
    }

    recognize(frames) {
        // Get necessary data from frame 
        this.rightHand = "";
        this.leftHand = "";
        for (const hand of frame.hands) {
            if (hand.type === 'left') {
                this.leftHand = hand;
            } else {
                this.rightHand = hand;
            }
        }
        frame.pointables.forEach((pointable) => {
            if (!pointable.tool && pointable.type == 1 && pointable.handId == this.rightHand.id) {
                this.rightIndexFinger = pointable;
            }
        });
        return { success: false, name: "", time: 0.0 };
    }

    getName() {
        return this.name;
    }
}

function convert(data) {

}

module.exports = {
    Recognizer
};