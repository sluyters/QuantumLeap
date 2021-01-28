GestureHandler
==============
  * [Constructor](#constructor)
  * [Methods](#methods)
  * [Events](#events)
  * [Examples](#examples)
  * [Useful repositories](#useful-repositories)

This object allows you to connect to the QuantumLeap framework and call functions based on events from QuantumLeap.

```javascript
import GestureHandler from 'quantumleapjs';
```

Constructor
-----------
```javascript
new GestureHandler([options]);
```

### Options
Options can be passed as a parameter at instantiation:
```javascript
let gestureHandler = new GestureHandler({ timeout: 5000, requireRegistration: false });
```

  * `timeout` - **integer** - *Default: 10000* - The maximum time in milliseconds to wait for a connection to succeed before closing and retrying.
  * `interval` - **boolean** - *Default: 3000* - The number of milliseconds between two reconnection attempts.
  * `requireRegistration` - **boolean** - *Default: true* - If set to *true*, `gesture` events are only triggered for recognized gesture that have been registered using the `registerGesture` method. If set to *false*, `gesture` events are triggered for any recognized gestures.


Methods
-------
### addListener(eventName, listener)
Attach the handler function to the event. The function will be triggered each time the event occurs. Any number of listeners can be attached to an event.

  * `eventName` - **string** - The name of [event](#events).
  * `listener` - **function** - A listener function.

```javascript
gestureHandler.addListener('frame', (event) => {
  console.log('Frame received!');
});
```

### connect([addr])
Connect to the QuantumLeap framework.

  * `addr` - **string** - *Default: 'ws://127.0.0.1:6442'* - The address of a running instance of QuantumLeap framework.

```javascript
gestureHandler.connect();
```

### disconnect()
Disconnect from the QuantumLeap framework.

```javascript
gestureHandler.disconnect();
```

### registerGestures(type, names)
Register gestures to the QuantumLeap framework. If `requireRegistration` is set to *true*, `gesture` events are triggered for each registered gesture.

  * `type` - **'static' | 'dynamic'** - The type of the gesture(s) to register.
  * `names` - **string | string[]** - The name(s) of the gesture(s) to register.

```javascript
gestureHandler.registerGestures('dynamic', ['circle', 'tap']);
```

### removeAllListeners([eventName])
Remove all listeners attached to the event. If `eventName` is omitted, all listeners attached to all events will be removed.

  * `eventName` - **string** - The name of [event](#events). If omitted, all listeners will be removed for all events.

```javascript
let listener1 = () => {
  // ...
};
let listener2 = () => {
  // ...
};
gestureHandler.addListener('frame', listener);
gestureHandler.addListener('frame', listener2);
gestureHandler.removeAllListeners('frame');
```

### removeListener(eventName, listener)
Remove the listener attached to the event.

  * `eventName` - **string** - The name of [event](#events).
  * `listener` - **function** - The listener function to remove.

```javascript
let listener = () => {
  // ...
};
gestureHandler.addListener('frame', listener);
gestureHandler.removeListener('frame', listener);
```

### unregisterGestures(type, names)
Unregister gestures from the QuantumLeap framework. If `requireRegistration` is set to *true*, `gesture` events will not be triggered anymore for unregistered gestures.

  * `type` - **'static' | 'dynamic'** - The type of the gesture(s) to unregister.
  * `names` - **string | string[]** - The name(s) of the gesture(s) to unregister.

```javascript
gestureHandler.unregisterGestures('dynamic', ['circle', 'tap']);
```

Events
------
### Event: 'frame'
Emitted after a frame is received from the QuantumLeap framework.

#### Properties
  * `Event.frame` - Data corresponding to the current frame.

### Event: 'gesture'
Emitted after a gesture is recognized by the QuantumLeap framework. If `requireRegistration` was set to *true*, an event is emitted only is the recognized gesture was previously registered. Otherwise, an event is emitted for any recognized gesture.

#### Properties
  * `Event.gesture` - Data corresponding to the recognized gesture.
    * `Event.gesture.type` - The type of the recognized gesture.
    * `Event.gesture.name` - The name of the recognized gesture.
    * `Event.gesture.data` - Additional data corresponding to the recognized gesture.
  * `Event.frame` - Data corresponding to the current frame.

### Event: 'connect'
Emitted after the connection with the QuantumLeap framework.

#### Properties
  * `Event.message` - A message describing the event.

### Event: 'disconnect'
Emitted when a disconnection with the QuantumLeap framework occurs.

#### Properties
  * `Event.message` - A message describing the event.

### Event: 'error'
Emitted when a connection error with the QuantumLeap framework occurs.

#### Properties
  * `Event.message` - A message describing the event.

### Event: 'newListener'
Emitted just before the new event listener is added.

#### Properties
  * `Event.eventName` - The name of the event being listened for.
  * `Event.listener` - The event handler function.

### Event: 'removeListener'
Emitted after the listener is removed.

#### Properties
  * `Event.eventName` - The name of the event being listened for.
  * `Event.listener` - The event handler function.

Examples
--------
```javascript
import GestureHandler from 'quantumleapjs' 

let gestureHandler = new GestureHandler();

gestureHandler.registerGestures('dynamic', ['circle', 'tap']);
gestureHandler.registerGestures('static', 'thumb up');

gestureHandler.addListener('gesture', (event) => {
  if (event.gesture.type === 'dynamic') {
    console.log('Dynamic gesture detected.');
  }
  if (event.gesture.name === 'thumb up') {
    console.log('Like');
  }
});

gestureHandler.connect();
```
    
Useful repositories
-------------------
* [QuantumLeap](https://github.com/sluyters/QuantumLeap): the QuantumLeap framework.
* [LeapGesturePlayback](https://github.com/sluyters/LeapGesturePlayback): a simple tool for recording and playing gestures with the Leap Motion Controller.
* [LUI project](https://github.com/sluyters/LUI): a QuantumLeap-enabled application for browsing multimedia contents.
