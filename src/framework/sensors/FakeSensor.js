import Sensor from './Sensor'

class FakeSensor extends Sensor{

    constructor(recogniser) {
        super(recogniser);
        this.generateGesture();
    }

    generateGesture(){
        this.recogniser.recognize();
    }
}

export default FakeSensor;