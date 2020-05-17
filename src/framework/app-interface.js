import { w3cwebsocket as W3CWebSocket } from "websocket";

class GestureHandler {
    
    constructor() {
        // Save callbacks for gestures, poses, and frames
        this.gestureHandlers = {};
        this.poseHandlers = {};
        this.forEachHandler = (gesture) => {};
        this.frameHandler = (frame) => {};
        // True if the interface is connected to the server
        this.isConnected = false;
        // Connect to the gesture recognizer.
        this.client = new W3CWebSocket('ws://127.0.0.1:6442');
        this.client.onopen = function() {
            console.log('WebSocket Client Connected');
            this.isConnected = true;
            // Register gestures to the server
            for (const gesture of Object.keys(this.gestureHandlers)) {
                this.client.send(JSON.stringify({ 'addGesture': gesture }));
            }
            // Register poses to the server
            for (const pose of Object.keys(this.poseHandlers)) {
                this.client.send(JSON.stringify({ 'addPose': pose }));
            }
        }.bind(this);
        this.client.onmessage = function(event) {
            let data = JSON.parse(event.data);
            if (data.hasOwnProperty('gesture')) {
                let gestureName = data.gesture.name;
                if (data.gesture.type === 'dynamic') {
                    // Dynamic gesture
                    if (this.gestureHandlers.hasOwnProperty(gestureName)) {
                        this.gestureHandlers[gestureName]();
                        this.forEachHandler(gestureName);
                    }
                } else {
                    // Pose
                    if (this.poseHandlers.hasOwnProperty(gestureName)) {
                        this.poseHandlers[gestureName](data.gesture.data);
                    }
                }
            } 
            if (data.hasOwnProperty('frame')) {
                this.frameHandler(data.frame);
            }
        }.bind(this);
    }

    /**
     * Perform an action related to a gesture.
     * @callback frameCallback
     * @param {Object} frame - The data from the sensor.
     */

    /**
     * Execute the callback each time a frame is received from the sensor.
     * @param {frameCallback} callback - The callback that handles the frame
     */
    onFrame(callback) {
        this.frameHandler = callback;
    }

    /**
     * Perform an action for each gesture.
     * @callback gesturesCallback
     * @param {string} gesture - The name of the detected gesture.
     */

    /**
     * Execute the callback each time any gesture is detected.
     * @param {gesturesCallback} callback - The callback that handles the gestures.
     */
    onEachGesture(callback) {
        this.forEachHandler = callback;
    }

    /**
     * Perform an action related to a gesture.
     * @callback gestureCallback
     */

    /**
     * Execute the callback each time the gesture is detected.
     * @param {string} gesture - The name of the gesture which should trigger the callback.
     * @param {gestureCallback} callback - The callback that handles the gesture.
     */
    onGesture(gesture, callback) {
        if (this.isConnected) {
            this.client.send(JSON.stringify({ 'addGesture': gesture }));
        }
        this.gestureHandlers[gesture] = callback;
    }

    /**
     * Execute the callback each time the pose is detected.
     * @param {string} pose - The name of the pose which should trigger the callback.
     * @param {poseCallback} callback - The callback that handles the pose.
     */
    onPose(pose, callback) {
        if (this.isConnected) {
            this.client.send(JSON.stringify({ 'addPose': pose }));
        }
        this.poseHandlers[pose] = callback;
    }

    /**
     * Remove the callback associated to the gesture.
     * @param {string} gesture - The name of the gesture for which the callback should be removed.
     */
    removeGestureHandler(gesture) {
        if (this.gestureHandlers.hasOwnProperty(gesture)) {
            delete this.gestureHandlers[gesture];
            if (this.isConnected) {
                this.client.send(JSON.stringify({ 'removeGesture': gesture }));
            }
        }
    }

    /**
     * Remove the callback associated to the pose.
     * @param {string} pose - The name of the pose for which the callback should be removed.
     */
    removePoseHandler(pose) {
        if (this.poseHandlers.hasOwnProperty(pose)) {
            delete this.poseHandlers[pose];
            if (this.isConnected) {
                this.client.send(JSON.stringify({ 'removePose': pose }));
            }
        }
    }

    /**
     * Disconnect from the gesture recognizer.
     */
    disconnect() {
        this.client.close();
    }
}

export default GestureHandler