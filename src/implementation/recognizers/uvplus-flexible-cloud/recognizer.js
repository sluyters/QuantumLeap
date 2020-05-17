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
            dataset.getGestureClasses().forEach((gesture, key, self) => {
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
        return {name:result[0], time: result[1]};
    }

    convert(sample){
        let points =[];
        for(let path in sample.paths){
            let strokes = sample.paths[path].strokes;
            let articulationPoints = [];
            strokes.forEach(stroke =>{
                articulationPoints = articulationPoints.concat(stroke.points);
            });
            points.push(articulationPoints);
        }
        return points;
    }

}



module.exports = {
    Recognizer
};