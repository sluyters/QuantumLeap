// MODULES ----------------------------------------------------------------------------------------
const path = require('path');

// Gesture datasets loaders
const LeapMotionDatasetLoader = require('./implementation/datasets/LeapmotionDatasetLoader');
const SmartphoneDatasetLoader = require('./implementation/datasets/SmartphoneDatasetLoader');
const UnifiedDatasetLoader = require('./framework/datasets/UnifiedDatasetLoader');
const HandGestureDatasetLoader = require('./implementation/datasets/HandGestureCsvDatasetLoader');
const UWaveDatasetLoader = require('./implementation/datasets/uWaveDatasetLoader');

// Pose datasets loaders
const MMHGRDatasetLoader = require('./implementation/datasets/pose/mmhgr-loader');

// Gesture recognizers
//3D
const HybridP3DollarPlusXRecognizer = require('./implementation/recognizers/hybridp3dollarplusx-recognizer/recognizer').Recognizer;
const JackknifeRecognizer = require('./implementation/recognizers/jackknife-recognizer/recognizer').Recognizer;
const P3DollarPlusXRecognizer = require('./implementation/recognizers/p3dollarplusx-recognizer/recognizer').Recognizer;
const UVPRecognizer = require('./implementation/recognizers/uvplusflexiblecloud-recognizer/recognizer').Recognizer;
const ThreeCentRecognizer = require('./implementation/recognizers/threecent-recognizer/recognizer').Recognizer;
const P3DollarPlusRecognizer = require('./implementation/recognizers/p3dollarplus-recognizer/recognizer').Recognizer;
const Q3DollarRecognizer = require('./implementation/recognizers/q3dollar-recognizer/recognizer').Recognizer;
//2D
const PDollarPlusRecognizer = require('./implementation/recognizers/pdollarplus-recognizer/recognizer').Recognizer;

// Pose classifiers
const GPSDClassifier = require('./implementation/classifiers/gpsd-classifier/classifier').Classifier;
const GPSDaClassifier = require('./implementation/classifiers/gpsda-classifier/classifier').Classifier;
const GPSDaDissimilarityClassifier = require('./implementation/classifiers/gpsdadissimilarity-classifier/classifier').Classifier;
const P3DollarPlusClassifier = require('./implementation/classifiers/p3dollarplus-classifier/classifier').Classifier; 

const articulationsBothHands = ["rightThumbPosition", "rightIndexPosition", "rightMiddlePosition", "rightRingPosition", "rightPinkyPosition", "leftThumbPosition", "leftIndexPosition", "leftMiddlePosition", "leftRingPosition", "leftPinkyPosition", "rigthPalmPosition", "leftPalmPosition"];
const articulationsRightHand = ["rightPalmPosition", "rightThumbPosition", "rightIndexPosition", "rightMiddlePosition", "rightRingPosition", "rightPinkyPosition"]

// CONFIG INIT ------------------------------------------------------------------------------------
var config = {};
config.datasets = {};
config.recognizers = {};
config.classifiers = {};

// CONFIGURATION ----------------------------------------------------------------------------------
// General configuration
config.minT = 2; // Minimum Training Templates
config.maxT = 8; // Maximum Training Templates (included)
config.nextT = x => x * 2; // Function used to increment the number of training templates
config.r = 100; // Repetitions

// Recognizers
N_SAMPLING_POINTS = 16;
config.recognizers.nSamplingPoints = N_SAMPLING_POINTS;
config.recognizers.modules = [
    {
        module: UVPRecognizer,
        options: {
            samplingPoints: N_SAMPLING_POINTS,
            articulations: articulationsBothHands
        }
    },
    {
        module: JackknifeRecognizer,
        options: {samplingPoints: N_SAMPLING_POINTS}
    },
    {
        module: ThreeCentRecognizer,
        options: {
            samplingPoints: N_SAMPLING_POINTS,
            pathName: "rightPalmPosition"
        }
    },
    {
        module: P3DollarPlusRecognizer,
        options: {
            samplingPoints: N_SAMPLING_POINTS,
            pathName: "rightPalmPosition"
        }
    },
    {
        module: P3DollarPlusXRecognizer,
        options: {
            samplingPoints: N_SAMPLING_POINTS,
            pathName: "rightPalmPosition"
        }
    },
    {
        module: HybridP3DollarPlusXRecognizer,
        options: {
            samplingPoints: N_SAMPLING_POINTS,
            palmThreshold: 50,
            fingerThreshold: 15
        }
    },
    {
        module: HybridP3DollarPlusXRecognizer,
        options: {
            samplingPoints: N_SAMPLING_POINTS,
            palmThreshold: 50,
            fingerThreshold: 5
        }
    },
    {
        module: HybridP3DollarPlusXRecognizer,
        options: {
            samplingPoints: N_SAMPLING_POINTS,
            palmThreshold: 1000,
            fingerThreshold: 0
        }
    },
    {
        module: Q3DollarRecognizer,
        options: {
            samplingPoints: N_SAMPLING_POINTS,
            pathName: "rightPalmPosition"
        }
    },
    {
        module: PDollarPlusRecognizer,
        options: {
            samplingPoints: N_SAMPLING_POINTS,
            pathName: "rightPalmPosition"
        }
    }
];

// Classifiers
config.classifiers.modules = [
    {
        module: GPSDClassifier,
        options: {
            articulations: articulationsRightHand
        }
    },
    {
        module: GPSDaClassifier,
        options: {
            alpha: 1.0,
            articulations: articulationsRightHand
        }
    },
    {
        module: GPSDaDissimilarityClassifier,
        options: {
            alpha: 1.0,
            articulations: articulationsRightHand
        }
    },
    {
        module: P3DollarPlusClassifier,
        options: {
            articulations: articulationsRightHand
        }
    }
];

// Datasets path
config.datasets.path = path.join(__dirname, "datasets");

// Gesture datasets
config.datasets.path = path.join(__dirname, "datasets");
config.datasets.gesture = [
    {
        name: "guinevere_unified",
        loader: UnifiedDatasetLoader
    }
    // {
    //     name: "leapmotion",
    //     loader: LeapMotionDatasetLoader
    // }
    // {
    //     name: "uWaveGestureLibrary",
    //     loader: UWaveDatasetLoader
    // }
    // {
    //     name: "smartphone",
    //     loader: SmartphoneDatasetLoader
    // }
];

// Pose datasets
config.datasets.pose = [
    {
        name: "multi_mod_hand_gest_recog",
        loader: MMHGRDatasetLoader
    }
];

module.exports = config;


