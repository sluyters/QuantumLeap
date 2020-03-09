import Recognizer from './Recognizer'

class FakeRecognizer extends Recognizer{


    addGesture(){
        console.log('addGesture');
    }

    recognize(){
        console.log('recognize');
    }

}

export default FakeRecognizer;