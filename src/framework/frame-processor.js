const GestureSet = require('./gestures/gesture-set').GestureSet;
const GestureClass = require('./gestures/gesture-class').GestureClass;

class FrameProcessor {
    constructor(config) {
        // Initialize analyzer, segmenter, datasets, recognizer and classifier
        this.analyzer = new config.analyzer.module(config.analyzer.options);
        this.segmenter = new config.segmenter.module(config.segmenter.options);
        this.gestureDataset = initDataset(config.datasets.gesture);
        this.poseDataset = initDataset(config.datasets.pose); 
        if (config.general.gesture.loadOnRequest) {
            this.recognizer =  new config.recognizer.module(config.recognizer.options);
        } else {
            this.recognizer = new config.recognizer.module(config.recognizer.options, this.gestureDataset);
        }
        if (config.general.pose.loadOnRequest) {
            this.classifier = new config.classifier.module(config.classifier.options);
        } else {
            this.classifier = new config.classifier.module(config.classifier.options, this.poseDataset);
        }
        // Keep track of enabled poses and gestures
        this.enabledPoses = [];
        this.enabledGestures = [];
        // Save config
        this.config = config;
    }

    resetContext() {
        if (this.config.general.gesture.loadOnRequest) {
            // TODO add option
            for (const gestureName of this.enabledGestures) {
                this.recognizer.removeGesture(gestureName);
            }
            //this.recognizer =  new this.config.recognizer.module(this.config.recognizer.options);
        }
        if (this.config.general.pose.loadOnRequest) {
            // TODO add option
            for (const poseName of this.enabledPoses) {
                console.log(poseName)
                this.classifier.removePose(poseName);
            }
            //this.classifier =  new this.config.classifier.module(this.config.classifier.options);
        }
        this.enabledPoses = [];
        this.enabledGestures = [];
    }

    enablePose(name) {
        if (!this.enabledPoses.includes(name)) {
            // The pose is not already enabled
            if (this.config.general.pose.loadOnRequest) {
                let gestureClass = this.poseDataset.getGestureClasses().get(name);
                if (gestureClass) {    
                    for (const template of gestureClass.getSamples()) {
                        this.classifier.addPose(name, template);
                    }
                } else {
                    console.error(`No pose class in the dataset with name '${name}'`);
                }
            }
            this.enabledPoses.push(name);
        }
    }

    enableGesture(name) {
        if (!this.enabledGestures.includes(name)) {
            // The gesture is not already enabled
            if (this.config.general.gesture.loadOnRequest) {
                let gestureClass = this.gestureDataset.getGestureClasses().get(name);
                if (gestureClass) {
                    for (const template of gestureClass.getSamples()) {
                        this.recognizer.addGesture(name, template);
                    }
                } else {
                    console.error(`No gesture class in the dataset with name '${name}'`);
                }
            }
            this.enabledGestures.push(name);
        }
    }

    disablePose(name) {
        var index = this.enabledPoses.indexOf(name);
        if (index > -1) {
            // The pose was enabled, disable it
            this.enabledPoses.splice(index, 1);
            if (this.config.general.pose.loadOnRequest) {
                this.classifier.removePose(name);
            }
        }
    }

    disableGesture(name) {
        var index = this.enabledGestures.indexOf(name);
        if (index > -1) {
            // The gesture was enabled, disable it
            this.enabledGestures.splice(index, 1);
            if (this.config.general.gesture.loadOnRequest) {
                this.recognizer.removeGesture(name);
            }
        }
    }

    processFrame(frame) {
        let staticPose = "";
        try {
            staticPose = this.classifier.classify(frame).name;
        } catch(error) {
            console.error(`Classifier error: ${error}`);
        }
        if (staticPose && (!this.config.general.pose.sendIfRequested || this.enabledPoses.includes(staticPose))) {
            // Static pose detected
            let data = this.analyzer.analyze(frame);
            return { 'type': 'pose', 'name': staticPose, 'data': data };
        } else {
            // Try to segment and recognize dynamic gesture
            let segment = this.segmenter.segment(frame);
            if (segment) {
                let name = "";
                try {
                    name = this.recognizer.recognize(segment).name;
                } catch (error) {
                    console.error(`Recognizer error: ${error}`);
                }
                if (name && (!this.config.general.gesture.sendIfRequested || this.enabledGestures.includes(name))) {
                    this.segmenter.notifyRecognition();
                    return { 'type': 'gesture', 'name': name, 'data': {} };
                }
            }
        }
        // Nothing detected
        return null;
    }
}

function initDataset(config) {
    // Load the dataset
    let dataset = config.loader.loadDataset(config.name, config.directory);
    // Select/aggregate/rename classes of the dataset if required
    if (config.aggregateClasses.length != 0) {
        let newDataset = new GestureSet(dataset.name);
        config.aggregateClasses.forEach((aggregate, index) => {
            let newClass = new GestureClass(aggregate.name, index);
            // Fuse the classes into a new aggregate class
            for (const className of aggregate.classes) {
                let oldClass = dataset.getGestureClasses().get(className);
                // Add each sample of the gesture class to the aggregate class
                oldClass.getSamples().forEach((sample) => newClass.addSample(sample));
            }
            // Add the aggregate class to the new dataset
            newDataset.addGestureClass(newClass);
        })
        return newDataset
    } else {
        return dataset;
    }
}

module.exports = {
    FrameProcessor
}