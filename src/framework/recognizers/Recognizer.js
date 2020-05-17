class Recognizer {

    static name = "Recognizer";

    constructor(dataset) {
        if (dataset!==undefined){
            dataset.getGestureClasses().forEach((gesture, key, self) => {
                gesture.getSample().forEach(sample => {
                        this.addGesture(gesture.name, sample);
                    }
                );
            });
        }
    }

    addGesture(name, sample){
        throw new Error('You must implement this function');
    }

    recognize(sample){
        throw new Error('You must implement this function');
    }

}

module.exports = {
    Recognizer
};