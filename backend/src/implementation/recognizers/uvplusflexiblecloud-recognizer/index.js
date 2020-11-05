const AbstractRecognizer = require('../../../framework/recognizers/abstract-recognizer').AbstractRecognizer;
const UVPRecognizer = require('./uvplusflexiblecloud/dollar').UVPRecognizer;

class Recognizer extends AbstractRecognizer{

    static name = "UVPlusFlexibleCloudRecognizer";

    constructor(options, dataset) {
        super();
        this.N = options.samplingPoints;
        this.articulations = options.articulations;
        this.recognizer = new UVPRecognizer(this.articulations.length, this.N);
        if (dataset!==undefined){
            dataset.getGestureClasses().forEach((gesture) => {
                gesture.getSamples().forEach(sample => {
                        this.addGesture(gesture.name, sample);
                    }
                );
            });
        }
    }

    addGesture(name, sample){
        this.recognizer.storeTemplate(convert(sample, this.articulations), name);
    }

    removeGesture(name) {
        this.recognizer.removeTemplate(name);
    }

    recognize(sample){
        let result = this.recognizer.recognize(convert(sample, this.articulations));
        return {name:result[0], time: result[1]};
    }

    toString() {
        return `${Recognizer.name} [ samplingPoints = ${this.N}, articulations: ${this.articulations} ]`;
    }
}

function convert(sample, articulations){
    let points =[];
    for(const articulation of articulations){
        let strokes = sample.paths[articulation].strokes;
        let articulationPoints = [];
        strokes.forEach(stroke =>{
            articulationPoints = articulationPoints.concat(stroke.points);
        });
        points.push(articulationPoints);
    }
    return points;
}

module.exports = Recognizer;