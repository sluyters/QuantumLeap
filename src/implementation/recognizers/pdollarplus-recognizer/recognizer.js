const AbstractRecognizer = require('../../../framework/recognizers/abstract-recognizer').AbstractRecognizer;
const PDollarPlusRecognizer = require('./pdollarplus/pdollarplus').PDollarPlusRecognizer;
const Point =  require('./pdollarplus/pdollarplus').$PP_Point;

let pathName;

class Recognizer extends AbstractRecognizer {

    static name = "PDollarPlusRecognizer";

    constructor(options, dataset) {
        super();
        this.N = options.samplingPoints;
        pathName = options.pathName;
        this.recognizer = new PDollarPlusRecognizer();

        if (dataset!==undefined){
            dataset.getGestureClasses().forEach((gesture) => {
                gesture.getSample().forEach(sample => {
                        this.addGesture(gesture.name, sample);
                    }
                );
            });
        }
    }

    addGesture(name, sample){
        this.recognizer.AddGesture(name, convert(sample), this.N);
    }

    recognize(sample){
        let result = this.recognizer.Recognize(convert(sample), this.N);
        return {name:result.Name, time: result.Time};
    }

    toString() {
        return `${Recognizer.name} [ samplingPoints = ${this.N}, pathName = ${pathName} ]`;
    }

}

function convert(sample){
    let PP_points =[];
    sample.paths[pathName].strokes.forEach((stroke,stroke_id) =>{
       stroke.points.forEach(point => {
           PP_points.push(new Point(point.x, point.y, stroke_id));
       });
    });
    return PP_points;
}

module.exports = {
    Recognizer
};