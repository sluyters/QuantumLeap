const path = require('path');
const config = require('./benchmarkConfig');

/**
 * Display the results of a test
 */
function printResult(results, dataset, recognizerOrClassifierName, type = "recognizer") {
    if (type === "recognizer") {
        console.log("#### " + recognizerOrClassifierName + " #### number of repetition: " + R + ", N: " + N);
    } else {
        console.log("#### " + recognizerOrClassifierName + " #### number of repetition: " + R);
    }
    console.log("#### gesture set " + dataset.name + " #### " + JSON.stringify(Array.from(dataset.getGestureClasses().keys())));
    let nTemplates = MINT;
    for(let i = 0 ; i < results[0].length && i < results[1].length ; i++) {
        console.log("Recognition accuracy with " + nTemplates + " training templates per gesture: " + (results[0][i]*100).toFixed(2) + " (" + results[1][i].toFixed(2) + "ms)");
        console.log("Confusion matrice: " + JSON.stringify(results[2][i]));
        nTemplates = computeNextT(nTemplates);
    }
    console.log("--------")
};

function startTesting(dataset, recognizerOrClassifierType, config, type = "recognizer") {
    // console.log(dataset);
    let recognition_rates = [];
    let execution_time = [];
    let confusion_matrices = [];

    for(let tg = MINT ; tg <= Math.min(dataset.getMinTemplate(), MAXT); tg = computeNextT(tg)) { // For each training set size
        let current_recognition_score = 0;
        let current_execution_time = 0.0;
        let current_confusion_matrice = new Array(dataset.G).fill(0).map(() => new Array(dataset.G).fill(0));

        for(let r = 0 ; r < R ; r++) { // Repeat R time
            let recognizerOrClassifier = new recognizerOrClassifierType(config);
            let candidates = selectCandidates(dataset);
            let training_templates = [];
            candidates.forEach(val =>{
                training_templates.push([val]);
            });
            for(let t = 0 ; t < tg ; t++) { // Add tg strokeData per gestureClass
                let index = 0;
                dataset.getGestureClasses().forEach((gesture) => {
                    let training = -1;
                    while (training == -1 || training_templates[index].includes(training)) 
                        training = getRandomNumber(0, gesture.getSample().length);
                    training_templates[index].push(training);
                    if (type === "recognizer") { // Training a recognizer
                        recognizerOrClassifier.addGesture(gesture.name, gesture.getSample()[training]);
                    } else { // Training a classifier
                        recognizerOrClassifier.addPose(gesture.name, gesture.getSample()[training]);
                    }
                    index++;
                });
            }
            // Recognition after tg training templates
            let c = 0;
            dataset.getGestureClasses().forEach((gesture) => {
                let toBeTested = gesture.getSample()[candidates[c]];
                if (type === "recognizer") { // Benchmarking a recognizer
                    var result = recognizerOrClassifier.recognize(toBeTested);
                } else { // Benchmarking a classifer
                    var result = recognizerOrClassifier.classify(toBeTested);
                }
                if(dataset.getGestureClasses().has(result.name))
                {
                    let result_index = dataset.getGestureClasses().get(result.name).index;
                    current_confusion_matrice[result_index][gesture.index] += 1;
                }
                current_recognition_score += (result.name===gesture.name) ? 1 : 0;
                current_execution_time += result.time;
                c++;
            });
        }
        recognition_rates.push(current_recognition_score);
        execution_time.push(current_execution_time);
        confusion_matrices.push(current_confusion_matrice);
    }
    for(let i = 0 ; i < recognition_rates.length ; i++) {
        recognition_rates[i] = recognition_rates[i]/(R * dataset.G);
        execution_time[i] = execution_time[i] / (R * dataset.G);
    }
    return [recognition_rates, execution_time, confusion_matrices];
};

/**
 * Return a random list of candidate gestures, 1 candidate per gesture class.
 */
function selectCandidates(dataset) {
    let candidates = [];
    dataset.getGestureClasses().forEach((value) => {
        candidates.push(getRandomNumber(0, value.getSample().length));
    });
    return candidates;
};

/**
 * Return a random number between min and max.
 */
function getRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random()*(max - min))+min;
};

/**
 * Test a specific recognizer/classifier with a specific dataset
 */
function test(dataset, recognizerOrClassifierType, config, type = "recognizer"){
    let result = startTesting(dataset, recognizerOrClassifierType, config, type);
    printResult(result, dataset, recognizerOrClassifierType.name, type);
};


let MINT = config.minT; // Maximum Training Templates
let MAXT = config.maxT; // Maximum Training Templates
let computeNextT = config.nextT; // Function that computes the next number of training templates
let R = config.r; // Repetitions
let N = config.recognizers.nSamplingPoints; // Points/Shapes

// TODO fuse both
if (config.classifiers.modules.length > 0) {
    for(let i=0; i < config.datasets.pose.length; i++){
        let datasetConfig = config.datasets.pose[i];
        let datasetPath = path.join(config.datasets.path, "pose");
        let dataset = datasetConfig.loader.loadDataset(datasetConfig.name, datasetPath);
        for(let j=0; j < config.classifiers.modules.length; j++){
            let classifier = config.classifiers.modules[j];
            test(dataset, classifier.module, classifier.options, "classifier");
        }
    }
}

if (config.recognizers.modules.length > 0) {
    for(let i=0; i < config.datasets.gesture.length; i++){
        let datasetConfig = config.datasets.gesture[i];
        let datasetPath = path.join(config.datasets.path, "gesture");
        let dataset = datasetConfig.loader.loadDataset(datasetConfig.name, datasetPath);
        for(let j=0; j < config.recognizers.modules.length; j++){
            let recognizer = config.recognizers.modules[j];
            test(dataset, recognizer.module, recognizer.options, "recognizer");
        }
    }
}
