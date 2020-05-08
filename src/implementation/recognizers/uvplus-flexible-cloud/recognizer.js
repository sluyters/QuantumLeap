const recognizer = require('../../../framework/recognizers/Recognizer');
const dollar = require('./dollar');

class Recognizer extends recognizer.Recognizer{

    static name = "DollarRecognizer";

    constructor(options, dataset) {
        super();
        this.N = options.samplingPoints;
        this.articulations = options.articulations;
        this.recognizer = new dollar.UVPRecognizer(this.articulations.length, this.N);
        if (dataset!==undefined){
            dataset.getGestureClass().forEach((gesture, key, self) => {
                gesture.getSample().forEach(sample => {
                        this.addGesture(gesture.name, sample);
                    }
                );
            });
        }
    }

    addGesture(name, sample){
        this.recognizer.storeTemplate(this.convert(sample), name);
    }

    recognize(sample){
        let result = this.recognizer.recognize(this.convert(sample));
        return {Name:result[0], Time: result[1]};
    }

    convert(sample){
        let points =[];
        sample.strokes.forEach((stroke,stroke_id) =>{
            this.articulations.forEach(articulation =>{
                let articulationPoints = (stroke.paths[articulation].points.length !== 0) ? stroke.paths[articulation].points : [new dollar.Point(0,0,0)];
                //console.log(JSON.stringify(articulationPoints))
                points.push(articulationPoints);
            });
        });
        //console.log(JSON.stringify(points));
        return points;
    }

}



module.exports = {
    DollarRecognizer: Recognizer
};