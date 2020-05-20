class FrameProcessor {
    constructor(config) {
        // Initialize classifier, analyzer, segmenter, dataset and recognizer
        this.classifier = new config.classifier.module(config.classifier.options);
        this.staticAnalyzer = new config.staticAnalyzer.module(config.staticAnalyzer.options);
        this.segmenter = new config.segmenter.module(config.segmenter.options);
        this.dataset = config.dataset.module.loadDataset(config.dataset.options.name, config.dataset.options.directory);
        if (config.general.loadGesturesFromClient) {
            this.recognizer =  new config.recognizer.module(config.recognizer.options);
        } else {
            this.recognizer = new config.recognizer.module(config.recognizer.options, this.dataset);
        }
        // Keep track of enabled poses and gestures
        this.enabledPoses = [];
        this.enabledGestures = [];
        // Save config
        this.config = config;
    }

    resetContext() {
        if (this.config.general.loadGesturesFromClient) {
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
            this.enabledPoses.push(name);
        }
    }

    enableGesture(name) {
        if (!this.enabledGestures.includes(name)) {
            // The gesture is not already enabled
            if (this.config.general.loadGesturesFromClient) {
                let gestureClass = this.dataset.getGestureClasses(name);
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
        }
    }

    disableGesture(name) {
        var index = this.enabledGestures.indexOf(name);
        if (index > -1) {
            // The gesture was enabled, disable it
            this.enabledGestures.splice(index, 1);
            if (this.config.general.loadGesturesFromClient) {
                // TODO this.recognizer.removeGesture(name);
            }
        }
    }

    processFrame(frame) {
        let staticPose = this.classifier.classify(frame);
        if (staticPose && (!this.config.general.reportGesturesFromClient || this.enabledPoses.includes(staticPose))) {
            // Static pose detected
            let data = this.staticAnalyzer.analyze(frame);
            // this.segmenter.notifyStatic()
            return { 'type': 'static', 'name': staticPose, 'data': data };
        } else {
            // Dynamic gesture detected
            let segment = this.segmenter.segment(frame);
            if (segment) {
                let { name, time, score } = this.recognizer.recognize(segment);
                if (name && (!this.config.general.reportGesturesFromClient || this.enabledGestures.includes(name))) {
                    this.segmenter.notifyRecognition();
                    return { 'type': 'dynamic', 'name': name, 'data': {} };
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