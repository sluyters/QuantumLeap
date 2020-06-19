class FrameProcessor {
    constructor(config) {
        // Initialize analyzer, segmenter, datasets, recognizer and classifier
        this.analyzer = new config.analyzer.module(config.analyzer.options);
        this.segmenter = new config.segmenter.module(config.segmenter.options);
        this.gestureDataset = config.datasets.gesture.loader.loadDataset(config.datasets.gesture.name, config.datasets.gesture.directory);
        this.poseDataset = config.datasets.pose.loader.loadDataset(config.datasets.pose.name, config.datasets.pose.directory);
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
            for (const gestureName of this.enabledGestures) {
                // TODO this.recognizer.removeGesture(gestureName);
            }
        }
        this.enabledPoses = [];
        this.enabledGestures = [];
    }

    enablePose(name) {
        if (!this.enabledPoses.includes(name)) {
            // The pose is not already enabled
            if (this.config.general.pose.loadOnRequest) {
                let gestureClass = this.gestureDataset.getGestureClasses(name);
                if (gestureClass) {
                    for (const template of gestureClass.getSample()) {
                        this.classifier.addPose(name, template);
                    }
                }
            }
            this.enabledPoses.push(name);
        }
    }

    enableGesture(name) {
        if (!this.enabledGestures.includes(name)) {
            // The gesture is not already enabled
            if (this.config.general.gesture.loadOnRequest) {
                let gestureClass = this.gestureDataset.getGestureClasses(name);
                if (gestureClass) {
                    for (const template of gestureClass.getSample()) {
                        this.recognizer.addGesture(name, template);
                    }
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
                // TODO this.classifier.removePose(name);
            }
        }
    }

    disableGesture(name) {
        var index = this.enabledGestures.indexOf(name);
        if (index > -1) {
            // The gesture was enabled, disable it
            this.enabledGestures.splice(index, 1);
            if (this.config.general.gesture.loadOnRequest) {
                // TODO this.recognizer.removeGesture(name);
            }
        }
    }

    processFrame(frame) {
        let staticPose = this.classifier.classify(frame).name;
        console.log(staticPose)
        if (staticPose && (!this.config.general.pose.sendIfRequested || this.enabledPoses.includes(staticPose))) {
            // Static pose detected
            let data = this.analyzer.analyze(frame);
            // this.segmenter.notifyStatic()
            return { 'type': 'pose', 'name': staticPose, 'data': data };
        } else {
            // Dynamic gesture detected
            let segment = this.segmenter.segment(frame);
            if (segment) {
                let { name, time, score } = this.recognizer.recognize(segment);
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

module.exports = {
    FrameProcessor
}