import { w3cwebsocket as W3CWebSocket } from "websocket";
import ReconnectingWebSocket from 'reconnecting-websocket';

class GestureHandler {
    constructor(addr = "ws://127.0.0.1:6442") {
        // Save callbacks for gestures, poses, and frames
        this.gestureHandlers = {};
        this.poseHandlers = {};
        this.forEachHandler = (gesture) => {};
        this.frameHandler = (frame) => {};
        // True if the interface is connected to the server
        this.isConnected = false;
        // The websocket client
        this.client = null;
        this.connect(addr, 10000, 3000);
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
            this.client.send(JSON.stringify(getOperationMessage('addGesture', gesture)));
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
            this.client.send(JSON.stringify(getOperationMessage('addPose', pose)));
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
                this.client.send(JSON.stringify(getOperationMessage('removeGesture', gesture)));
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
                this.client.send(JSON.stringify(getOperationMessage('removePose', pose)));
            }
        }
    }

    /**
     * Connect to the gesture recognizer
     */
    connect(addr, timeout, interval) {
        this.client = new ReconnectingWebSocket(addr, [], {
            constructor: W3CWebSocket,
            connectionTimeout: timeout,  // in milliseconds
            reconnectInterval: interval
        });
        this.client.onopen = function() {
            console.log("WebSocket Client Connected");
            this.isConnected = true;
            // Init the message
            let message = {
                'type': 'operation',
                'data': []
            };
            // Add addGestures operations to the message
            for (const gesture of Object.keys(this.gestureHandlers)) {
                message.data.push({
                    'type': 'addGesture',
                    'name': gesture
                });
            }
            // Add addPose operations to the message
            for (const pose of Object.keys(this.poseHandlers)) {
                message.data.push({
                    'type': 'addPose',
                    'name': pose
                });
            }
            // Send the message to the server
            this.client.send(JSON.stringify(message));
        }.bind(this);
        // Handle messages from the server
        this.client.onmessage = function(event) {
            let msg = JSON.parse(event.data);
            if (msg.type === 'data') {
                for (const dataMsg of msg.data) {
                    if (dataMsg.type === 'frame') {
                        this.frameHandler(dataMsg.data);
                    } else if (dataMsg.type === 'pose') {
                        if (this.poseHandlers.hasOwnProperty(dataMsg.name)) {
                            this.poseHandlers[dataMsg.name](dataMsg.data);
                        }
                    } else if (dataMsg.type === 'gesture') {
                        if (this.gestureHandlers.hasOwnProperty(dataMsg.name)) {
                            this.gestureHandlers[dataMsg.name](dataMsg.data);
                            this.forEachHandler(dataMsg.name);
                        }
                    }
                }
            }
        }.bind(this);
    }

    /**
     * Disconnect from the gesture recognizer.
     */
    disconnect() {
        this.client.close();
    }
}

function getOperationMessage(type, name) {
    return { 
        'type': 'operation',
        'data': [
            {
                'type': type,
                'name': name
            }
        ] 
    }
}

export default GestureHandler