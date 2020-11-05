// MODULES ----------------------------------------------------------------------------------------
// Sensor Interfaces
const LeapSensor = require('./implementation/sensors/leap-sensor');

// Pose Analyzers
const NoAnalyzer = require('./implementation/analyzers/placeholder-analyzer');
const BasicAnalyzer = require('./implementation/analyzers/basic-analyzer');

// Gesture Segmenters
const WindowSegmenter = require('./implementation/segmenters/window-segmenter');
const ZoningSegmenter = require('./implementation/segmenters/zoning-segmenter');
const LeftHandSegmenter = require('./implementation/segmenters/lefthand-segmenter');
const FrameSegmenter = require('./implementation/segmenters/frame-segmenter');

// Gesture Recognizers
const NoRecognizer = require('./implementation/recognizers/placeholder-recognizer');
//3D
const HybridP3DollarPlusXRecognizer = require('./implementation/recognizers/hybridp3dollarplusx-recognizer');
const JackknifeRecognizer = require('./implementation/recognizers/jackknife-recognizer');
const P3DollarPlusXRecognizer = require('./implementation/recognizers/p3dollarplusx-recognizer');
const UVPRecognizer = require('./implementation/recognizers/uvplusflexiblecloud-recognizer');
const ThreeCentRecognizer = require('./implementation/recognizers/threecent-recognizer');
const P3DollarPlusRecognizer = require('./implementation/recognizers/p3dollarplus-recognizer');
//2D
const PDollarPlusRecognizer = require('./implementation/recognizers/pdollarplus-recognizer');

// Pose Classifiers
const NoClassifier = require('./implementation/classifiers/placeholder-classifier');
const GPSDClassifier = require('./implementation/classifiers/gpsd-classifier');
const GPSDaClassifier = require('./implementation/classifiers/gpsda-classifier');
const GPSDaDissimilarityClassifier = require('./implementation/classifiers/gpsdadissimilarity-classifier');
const P3DollarPlusClassifier = require('./implementation/classifiers/p3dollarplus-classifier'); 

// Gesture Dataset Loaders
const UnifiedDatasetLoader = require('./framework/datasets/unified-loader');
const GuinevereDatasetLoader = require('./implementation/datasets/gesture/guinevere-loader');
const LeapMotionDatasetLoader = require('./implementation/datasets/gesture/leap-gesture-loader');
const SmartphoneDatasetLoader = require('./implementation/datasets/gesture/smartphone-loader');
const HandGestureDatasetLoader = require('./implementation/datasets/gesture/hand-gesture-csv-loader');
const UWaveDatasetLoader = require('./implementation/datasets/gesture/uwave-loader');

// Pose Dataset Loaders
const MMHGRDatasetLoader = require('./implementation/datasets/pose/mmhgr-loader');
const LeapPoseDatasetLoader = require('./implementation/datasets/pose/leap-pose-loader');

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
config.general = {};
config.general.pose = {};
config.general.gesture = {};
config.server = {};
config.datasets = {};

// CONFIGURATION ----------------------------------------------------------------------------------
// General Configuration
config.general.debug = false;                       // Show debug logs
config.general.sendContinuousData = true;           // Send data from each frame to the client
config.general.gesture = {
    sendIfRequested: true,                          // Send recognized gestures only if they are requested by the client
    loadOnRequest: false                            // Load gestures based on requests from the client
}
config.general.pose = {
    sendIfRequested: true,                          // Send recognized gestures only if they are requested by the client
    loadOnRequest: false                            // Load gestures based on requests from the client
}

// Server
config.server.ip = '127.0.0.1';						// IP of the server (for app interface)
config.server.port = 6442;							// Port of the server (for app interface)

// Sensor Interface
config.sensor = {
    module: LeapSensor,
    options: {
        framerate: 60                               // Sensor framerate [images/seconds]
    }
}

// Pose Analyzer
config.analyzer = {
    module: BasicAnalyzer,
    options: {}
}

// Gesture Segmenter
config.segmenter = {
    module: WindowSegmenter,
    options: {
        motionThreshold: 70,                        // Minimum hand motion to consider that the segment may be a gesture
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
    directory: __dirname + "/datasets/gesture",
    loader: LeapMotionDatasetLoader,
    name: "guinevere",
    useCustomTemplatesPerClass: true,
    templatesPerClass: 16,
    aggregateClasses: [
        { name: "rhand_uswipe", classes: ["swipe_up"] },
        { name: "rhand_dswipe", classes: ["swipe_down"] },
        { name: "rhand_lswipe", classes: ["swipe_left"] },
        { name: "rhand_rswipe", classes: ["swipe_right"] },
        { name: "rindex_airtap", classes: ["tap"] },
        //{ name: "rhand_crotate", classes: ["turn_clockwise"] },
        //{ name: "rhand_acrotate", classes: ["turn_counter_clockwise"] },
        //{ name: "rhand_close", classes: ["pinch_in"] },
        //{ name: "rhand_open", classes: ["pinch_out"] },
        //{ name: "thumbs_up", classes: ["thumbs_up"] },
        //{ name: "thumbs_down", classes: ["thumbs_down"] }
    ]
}

// Pose Dataset
config.datasets.pose = {
    directory: __dirname + "/datasets/pose",
    loader: LeapPoseDatasetLoader,
    name: "guinevre-pose",
    useCustomTemplatesPerClass: true,
    templatesPerClass: 100,
    aggregateClasses: []
}

// Gesture Recognizer
config.recognizer = {
    module: JackknifeRecognizer,
    options: {
        palmThreshold: 50,
        fingerThreshold: 15,
        samplingPoints: 16,                         // Number of sampling points [#points]
        articulations: palms.right,
        //pathName: "rightPalmPosition"
    }
}

// Pose Classifier
config.classifier = {
    module: GPSDaClassifier,
    options: {
        bufferLength: 15,
        poseRatioThreshold: 0.8,
        alpha: 0.8,
        articulations: articulationsRightHandDetailed
    }
}

module.exports = config;
