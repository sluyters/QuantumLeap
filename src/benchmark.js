const config = require('./benchmarkConfig');

let PrintResults = function(results, recognizer, dataset) {
    console.log("#### " + recognizer + " #### number of repetition: " + R + ", N: " + N);
    console.log("#### gesture set " + dataset.name + " #### " + JSON.stringify(Array.from(dataset.getGestureClass().keys())));
    for(let i=0 ; i<results[0].length && i<results[1].length ; i++) {
        console.log("Recognition accuracy with " + (i+1) + " training templates per gesture: " + (results[0][i]*100).toFixed(2) + " (" + results[1][i].toFixed(2) + "ms)");
        console.log("Confusion matrice: " + JSON.stringify(results[2][i]));
    }
    console.log("--------")
};

let StartTesting = function(dataset, Recognizer, recognizerConfig) {
    //console.log(dataset);
    let recognition_rates = [];
    let execution_time = [];
    let confusion_matrices = [];

    for(let tg=1 ; tg < Math.min(dataset.getMinTemplate(), MAXT) ; tg++) { //for each training set size
        let current_recognition_score = 0;
        let current_execution_time = 0.0;
        let current_confusion_matrice = new Array(dataset.G).fill(0).map(() => new Array(dataset.G).fill(0));

        for(let r=0 ; r<R ; r++) { //repeat R time
            let recognizer = new Recognizer(recognizerConfig);

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
    return [recognition_rates, execution_time, confusion_matrices];
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

let test = function(datasetName, DatasetLoader, GestureRecognizer, GestureRecognizerConfig){
    let dataset = DatasetLoader.loadDataset(datasetName, config.datasetFolder);
    let result = StartTesting(dataset, GestureRecognizer, GestureRecognizerConfig);
    PrintResults(result, GestureRecognizer.name , dataset);
};

let MAXT = config.maxt; //Maximum Training Templates
let R = config.r; //Repetitions
let N = config.n; //Points/Shapes

for(let i=0; i < config.recognizers.length; i++){
    let recognizer = config.recognizers[i];
    for(let j=0; j < config.datasets.length; j++){
        let dataset = config.datasets[j];
        test(dataset.name, dataset.loader, recognizer.module, recognizer.options);
    }
}



