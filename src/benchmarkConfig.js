// MODULES ----------------------------------------------------------------------------------------
const path = require('path');

// Gesture datasets loaders
const UnifiedDatasetLoader = require('./framework/datasets/unified-loader');
const GuinevereDatasetLoader = require('./implementation/datasets/gesture/guinevere-loader');
const LeapMotionDatasetLoader = require('./implementation/datasets/gesture/leap-gesture-loader');
const SmartphoneDatasetLoader = require('./implementation/datasets/gesture/smartphone-loader');
const HandGestureDatasetLoader = require('./implementation/datasets/gesture/hand-gesture-csv-loader');
const UWaveDatasetLoader = require('./implementation/datasets/gesture/uwave-loader');

// Pose datasets loaders
const MMHGRDatasetLoader = require('./implementation/datasets/pose/mmhgr-loader');
const LeapPoseDatasetLoader = require('./implementation/datasets/pose/leap-pose-loader');

// Gesture recognizers
//3D
const HybridP3DollarPlusXRecognizer = require('./implementation/recognizers/hybridp3dollarplusx-recognizer/recognizer').Recognizer;
const JackknifeRecognizer = require('./implementation/recognizers/jackknife-recognizer/recognizer').Recognizer;
const P3DollarPlusXRecognizer = require('./implementation/recognizers/p3dollarplusx-recognizer/recognizer').Recognizer;
const UVPRecognizer = require('./implementation/recognizers/uvplusflexiblecloud-recognizer/recognizer').Recognizer;
const ThreeCentRecognizer = require('./implementation/recognizers/threecent-recognizer/recognizer').Recognizer;
const P3DollarRecognizer = require('./implementation/recognizers/p3dollar-recognizer/recognizer').Recognizer;
const P3DollarPlusRecognizer = require('./implementation/recognizers/p3dollarplus-recognizer/recognizer').Recognizer;
const Q3DollarRecognizer = require('./implementation/recognizers/q3dollar-recognizer/recognizer').Recognizer;
//2D
const PDollarPlusRecognizer = require('./implementation/recognizers/pdollarplus-recognizer/recognizer').Recognizer;

// Pose classifiers
const GPSDClassifier = require('./implementation/classifiers/gpsd-classifier/classifier').Classifier;
const GPSDaClassifier = require('./implementation/classifiers/gpsda-classifier/classifier').Classifier;
const GPSDaDissimilarityClassifier = require('./implementation/classifiers/gpsdadissimilarity-classifier/classifier').Classifier;
const P3DollarPlusClassifier = require('./implementation/classifiers/p3dollarplus-classifier/classifier').Classifier; 

// Articulations
const fingerMcps = {
    left: ["leftThumbMcpPosition", "leftIndexMcpPosition", "leftMiddleMcpPosition", "leftRingMcpPosition", "leftPinkyMcpPosition"],
    right: ["rightThumbMcpPosition", "rightIndexMcpPosition", "rightMiddleMcpPosition", "rightRingMcpPosition", "rightPinkyMcpPosition"]
}
const fingerPips = {
    left: ["leftThumbPipPosition", "leftIndexPipPosition", "leftMiddlePipPosition", "leftRingPipPosition", "leftPinkyPipPosition"],
    right: ["rightThumbPipPosition", "rightIndexPipPosition", "rightMiddlePipPosition", "rightRingPipPosition", "rightPinkyPipPosition"]
}
const fingerTips = {
    left: ["leftThumbTipPosition", "leftIndexTipPosition", "leftMiddleTipPosition", "leftRingTipPosition", "leftPinkyTipPosition"],
    right: ["rightThumbTipPosition", "rightIndexTipPosition", "rightMiddleTipPosition", "rightRingTipPosition", "rightPinkyTipPosition"]
}
const palms = {
    left: ["leftPalmPosition"],
    right: ["rightPalmPosition"]
}
const articulationsBothHandsSimple = [].concat(palms.right, palms.left, fingerTips.right, fingerTips.left);
const articulationsRightHandSimple = [].concat(palms.right, fingerTips.right);
const articulationsRightHandDetailed = [].concat(palms.right, fingerMcps.right, fingerPips.right, fingerTips.right);


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
            articulations: articulationsRightHandSimple
        }
    },
    {
        module: JackknifeRecognizer,
        options: {
            samplingPoints: N_SAMPLING_POINTS,
            articulations: articulationsRightHandSimple
        }
    },
    {
        module: ThreeCentRecognizer,
        options: {
            samplingPoints: N_SAMPLING_POINTS,
            pathName: "rightPalmPosition"
        }
    },
    {
        module: P3DollarRecognizer,
        options: {
            samplingPoints: N_SAMPLING_POINTS,
            articulations: articulationsRightHandSimple
        }
    },
    {
        module: P3DollarPlusRecognizer,
        options: {
            samplingPoints: N_SAMPLING_POINTS,
            articulations: articulationsRightHandSimple
        }
    },
    {
        module: Q3DollarRecognizer,
        options: {
            samplingPoints: N_SAMPLING_POINTS,
            articulations: articulationsRightHandSimple
        }
    },
    {
        module: P3DollarPlusXRecognizer,
        options: {
            samplingPoints: N_SAMPLING_POINTS,
            articulations: articulationsRightHandSimple
        }
    },
    {
        module: P3DollarPlusXRecognizer,
        options: {
            samplingPoints: N_SAMPLING_POINTS,
            articulations: ["rightPalmPosition"]
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
        module: PDollarPlusRecognizer,
        options: {
            samplingPoints: N_SAMPLING_POINTS,
            pathName: "rightPalmPosition"
        }
    }
];

// Classifiers
config.classifiers.modules = [
    // {
    //     module: GPSDClassifier,
    //     options: {
    //         articulations: articulationsRightHandSimple
    //     }
    // },
    // {
    //     module: GPSDaClassifier,
    //     options: {
    //         alpha: 0.70,
    //         articulations: articulationsRightHandSimple
    //     }
    // },
    // {
    //     module: GPSDaDissimilarityClassifier,
    //     options: {
    //         alpha: 0.7,
    //         articulations: articulationsRightHandSimple
    //     }
    // },
    // {
    //     module: P3DollarPlusClassifier,
    //     options: {
    //         articulations: articulationsRightHandSimple
    //     }
    // }
];

// Datasets path
config.datasets.path = path.join(__dirname, "datasets");

// Gesture datasets
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
    // {
    //     loader: LeapPoseDatasetLoader,
    //     name: "guinevre-pose"
    // },
    {
        loader: MMHGRDatasetLoader,
        name: "multi_mod_hand_gest_recog"
    }
];

module.exports = config;


