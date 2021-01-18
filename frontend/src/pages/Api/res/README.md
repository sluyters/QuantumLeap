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
### registerGestures(type, names)
Register gestures to the QuantumLeap framework. If `requireRegistration` is set to *true*, `gesture` events are triggered for each registered gesture.

  * `type` - **'static' | 'dynamic'** - The type of the gesture(s) to register.
  * `names` - **string | string[]** - The name(s) of the gesture(s) to register.

### unregisterGestures(type, names)
Unregister gestures from the QuantumLeap framework. If `requireRegistration` is set to *true*, `gesture` events will not be triggered anymore for unregistered gestures.

  * `type` - **'static' | 'dynamic'** - The type of the gesture(s) to unregister.
  * `names` - **string | string[]** - The name(s) of the gesture(s) to unregister.

### addEventListener(type, listener)
Attach a listener function to an event. The listener will be triggered each time the event occurs. Any number of listeners can be attached to an event.

  * `type` - **'frame' | 'gesture' | 'connect' | 'disconnect' | 'error'** - The type of event.
  * `listener` - **function** - A listener function.

### removeEventListener(type, listener)
Remove a listener attached to an event.

  * `type` - **'frame' | 'gesture' | 'connect' | 'disconnect' | 'error'** - The type of event.
  * `listener` - **function** - The listener function to remove.

### removeEventListeners([type])
Remove all listeners attached to an event. If `type` is omitted, all listeners attached to all events will be removed.

  * `type` - **'frame' | 'gesture' | 'connect' | 'disconnect' | 'error'** - The type of event. If omitted, all listeners will be removed for all events.

### connect([addr])
Connect to the QuantumLeap framework.

  * `addr` - **string** - *Default: 'ws://127.0.0.1:6442'* - The address of a running instance of QuantumLeap framework.

### disconnect()
Disconnect from the QuantumLeap framework.


Events
------
### frame
Emitted when a frame is received from the QuantumLeap framework.

#### Properties
  * `Event.type` - The type of event.
  * `Event.frame` - Data corresponding to the current frame.

### gesture
Emitted when a gesture is recognized by the QuantumLeap framework. If `requireRegistration` was set to *true*, an event is emitted only is the recognized gesture was previously registered. Otherwise, an event is emitted for any recognized gesture.

#### Properties
  * `Event.type` - The type of event.
  * `Event.gesture` - Data corresponding to the recognized gesture.
    * `Event.gesture.type` - The type of the recognized gesture.
    * `Event.gesture.name` - The name of the recognized gesture.
    * `Event.gesture.data` - Additional data corresponding to the recognized gesture.
  * `Event.frame` - Data corresponding to the current frame.

### connect
Emitted after the connection with the QuantumLeap framework.

#### Properties
  * `Event.type` - The type of event.
  * `Event.message` - A message describing the event.

### disconnect
Emitted when a disconnection with the QuantumLeap framework occurs.

#### Properties
  * `Event.type` - The type of event.
  * `Event.message` - A message describing the event.

### error
Emitted when a connection error with the QuantumLeap framework occurs.

#### Properties
  * `Event.type` - The type of event.
  * `Event.message` - A message describing the event.

Examples
--------
```javascript
import GestureHandler from 'quantumleapjs' 

let gestureHandler = new GestureHandler();

gestureHandler.registerGestures('dynamic', ['left swipe', 'right swipe']);
gestureHandler.registerGestures('static', 'thumb up');

gestureHandler.addEventListener('gesture', (event) => {
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
