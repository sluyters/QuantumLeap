const path = require('path');
const fs = require('fs');
const config = require('./benchmarkConfig');
const GestureSet = require('./framework/gestures/gesture-set').GestureSet;
const GestureClass = require('./framework/gestures/gesture-class').GestureClass;

// Important values
const MINT = config.minT; // Maximum Training Templates
const MAXT = config.maxT; // Maximum Training Templates
const computeNextT = config.nextT; // Function that computes the next number of training templates
const R = config.r; // Repetitions
const N = config.recognizers.nSamplingPoints; // Points/Shapes

function run() {
    // // Test classifiers
    // if (config.classifiers.modules.length > 0) {
    //     for(let i=0; i < config.datasets.pose.length; i++){
    //         let datasetConfig = config.datasets.pose[i];
    //         let datasetPath = path.join(config.datasets.path, "pose");
    //         let dataset = loadDataset(datasetPath, datasetConfig);
    //         for(let j=0; j < config.classifiers.modules.length; j++){
    //             let classifier = config.classifiers.modules[j];
    //             test(dataset, classifier.module, classifier.options, "classifier");
    //         }
    //     }
    //     fs.writeFileSync('results-poses.json', JSON.stringify(results));
    // }
    if (config.classifiers.modules.length > 0) {
        let results = [];
        for(let i=0; i < config.datasets.pose.length; i++){
            let datasetConfig = config.datasets.pose[i];
            let datasetPath = path.join(config.datasets.path, "pose");
            let dataset = loadDataset(datasetPath, datasetConfig);
            let datasetResults = { 
                dataset: dataset.name,
                gestures: Array.from(dataset.getGestureClasses().keys()),
                data: []
            };
            for(let j=0; j < config.classifiers.modules.length; j++){
                let classifier = config.classifiers.modules[j];
                let res = test(dataset, classifier.module, classifier.options, "classifiers");
                console.log(classifier.module.name);
                datasetResults.data.push({ 
                    name: classifier.module.name,
                    options: classifier.options,
                    data: res
                });
            }
            results.push(datasetResults);
        }
        fs.writeFileSync('results-poses.json', JSON.stringify(results, null, 2));
    }

    // Test recognizers
    if (config.recognizers.modules.length > 0) {
        let results = [];
        for(let i=0; i < config.datasets.gesture.length; i++){
            let datasetConfig = config.datasets.gesture[i];
            let datasetPath = path.join(config.datasets.path, "gesture");
            let dataset = loadDataset(datasetPath, datasetConfig);
            let datasetResults = { 
                dataset: dataset.name,
                gestures: Array.from(dataset.getGestureClasses().keys()),
                data: []
            };
            for(let j=0; j < config.recognizers.modules.length; j++){
                let recognizer = config.recognizers.modules[j];
                let res = test(dataset, recognizer.module, recognizer.options, "recognizer");
                console.log(recognizer.module.name);
                datasetResults.data.push({ 
                    name: recognizer.module.name,
                    options: recognizer.options,
                    data: res
                });
            }
            results.push(datasetResults);
        }
        fs.writeFileSync('results-gestures.json', JSON.stringify(results, null, 2));
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
    //let recognitionRates = [];
    //let executionTimes = [];
    //let confusionMatrices = [];
    let results = [];
    // Perform the test for each size of training set
    for(let trainingSetSize = MINT ; trainingSetSize <= Math.min(dataset.getMinTemplate(), MAXT); trainingSetSize = computeNextT(trainingSetSize)) {
        let res = {
            n: trainingSetSize,
            accuracy: 0.0,
            time: 0.0,
            confusionMatrix: []
        };
        res.confusionMatrix = new Array(dataset.G).fill(0).map(() => new Array(dataset.G).fill(0));

        //let recognitionRate = 0;
        //let executionTime = 0.0;
        //let confusionMatrix = new Array(dataset.G).fill(0).map(() => new Array(dataset.G).fill(0));
        
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
                    //while (training == -1 || markedTemplates[index].includes(training) || gestureClass.getSamples()[training].user == gestureClass.getSamples()[markedTemplates[index][0]].user) {
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
                    res.confusionMatrix[gestureClass.index][resultIndex] += 1;
                    //confusionMatrix[gestureClass.index][resultIndex] += 1;
                }
                // Update execution time and accuracy
                res.accuracy += (result.name===gestureClass.name) ? 1 : 0;
                res.time += result.time;
                //recognitionRate += (result.name===gestureClass.name) ? 1 : 0;
                //executionTime += result.time;
                index++;
            });
        }
        res.accuracy = res.accuracy / (R * dataset.G);
        res.time = res.time / (R * dataset.G);
        results.push(res);
        //recognitionRates.push(recognitionRate / (R * dataset.G));
        //executionTimes.push(executionTime / (R * dataset.G));
        //confusionMatrices.push(confusionMatrix);
    }
    return results;
    //return [recognitionRates, executionTimes, confusionMatrices];
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
 * Load a gesture dataset
 */
function loadDataset(datasetPath, datasetConfig) {
    // Load the dataset
    let dataset = datasetConfig.loader.loadDataset(datasetConfig.name, datasetPath);
    // Select/aggregate/rename classes of the dataset if required
    if (datasetConfig.aggregateClasses.length != 0) {
        let newDataset = new GestureSet(dataset.name);
        datasetConfig.aggregateClasses.forEach((aggregate, index) => {
            // Aggregate gesture class
            let newClass = new GestureClass(aggregate.name, index);
            let templates = [];
            // Fuse the classes into a new aggregate class
            for (const className of aggregate.classes) {
                let oldClass = dataset.getGestureClasses().get(className);
                templates = templates.concat(templates, oldClass.getSamples());
            }
            // Add the templates to the new gesture class
            for (template of templates) {
                newClass.addSample(template);
            }
            // Add the aggregate class to the new dataset
            newDataset.addGestureClass(newClass);
        });
        return newDataset
    } else {
        return dataset;
    }
}

/**
 * Test a specific recognizer/classifier with a specific dataset
 */
function test(dataset, recognizerOrClassifierType, config, type = "recognizer"){
    let result = startUserIndependentTesting(dataset, recognizerOrClassifierType, config, type);
    //let tmp = new recognizerOrClassifierType(config);
    //recognizerOrClassifierStr = tmp.toString();
    //printResult(result, dataset, recognizerOrClassifierStr, type);
    return result;
};

if (require.main === module) {
    run();
}
