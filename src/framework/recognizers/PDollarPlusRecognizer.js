const recognizer = require('./Recognizer');
const pdollarplus = require('./pdollarplus');

class PDollarPlusRecognizer extends recognizer.Recognizer{

    constructor(name, N) {
        super(name);
        this.N = N;
        this.recognizer = new pdollarplus.PDollarPlusRecognizer();
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
    PDollarPlusRecognizer
};