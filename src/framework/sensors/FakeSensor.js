const Sensor = require('./Sensor').Sensor;

class FakeSensor extends Sensor{

    constructor(dataset) {
        super();
        this.dataset = dataset;
    }

    onGesture(callback){
        this.callback=callback;
    }

    async acquireData(){
        while (true)
        {
            await sleep(5000);
            //take one random sample;
            this.callback(this.dataset.getGestureClass().get("3zoom").getSample()[1]);
        }
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = {
    FakeSensor
};