class Recognizer {
  static name = "GPSDRecognizer";

  constructor(numPoints) {
    this.numPoints = numPoints;
    this.templates = [];
  }

  recognize(points) {
    if (points.length != this.numPoints) {
      return { success: false, name: 'No match', score: 0.0, time: 0.0 };
    }
    var t0 = Date.now();
    var candidate = new CPS("", points);
    var bestTemplate = null;
    var bestDistance = +Infinity;
    for (const template of this.templates) {
      var distance = computeGPSD(candidate.cps, template.cps);
      if (distance < bestDistance) {
        bestTemplate = template;
        bestDistance = distance;
      }
    }
    var t1 = Date.now();
    //console.log(`${bestTemplate.name} \t \t ${bestDistance}`)
    let score = bestDistance > 1.0 ? 1.0 / bestDistance : 1.0;
    return (bestTemplate === null) ? { success: false, name: 'No match', score: 0.0, time: t1 - t0 } : { success: true, name: bestTemplate.name, score: score, time: t1 - t0 };
  }

  addGesture(name, points) {
    if (points.length != this.numPoints) {
      return false;
    }
    this.templates.push(new CPS(name, points));
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
  constructor(name, points) {
    this.name = name;
    points = centerAndNormalize(points);
    this.cps = computeCPS(points);
    //console.log(this.cps)
  }
}

/**
 * A 3D point in space
 */
class Point {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
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
function computeCPS(points) {
  let cps = [];
  for (var i = 0; i < points.length - 1; i++) {
    for (var j = i + 1; j < points.length; j++) {
      cps.push(getDistance(points[i], points[j]));
    }
  }
  cps.sort();
  return cps;
}

/**
 * Center and normalize a set of points
 */
function centerAndNormalize(points) {
  let barycentre = getBarycentre(points);
  let avgDistance = getAvgDistance(barycentre, points);
  let newPoints = []
  for (const point of points) {
    var x = (point.x - barycentre.x) / avgDistance;
    var y = (point.y - barycentre.y) / avgDistance;
    var z = (point.z - barycentre.z) / avgDistance;
    newPoints.push(new Point(x, y, z));
  }
  return newPoints;
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
 * Compute the average distance between a set of points and a reference point
 */
function getAvgDistance(refPoint, points) {
  var d = 0.0;
  for (const point of points) {
    d += getDistance(point, refPoint);
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

module.exports = {
  Recognizer,
  Point
};


