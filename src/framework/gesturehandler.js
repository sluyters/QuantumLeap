import { w3cwebsocket as W3CWebSocket } from "websocket"; // Added

class GestureHandler {

    constructor() {
        this.handlers = {};
        this.client = new W3CWebSocket('ws://127.0.0.1:6442'); // Added

        this.client.onopen = function() {
            console.log('WebSocket Client Connected');
        };

        this.client.onmessage = function(event) {
            let data = JSON.parse(event.data);
            if (data.hasOwnProperty('gesture')) {
                if (this.handlers.hasOwnProperty(data.gesture)) {
                    this.handlers[data.gesture]();
                }
            }
        }.bind(this);
    }

    onGesture(gesture, handler) {
        this.handlers[gesture] = handler;
    }

    removeGestureHandler(gesture) {
        if (this.handlers.hasOwnProperty(gesture)) {
            delete this.handlers[gesture];
        }
    }

    disconnect() {
        this.client.close();
    }
}

export default GestureHandler