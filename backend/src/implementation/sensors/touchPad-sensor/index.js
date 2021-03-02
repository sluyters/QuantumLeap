const AbstractSensor = require('../../../framework/modules/sensors/abstract-sensor').AbstractSensor
const Point3D = require('../../../framework/gestures/point').Point3D;
const WebSocket = require('ws');

class Sensor extends AbstractSensor{

    constructor(options){
        super("3DTouchPad");
        this.ws = undefined;
        this.lastFrame = undefined;
    }

    getPoints(timestamp){
        let frame = this.lastFrame;
        let points = [];

        let fingers = []; //....????

        if(frame !== undefined){
            
        }
        
        return { 
            hasData: hasLeftHand || hasRightHand,
            points: points,
            appData: {}
          };
    }

    connect(){
        console.log("hello")
        this.ws = new WebSocket({port:8081});
        this.ws.on('connection', (event)=>{
            console.log('--- Touchpad Connected ---')
            this.ws.on('message', (event) => {
                let data = JSON.parse(event);
                this.lastFrame = data;
            })
        })
        
    }

    disconnect(){
        if (this.ws){
            this.ws = undefined;
            this.lastFrame = undefined;
        }
    }

}

module.exports = Sensor;