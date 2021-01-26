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

        this.callback = callback;

        var previous2DData = false
        var points2D_tab = []
        var actual_count = -1
        var count_fingers = 1


        socket.on('connection',function(ws){
            console.log("TouchPad----Connected-----");
            ws.on('message',function(message){
                 
                let parsedFrame = new Frame(0);

                var received_info = JSON.parse(message)


                if(received_info.type === "2D"){
                    if(previous2DData == false){
                        points2D_tab = []
                        let data2D_received = received_info
                        let x = data2D_received.x
                        let y = data2D_received.y
                        let t = data2D_received.count
                    

                        points2D_tab[0] = new Point3D(x,y,0,t);
                        actual_count = t
                        previous2DData = true
                        // let articulation = new Articulation("2DTouch",point2D);
                        // parsedFrame.addArticulation(articulation);
                    }
                    else{
                        let data2D_received = received_info
                        if(actual_count != data2D_received.count){
                            if (count_fingers == 1){
                                parsedFrame.addArticulation(new Articulation("2DTouch1",points2D_tab[0]))
                                parsedFrame.hasRightHand = true;
                                callback(parsedFrame, {});
                                
                                points2D_tab[0] = new Point3D(data2D_received.x,data2D_received.y,0,data2D_received.count)
                                actual_count = data2D_received.count
                            }
                            else if(count_fingers == 2){
                                let it = 0
                                while(it< 2){
                                    parsedFrame.addArticulation(new Articulation("2DTouch2",points2D_tab[it]))
                                    parsedFrame.hasRightHand = true;
                                    callback(parsedFrame, {});
                                    it += 1
                                }
                                points2D_tab = [] 
                                points2D_tab[0] = new Point3D(data2D_received.x,data2D_received.y,0,data2D_received.count)
                                count_fingers -= 1
                                actual_count = data2D_received.count

                            }

                            else{
                                let it = 0
                                while(it< 3){
                                    parsedFrame.addArticulation(new Articulation("2DTouch3",points2D_tab[it]))
                                    parsedFrame.hasRightHand = true;
                                    callback(parsedFrame, {});
                                    it += 1
                                }
                                points2D_tab = []
                                points2D_tab[0] = new Point3D(data2D_received.x,data2D_received.y,0,data2D_received.count)
                                count_fingers -= 2
                                actual_count = data2D_received.count
                            }
                        }
                        else{
                            points2D_tab[points2D_tab.length] = new Point3D(data2D_received.x,data2D_received.y,0,data2D_received.count)
                            count_fingers += 1
                        }

                    }
                    
                }

                else if(received_info.type === "3D"){


                    if (previous2DData == true){
                        if(count_fingers == 1){
                            parsedFrame.addArticulation(new Articulation("2DTouch1",points2D_tab[0]))
                            parsedFrame.hasRightHand = true;
                            callback(parsedFrame, {});
                        }
                        else if (count_fingers == 2){
                            let it = 0
                            while(it < count_fingers){
                                parsedFrame.addArticulation(new Articulation("2DTouch2",points2D_tab[it]))
                                parsedFrame.hasRightHand = true;
                                callback(parsedFrame, {});
                                it += 1
                            }
                        }
                        else{
                            let it = 0
                            while(it < 3){
                                parsedFrame.addArticulation(new Articulation("2DTouch3",points2D_tab[it]))
                                parsedFrame.hasRightHand = true;
                                callback(parsedFrame, {});
                                it += 1
                            }

                        }
                        count_fingers = 1
                        previous2DData = false
                        points2D_tab = []
                    }


                    let data3D_received = received_info
                    let x = data3D_received.x
                    let y = data3D_received.y
                    let z = data3D_received.z
                    let t = data3D_received.count

                    let point3D = new Point3D(x,y,z,t);
                    let articulation = new Articulation("3D",point3D);
                    parsedFrame.addArticulation(articulation);
                    
                    parsedFrame.hasRightHand = true;
                    callback(parsedFrame, {});
                }
                
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