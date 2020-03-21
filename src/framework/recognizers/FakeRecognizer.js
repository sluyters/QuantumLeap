const recognizer = require('./Recognizer');

class FakeRecognizer extends recognizer.Recognizer{


    addGesture(){
        //console.log('addGesture');
    }

    recognize(){
        //console.log('recognize');
        return {Name:"Demo", Time: 5};
    }

}

module.exports = {
    FakeRecognizer
};