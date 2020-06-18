class AbstractSensor {

    onGesture(callback){
        throw new Error('You must implement this function');
    }

    async acquireData(){
        throw new Error('You must implement this function');
    }

    stop(){
        throw new Error('You must implement this function');
    }
}

module.exports = {
    AbstractSensor
};