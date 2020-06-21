// MODULES ----------------------------------------------------------------------------------------
// Sensor Interfaces
const LeapSensor = require('./implementation/sensors/leap-sensor/sensor').Sensor;

// Pose Analyzers
const BasicAnalyzer = require('./implementation/analyzers/basic-analyzer/analyzer').Analyzer;

// Gesture Segmenters
const WindowSegmenter = require('./implementation/segmenters/window-segmenter').Segmenter;
const ZoningSegmenter = require('./implementation/segmenters/zoning-segmenter').Segmenter;
const LeftHandSegmenter = require('./implementation/segmenters/lefthand-segmenter').Segmenter;
const FrameSegmenter = require('./implementation/segmenters/frame-segmenter').Segmenter;

// Gesture Recognizers
//3D
const HybridP3DollarPlusXRecognizer = require('./implementation/recognizers/hybridp3dollarplusx-recognizer/recognizer').Recognizer;
const JackknifeRecognizer = require('./implementation/recognizers/jackknife-recognizer/recognizer').Recognizer;
const P3DollarPlusXRecognizer = require('./implementation/recognizers/p3dollarplusx-recognizer/recognizer').Recognizer;
const UVPRecognizer = require('./implementation/recognizers/uvplusflexiblecloud-recognizer/recognizer').Recognizer;
const ThreeCentRecognizer = require('./implementation/recognizers/threecent-recognizer/recognizer').Recognizer;
const P3DollarPlusRecognizer = require('./implementation/recognizers/p3dollarplus-recognizer/recognizer').Recognizer;
//2D
const PDollarPlusRecognizer = require('./implementation/recognizers/pdollarplus-recognizer/recognizer').Recognizer;

// Pose Classifiers
const NoClassifier = require('./implementation/classifiers/placeholder-classifier/classifier').Classifier;
const GPSDClassifier = require('./implementation/classifiers/gpsd-classifier/classifier').Classifier;
const GPSDaClassifier = require('./implementation/classifiers/gpsda-classifier/classifier').Classifier;
const GPSDaDissimilarityClassifier = require('./implementation/classifiers/gpsdadissimilarity-classifier/classifier').Classifier;
const P3DollarPlusClassifier = require('./implementation/classifiers/p3dollarplus-classifier/classifier').Classifier; 

// Gesture Dataset Loaders
const UnifiedDatasetLoader = require('./framework/datasets/UnifiedDatasetLoader');
const LeapMotionDatasetLoader = require('./implementation/datasets/LeapMotionDatasetLoader');
const SmartphoneDatasetLoader = require('./implementation/datasets/SmartphoneDatasetLoader');
const HandGestureDatasetLoader = require('./implementation/datasets/HandGestureCsvDatasetLoader');
const UWaveDatasetLoader = require('./implementation/datasets/uWaveDatasetLoader');

// Pose Dataset Loaders
const MMHGRDatasetLoader = require('./implementation/datasets/pose/mmhgr-loader');
const LeapPoseDatasetLoader = require('./implementation/datasets/pose/leap-pose-loader');

// CONFIG INIT ------------------------------------------------------------------------------------
var config = {};
config.general = {};
config.general.pose = {};
config.general.gesture = {};
config.server = {};
config.datasets = {};

// CONFIGURATION ----------------------------------------------------------------------------------
// General Configuration
config.general.debug = true;                        // Show debug logs
config.general.sendContinuousData = true;           // Send data from each frame to the client
config.general.gesture = {
    sendIfRequeste: true,                           // Send recognized gestures only if they are requested by the client
    loadOnRequest: true                             // Load gestures based on requests from the client
}
config.general.pose = {
    sendIfRequested: true,                          // Send recognized gestures only if they are requested by the client
    loadOnRequest: false                             // Load gestures based on requests from the client
}

// Server
config.server.ip = '127.0.0.1';						// IP of the server (for app interface)
config.server.port = 6442;							// Port of the server (for app interface)

// Sensor Interface
config.sensor = {
    module: LeapSensor,
    options: {
        framerate: 60                               // Sensor framerate [seconds]
    }
}

// Pose Analyzer
config.analyzer = {
    module: BasicAnalyzer,
    options: {}
}

// Gesture Segmenter
config.segmenter = {
    module: LeftHandSegmenter,
    options: {
        minSegmentLength: 10,                       // Minimum length of a segment (if applicable) [#frames]
        maxSegmentLength: 60,                       // Maximum length of a segment (if applicable) [#frames]
        windowWidth: 20,                            // Width of the window (if applicable) [#frames]
        intervalLength: 3,                          // Length of the interval between 2 consecutive segments (if applicable) [#frames]
        pauseLength: 60,                            // Length of the pause after a gesture has been detected (if applicable) [#frames]
        xBound: 120,                                // 1/2 width of the zone (if applicable) [mm]
        zBound: 60                                  // 1/2 depth of the zone (if applicable) [mm]
    }
}

// Gesture Dataset
config.datasets.gesture = {
    directory: "./datasets/gesture",
    loader: UnifiedDatasetLoader,
    name: "guinevere_unified",
    aggregateClasses: [
        { name: "rhand_uswipe", classes: ["swipe_up", "open_hand_up"] },
        { name: "rhand_dswipe", classes: ["swipe_down", "open_hand_down"] },
        { name: "rhand_lswipe", classes: ["swipe_left", "open_hand_left"] },
        { name: "rhand_rswipe", classes: ["swipe_right", "open_hand_right"] },
        { name: "rindex_airtap", classes: ["tap"] },
        { name: "rhand_crotate", classes: ["turn_clockwise"] },
        { name: "rhand_acrotate", classes: ["turn_counter_clockwise"] },
        { name: "rhand_close", classes: ["pinch_in"] },
        { name: "rhand_open", classes: ["pinch_out"] },
        { name: "thumbs_up", classes: ["thumbs_up"] },
        { name: "thumbs_down", classes: ["thumbs_down"] }
    ]
}

// Pose Dataset
config.datasets.pose = {
    directory: "./datasets/pose",
    loader: LeapPoseDatasetLoader,
    name: "guinevre-pose",
    aggregateClasses: []
}

// Gesture Recognizer
config.recognizer = {
    module: HybridP3DollarPlusXRecognizer,
    options: {
        palmThreshold: 50,
        fingerThreshold: 15,
        samplingPoints: 16,                         // Number of sampling points [#points]
        articulations: ["rightThumbPosition", "rightIndexPosition", "rightMiddlePosition", "rightRingPosition", "rightPinkyPosition", "leftThumbPosition", "leftIndexPosition", "leftMiddlePosition", "leftRingPosition", "leftPinkyPosition", "rigthPalmPosition", "leftPalmPosition"]
    }
}

// Pose Classifier
config.classifier = {
    module: NoClassifier,
    options: {
        articulations: ["rightPalmPosition", "rightThumbPosition", "rightIndexPosition", "rightMiddlePosition", "rightRingPosition", "rightPinkyPosition"]
    }
}

module.exports = config;
