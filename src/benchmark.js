const path = require('path');
const config = require('./benchmarkConfig');

// Important values
const MINT = config.minT; // Maximum Training Templates
const MAXT = config.maxT; // Maximum Training Templates
const computeNextT = config.nextT; // Function that computes the next number of training templates
const R = config.r; // Repetitions
const N = config.recognizers.nSamplingPoints; // Points/Shapes

function run() {
    // Test classifiers
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

    // Test recognizers
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
}

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

/**
 * User-independent testing
 */
function startUserIndependentTesting(dataset, recognizerOrClassifierType, config, type = "recognizer") {
    let recognitionRates = [];
    let executionTimes = [];
    let confusionMatrices = [];
    // Perform the test for each size of training set
    for(let trainingSetSize = MINT ; trainingSetSize <= Math.min(dataset.getMinTemplate(), MAXT); trainingSetSize = computeNextT(trainingSetSize)) {
        let recognitionRate = 0;
        let executionTime = 0.0;
        let confusionMatrix = new Array(dataset.G).fill(0).map(() => new Array(dataset.G).fill(0));
        // Repeat the test R times
        for(let r = 0 ; r < R ; r++) {
            // Initialize the recognizer and select the candidates
            let recognizerOrClassifier = new recognizerOrClassifierType(config);
            let candidates = selectCandidates(dataset);
            // For each gesture class, mark the templates that cannot be reused
            let markedTemplates = [];
            candidates.forEach(candidate =>{
                markedTemplates.push([candidate]);
            });
            // Train the recognizer / classifier
            for(let t = 0 ; t < trainingSetSize ; t++) { // Add trainingSetSize strokeData per gestureClass
                // Add one sample for each gesture class
                let index = 0;
                dataset.getGestureClasses().forEach((gestureClass) => {
                    // Select a valid training template
                    let training = -1;
                    //while (training == -1 || training_templates[index].includes(training) || gestureClass.getSamples()[training].user == gestureClass.getSamples()[training_templates[index][0]].user) 
                    while (training == -1 || markedTemplates[index].includes(training)) {
                        training = getRandomNumber(0, gestureClass.getSamples().length);
                    }
                    // Mark the training template
                    markedTemplates[index].push(training);
                    // Train the recognizer / classifier
                    if (type === "recognizer") {
                        recognizerOrClassifier.addGesture(gestureClass.name, gestureClass.getSamples()[training]);
                    } else {
                        recognizerOrClassifier.addPose(gestureClass.name, gestureClass.getSamples()[training]);
                    }
                    index++;
                });
            }
            // Test the recognizer / classifier
            let index = 0;
            dataset.getGestureClasses().forEach((gestureClass) => {
                // Retrieve the testing sample
                let toBeTested = gestureClass.getSamples()[candidates[index]];
                // Attempt recognition
                if (type === "recognizer") {
                    var result = recognizerOrClassifier.recognize(toBeTested);
                } else {
                    var result = recognizerOrClassifier.classify(toBeTested);
                }
                // Update the confusion matrix
                if (dataset.getGestureClasses().has(result.name)) {
                    let resultIndex = dataset.getGestureClasses().get(result.name).index;
                    confusionMatrix[resultIndex][gestureClass.index] += 1;
                }
                // Update execution time and accuracy
                recognitionRate += (result.name===gestureClass.name) ? 1 : 0;
                executionTime += result.time;
                index++;
            });
        }
        recognitionRates.push(recognitionRate / (R * dataset.G));
        executionTimes.push(executionTime / (R * dataset.G));
        confusionMatrices.push(confusionMatrix);
    }
    return [recognitionRates, executionTimes, confusionMatrices];
};

/**
 * Return a random list of candidate gestures, 1 candidate per gesture class.
 */
function selectCandidates(dataset) {
    let candidates = [];
    dataset.getGestureClasses().forEach((value) => {
        candidates.push(getRandomNumber(0, value.getSamples().length));
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
    let result = startUserIndependentTesting(dataset, recognizerOrClassifierType, config, type);
    let tmp = new recognizerOrClassifierType(config);
    recognizerOrClassifierStr = tmp.toString();
    printResult(result, dataset, recognizerOrClassifierStr, type);
};

if (require.main === module) {
    run();
}
