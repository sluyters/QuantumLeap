/**
 *  uV
 *  An ARST-invariant Multi-stroke Recognizer for Fast Prototyping
 *
 *  Nathan Magrofuoco
 *  Université catholique de Louvain
 *  Louvain Research Institute in Management and Organizations
 *  Louvain-la-Neuve, Belgium
 *  nathan.magrofuoco@uclouvain.be
 *
 *  Jean Vanderdonckt
 *  Université catholique de Louvain
 *  Louvain Research Institute in Management and Organizations
 *  Institute of Information and Communication Technologies, Electronics and
 *  Applied Mathematics
 *  Louvain-la-Neuve, Belgium
 *  jean.vanderdonckt@uclouvain.be
 *
 *  Paolo Roselli
 *  Università degli Studi di Roma "Tor Vergata"
 *  Rome, Italy
 *  roselli@mat.uniroma2.it
 *
 *  The academic publication for uV, and what should be
 *  used to cite it, is:
 *
 *    In press.
 *
 *  This software is distributed under the "BSD 3-Clause License" agreement:
 *
 *  Copyright (c) 2021, Nathan Magrofuoco, Jean Vanderdonckt, and Paolo Roselli
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are met:
 *
 *  1. Redistributions of source code must retain the above copyright notice, this
 *     list of conditions and the following disclaimer.
 *
 *  2. Redistributions in binary form must reproduce the above copyright notice,
 *     this list of conditions and the following disclaimer in the documentation
 *     and/or other materials provided with the distribution.
 *
 *  3. Neither the name of the copyright holder nor the names of its
 *     contributors may be used to endorse or promote products derived from
 *     this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 *  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 *  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 *  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 *  FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 *  DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 *  SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 *  CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 *  OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 *  OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 **/

const { performance } = require('perf_hooks');

// Point constructor
const Point = function (coords, strokeId = 0) {
  this.coords = coords;
  this.strokeId = strokeId;
}

// Gesture constructor
const Gesture = function (shapes, name = 'unknown') {
  this.name = name;
  this.shapes = shapes;
}

// uVRecognizer constructor: numShapes designates the number of shapes into which
// all gesture samples must be converted
const uVRecognizer = function (numShapes) {
  this.numShapes = numShapes;
  this.templates = [];
}

// train the recognizer by pre-processing and storing a new template: points
// is an array of Point objects and name designates the class of the gesture
uVRecognizer.prototype.addTemplate = function(points, name) {
  const t0 = performance.now(); // start timer
  this.templates.push(new Gesture(this.preprocess(points), name));
  const t1 = performance.now(); // stop timer
  return [this.templates.length, t1 - t0];
}

// remove all templates of a given gesture from the training set
uVRecognizer.prototype.removeTemplates = function(name) {
  this.templates = this.templates.filter(gesture => gesture.name !== name);
}

// recognition of a candidate after pre-processing and classification against
// each stored template
uVRecognizer.prototype.recognize = function (points) {
  const t0 = performance.now(); // start timer
  let bestScore = +Infinity;
  let bestTemplate = -1;
  const candidate = new Gesture(this.preprocess(points));
  const t1 = performance.now(); // intermediate timer
  // compare the candidate to each stored template
  for (let t = 0; t < this.templates.length; t += 1) {
    const score = this.matching(
      candidate.shapes, this.templates[t].shapes, bestScore
    );
    if (score < bestScore) {
      bestScore = score;
      bestTemplate = t;
    }
  }
  const t2 = performance.now(); // stop timer
  return (bestTemplate == -1) ?
    ['No match', t1 - t0, t2 - t1, t2 - t0, 0.0] :
    [this.templates[bestTemplate].name, t1 - t0, t2 - t1, t2 - t0, bestScore > 1.0 ? 1.0 / bestScore : 1.0];
}

uVRecognizer.prototype.preprocess = function (points) {
  return this.shape(this.resample(points.slice(0, points.length)));
}

uVRecognizer.prototype.resample = function (points) {
  const numStrokes = points[points.length - 1].strokeId;
  const int = this.pathLength(points) / (this.numShapes + numStrokes);
  let resampledPoints = [points[0]];
  let dist = 0.0;
  for (let i = 1; i < points.length; i += 1) {
    if (points[i - 1].strokeId == points[i].strokeId) {
      const dist2 = this.euclideanDistance(points[i - 1], points[i]);
      if ((dist + dist2) >= int) {
        let newCoords = [];
        for (let c = 0; c < points[i - 1].coords.length; c += 1) {
          newCoords.push(
            points[i - 1].coords[c] + ((int - dist) / dist2) *
            (points[i].coords[c] - points[i - 1].coords[c])
          );
        }
        let p = new Point(newCoords, points[i - 1].strokeId);
        resampledPoints.push(p);
        points.splice(i, 0, p);
        dist = 0.0;
      }
      else dist += dist2;
    }
  }
  // sometimes it falls a rounding-error short of adding the last point
  while (resampledPoints.length <= this.numShapes + numStrokes)
    resampledPoints.push(points[points.length - 1]);
  return resampledPoints;
}

