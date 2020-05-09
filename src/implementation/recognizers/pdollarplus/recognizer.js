const recognizer = require('../../../framework/recognizers/Recognizer');
const pdollarplus = require('./pdollarplus');

class Recognizer extends recognizer.Recognizer{

    static name = "PDollarPlusRecognizer";

    constructor(options, dataset) {
        super();
        this.N = options.samplingPoints;
        this.recognizer = new pdollarplus.PDollarPlusRecognizer();

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
        this.recognizer.AddGesture(name, convert(sample), this.N);
    }

    recognize(sample){
        let result = this.recognizer.Recognize(convert(sample), this.N);
        return {Name:result.Name, Time: result.Time};
    }

}

function convert(sample){
    let PP_points =[];
    sample.strokes.forEach((stroke,stroke_id) =>{
       stroke.points.forEach(point => {
           PP_points.push(new pdollarplus.$PP_Point(point.x, point.y, stroke_id));
       });
    });
    return PP_points;
}

module.exports = {
    PDollarPlusRecognizer: Recognizer
};