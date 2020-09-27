# QuantumLeap
## How to run the QuantumLeap framework?
1. Install [Node.js](https://nodejs.org/en/download/).
1. Install the dependencies.

        npm install
    
1. Start the framework.

        npm start


## How to add gestural support to your application with QuantumLeap?
### Configuring QuantumLeap
Modify [config.js](https://github.com/sluyters/QuantumLeap/blob/master/src/config.js) to configure QuantumLeap to the needs of your application.

### Adding gestures to your application
1. Import `GestureHandler` from [app-interface.js](https://github.com/sluyters/QuantumLeap/blob/master/src/framework/app-interface.js).

        import GestureHandler from 'PATH_TO_APP-INTERFACE/app-interface'
        
1. Create a `GestureHandler` object. If QuantumLeap is running, the `GestureHandler` object will connect to it automatically.

        let gestureHandler = new GestureHandler();

1. Call the methods of the `GestureHandler` to associate actions to gestures.
    * `onFrame(callback)`: execute the callback each time a frame is received from the sensor. This can be used to display the position of the fingers on the screen in real-time.
    * `onGesture(gesture, callback)`: execute the callback each time the (dynamic) gesture is detected. This can be used by an application to associate an action with a specific gesture
    * `onEachGesture(callback)`:  execute the callback each time any gesture is detected. This can be used to perform an action regardless of the gesture performed.
    * `removeGestureHandler(gesture)`: remove the callback associated to the gesture.
    * `onPose(gesture, callback)`:  execute the callback each time the pose (i.e., static gesture) is detected. This can be used to execute a “continuous” action while the pose is detected (e.g., rotate an image depending on the rotation of the hand).
    * `removePoseHandler(gesture)`: remove the callback associated to the pose.
    * `disconnect()`:  disconnect from the QuantumLeap framework.
    
