const fs = require('fs');
const path = require('path');

const GestureSet = require('../../../../framework/gestures/gesture-set').GestureSet;
const GestureClass = require('../../../../framework/gestures/gesture-class').GestureClass;
const StrokeData = require('../../../../framework/gestures/stroke-data').StrokeData;
const Stroke = require('../../../../framework/gestures/stroke-data').Stroke;
const Path = require('../../../../framework/gestures/stroke-data').Path;
const Point3D = require('../../../../framework/gestures/point').Point3D;

function loadDataset(name, datasetPath, identifier, sensorPointsNames){
    let gestureSet = new GestureSet(name);
    let dirPath = datasetPath;
    let gestureIndex = 0;
    let user = 0;

    fs.readdirSync(dirPath, {withFileTypes: true}).filter(dirent => !dirent.isFile()).map(dirent => dirent.name).forEach((user_dir) => {
        let gestureClassDirPath = path.join(dirPath,user_dir);
        let gestureClass = new GestureClass(user_dir,gestureIndex);
        gestureIndex += 1;
        user += 1;
        let count = 0;

        fs.readdirSync(gestureClassDirPath).forEach((sample) =>{
            let rawGesturePath = path.join(gestureClassDirPath,sample);
            let rawGestureData = JSON.parse(fs.readFileSync(rawGesturePath));
            let gestureData = new StrokeData(user,count,undefined);
            count += 1
            let strokePath3D = new Path("3D_sensor");
            let strokePath2D1 = new Path("2DTouch1_sensor");
            let strokePath2D2 = new Path("2DTouch2_sensor");
            let strokePath2D3 = new Path("2DTouch3_sensor");
            gestureData.addPath("3D_sensor",strokePath3D);
            gestureData.addPath("2DTouch1_sensor",strokePath2D1);
            gestureData.addPath("2DTouch2_sensor",strokePath2D2);
            gestureData.addPath("2DTouch3_sensor",strokePath2D3);


            let stroke3D = new Stroke("3D_sensor");
            let stroke2D1 = new Stroke("2DTouch1_sensor");
            let stroke2D2 = new Stroke("2DTouch2_sensor");
            let stroke2D3 = new Stroke("2DTouch3_sensor");

            let basic_point = new Point3D(10,10,10,10);
            for(let i = 0 ; i < rawGestureData.table.length ; i++ ) {
                
                if (i > 0){
                    basic_point = new Point3D(10,10,10,10);
                }
                var value = rawGestureData.table
                if(value[i].type === "2D"){
                    points2D_tab = [];

                    let x = value[i].x;
                    let y = value[i].y;
                    let t = value[i].count;
                    points2D_tab[0] = new Point3D(x,y,0,t);
                    
                    let nbr_fingers = 1;
                    let actual_count = value[i].count;

                    for(let count = 1 ; i+count < value.length && value[i+count].type === "2D" && value[i+count].count == actual_count  && count < 4; count ++){
                        points2D_tab[count] = new Point3D(value[i+count].x,value[i+count].y,0,actual_count);
                        nbr_fingers += 1;
                    }
                    if(nbr_fingers == 1){
                        stroke2D1.addPoint(points2D_tab[0]);
                        stroke2D2.addPoint(basic_point);
                        stroke2D3.addPoint(basic_point);
                        stroke3D.addPoint(basic_point);
                    }
                    else if(nbr_fingers == 2){
                        let it = 0;
                        while(it< 2){
                            stroke2D2.addPoint(points2D_tab[it]);
                            stroke2D1.addPoint(basic_point);
                            stroke2D3.addPoint(basic_point);
                            stroke3D.addPoint(basic_point);
                            it += 1;
                        }
                        i += 1;
                    }
                    else{
                        let it = 0;
                        while(it< 3){
                            stroke2D3.addPoint(points2D_tab[it]);
                            stroke2D2.addPoint(basic_point);
                            stroke2D1.addPoint(basic_point);
                            stroke3D.addPoint(basic_point);
                            it += 1;
                        }
                        i += count - 1;
                    }
    
                }
                else if(value[i].type === "3D"){
                    let x = value[i].x;
                    let y = value[i].y;
                    let z = value[i].z;
                    let t = value[i].count;
                    stroke3D.addPoint(new Point3D(x,y,z,t));
                    stroke2D2.addPoint(basic_point);
                    stroke2D1.addPoint(basic_point);
                    stroke2D3.addPoint(basic_point);
                }
                                
            }
            strokePath2D1.addStroke(stroke2D1);
            strokePath2D2.addStroke(stroke2D2);
            strokePath2D3.addStroke(stroke2D3);
            strokePath3D.addStroke(stroke3D);

            gestureClass.addSample(gestureData);
        });
        gestureSet.addGestureClass(gestureClass);
    })
    return gestureSet;
}
module.exports = {
    loadDataset
};