// TODO Feasable?
uVRecognizer.prototype.shape = function (points) {
  const c = this.centroid(points);


  let shapes = [];
  for(let i = 0; i < points.length - 1; i += 1) {
    if (points[i].strokeId == points[i + 1].strokeId) {
      let coords = [];

      // b->p_i
      let v1 = this.subtract(points[i], c);
      v1.strokeId = points[i].strokeId;

      // p_i->(p_i+1)
      let v2 = this.subtract(points[i + 1], points[i]);
      v2.strokeId = points[i].strokeId;

      let den = this.scalarProduct(v2, v2);


      coords.push(this.scalarProduct(v1, v2) / den);
      for (let c1 = 0; c1 < v1.coords.length - 1; c1 += 1) {
        for (let c2 = c1 + 1; c2 < v2.coords.length; c2 += 1) {
          coords.push(
            this.determinant(
              v1.coords[c1],
              v1.coords[c2],
              v2.coords[c1],
              v2.coords[c2]
            ) / den
          );
        }
      }
      shapes.push(new Point(coords, points[i].strokeId));
    }
  }

  // in some cases, it creates too much shapes
  while (shapes.length > this.numShapes) shapes.pop();

  return shapes;
}

uVRecognizer.prototype.centroid = function (points) {
  let newCoords = [];
  // Init coords
  for (let c = 0; c < points[0].coords.length; c += 1) {
    newCoords.push(0.0);
  }
  // Add coords of each point
  for (let i = 0; i < points.length; i += 1) {
    for (let c = 0; c < points[i].coords.length; c += 1) {
      newCoords[c] += points[i].coords[c];
    }
  }
  // Divide by number of points
  for (let c = 0; c < newCoords.length; c += 1) {
    newCoords[c] /= points.length;
  }
  return new Point(newCoords);
}

uVRecognizer.prototype.pathLength = function (points) {
  let d = 0.0;
  for (let i = 1; i < points.length; i += 1)
    if (points[i - 1].strokeId == points[i].strokeId)
      d += this.euclideanDistance(points[i - 1], points[i]);
  return d;
}

uVRecognizer.prototype.subtract = function (p1, p2) {
  let newCoords = [];
  for (let c = 0; c < p1.coords.length; c += 1) {
    newCoords.push(p1.coords[c] - p2.coords[c]);
  }
  return new Point(newCoords);
}

uVRecognizer.prototype.euclideanDistance = function (p1, p2) {
  let dist = 0.0;
  for (let c = 0; c < p1.coords.length; c += 1) {
    const diff = p2.coords[c] - p1.coords[c];
    dist += diff * diff;
  }
  return Math.sqrt(dist);
}

uVRecognizer.prototype.determinant = function (u1, u2, v1, v2) {
  return u1 * v2 - v1 * u2;
}

uVRecognizer.prototype.scalarProduct = function (v1, v2) {
  let res = 0.0;
  for (let c = 0; c < v1.coords.length; c += 1) {
    res += v1.coords[c] * v2.coords[c];
  }
  return res;
}

uVRecognizer.prototype.matching = function (shapes1, shapes2, minSoFar) {
  return Math.min(
    this.cloudDistance(shapes1, shapes2, minSoFar),
    this.cloudDistance(shapes2, shapes1, minSoFar)
  );
}

uVRecognizer.prototype.cloudDistance = function (shapes1, shapes2, minSoFar) {
  let sum = 0.0; // score
  const numShapes = shapes1.length;
  // will hold true if a shape from shapes2 has already been matched
  let matchedShapes = [];
  for (let i = 0; i < numShapes; i += 1)
    matchedShapes[i] = false;
  // match each shape of shapes1 with the closest shape from shapes2
  for (let i = 0; i < numShapes; i += 1) {
    let index = -1;
    let min = +Infinity;
    for (let j = 0; j < numShapes; j += 1) {
      let d = this.euclideanDistance(shapes1[i], shapes2[j]);
      if (d < min) {
        min = d;
        index = j;
      }
    }
    sum += min * 0.95;
    if (sum >= minSoFar) return sum; // early abandoning
    matchedShapes[index] = true;
  }
  // match each shape of shapes2 that has not been matched yet
  for (let j = 0; j < numShapes; j += 1) {
    if (!matchedShapes[j]) {
      let min = +Infinity;
      for (let i = 0; i < numShapes; i += 1) {
        let d = this.euclideanDistance(shapes1[i], shapes2[j]);
        if (d < min) min = d;
      }
      sum += min * 1.05;
      if (sum >= minSoFar) return sum; // early abandoning
    }
  }
  return sum;
}

module.exports = {
	uVRecognizer,
	Point
}