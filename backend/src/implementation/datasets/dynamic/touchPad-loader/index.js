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
    
    

    fs.readdirSync(dirPath, {withFileTypes: true}).filter(dirent => !dirent.isFile()).map(dirent => dirent.name).forEach((user_dir) => {
        let gestureClassDirPath = path.join(dirPath,user_dir);

        fs.readdirSync(gestureClassDirPath).forEach((sample) =>{

            let rawGesturePath = path.join(gestureClassDirPath,sample);
            let rawGestureData = JSON.parse(fs.readFileSync(rawGesturePath));

            let filename = sample.split(".")[0].split("-");
            let gestureName = filename[0].split("#")[0];

            let infosupp = undefined;
            if (filename[0].split("#").length > 1) {
                infosupp = filename[0].split("#")[1];
            }
            let id = filename[1];

            let gestureData = new StrokeData(parseInt(user_dir),id,undefined);

            let string3D = "3D_"
            let string2D1 = "2DTouch1_"
            let string2D2 = "2DTouch2_"
            let string2D3 = "2DTouch3_"

            
            let strokePath3D = new Path(string3D.concat(identifier));
            let strokePath2D1 = new Path(string2D1.concat(identifier));
            let strokePath2D2 = new Path(string2D2.concat(identifier));
            let strokePath2D3 = new Path(string2D3.concat(identifier));
            gestureData.addPath(string3D.concat(identifier),strokePath3D);
            gestureData.addPath(string2D1.concat(identifier),strokePath2D1);
            gestureData.addPath(string2D2.concat(identifier),strokePath2D2);
            gestureData.addPath(string2D3.concat(identifier),strokePath2D3);


            let stroke3D = new Stroke(string3D.concat(identifier));
            let stroke2D1 = new Stroke(string2D1.concat(identifier));
            let stroke2D2 = new Stroke(string2D2.concat(identifier));
            let stroke2D3 = new Stroke(string2D3.concat(identifier));

            for(let i = 0 ; i < rawGestureData.table.length ; i++ ) {
                
                let basic_point = new Point3D(10,10,10,10);
                
                var value = rawGestureData.table

                if(value[i].type === "2DTouch1"){
                    stroke2D1.addPoint(new Point3D(value[i].x[0],value[i].y[0],0,value[i].count));

                    stroke3D.addPoint(basic_point);
                    stroke2D2.addPoint(basic_point);
                    stroke2D3.addPoint(basic_point);
                }
                if(value[i].type === "2DTouch2"){
                    stroke2D2.addPoint(new Point3D(value[i].x[0],value[i].y[0],0,value[i].count));

                    stroke3D.addPoint(basic_point);
                    stroke2D1.addPoint(basic_point);
                    stroke2D3.addPoint(basic_point);

                    stroke2D2.addPoint(new Point3D(value[i].x[1],value[i].y[1],0,value[i].count));

                    stroke3D.addPoint(basic_point);
                    stroke2D1.addPoint(basic_point);
                    stroke2D3.addPoint(basic_point);
                }
                if(value[i].type === "2DTouch3"){
                    stroke2D3.addPoint(new Point3D(value[i].x[0],value[i].y[0],0,value[i].count));

                    stroke3D.addPoint(basic_point);
                    stroke2D1.addPoint(basic_point);
                    stroke2D2.addPoint(basic_point);

                    stroke2D3.addPoint(new Point3D(value[i].x[1],value[i].y[1],0,value[i].count));

                    stroke3D.addPoint(basic_point);
                    stroke2D1.addPoint(basic_point);
                    stroke2D2.addPoint(basic_point);

                    stroke2D3.addPoint(new Point3D(value[i].x[2],value[i].y[2],0,value[i].count));

                    stroke3D.addPoint(basic_point);
                    stroke2D1.addPoint(basic_point);
                    stroke2D2.addPoint(basic_point);
                }
                else if(value[i].type === "3D"){
                
                    stroke3D.addPoint(new Point3D(value[i].x,value[i].y,value[i].z,value[i].count));

                    stroke2D2.addPoint(basic_point);
                    stroke2D1.addPoint(basic_point);
                    stroke2D3.addPoint(basic_point);
                }
                                
            }
            strokePath2D1.addStroke(stroke2D1);
            strokePath2D2.addStroke(stroke2D2);
            strokePath2D3.addStroke(stroke2D3);
            strokePath3D.addStroke(stroke3D);

            if (gestureSet.getGestureClasses().has(gestureName)) {
                gestureSet.getGestureClasses().get(gestureName).addSample(gestureData);
            } else {
                let gestureClass = new GestureClass(gestureName, gestureIndex);
                gestureIndex += 1;
                gestureClass.addSample(gestureData);
                gestureSet.addGestureClass(gestureClass);
            }


           
        });

    })

    return gestureSet;
}
module.exports = {
    loadDataset
};