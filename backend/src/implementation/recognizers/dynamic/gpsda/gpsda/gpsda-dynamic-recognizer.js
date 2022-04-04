const { performance } = require('perf_hooks');

class Recognizer {

  constructor(numPoints, alpha = 1) {
    this.alpha = alpha;
    this.numPoints = numPoints;
    this.templates = [];
  }

  recognize(points) {
    var t0 = performance.now();
    points = resample(points, this.numPoints);
    var candidate = new CPS("", points, this.alpha);
    var bestTemplate = null;
    var bestDistance = +Infinity;
    for (const template of this.templates) {
      var distance = computeGPSD(candidate.cps, template.cps);
      if (distance < bestDistance) {
        bestTemplate = template;
        bestDistance = distance;
      }
    }
    var t1 = performance.now();
    let score = bestDistance > 1.0 ? 1.0 / bestDistance : 1.0;
    return (bestTemplate === null) ? { success: false, name: 'No match', score: 0.0, time: t1 - t0 } : { success: true, name: bestTemplate.name, score: score, time: t1 - t0 };
  }

  addGesture(name, points) {
    points = resample(points, this.numPoints);
    this.templates.push(new CPS(name, points, this.alpha));
    return true;
  }

  removeGesture(name) {
    this.templates = this.templates.filter(cps => cps.name !== name);
  }
}

/**
 * Complete point shape descriptor
 */
class CPS {
  constructor(name, points, alpha) {
    this.name = name;
    this.cps = computeCPS(points, alpha);
  }
}

class Point {
  constructor(coords) {
    this.coords = coords;
  }
}

/**
 * Resample to a fixed number of points
 */
function resample(points, n) {
  const int = getPathLength(points) / (n - 1);  // Interval length
  let resampledPoints = [points[0]];  // Resampled points
  let dist = 0.0; // Distance from previous resampled point
  for (let i = 1; i < points.length; i += 1) {
      const dist2 = getEuclideanDistance(points[i - 1], points[i]);
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
        points.splice(i, 0, p); // Insert 'p' at position i in tmpVectors s.t. 'p' will be the next i
        dist = 0.0;
      } else {
        dist += dist2;
      }
  }
  // sometimes it falls a rounding-error short of adding the last point
  while (resampledPoints.length <= (n - 1))
    resampledPoints.push(points[points.length - 1]);
  return resampledPoints;
}

/**
 * Compute the Global Point Shape Distance (distance between the 2 complete point shapes)
 */
function computeGPSD(cps1, cps2) {
  var distance = 0.0;
  for (var i = 0; i < cps1.length; i++) {
    distance += Math.abs(cps2[i] - cps1[i]);
  }
  return distance;
}

/**
 * Compute the Complete Point Shape descriptor of a set of points
 */
function computeCPS(points, alpha) {
  let c = getCentroid(points);
  let avgDistance = getAvgAlphaDistance(c, points, alpha);
  let cps = [];
  for (var i = 0; i < points.length - 1; i++) {
    for (var j = i + 1; j < points.length; j++) {
      let alphaDistance = Math.pow(getEuclideanDistance(points[i], points[j]), alpha);
      cps.push(alphaDistance / avgDistance);
    }
  }
  cps.sort();
  return cps;
}

/**
 * Compute the centroid of a set of points
 */
function getCentroid(points) {
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

/**
 * Compute the average distance between a set of points and a reference point
 */
function getAvgAlphaDistance(refPoint, points, alpha) {
  var dist = 0.0;
  for (const point of points) {
    dist += Math.pow(getEuclideanDistance(point, refPoint), alpha);
  }
  return dist / points.length;
}

/**
 * Compute the euclidean distance between two points
 */
function getEuclideanDistance(p1, p2) {
  let dist = 0.0;
  for (let c = 0; c < p1.coords.length; c += 1) {
    const diff = p2.coords[c] - p1.coords[c];
    dist += diff * diff;
  }
  return Math.sqrt(dist);
}

function getPathLength(points) {
  let d = 0.0;
  for (let i = 0; i < points.length - 1; i += 1) {
    d += getEuclideanDistance(points[i], points[i + 1]);
  }
  return d;
}

module.exports = {
  Recognizer,
  Point
};