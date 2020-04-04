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
            if(this.callback!==undefined)
                this.callback(this.dataset.getGestureClass().get("3zoom").getSample()[1]);
        }
    }

    stop(){
        console.log("End sensor");
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