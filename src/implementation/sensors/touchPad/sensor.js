const AbstractSensor = require('../../../framework/sensors/abstract-sensor').AbstractSensor

const Point2D = require('../../../framework/gestures/Point').Point2D;
const Point3D = require('../../../framework/gestures/Point').Point3D;
const {Frame, Articulation} = require('../../../framework/frames/frame');

//Web Socket Import
var webSocketServer = require('ws').Server;
var socket = new webSocketServer({port:8081})
var fs = require('fs');


class Sensor extends AbstractSensor{
    constructor(){
        super("Touchpad-Interface");
    }

    loop(callback){
        console.log("Hello")

        this.callback = callback;
       

        socket.on('connection',function(ws){
            console.log("TouchPad----Connected-----");
            ws.on('message',function(message){
                 
                let parsedFrame = new Frame(0);

                var received_info = JSON.parse(message)
                if(received_info.type === "3D"){
                    let data3D_received = received_info
                    let x = data3D_received.x
                    let y = data3D_received.y
                    let z = data3D_received.z
                    let t = data3D_received.count

                    let point3D = new Point3D(x,y,z,t);
                    let articulation = new Articulation("main",point3D);
                    parsedFrame.addArticulation(articulation);
                }
                else if(received_info.type === "2D"){
                    let data2D_received = received_info
                    let x = data2D_received.x
                    let y = data2D_received.y
                    let t = data2D_received.count
                    

                    let point2D = new Point3D(x,y,0,t);
                    let articulation = new Articulation("main",point2D);
                    parsedFrame.addArticulation(articulation);
                }
                parsedFrame.hasRightHand = true;
                callback(parsedFrame, {});
            })
        })
        
    }

    stop(){
        socket.onclose = function(event){
            console.log("TouchPad---Disconnected-----")
        }
    }
}

module.exports = {
    Sensor
}