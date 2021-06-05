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
            let strokePath3D = new Path("3D_3Dtchp");
            let strokePath2D1 = new Path("2DTouch1_3Dtchp");
            let strokePath2D2 = new Path("2DTouch2_3Dtchp");
            let strokePath2D3 = new Path("2DTouch3_3Dtchp");
            gestureData.addPath("3D_3Dtchp",strokePath3D);
            gestureData.addPath("2DTouch1_3Dtchp",strokePath2D1);
            gestureData.addPath("2DTouch2_3Dtchp",strokePath2D2);
            gestureData.addPath("2DTouch3_3Dtchp",strokePath2D3);


            let stroke3D = new Stroke("3D_3Dtchp");
            let stroke2D1 = new Stroke("2DTouch1_3Dtchp");
            let stroke2D2 = new Stroke("2DTouch2_3Dtchp");
            let stroke2D3 = new Stroke("2DTouch3_3Dtchp");

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

            gestureClass.addSample(gestureData);
        });
        gestureSet.addGestureClass(gestureClass);
    })
    return gestureSet;
}
module.exports = {
    loadDataset
};