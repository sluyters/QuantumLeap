
class Recognizer {
  static name = "GPSDAlphaDissimilarityRecognizer";

  constructor(numPoints, alpha = 1) {
    this.alpha = alpha;
    this.numPoints = numPoints;
    this.templates = [];
  }

  recognize(points) {
    if (points.length != this.numPoints) {
      return { success: false, name: 'No match', score: 0.0, time: 0.0 };
    }
    var t0 = Date.now();
    var candidate = new CPS("", points, this.alpha);
    // Select the 2 best templates according to the GPSD
    var bestTemplates = [null, null];
    var bestDistances = [+Infinity, +Infinity];
    for (const template of this.templates) {
      var gpsdistance = computeGPSD(candidate, template);
      if (gpsdistance < bestDistances[1]) {
        // Distance smaller than second best template
        if (gpsdistance < bestDistances[0]) {
          // Distance smaller than first best template
          bestDistances[1] = bestDistances[0];
          bestTemplates[1] = bestTemplates[0];
          bestDistances[0] = gpsdistance;
          bestTemplates[0] = template;
        } else {
          bestDistances[1] = gpsdistance;
          bestTemplates[1] = template;
        }
      }
    }
    // Select the template that minimizes the parametric dissimilarity distance
    let pdd1 = computePDD(bestDistances[0], bestTemplates[0], candidate);
    let pdd2 = computePDD(bestDistances[1], bestTemplates[1], candidate);
    let bestTemplate = pdd1 < pdd2 ? bestTemplates[0] : bestTemplates[1];
    var t1 = Date.now();
    let score = bestDistance > 1.0 ? 1.0 / bestDistance : 1.0;
    return (bestTemplate === null) ? { success: false, name: 'No match', score: 0.0, time: t1 - t0 } : { success: true, name: bestTemplate.name, score: score, time: t1 - t0 };
  }

  addGesture(name, points) {
    if (points.length != this.numPoints) {
      return false;
    }
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
    let barycentre = getBarycentre(points);
    let meanAlphaDistance = getMeanAlphaDistance(barycentre, points, alpha);
    let min = getMin(points, barycentre, meanAlphaDistance);
    let max = getMax(points, barycentre, meanAlphaDistance);
    this.wa = new Point(0.5 * (min.x + max.x), 0.5 * (min.y + max.y), 0.5 * (min.z + max.z));
    this.va = new Point(max.x - min.x, max.y - min.y, max.z - min.z);
    this.cps = computeCPS(points, meanAlphaDistance, alpha);
    //console.log(this.cps)
  }
}

/**
 * TODO generalize to any dimension
 */
class Point {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

/**
 * Compute the Parametric Dissimilarity Distance
 */
function computePDD(gpsd, cps1, cps2) {
  return gpsd + Math.sqrt(getDistance(cps1.wa, cps2.wa)) + Math.sqrt(getCrossProductMagnitude(cps1.va, cps2.va));
}

/**
 * Compute the Global Point Shape Distance (distance between the 2 complete point shapes)
 */
function computeGPSD(cps1, cps2) {
  var distance = 0.0;
  for (var i = 0; i < cps1.cps.length; i++) {
    distance += Math.abs(cps2.cps[i] - cps1.cps[i]);
  }
  return distance;
}

function getMin(points, barycentre, meanAlphaDistance) {
  let xMin, yMin, zMin = -Infinity;
  for (const point of points) {
    xMin = Math.min(xMin, point.x - barycentre.x);
    yMin = Math.min(yMin, point.y - barycentre.y);
    zMin = Math.min(zMin, point.z - barycentre.z);
  }
  return new Point(xMin / meanAlphaDistance, yMin / meanAlphaDistance, zMin / meanAlphaDistance);
}

function getMax(points, barycentre, meanAlphaDistance) {
  let xMax, yMax, zMax = +Infinity;
  for (const point of points) {
    xMax = Math.max(xMax, point.x - barycentre.x);
    yMax = Math.max(yMax, point.y - barycentre.y);
    zMax = Math.max(zMax, point.z - barycentre.z);
  }
  return new Point(xMax / meanAlphaDistance, yMax / meanAlphaDistance, zMax / meanAlphaDistance);
}

/**
 * Compute the Complete Point Shape descriptor of a set of points
 */
function computeCPS(points, meanDistance, alpha) {
  let cps = [];
  for (var i = 0; i < points.length - 1; i++) {
    for (var j = i + 1; j < points.length; j++) {
      let alphaDistance = Math.pow(getDistance(points[i], points[j]), alpha);
      cps.push(alphaDistance / meanDistance);
    }
  }
  cps.sort();
  return cps;
}

/**
 * Compute the barycentre of a set of points
 */
function getBarycentre(points) {
  var x = 0.0, y = 0.0, z = 0.0;
  for (const point of points) {
    x += point.x;
    y += point.y;
    z += point.z;
  }
  x /= points.length;
  y /= points.length;
  z /= points.length;
  return new Point(x, y, z);
}

/**
 * Compute the mean distance between a set of points and a reference point
 */
function getMeanAlphaDistance(refPoint, points, alpha) {
  var d = 0.0;
  for (const point of points) {
    d += Math.pow(getDistance(point, refPoint), alpha);
  }
  return d / points.length;
}

/**
 * Compute the euclidean distance between two points
 */
function getDistance(p1, p2) {
  var dx = p2.x - p1.x;
  var dy = p2.y - p1.y;
  var dz = p2.z - p1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function getCrossProductMagnitude(p1, p2) {
  let cpx = p1.y * p2.z - p1.z * p2.y;
  let cpy = p1.x * p2.z - p1.z * p2.x;
  let cpz = p1.x * p2.y - p1.y * p2.x;
  return Math.sqrt(cpx * cpx + cpy * cpy + cpz * cpz);
}

module.exports = {
  Recognizer,
  Point
};


