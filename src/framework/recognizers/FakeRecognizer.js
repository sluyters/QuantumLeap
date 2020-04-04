const Recognizer = require('./Recognizer').Recognizer;

class FakeRecognizer extends Recognizer{

    constructor(N, dataset) {
        super();
        this.gestureset=[];
        //TODO need to init gestureset so can't call super(dataset)
        if (dataset!==undefined){
            dataset.getGestureClass().forEach((gesture, key, self) => {
                gesture.getSample().forEach(sample => {
                        this.addGesture(gesture.name, sample);
                    }
                );
            });
        }
    }

    addGesture(name, sample){
        console.log(name + ': ' + sample);
        if(this.gestureset.indexOf(name) === -1)
            this.gestureset.push(name);
    }

    recognize(sample){
        //console.log('recognize');

        return {Name:this.gestureset[0], Time: 5};
    }

}

module.exports = {
    FakeRecognizer
};