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
const HybridP3DollarPlusXRecognizer = require('./implementation/recognizers/hybrid-p3dollarplusx-recognizer/recognizer').Recognizer;
const JackknifeRecognizer = require('./implementation/recognizers/jackknife-recognizer/recognizer').Recognizer;
const P3DollarPlusXRecognizer = require('./implementation/recognizers/p3dollarplusx-recognizer/recognizer').Recognizer;
const UVPRecognizer = require('./implementation/recognizers/uvplus-flexible-cloud/recognizer').DollarRecognizer;
const ThreeCentRecognizer = require('./implementation/recognizers/ThreeCentRecognizer').ThreeCentRecognizer;
const P3DollarRecognizer = require('./implementation/recognizers/P3DollarPlusRecognizer').P3DollarPlusRecognizer;
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
    }//,
    // {
    //     module: JackknifeRecognizer,
    //     options: {samplingPoints : 16}
    // }
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

config.mint = 10; //Minimum Training Templates
config.maxt = 16; //Maximum Training Templates
config.r = 100; //Repetitions
config.n = 8; //Points/Shapes

module.exports = config;


