/**
 *  uF
 *  An (R)ST-invariant Multi-modal Recognizer for Fast Prototyping.
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
 *  The academic publication for uF, and what should be
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

/**
 *  - For each relevant path (that is part of an articulation from articulations),
 *  resample path points to N equidistantly-spaced points (N odd and >=5);
 *  - Creation of 2N-1 vectors for uni-path articulations and 4N vectors for
 *  multi-path articulations;
 *  - Creation of N-1 shapes for uni-path articulations and 2N shapes for
 *  multi-path articulations ;
 *  - Creation of N-2 second-order shapes for uni-path articulations and N
 *  second-order shapes for multi-path articulations ;
 *  - Creation of A M-dimensional shape where A=nbr of articulations and
 *  M=((N+1)*N)/2+1;
 *  - Comparison between the candidate and the stored templates by computation
 *  of the VD, BD, 2BD, and the MBD weighted by alpha, beta, gamma, and delta,
 *  respectively.
 */

const { performance } = require('perf_hooks');

// N-Dim. Point constructor (can be used to build any N-Dim. data structure)
const Point = function (coords, strokeId = 0) {
  this.coords = coords;
  this.strokeId = strokeId;
}

// Gesture constructor
const Gesture = function (
  vectors, shapes, secondShapes, mDimShapes, name = 'unknown'
) {
  this.vectors = vectors;
  this.shapes = shapes;
  this.secondShapes = secondShapes;
  this.mDimShapes = mDimShapes;
  this.name = name;
}

// uFRecognizer constructor: numPoints designates the resampling rate of all
// gesture samples, alpha, beta, gamma, and delta define the weight of the VD,
// SD, SSD, and MSD metrics, respectively, and articulations is an array of
// uni-path and multi-path articulations (arrays of one or several path index).
const uFRecognizer = function (
  numPoints, alpha, beta, gamma, delta, articulations
) {
  if (numPoints < 5) numPoints = 5; // N>=5
  if (numPoints % 2 == 0) numPoints += 1; // N odd number
  this.numPoints = numPoints;
  this.alpha = alpha; // VD weight
  this.beta = beta; // SD weight
  this.gamma = gamma; // SSD weight
  this.delta = delta / 10; // MSD weight
  this.articulations = articulations;
  this.relevantPaths = articulations.flat();
  this.templates = [];
}

// train the recognizer by pre-processing and storing a new template
uFRecognizer.prototype.addTemplate = function(paths, name) {
  const t0 = performance.now(); // start timer
  this.templates.push(this.preprocess(paths, name));
  const t1 = performance.now(); // stop timer
  return [this.templates.length, t1 - t0];
}

// remove all templates of a given gesture from the training set
uFRecognizer.prototype.removeTemplates = function(name) {
  this.templates = this.templates.filter(gesture => gesture.name !== name);
}

