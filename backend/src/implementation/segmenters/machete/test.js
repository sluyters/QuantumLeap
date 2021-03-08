const { Machete } = require('./machete/machete');
const { Sample } = require('./machete/sample');
const { Vector } = require('./machete/vector');
const { ContinuousResult, ContinuousResultOptions }= require ('./machete/continuous_result_options');

// Init Machete
let crOptions =  new ContinuousResultOptions();
crOptions.latencyFrameCount = 2;
let macheteSegmenter = new Machete(undefined, crOptions);

// Train
let macheteSample1 = new Sample(0, "square", 0);
let trajectory1 = [];
trajectory1.push(new Vector([0, 0]));
trajectory1.push(new Vector([1, 0]));
trajectory1.push(new Vector([1, 1]));
trajectory1.push(new Vector([0, 1]));
trajectory1.push(new Vector([0, 0]));
macheteSample1.addTrajectory(trajectory1);
macheteSegmenter.addSample(macheteSample1, false);

let macheteSample2 = new Sample(0, "triangle", 0);
let trajectory2 = [];
trajectory2.push(new Vector([0, 0]));
trajectory2.push(new Vector([2, 0]));
trajectory2.push(new Vector([1, 1.33]));
trajectory2.push(new Vector([0, 0]));
macheteSample2.addTrajectory(trajectory2);
macheteSegmenter.addSample(macheteSample2, false);


// Test trajectory
t = [
  new Vector([-1,-3]),
  new Vector([-1,-2]),
  new Vector([-1,-1]),
  // new Vector([0,0]),
  // new Vector([1,0]),
  // new Vector([1,1]),
  // new Vector([0,1]),
  // new Vector([1,0]),
  // new Vector([2,0]),
  // new Vector([3,0]),
  // new Vector([0,0]),
  // new Vector([1,0]),
  // new Vector([1,1]),
  // new Vector([0,1]),
  // new Vector([0,0]),
  // new Vector([1,0]),
  // new Vector([1,1]),
  // new Vector([0,1]),
  // new Vector([0,0]),
  // new Vector([1,0]),
  // new Vector([1,1]),
  // new Vector([0,1]),
  // new Vector([0,0]),
  // new Vector([1,0]),
  new Vector([0,0]),
  new Vector([1,0]),
  new Vector([2,0]),
  new Vector([2,1]),
  new Vector([2,2]),
  new Vector([1,2]),
  new Vector([0,2]),
  new Vector([0,1]),
  new Vector([0,0]),
  new Vector([0,1]),
  new Vector([0,3]),
  new Vector([0,2]),
  new Vector([0,3]),
  new Vector([3,3]),
  new Vector([1.5,4]),
  new Vector([0,3]),
  new Vector([0,4]),
  new Vector([0,5]),
  new Vector([0,6]),
]

// Test
t.forEach((ti, i) => {
  let continuousResults = macheteSegmenter.doTheThing(ti, i);
  //console.log(continuousResults)
  let result = ContinuousResult.selectResult(continuousResults, false);
  if (result !== null) {
    console.log(result);
    frames = [];
    for (let j = result.startFrameNo; j <= result.endFrameNo; j++) {
      frames.push(t[j].data);
    }
    console.log(frames)
  }
});

