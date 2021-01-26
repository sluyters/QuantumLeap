const path = require("path");
const fs = require('fs');

const GestureSet = require('../../../framework/gestures/gesture-set').GestureSet;
const GestureClass = require('../../../framework/gestures/gesture-class').GestureClass;
const StrokeData = require('../../../framework/gestures/stroke-data').StrokeData;
const Stroke = require('../../../framework/gestures/stroke-data').Stroke;
const Path = require('../../../framework/gestures/stroke-data').Path;
const Point2D = require('../../../framework/gestures/Point').Point2D;
const Point3D = require('../../../framework/gestures/Point').Point3D;

function loadDataset(name,directory){
    let gestureSet = new GestureSet(name);
    let dirPath = path.join(directory,name);
    let gestureIndex = 0;
    let user = 0
    console.log("We LOADING")

    fs.readdirSync(dirPath).forEach((dir)=>{
        let gestureClassDirPath = path.join(dirPath,dir);
        let gestureClass = new GestureClass(dir,gestureIndex);
        gestureIndex+=1;
        user += 1
        let count = 0
        
        fs.readdirSync(gestureClassDirPath).forEach((file)=>{
            
            let rawGesturePath = path.join(gestureClassDirPath,file);
            let rawGestureData = JSON.parse(fs.readFileSync(rawGesturePath));
            let gestureData = new StrokeData(user,count,undefined);
            count += 1
            let strokePath = new Path("main");
            gestureData.addPath("main",strokePath);

            let stroke = new Stroke(0);

            for(let i = 0 ; i < rawGestureData.table.length ; i++ ) {
                let points = {}
                var value = rawGestureData.table
                if(value[i].type === "2D"){
                    let x = value[i].x;
                    let y = value[i].y;
                    let t = value[i].count;
                    stroke.addPoint(new Point2D(x,y,t))
                }
                else if(value[i].type === "3D"){
                    let x = value[i].x;
                    let y = value[i].y;
                    let z = value[i].z;
                    let t = value[i].count;
                    stroke.addPoint(new Point3D(x,y,z,t))
                }
                                
            }
            strokePath.addStroke(stroke);
            gestureClass.addSample(gestureData);
        });
        gestureSet.addGestureClass(gestureClass)
    });

    return gestureSet;
}
module.exports = {
    loadDataset
};