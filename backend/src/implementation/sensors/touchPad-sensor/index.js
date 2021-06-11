const AbstractSensor = require('../../../framework/modules/sensors/abstract-sensor').AbstractSensor
const Point = require('../../../framework/gestures/point').Point3D;
net = require('net');
var count = -1;
var lastFrame;

var articulation_field = ["3D","2DTouch1","2DTouch2","2DTouch3"]



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

        const addMissingPoints = (field,points) => {
            let basic_point = new Point(10,10,10,10);
            for(let i = 0; i < articulation_field.length; i++){
                if (field !== articulation_field[i]){
                    points.push({
                        name : articulation_field[i],
                        point : basic_point
                    })
                }
            }
        }
        if(lastFrame.type === "3D"){
            points.push({
                name: "3D",
                point: new Point(lastFrame.x,lastFrame.y,lastFrame.z,lastFrame.count)
            })
            addMissingPoints("3D",points)
        }
        else if(lastFrame.type ==="2DTouch1"){
            points.push({
                name : "2DTouch1",
                point: new Point(lastFrame.x[0],lastFrame.y[0],0,lastFrame.count)
            })
            addMissingPoints("2DTouch1",points)
        }
        else if (lastFrame.type === "2DTouch2"){
            points.push({
                name : "2DTouch2",
                point: new Point(lastFrame.x[0],lastFrame.y[0],0,lastFrame.count)
            })
            addMissingPoints("2DTouch2",points)

            points.push({
                name : "2DTouch2",
                point: new Point(lastFrame.x[1],lastFrame.y[1],0,lastFrame.count)
            })
            addMissingPoints("2DTouch2",points)
        }
        else if (lastFrame.type === "2DTouch3"){

            points.push({
                name : "2DTouch3",
                point: new Point(lastFrame.x[0],lastFrame.y[0],0,lastFrame.count)
            })
            addMissingPoints("2DTouch3",points)

            points.push({
                name : "2DTouch3",
                point: new Point(lastFrame.x[1],lastFrame.y[1],0,lastFrame.count)
            })
            addMissingPoints("2DTouch3",points)

            points.push({
                name : "2DTouch3",
                point: new Point(lastFrame.x[2],lastFrame.y[2],0,lastFrame.count)
            })
            addMissingPoints("2DTouch3",points)
        }

        lastFrame = null

        
        return { 
            hasData: true,
            points: points,
            appData: {}
          };
    }

    

    connect(){  

        net.createServer(function (socket) {
			console.log("TouchPad Connected")
			socket.on('data', function (data) {
				lastFrame = JSON.parse(data);
				count ++;
			});
			
			socket.on('error', function(e){
				console.log(e);
			});
			
		}).listen(5000);

    }

    disconnect(){
        if (this.ws){
            this.ws = undefined;
            this.lastFrame = undefined;
        }
    }

}

module.exports = Sensor;