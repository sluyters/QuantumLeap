const path = require('path');
const fs = require('fs');
const cdollar = require('./framework/recognizers/cdollar');
const pdollarplus = require('./framework/recognizers/pdollarplus');

let P = 1; //Participants
let G = 16; //Gesture Classes
let TperG = 5; //Templates per Gesture Class
let MAXT = 4; //Maximum Training Templates
//let MAXP = 100; //MaxIndependentParticipants
let R = 100; //Repetitions
let N = 8; //Points/Shapes
//let D = 0; //(FILES2.length>0) ? 2 : 1;
let datasetFolder = "framework/dataset";
let RECOGNIZERS = ["FakeRecognizer"];

//Points/Shapes = 8

let StartTesting = function(dataset, dataset2=1) {
    PrintResults(StartUserDepDeviceDepTesting(dataset), 'USER-DEPENDENT & PLATFORM-DEPENDENT TESTING');
}

let GetNumberById = function(id) {
    let input = document.getElementById(id).value;
    if(isNaN(input)) return 0;
    else return Number(input);
}

let LoadDataset = function() {
    const directoryPath = path.join(__dirname, datasetFolder);

    let count = TperG;
    let $PP_dataset = [];
    let $C_dataset = [];

    //TODO Addapt for P > 1
    p = 0; // new participant
    $PP_dataset[p] = [];
    $C_dataset[p] = [];
    let g = -1;

    fs.readdirSync(directoryPath).forEach(dir => {
        let subDirPath = directoryPath + '/' + dir;

        fs.readdirSync(subDirPath).forEach(file => {
            g++;

            let raw_gesture = JSON.parse(fs.readFileSync(subDirPath + '/' + file));
            let $PP_points = [];
            let $C_points = [];
            for(let j=0 ; j<raw_gesture[0].strokes.length ; j++) {
                for(var k=0 ; k<raw_gesture[0].strokes[j].length ; k++) {
                    $PP_points[$PP_points.length] = new pdollarplus.$PP_Point(raw_gesture[0].strokes[j][k].x, raw_gesture[0].strokes[j][k].y, raw_gesture[0].strokes[j][k].stroke_id);
                    $C_points[$C_points.length] = new cdollar.$C_Point(raw_gesture[0].strokes[j][k].x, raw_gesture[0].strokes[j][k].y, raw_gesture[0].strokes[j][k].t, raw_gesture[0].strokes[j][k].stroke_id)
                }
            }

            $PP_dataset[p][g] = [raw_gesture[0].name, $PP_points];
            $C_dataset[p][g] = [raw_gesture[0].name, $C_points];
        });
    });

    return [$PP_dataset, $C_dataset];
};

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
}

let StartUserDepDeviceDepTesting = function(dataset) {
    //console.log(dataset);
    let $C_recognition_matrix = new Map();
    let $PP_recognition_rates = [];
    let $C_recognition_rates = [];
    let $PP_execution_time = [];
    let $C_execution_time = [];
    for(let p=0 ; p<P ; p++) {
        for(let tg=1 ; tg<TperG ; tg++) {
            let $PP_current_recognition_score = 0;
            let $C_current_recognition_score = 0;
            let $PP_current_execution_time = 0.0;
            let $C_current_execution_time = 0.0;
            for(let r=0 ; r<R ; r++) {
                let $PP_recognizer = new pdollarplus.PDollarPlusRecognizer();
                let $C_recognizer = new cdollar.CDollarRecognizer(N);
                let candidates = SelectCandidates();
                let training_templates = candidates.slice(0, candidates.length);
                for(let t=0 ; t<tg ; t++) {
                    for(let g=0 ; g<G*TperG ; g=g+TperG) {
                        let training = -1;
                        while(training==-1 || training_templates.includes(training)) training = GetRandomNumber(g, g+TperG);
                        training_templates[training_templates.length] = training;
                        $PP_recognizer.AddGesture(dataset[0][p][training][0], dataset[0][p][training][1], N);
                        $C_recognizer.SaveAs(dataset[1][p][training][1], dataset[1][p][training][0]);
                    }
                }
                // Recognition after tg training templates
                for(let c=0 ; c<candidates.length ; c++) {
                    let $PP_result = $PP_recognizer.Recognize(dataset[0][p][candidates[c]][1], N);
                    let $C_result = $C_recognizer.Recognize(dataset[1][p][candidates[c]][1]);
                    // Print the result within $C"s recognition matrix
                    if($C_recognition_matrix.has(dataset[1][p][candidates[c]][0])) {
                        let candidate_matrix = $C_recognition_matrix.get(dataset[1][p][candidates[c]][0]);
                        if(candidate_matrix.has($C_result[0].Name)) {
                            let previous_result = candidate_matrix.get($C_result[0].Name);
                            candidate_matrix.set($C_result[0].Name, previous_result+1);
                        }
                        else {
                            candidate_matrix.set($C_result[0].Name, 1);
                        }
                    }
                    else {
                        $C_recognition_matrix.set(dataset[1][p][candidates[c]][0], new Map([[$C_result[0].Name, 1]]));
                    }
                    $PP_current_recognition_score += ($PP_result.Name==dataset[0][p][candidates[c]][0]) ? 1 : 0;
                    $C_current_recognition_score += ($C_result[0].Name==dataset[1][p][candidates[c]][0]) ? 1 : 0;
                    $PP_current_execution_time += $PP_result.Time;
                    $C_current_execution_time += $C_result[1];
                }
            }
            if($PP_recognition_rates[tg-1]>0 && $C_recognition_rates[tg-1]>0) {
                $PP_recognition_rates[tg-1] += $PP_current_recognition_score;
                $C_recognition_rates[tg-1] += $C_current_recognition_score;
                $PP_execution_time[tg-1] += $PP_current_execution_time;
                $C_execution_time[tg-1] += $C_current_execution_time;
            }
            else {
                $PP_recognition_rates[tg-1] = $PP_current_recognition_score;
                $C_recognition_rates[tg-1] = $C_current_recognition_score;
                $PP_execution_time[tg-1] = $PP_current_execution_time;
                $C_execution_time[tg-1] = $C_current_execution_time;
            }
        }
    }
    for(let i=0 ; i<$PP_recognition_rates.length && i<$C_recognition_rates.length ; i++) {
        $PP_recognition_rates[i] = $PP_recognition_rates[i]/(P*R*G);
        $C_recognition_rates[i] = $C_recognition_rates[i]/(P*R*G);
        $PP_execution_time[i] = $PP_execution_time[i]/(P*R*G);
        $C_execution_time[i] = $C_execution_time[i]/(P*R*G);
    }
    console.log($C_recognition_matrix);
    return new Array(new Array($PP_recognition_rates, $PP_execution_time), new Array($C_recognition_rates, $C_execution_time));
}

/**
 * choose one candidate per gesture
 */
let SelectCandidates = function() {
    let candidates = new Array();
    for(let g=0 ; g<G ; g++) {
        candidates[g] = GetRandomNumber(g*TperG, (g+1)*TperG);
    }
    return candidates;
}

let GetRandomNumber = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random()*(max - min))+min;
}


let dataset = LoadDataset();
StartTesting(dataset);