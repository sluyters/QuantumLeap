// Testing parameters =======================================================================================
// Recognizer
//const Recognizer = require('./recognizers/PDollarPlusRecognizer').PDollarPlusRecognizer;
const Recognizer = require('./recognizers/P3DollarPlusRecognizer').P3DollarPlusRecognizer;
//const Recognizer = require('./recognizers/P3DollarPlusXRecognizer').P3DollarPlusXRecognizer;

// Dataset
//const datasetConverter = require('./datasets/SmartphoneConverter');
const datasetConverter = require('./datasets/LeapmotionConverter');
//const datasetConverter = require('./datasets/uWaveConverter');

let datasetName = "test";
//let datasetFolder = "smartphone";
let datasetFolder = "leapmotion";
//let datasetFolder = "uWaveGestureLibrary";

// Other parameters
let P = 1; //Participants
let G = 4; //Gesture Classes
let TperG = 7; //Templates per Gesture Class
let MAXT = 6; //Maximum Training Templates
let R = 100; //Repetitions
let N = 8; //Points/Shapes
let RECOGNIZERS = [Recognizer.name];

// Testing framework ========================================================================================
let PrintResults = function(results, title) {
    for(let r=0 ; r<results.length ; r++) {
        console.log("#### " + title + " for " + RECOGNIZERS[r] + " ####");
        for(let i=0 ; i<results[r][0].length && i<results[r][1].length ; i++) {
            if(results[r][0][i].length>0 && results[r][1][i].length>0) {
                for(let j=0 ; j<results[r][0][i].length && j<results[r][1][i].length ; j++) {
                    if(results[r][0][i][j].length>0 && results[r][1][i][j].length>0) {
                        for(let k=0 ; k<results[r][0][i][j].length && k<results[r][1][i][j].length ; k++) {
                            console.log("Recognition accuracy with " + (k+1) + " training templates per gesture from " + (j+1)  + " other participants using the platform " + (i+1) + ": " + (results[r][0][i][j][k]*100).toFixed(2) + " (" + results[r][1][i][j][k].toFixed(2) + "ms)");
                        }
                        if(j!=results[r][0][i].length-1) console.log("----");
                    }
                    else {
                        if(title=="USER-INDEPENDENT & PLATFORM-DEPENDENT TESTING (d2)" || title=="USER-INDEPENDENT & PLATFORM-DEPENDENT TESTING (d1)") {
                            console.log("Recognition accuracy with " + (j+1) + " training templates per gesture from " + (i+1)  + " other participants: " + (results[r][0][i][j]*100).toFixed(2) + " (" + results[r][1][i][j].toFixed(2) + "ms)");
                        }
                        else {
                            console.log("Recognition accuracy with " + (j+1) + " training templates per gesture from the platform " + (i+1) + ": " + (results[r][0][i][j]*100).toFixed(2) + " (" + results[r][1][i][j].toFixed(2) + "ms)");
                        }
                    }
                }
                if(i!=results[r][0].length-1) console.log("----");
            }
            else {
                console.log("Recognition accuracy with " + (i+1) + " training templates per gesture: " + (results[r][0][i]*100).toFixed(2) + " (" + results[r][1][i].toFixed(2) + "ms)");
            }
        }
    }
    console.log("--------")
};

let StartUserDepDeviceDepTesting = function(dataset) {
    //console.log(dataset);
    let recognition_rates = new Array(MAXT).fill(0);
    let execution_time = new Array(MAXT).fill(0);

    for(let p=0 ; p<P ; p++) {
        for(let tg=1 ; tg<=MAXT ; tg++) { //for each training set size
            let current_recognition_score = 0;
            let current_execution_time = 0.0;
            for(let r=0 ; r<R ; r++) {
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

                    current_recognition_score += (result.Name===gesture.name) ? 1 : 0;
                    current_execution_time += result.Time;
                    c++;
                });
            }
            recognition_rates[tg-1] += current_recognition_score;
            execution_time[tg-1] += current_execution_time;
        }
    }
    for(let i=0 ; i<recognition_rates.length ; i++) {
        recognition_rates[i] = recognition_rates[i]/(P*R*G);
        execution_time[i] = execution_time[i]/(P*R*G);
    }
    return [
        [recognition_rates, execution_time]
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
let result = StartUserDepDeviceDepTesting(dataset);
PrintResults(result, 'USER-DEPENDENT TESTING');