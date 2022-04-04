const Recognizer = require('./gpsda-dynamic-recognizer').Recognizer;
const Point = require('./gpsda-dynamic-recognizer').Point;

// Test points
const square1 = [
  new Point([0, 0, 0, 1]),
  new Point([3, 4, 0, 1]),
  new Point([3, 4, 5, 1]),
  new Point([0, 0, 5, 1]),
]
const square2 = [
  new Point([0, 0, 0, 1]),
  new Point([0, 0, 2, 1]),
  new Point([0, 2, 2, 1]),
  new Point([0, 2, 0, 1]),
]

const square3 = [
  new Point([1, 0, 0, 1]),
  new Point([1.3, 6, 0, 1]),
  new Point([7, 6.1, 0, 1]),
  new Point([7.2, 0, 0, 1]),
]

const xxx1 = [
  new Point([0, 1, 0, 1]),
  new Point([1, 4, 0, 1]),
  new Point([3, 4, 0, 1]),
  new Point([3, 7, 0, 1]),
  new Point([3, 7, 4, 1]),
]
const xxx2 = [
  new Point([0, 3, 0, 1]),
  new Point([2, 7, 0, 1]),
  new Point([6, 7, 0, 1]),
  new Point([6, 13, 0, 1]),
  new Point([6, 13, 8, 1]),
]

const xxx3 = [
  new Point([0, 3.3, 0, 1]),
  new Point([2.2, 7, 0, 1]),
  new Point([6, 7.9, 0, 1]),
  new Point([6.1, 13, 0, 1]),
  new Point([6, 13, 8.2, 1]),
]




console.log("START")

let recognizer = new Recognizer(7, 1.0);

recognizer.addGesture("square", square1);
recognizer.addGesture("square", square2);
recognizer.addGesture("xxx", xxx1);
recognizer.addGesture("xxx", xxx2);

console.log(recognizer.recognize(square3));
console.log(recognizer.recognize(xxx3));
console.log("END")
