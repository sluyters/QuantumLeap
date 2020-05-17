// MODULES ----------------------------------------------------------------------------------------
const path = require('path');

// Gesture Datasets loader
const LeapMotionDatasetLoader = require('./implementation/datasets/LeapmotionConverter');
const SmartphoneDatasetLoader = require('./implementation/datasets/SmartphoneConverter');
const UnifiedDatasetLoader = require('./framework/datasets/UnifiedDatasetLoader');
const HandGestureDatasetLoader = require('./implementation/datasets/HandGestureCsv');
const UWaveDatasetLoader = require('./implementation/datasets/uWaveConverter');


// Gesture Recognizers
//3D
const HybridP3DollarPlusXRecognizer = require('./implementation/recognizers/hybridp3dollarplusx-recognizer/recognizer').Recognizer;
const JackknifeRecognizer = require('./implementation/recognizers/jackknife-recognizer/recognizer').Recognizer;
const P3DollarPlusXRecognizer = require('./implementation/recognizers/p3dollarplusx-recognizer/recognizer').Recognizer;
const UVPRecognizer = require('./implementation/recognizers/uvplus-flexible-cloud/recognizer').Recognizer;
const ThreeCentRecognizer = require('./implementation/recognizers/threecent-recognizer/recognizer').Recognizer;
const P3DollarPlusRecognizer = require('./implementation/recognizers/p3dollarplus-recognizer/recognizer').Recognizer;
const Q3DollarRecognizer = require('./implementation/recognizers/q3dollar-recognizer/recognizer').Recognizer;
//2D
const PDollarPlusRecognizer = require('./implementation/recognizers/pdollarplus/recognizer').Recognizer;

const fingers = ["rightThumbPosition", "rightIndexPosition", "rightMiddlePosition", "rightRingPosition", "rightPinkyPosition", "leftThumbPosition", "leftIndexPosition", "leftMiddlePosition", "leftRingPosition", "leftPinkyPosition", "rigthPalmPosition", "leftPalmPosition"];

// CONFIG INIT ------------------------------------------------------------------------------------
var config = {};

// CONFIGURATION ----------------------------------------------------------------------------------

config.recognizers = [
    {
        module: UVPRecognizer,
        options: {
            samplingPoints : 8,
            articulations: fingers
        }
    },
    {
        module: JackknifeRecognizer,
        options: {samplingPoints : 8}
    },
    {
        module: ThreeCentRecognizer,
        options: {samplingPoints : 8}
    },
    {
        module: P3DollarPlusRecognizer,
        options: {samplingPoints : 8}
    },
    {
        module: P3DollarPlusXRecognizer,
        options: {samplingPoints : 8}
    },
    // {
    //     module: HybridP3DollarPlusXRecognizer,
    //     options: {samplingPoints : 8}
    // },
    {
        module: Q3DollarRecognizer,
        options: {samplingPoints : 8}
    }
];

config.datasets = [
    {
        name: "guinevere_unified",
        loader: UnifiedDatasetLoader
    }//,
    // {
    //     name: "leapmotion",
    //     loader: LeapMotionDatasetLoader
    // }
];


let dirPath = path.join(__dirname, "datasets");
config.datasetFolder = dirPath;

config.mint = 14; //Minimum Training Templates
config.maxt = 16; //Maximum Training Templates
config.r = 100; //Repetitions
config.n = 8; //Points/Shapes

module.exports = config;


