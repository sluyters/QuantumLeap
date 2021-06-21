const AbstractSensor = require('../../../framework/modules/sensors/abstract-sensor').AbstractSensor
const Point = require('../../../framework/gestures/point').Point3D;


var articulation_field = ["3D","2DTouch1","2DTouch2","2DTouch3"]



class Sensor extends AbstractSensor{

    constructor(options){
        super(`3DTouchPad`);
        this.port = options.port
        this.lastframe = undefined
        this.net = require('net');
    }

    getPoints(timestamp){
        let points = [];

        if(this.lastframe === undefined){
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
                        name : `${articulation_field[i]}`,
                        point : basic_point
                    })
                }
            }
        }
        if(this.lastframe.type === "3D"){
            points.push({
                name: `3D`,
                point: new Point(this.lastframe.x,this.lastframe.y,this.lastframe.z,this.lastframe.count)
            })
            addMissingPoints("3D",points)
            
        
        }
        else if(this.lastframe.type ==="2DTouch1"){
            points.push({
                name : `2DTouch1`,
                point: new Point(this.lastframe.x[0],this.lastframe.y[0],0,this.lastframe.count)
            })
            addMissingPoints("2DTouch1",points)
        }
        else if (this.lastframe.type === "2DTouch2"){
            points.push({
                name : `2DTouch2`,
                point: new Point(this.lastframe.x[0],this.lastframe.y[0],0,this.lastframe.count)
            })
            addMissingPoints("2DTouch2",points)

            points.push({
                name : `2DTouch2`,
                point: new Point(this.lastframe.x[1],this.lastframe.y[1],0,this.lastframe.count)
            })
            addMissingPoints("2DTouch2",points)
        }
        else if (this.lastframe.type === "2DTouch3"){

            points.push({
                name : `2DTouch3`,
                point: new Point(this.lastframe.x[0],this.lastframe.y[0],0,this.lastframe.count)
            })
            addMissingPoints("2DTouch3",points)

            points.push({
                name : `2DTouch3`,
                point: new Point(this.lastframe.x[1],this.lastframe.y[1],0,this.lastframe.count)
            })
            addMissingPoints("2DTouch3",points)

            points.push({
                name : `2DTouch3`,
                point: new Point(this.lastframe.x[2],this.lastframe.y[2],0,this.lastframe.count)
            })
            addMissingPoints("2DTouch3",points)
        }

        this.lastframe = undefined


        
        return { 
            hasData: true,
            points: points,
            appData: {}
          };
    }

    

    connect(){  

        this.net.createServer( (socket) => {
			console.log("TouchPad Connected")
			socket.on('data', (data) => {
				try{
                    this.lastframe = JSON.parse(data);
                }
                catch(error){
                }
			});
			
			socket.on('error', function(e){
				console.log(`3DTouchpad socket is disconnected`);
			});
			
		}).listen(this.port);

    }

    disconnect(){
        //TODO
    }

}

module.exports = Sensor;