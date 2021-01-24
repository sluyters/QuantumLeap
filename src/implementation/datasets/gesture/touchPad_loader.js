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
    console.log("We LOADING")

    fs.readdirSync(dirPath).forEach((dir)=>{
        let gestureClassDirPath = path.join(dirPath,dir);
        let gestureClass = new GestureClass(dir,gestureIndex);
        gestureIndex+=1;
        
        fs.readdirSync(gestureClassDirPath).forEach((file)=>{
            let rawGesturePath = path.join(gestureClassDirPath,file);
            let rawGestureData = JSON.parse(fs.readFileSync(rawGesturePath));
            let gestureData = new StrokeData();
            let strokePath = new Path("main");
            gestureData.addPath("main",strokePath);
            
            for(let i = 0 ; i < rawGestureData.table.length ; i++ ) {
                var value = rawGestureData.table
                let stroke = new Stroke(i);
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
                strokePath.addStroke(stroke);
            }
           // console.log(gestureData)
            gestureClass.addSample(gestureData);
        });
        console.log(gestureClass)
        gestureSet.addGestureClass(gestureClass)
        console.log(gestureSet)
    });

    return gestureSet;
}
module.exports = {
    loadDataset
};