// recognition of a candidate after pre-processing and classification against
// each stored template
uFRecognizer.prototype.recognize = function (paths) {
  const t0 = performance.now(); // start timer
  let bestScore = +Infinity;
  let bestTemplate = -1;
  const candidate = this.preprocess(paths);
  const t1 = performance.now(); // intermediate timer
  // compare the candidate to each stored template
  for (let t = 0; t < this.templates.length; t += 1) {
    const score = this.compare(candidate, this.templates[t], bestScore);
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

uFRecognizer.prototype.preprocess = function (paths, name = 'unknown') {
  const resampledPaths = this.resample(this.copy(paths));
  const vectors = this.normalize(this.vectorize(resampledPaths));
  const shapes = this.shaper(vectors, false);
  const secondShapes = (this.gamma !== 0) ? this.shaper(shapes, true) : undefined;
  const mDimShapes = (this.delta !== 0) ? this.shaper(this.normalize(this.bivectorize(resampledPaths)), false) : undefined;
  return new Gesture(
    vectors,
    shapes,
    secondShapes,
    mDimShapes,
    name
  );
}

uFRecognizer.prototype.resample = function (paths) {
  let newPaths = [];
  for (let p = 0; p < paths.length; p += 1) {
    // resample this path if it is considered as relevant
    if (this.relevantPaths.includes(p)) {
      const numStrokes = paths[p][paths[p].length - 1].strokeId;
      const int = this.pathLength(paths[p]) / (this.numPoints - 1);
      let newPoints = [paths[p][0]];
      let dist = 0.0;
      for (let i = 1; i < paths[p].length; i += 1) {
        const dist2 = this.euclideanDistance(paths[p][i - 1], paths[p][i]);
        if (dist2 > 0 && (dist + dist2) >= int) {
          let newCoords = [];
          for (let c = 0; c < paths[p][i - 1].coords.length; c += 1) {
            newCoords.push(
              paths[p][i - 1].coords[c] + ((int - dist) / dist2) *
              (paths[p][i].coords[c] - paths[p][i - 1].coords[c])
            );
          }
          let newPoint = new Point(newCoords, paths[p][i - 1].strokeId);
          newPoints.push(newPoint);
          paths[p].splice(i, 0, newPoint);
          dist = 0.0;
        }
        else dist += dist2;
      }
      // sometimes it falls a rounding-error short of adding the last point
      while (newPoints.length < this.numPoints) {
        newPoints.push(paths[p][paths[p].length - 1]);
      }
      newPaths.push(newPoints);
    }
    // add an empty path if it is not considered as relevant
    else {
      newPaths.push([]);
    }
  }
  return newPaths;
}

uFRecognizer.prototype.vectorize = function (paths) {
  let newPaths = [];
  for (let a = 0; a < this.articulations.length; a += 1) {
    // uni-path articulation (1 vector = 2 points from the same path)
    if (this.articulations[a].length == 1) {
      const p = this.articulations[a][0];
      const centroid = this.centroid(paths[p]);
      let vectors = [];
      for (let i = 0; i < paths[p].length - 1; i += 1) {
        let coords0 = [];
        let coords1 = [];
        for (let c = 0; c < paths[p][i].coords.length; c += 1) {
          coords0.push(paths[p][i].coords[c] - centroid.coords[c]);
          coords1.push(paths[p][i + 1].coords[c] - paths[p][i].coords[c]);
        }
        vectors.push(new Point(coords0, paths[p][i].strokeId));
        vectors.push(new Point(coords1, paths[p][i + 1].strokeId));
      }
      newPaths.push(vectors);
    }
    // multi⁻path articulation (2 vectors = 3 points from 3 different paths)
    else if (this.articulations[a].length == 3) {
      const p0 = this.articulations[a][0];
      const p1 = this.articulations[a][1];
      const p2 = this.articulations[a][2];
      let pts = paths[p0].concat(paths[p1].concat(paths[p2]));
      const centroid = this.centroid(pts);
      let vectors = [];
      for (let i = 0; i < paths[p0].length; i += 1) {
        let coords0 = [], coords1 = [], coords2 = [], coords3 = [];
        for (let c = 0; c < paths[p0][i].coords.length; c += 1) {
          coords0.push(paths[p0][i].coords[c] - centroid.coords[c]);
          coords1.push(paths[p1][i].coords[c] - paths[p0][i].coords[c]);
          coords2.push(paths[p1][i].coords[c] - centroid.coords[c]);
          coords3.push(paths[p2][i].coords[c] - paths[p1][i].coords[c]);
        }
        vectors.push(new Point(coords0));
        vectors.push(new Point(coords1));
        vectors.push(new Point(coords2));
        vectors.push(new Point(coords3));
      }
      newPaths.push(vectors);
    }
  }
  return newPaths;
}

// create two M-dimensional bivectors for each uni-path articulation
uFRecognizer.prototype.bivectorize = function (paths) {
  let newPaths = [];
  for (let a = 0; a < this.articulations.length; a += 1) {
    if (this.articulations[a].length == 1) {
      const p = this.articulations[a][0];
      let vectors = [], coords1 = [], coords2 = [];
      const halfIndex = Math.floor(paths[p].length / 2);
      const lastIndex = paths[p].length - 1;
      for (let i = 0; i < halfIndex; i += 1) {
        for (let c = 0; c < paths[p][i].coords.length; c += 1) {
          coords1.push(paths[p][i + 1].coords[c] - paths[p][i].coords[c]);
          coords2.push(paths[p][halfIndex + i + 1].coords[c] - paths[p][halfIndex + i].coords[c]);
        }
      }
      vectors.push(new Point(coords1));
      vectors.push(new Point(coords2));
      newPaths.push(vectors);
    }
  }
  return newPaths;
}

uFRecognizer.prototype.normalize = function (paths) {
  let newPaths = [];
  for (let p = 0; p < paths.length; p += 1) {
    let newVectors = [];
    for (let v = 0; v < paths[p].length; v += 1) {
      const norm = this.norm(paths[p][v]);
      let newCoords = [];
      for (let c = 0; c < paths[p][v].coords.length; c += 1) {
        // Avoid NaN if norm is 0
        if (norm !== 0.0) {
          newCoords.push(paths[p][v].coords[c] / norm);
        } else {
          newCoords.push(paths[p][v].coords[c]);
        }
      }
      newVectors.push(new Point(newCoords));
    }
    newPaths.push(newVectors);
  }
  return newPaths;
}

uFRecognizer.prototype.shaper = function (paths, secondOrder) {
  let newPaths = [];
  for (let p = 0; p < paths.length; p += 1) {
    // second-order shapes are only computed for uni-path articulations
    if ((secondOrder && this.articulations[p].length == 1) || !secondOrder) {
      const nextVector = (this.articulations[p].length == 1) ? 1 : 2;
      let shapes = [];
      for(let i = 0; i < paths[p].length - 1; i += nextVector) {
        let coords = [];
        coords.push(this.scalarProduct(paths[p][i], paths[p][i + 1]));
        for (let c1 = 0; c1 < paths[p][i].coords.length - 1; c1 += 1) {
          for (let c2 = c1 + 1; c2 < paths[p][i + 1].coords.length; c2 += 1) {
            coords.push(
              this.determinant(
                paths[p][i].coords[c1],
                paths[p][i].coords[c2],
                paths[p][i + 1].coords[c1],
                paths[p][i + 1].coords[c2]
              )
            );
          }
        }
        shapes.push(new Point(coords));
      }
      newPaths.push(shapes);
    }
  }
  return newPaths;
}

uFRecognizer.prototype.compare = function (g1, g2, minSoFar) {
  let score = 0.0;
  for (let p = 0; p < g1.vectors.length; p += 1) {
    for (let i = 0; i < g1.vectors[p].length; i += 1) {
      if (this.alpha !== 0) {
        const vd = this.elementWiseDistance(
          g1.vectors[p][i], g2.vectors[p][i], g1.vectors[p].length
        );
        score += this.alpha * vd;
      }
      if (this.beta !== 0 && p < g1.shapes.length && i < g1.shapes[p].length) {
        const bd = this.elementWiseDistance(
          g1.shapes[p][i], g2.shapes[p][i], g1.shapes[p].length
        )
        score += this.beta * bd;
      }
      if (this.gamma !== 0 && p < g1.secondShapes.length && i < g1.secondShapes[p].length) {
        const bbd = this.elementWiseDistance(
          g1.secondShapes[p][i], g2.secondShapes[p][i], g1.secondShapes[p].length
        );
        score += this.gamma * bbd;
      }
      if (this.delta !== 0 && p < g1.mDimShapes.length && i < g1.mDimShapes[p].length) {
        const mbd = this.elementWiseDistance(
          g1.mDimShapes[p][i], g2.mDimShapes[p][i], g1.mDimShapes[p].length
        );
        score += this.delta * mbd;
      }
      // early abandoning
      if (score >= minSoFar) {
        return minSoFar;
      }
    }
  }
  return score;
}

uFRecognizer.prototype.elementWiseDistance = function (e1, e2, den) {
  return this.euclideanDistance(e1, e2) / den;
}

uFRecognizer.prototype.centroid = function (points) {
  let newCoords = [];
  for (let c = 0; c < points[0].coords.length; c += 1) {
    newCoords.push(0.0);
  }
  for (let i = 0; i < points.length; i += 1) {
    for (let c = 0; c < points[i].coords.length; c += 1) {
      newCoords[c] += points[i].coords[c];
    }
  }
  for (let c = 0; c < newCoords.length; c += 1) {
    newCoords[c] /= points.length;
  }
  return new Point(newCoords);
}

uFRecognizer.prototype.pathLength = function (points) {
  let d = 0.0;
  for (let i = 0; i < points.length - 1; i += 1) {
    d += this.euclideanDistance(points[i], points[i + 1]);
  }
  return d;
}

uFRecognizer.prototype.norm = function (v) {
  let norm = 0.0;
  for (let c = 0; c < v.coords.length; c += 1) {
    norm += v.coords[c] * v.coords[c];
  }
  return Math.sqrt(norm);
}

uFRecognizer.prototype.euclideanDistance = function (p1, p2) {
  let dist = 0.0;
  for (let c = 0; c < p1.coords.length; c += 1) {
    const diff = p2.coords[c] - p1.coords[c];
    dist += diff * diff;
  }
  return Math.sqrt(dist);
}

uFRecognizer.prototype.determinant = function (u1, u2, v1, v2) {
  return u1 * v2 - v1 * u2;
}

uFRecognizer.prototype.scalarProduct = function (v1, v2) {
  let res = 0.0;
  for (let c = 0; c < v1.coords.length; c += 1) {
    res += v1.coords[c] * v2.coords[c];
  }
  return res;
}

uFRecognizer.prototype.copy = function (paths) {
  let copy = [];
  for (let p = 0; p < paths.length; p += 1) {
    copy.push(paths[p].slice(0, paths[p].length));
  }
  return copy;
}

module.exports = {
	uFRecognizer,
	Point
}
