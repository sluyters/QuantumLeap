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
            let strokePath3D = new Path("3D");
            let strokePath2D1 = new Path("2DTouch1")
            let strokePath2D2 = new Path("2DTouch2")
            let strokePath2D3 = new Path("2DTouch3")
            gestureData.addPath("3D",strokePath3D);
            gestureData.addPath("2DTouch1",strokePath2D1);
            gestureData.addPath("2DTouch2",strokePath2D2);
            gestureData.addPath("2DTouch3",strokePath2D3);

            let stroke3D = new Stroke("3D");
            let stroke2D1 = new Stroke("2DTouch1")
            let stroke2D2 = new Stroke("2DTouch2")
            let stroke2D3 = new Stroke("2DTouch3")
            
            for(let i = 0 ; i < rawGestureData.table.length ; i++ ) {
                var value = rawGestureData.table
                if(value[i].type === "2D"){
                    points2D_tab = []

                    let x = value[i].x;
                    let y = value[i].y;
                    let t = value[i].count;
                    points2D_tab[0] = new Point3D(x,y,0,t)
                    
                    let nbr_fingers = 1
                    let actual_count = value[i].count;

                    for(let count = 1 ; i+count < value.length && value[i+count].type === "2D" && value[i+count].count == actual_count  && count < 4; count ++){
                        points2D_tab[count] = new Point3D(value[i+count].x,value[i+count].y,0,actual_count)
                        nbr_fingers += 1
                    }
                    if(nbr_fingers == 1){
                        stroke2D1.addPoint(points2D_tab[0])
                        stroke2D2.addPoint(new Point3D(0,0,0,0))
                        stroke2D3.addPoint(new Point3D(0,0,0,0))
                        stroke3D.addPoint(new Point3D(0,0,0,0))
                    }
                    else if(nbr_fingers == 2){
                        let it = 0
                        while(it< 2){
                            stroke2D2.addPoint(points2D_tab[it])
                            stroke2D1.addPoint(new Point3D(0,0,0,0))
                            stroke2D3.addPoint(new Point3D(0,0,0,0))
                            stroke3D.addPoint(new Point3D(0,0,0,0))
                            it += 1
                        }
                        i += 1
                    }
                    else{
                        let it = 0
                        while(it< 3){
                            stroke2D3.addPoint(points2D_tab[it])
                            stroke2D2.addPoint(new Point3D(0,0,0,0))
                            stroke2D1.addPoint(new Point3D(0,0,0,0))
                            stroke3D.addPoint(new Point3D(0,0,0,0))
                            it += 1
                        }
                        i += count - 1
                    }
    
                }
                else if(value[i].type === "3D"){
                    let x = value[i].x;
                    let y = value[i].y;
                    let z = value[i].z;
                    let t = value[i].count;
                    stroke3D.addPoint(new Point3D(x,y,z,t))
                    stroke2D2.addPoint(new Point3D(0,0,0,0))
                    stroke2D1.addPoint(new Point3D(0,0,0,0))
                    stroke2D3.addPoint(new Point3D(0,0,0,0))
                }
                                
            }
            strokePath2D1.addStroke(stroke2D1);
            strokePath2D2.addStroke(stroke2D2);
            strokePath2D3.addStroke(stroke2D3);
            strokePath3D.addStroke(stroke3D);

            gestureClass.addSample(gestureData)
        });
        gestureSet.addGestureClass(gestureClass)
    });

    return gestureSet;
}
module.exports = {
    loadDataset
};