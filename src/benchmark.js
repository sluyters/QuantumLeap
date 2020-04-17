// Testing parameters =======================================================================================
// Recognizer
//const Recognizer = require('./recognizers/PDollarPlusRecognizer').PDollarPlusRecognizer;
//const Recognizer = require('./recognizers/P3DollarPlusRecognizer').P3DollarPlusRecognizer;
const Recognizer = require('./recognizers/ThreeCentRecognizer').ThreeCentRecognizer;
//const Recognizer = require('./recognizers/P3DollarPlusXRecognizer').P3DollarPlusXRecognizer;

// Dataset

// let datasetFolder = "smartphone";
// const datasetConverter = require('./datasets/SmartphoneConverter');
// const Recognizer = require('./recognizers/PDollarPlusRecognizer').PDollarPlusRecognizer;

// let datasetFolder = "leapmotion";
// const datasetConverter = require('./datasets/LeapmotionConverter');

// let datasetFolder = "uWaveGestureLibrary";
// const datasetConverter = require('./datasets/uWaveConverter');


let datasetFolder = "HandGestureDataset_SHREC2017_csv";
const datasetConverter = require('./datasets/HandGestureCsv');

let datasetName = "test";

// Other parameters
let MAXT = 16; //Maximum Training Templates
let R = 100; //Repetitions
let N = 8; //Points/Shapes
let RECOGNIZERS = [Recognizer.name];

// Testing framework ========================================================================================
let PrintResults = function(results) {
    for(let r=0 ; r<results.length ; r++) {
        console.log("#### " + RECOGNIZERS[r] + " #### number of repetition: " + R + ", N: " + N);
        console.log("#### gesture set #### " + JSON.stringify(Array.from(dataset.getGestureClass().keys())));
        for(let i=0 ; i<results[r][0].length && i<results[r][1].length ; i++) {
            console.log("Recognition accuracy with " + (i+1) + " training templates per gesture: " + (results[r][0][i]*100).toFixed(2) + " (" + results[r][1][i].toFixed(2) + "ms)");
            console.log("Confusion matrice: " + JSON.stringify(results[r][2][i]));
        }
    }
    console.log("--------")
};

let StartUserIndepTesting = function(dataset) {
    //console.log(dataset);
    let recognition_rates = [];
    let execution_time = [];
    let confusion_matrices = [];

    for(let tg=1 ; tg < Math.min(dataset.TperG, MAXT) ; tg++) { //for each training set size
        let current_recognition_score = 0;
        let current_execution_time = 0.0;
        let current_confusion_matrice = new Array(dataset.G).fill(0).map(() => new Array(dataset.G).fill(0));

        for(let r=0 ; r<R ; r++) { //repeat R time
            let recognizer = new Recognizer(N);

            let candidates = SelectCandidates(dataset);
            let training_templates = [];
            candidates.forEach(val =>{
                training_templates.push([val]);
            });
            for(let t=0 ; t<tg ; t++) { //add tg strokeData per gestureClass
                let index = 0;
                dataset.getGestureClass().forEach((gesture, key, self) => {
                    let training = -1;
                    while(training==-1 || training_templates[index].includes(training)) training = GetRandomNumber(0, gesture.getSample().length);
                    training_templates[index].push(training);
                    recognizer.addGesture(gesture.name, gesture.getSample()[training]);
                    index++;
                });
            }
            // Recognition after tg training templates
            let c = 0;
            dataset.getGestureClass().forEach((gesture, key, self) => {
                let toBeTested = gesture.getSample()[candidates[c]];
                let result = recognizer.recognize(toBeTested);
                if(dataset.getGestureClass().has(result.Name))
                {
                    let result_index = dataset.getGestureClass().get(result.Name).index;
                    current_confusion_matrice[result_index][gesture.index] += 1;
                }
                current_recognition_score += (result.Name===gesture.name) ? 1 : 0;
                current_execution_time += result.Time;
                c++;
            });
        }
        recognition_rates.push(current_recognition_score);
        execution_time.push(current_execution_time);
        confusion_matrices.push(current_confusion_matrice);
    }
    for(let i=0 ; i<recognition_rates.length ; i++) {
        recognition_rates[i] = recognition_rates[i]/(R * dataset.G);
        execution_time[i] = execution_time[i]/(R * dataset.G);
        // confusion_matrices[i].forEach(function(row, x, theArray) {
        //     row.forEach(function(col, y) {
        //         theArray[x][y] = col/100;
        //     });
        // });
    }
    return [
        [recognition_rates, execution_time, confusion_matrices]
        ];
};

/**
 * choose one candidate per gesture
 */
let SelectCandidates = function(dataset) {
    let candidates = [];
    dataset.getGestureClass().forEach((value, key, self) => {
        candidates.push(GetRandomNumber(0, value.getSample().length));
    });
    return candidates;
};

let GetRandomNumber = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random()*(max - min))+min;
};


let dataset = datasetConverter.loadDataset(datasetName, datasetFolder);
let result = StartUserIndepTesting(dataset);
PrintResults(result);