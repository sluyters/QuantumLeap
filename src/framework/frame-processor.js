const GestureSet = require('./gestures/gesture-set').GestureSet;
const GestureClass = require('./gestures/gesture-class').GestureClass;
const RingBuffer = require('ringbufferjs');

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
        // Initialize pose buffer
        this.poseBuffer = new RingBuffer(config.classifier.options.bufferLength);
        this.poseCounter = {};
        // Save config
        this.config = config;
    }

    resetContext() {
        if (this.config.general.gesture.loadOnRequest) {
            this.recognizer =  new this.config.recognizer.module(this.config.recognizer.options);
        }
        if (this.config.general.pose.loadOnRequest) {
            this.classifier =  new this.config.classifier.module(this.config.classifier.options);
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
        // Get pose and data from the pose buffer
        let oldPoseInfo = "";
        let oldPoseRatio = 0;
        if (this.poseBuffer.isFull()) {
            oldPoseInfo = this.poseBuffer.deq();
            if (oldPoseInfo.pose) {
                oldPoseRatio = this.poseCounter[oldPoseInfo.pose]-- / this.config.classifier.options.bufferLength;
            }
        }
        let staticPose = "";
        try {
            staticPose = this.classifier.classify(frame).name;
        } catch(error) {
            console.error(`Classifier error: ${error}`);
        }
        let newPoseInfo = { pose: "", data: "" };
        if (staticPose && (!this.config.general.pose.sendIfRequested || this.enabledPoses.includes(staticPose))) {
            newPoseInfo = { pose: staticPose, data: this.analyzer.analyze(frame) };
            if (!this.poseCounter.hasOwnProperty(staticPose)) {
                this.poseCounter[staticPose] = 1;
            } else {
                this.poseCounter[staticPose]++;
            }
        }
        this.poseBuffer.enq(newPoseInfo);
        if (oldPoseInfo.pose && oldPoseRatio > this.config.classifier.options.poseRatioThreshold) {
            // Static pose detected
            this.segmenter.notifyRecognition();
            return { 'type': 'pose', 'name': oldPoseInfo.pose, 'data': oldPoseInfo.data };
        } else {
            // Reset analyzer
            this.analyzer.reset();
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
            // Aggregate gesture class
            let newClass = new GestureClass(aggregate.name, index);
            let templates = [];
            // Fuse the classes into a new aggregate class
            for (const className of aggregate.classes) {
                let oldClass = dataset.getGestureClasses().get(className);
                templates = templates.concat(templates, oldClass.getSamples());
            }
            // Select a number of templates from the dataset if required
            if (config.useCustomTemplatesPerClass) {
                templates = getRandomSubarray(templates, config.templatesPerClass);
            }
            // Add the templates to the new gesture class
            for (template of templates) {
                newClass.addSample(template);
            }
            // Add the aggregate class to the new dataset
            newDataset.addGestureClass(newClass);
        });
        return newDataset
    } else {
        // Select a number of templates from the dataset if required
        if (config.useCustomTemplatesPerClass) {
            let newDataset = new GestureSet(dataset.name);
            dataset.getGestureClasses().forEach(gestureClass => {
                let newClass = new GestureClass(gestureClass.name, gestureClass.index); 
                let templates = gestureClass.getSamples();
                templates = getRandomSubarray(templates, config.templatesPerClass);
                // Add the templates to the new gesture class
                for (template of templates) {
                    newClass.addSample(template);
                }
                newDataset.addGestureClass(newClass);
            });
            return newDataset;
        }
        return dataset;
    }
}

// https://stackoverflow.com/questions/11935175/sampling-a-random-subset-from-an-array
function getRandomSubarray(arr, size) {
    if (size > arr.length) {
        console.log("Not enough templates!")
        return arr;
    }
    var shuffled = arr.slice(0), i = arr.length, min = i - size, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}

module.exports = {
    FrameProcessor
}