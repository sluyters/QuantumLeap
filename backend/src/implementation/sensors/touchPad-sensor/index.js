const AbstractSensor = require('../../../framework/modules/sensors/abstract-sensor').AbstractSensor
const Point = require('../../../framework/gestures/point').Point3D;
var webSocketServer = require('ws').Server;
var websocket = new webSocketServer({port:8081})
var count = -1;
var lastFrame;



class Sensor extends AbstractSensor{

    constructor(options){
        super("3DTouchPad");
    }

    getPoints(timestamp){
        let points = [];

        if(count === -1 || lastFrame === null){
            return { 
                hasData: false,
                points: points,
                appData: {}
              };
        }
        points.push({
            name: "3D",
            point: new Point(lastFrame.x,lastFrame.y,lastFrame.z,lastFrame.count)
        })

        //console.log(JSON.stringify(lastFrame))
        lastFrame = null

        
        return { 
            hasData: true,
            points: points,
            appData: {}
          };
    }
    

    connect(){  

        websocket.on('connection',function(ws){
            this.ws = ws
            console.log("Touchpad Sensor is Connected !")

            ws.on('message', function getVal(event) {
                let data = JSON.parse(event);
                lastFrame = data
                count = data.count
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