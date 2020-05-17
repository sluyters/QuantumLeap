// MODULES ----------------------------------------------------------------------------------------
// Sensor Interfaces
//const LeapSensor = require('./implementation/sensors/LeapSensor').LeapSensor;
const LeapSensor = require('./implementation/sensors/leap-sensor').Sensor;

// Gesture Datasets loader
const UnifiedDatasetLoader = require('./framework/datasets/UnifiedDatasetLoader');
// const LeapMotionDatasetLoader = require('./implementation/datasets/LeapmotionConverter');
// const SmartphoneDatasetLoader = require('./implementation/datasets/SmartphoneConverter');
// const HandGestureDatasetLoader = require('./implementation/datasets/HandGestureCsv');
// const UWaveDatasetLoader = require('./implementation/datasets/uWaveConverter');

// Classifiers
const GPSDClassifier = require('./implementation/classifier/gpsd-classifier/classifier').Classifier;

// Static Gesture Analyzers
const BasicStaticAnalyzer = require('./implementation/static-analyzer/basic-analyzer/static-analyzer').StaticAnalyzer;

// Gesture Segmenters
const WindowSegmenter = require('./implementation/segmenter/window-segmenter').Segmenter;
const ZoningSegmenter = require('./implementation/segmenter/zoning-segmenter').Segmenter;
const LeftHandSegmenter = require('./implementation/segmenter/lefthand-segmenter').Segmenter;
const FrameSegmenter = require('./implementation/segmenter/frame-segmenter').Segmenter;

// Gesture Recognizers
//3D
const HybridP3DollarPlusXRecognizer = require('./implementation/recognizers/hybridp3dollarplusx-recognizer/recognizer').Recognizer;
const JackknifeRecognizer = require('./implementation/recognizers/jackknife-recognizer/recognizer').Recognizer;
const P3DollarPlusXRecognizer = require('./implementation/recognizers/p3dollarplusx-recognizer/recognizer').Recognizer;
const UVPRecognizer = require('./implementation/recognizers/uvplus-flexible-cloud/recognizer').Recognizer;
const ThreeCentRecognizer = require('./implementation/recognizers/threecent-recognizer/recognizer').Recognizer;
const P3DollarPlusRecognizer = require('./implementation/recognizers/p3dollarplus-recognizer/recognizer').Recognizer;
//2D
const PDollarPlusRecognizer = require('./implementation/recognizers/pdollarplus/recognizer').Recognizer;


// CONFIG INIT ------------------------------------------------------------------------------------
var config = {};
config.general = {};
config.server = {};
config.sensor = {};
config.sensor.options = {};
config.classifier = {};
config.classifier.options = {};
config.staticAnalyzer = {};
config.staticAnalyzer.options = {};
config.dataset = {};
config.dataset.options = {};
config.segmenter = {};
config.segmenter.options = {};
config.recognizer = {};
config.recognizer.options = {};

// CONFIGURATION ----------------------------------------------------------------------------------
// General Configuration
config.general.loadGesturesFromClient = false;       // Load gestures based on requests from the client
config.general.debug = true;

// Server
config.server.ip = '127.0.0.1';						// IP of the server (for app interface)
config.server.port = 6442;							// Port of the server (for app interface)

// Sensor Interface
config.sensor.module = LeapSensor;
config.sensor.options.framerate = 60;				// Sensor framerate [seconds]

// Classifier
config.classifier.module = GPSDClassifier;
//config.classifier.options;

// Static Gesture Analyzer
config.staticAnalyzer.module = BasicStaticAnalyzer;
//config.staticAnalyzer.options = 

// Gesture Dataset
config.dataset.module = UnifiedDatasetLoader;
config.dataset.options.directory = "./datasets";
config.dataset.options.name = "guinevere_unified";


// Gesture Segmenter
config.segmenter.module = WindowSegmenter;
config.segmenter.options.minSegmentLength = 10;		// Minimum length of a segment (if applicable) [#frames]
config.segmenter.options.maxSegmentLength = 60;		// Maximum length of a segment (if applicable) [#frames]
config.segmenter.options.windowWidth = 20;			// Width of the window (if applicable) [#frames]
config.segmenter.options.intervalLength = 3;		// Length of the interval between 2 consecutive segments (if applicable) [#frames]
config.segmenter.options.pauseLength = 60;			// Length of the pause after a gesture has been detected (if applicable) [#frames]
config.segmenter.options.xBound = 120;				// 1/2 width of the zone (if applicable) [mm]
config.segmenter.options.zBound = 60;				// 1/2 depth of the zone (if applicable) [mm]

// Gesture Recognizer
config.recognizer.module = JackknifeRecognizer;
config.recognizer.options.samplingPoints = 16;		// Number of sampling points [#points]
config.recognizer.options.articulations = ["rightThumbPosition", "rightIndexPosition", "rightMiddlePosition", "rightRingPosition", "rightPinkyPosition", "leftThumbPosition", "leftIndexPosition", "leftMiddlePosition", "leftRingPosition", "leftPinkyPosition", "rigthPalmPosition", "leftPalmPosition"];



module.exports = config;
