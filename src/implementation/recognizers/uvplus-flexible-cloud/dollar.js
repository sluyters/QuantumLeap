const {
  performance,
  PerformanceObserver
} = require('perf_hooks');
/**
 *  $-family for hand gesture recognition
 *    w/ 3D points;
 *    w/ flexible cloud matching:
 *      1) each shape from the 1st cloud with any closest shape from the 2nd
 *      cloud that belongs to the same articulation;
 *      2) each unmatched shape from the 2nd cloud with any closest shape from
 *      the 1st cloud that belong to the same articulation.
 *
 *  Jackknife's LeapMotion dataset, p=20, gc=8, maxT=1, n=8: 99.52% (0.28ms)
 *  Jackknife's LeapMotion dataset, p=20, gc=8, maxT=1, maxP=1, n=8: 85.69% (0.30ms)
 *  Jackknife's LeapMotion dataset, p=20, gc=8, maxT=1, maxP=2, n=8: 91.87% (0.47ms)
 *  Jackknife's LeapMotion dataset, p=20, gc=8, maxT=1, maxP=3, n=8: 93.62% (0.63ms)
 *  Jackknife's LeapMotion dataset, p=20, gc=8, maxT=1, maxP=4, n=8: 94.63% (0.79ms)
 *  Jackknife's LeapMotion dataset, p=20, gc=8, maxT=1, maxP=5, n=8: 95.33% (0.93ms)
 */


/**
 *  Point constructor.
 */
function Point(x, y, z) {
  // (x, y, z) coordinates
  this.x = x;
  this.y = y;
  this.z = z;
}

 /**
  * Gesture constructor.
  */
function Gesture(articulations, name = 'unknown') {
  // name of the gesture class
  this.name = name;
  // array of articulations' points
  this.articulations = articulations;
}

/**
 *  UVPRecognizer constructor.
 */
function UVPRecognizer(numberOfArticulations, numberOfPoints) {
  // number of articulations (paths) per gesture
  this.numberOfArticulations = numberOfArticulations;
  // number of points per articulation required to represent a gesture
  this.numberOfPoints = numberOfPoints;
  // array of stored training templates
  this.trainingTemplates = [];
}

/**
 *  Transform an array of articulations' points into a template via
 *  preprocessing.
 *
 *  @return true the template was successfully saved; false otherwise
 */
UVPRecognizer.prototype.storeTemplate = function(articulations, name) {
  if (articulations.length == this.numberOfArticulations) {
    let template = new Gesture(this.preprocess(articulations), name);
    this.trainingTemplates.push(template);
    return true;
  }
  return false; // error: not enough articulations
}

/**
 *  Determine the gesture class of an array of articulations' points (candidate)
 *  after preprocessing and cloud-matching against the stored training templates.
 *
 *  @return an array with the least dissimilar training template and the time
 *  required to perform the recognition in ms.
 */
UVPRecognizer.prototype.recognize = function(articulations) {
  if (articulations.length == this.numberOfArticulations) {
    // start timer
    let t0 = performance.now();

    let minDissimilarity = +Infinity;
    let bestTemplate = -1;

    // preprocess the points to represent the candidate gesture
    let candidate = new Gesture(this.preprocess(articulations));

    // cloud-matching against all stored training templates
    for (let t = 0; t < this.trainingTemplates.length; t += 1) {
      let dissimilarity = this.cloudMatching(
        candidate.articulations, this.trainingTemplates[t].articulations, minDissimilarity
      );

      // if less dissimilar: update info
      if (dissimilarity < minDissimilarity) {
        minDissimilarity = dissimilarity;
        bestTemplate = t;
      }
    }

    // stop timer
    let t1 = performance.now();
    let res = (this.trainingTemplates.length === 0 || bestTemplate === -1) ? "Undefined" : this.trainingTemplates[bestTemplate].name;
    return [res, t1 - t0];
  }
  return [false, 0]; // error: not enough articulations
}

/**
 *  Transform an array of articulations' points into an array of articulations'
 *  points after resampling, scaling, and translation.
 *
 *  @return an array of articulations' points.
 */
UVPRecognizer.prototype.preprocess = function(articulations) {
  return this.translate(
    this.scale(
      this.resample(articulations)
    ),
    new Point(0, 0, 0)
  );
}

/**
 *  Resample an array of articulations' points.
 *
 *  @return an array of resampled articulations' points.
 */
UVPRecognizer.prototype.resample = function(articulations) {
  let resampledArticulations = [];
  let arts = [];
  for (let a = 0; a < this.numberOfArticulations; a += 1) {
    resampledArticulations[a] = [articulations[a][0]];
    // avoid modifying the original array (cfr call to splice method below)
    arts[a] = articulations[a].slice(0, articulations[a].length);
  }

  // the interval between two resampled points depends of the number of shapes
  // and the total length of each articulation's points
  let intervals = [];
  for (let a = 0; a < this.numberOfArticulations; a += 1) {
    intervals[a] = this.pathLength(articulations[a]) / (this.numberOfPoints - 1);
  }

  // resample the articulation's point when it is too far away from the previous
  let dist = [];
  for (let a = 0; a < this.numberOfArticulations; a += 1) {
    dist[a] = 0.0;
  }
  for (let a = 0; a < this.numberOfArticulations; a += 1) {
    for (let i = 1; i < arts[a].length; i += 1) {
      let dist2 = this.betweenPointsEuclideanDistance(arts[a][i - 1], arts[a][i]);
      if ((dist[a] + dist2) >= intervals[a]) {
        let p = new Point(
          arts[a][i - 1].x + ((intervals[a] - dist[a]) / dist2) * (arts[a][i].x - arts[a][i - 1].x),
          arts[a][i - 1].y + ((intervals[a] - dist[a]) / dist2) * (arts[a][i].y - arts[a][i - 1].y),
          arts[a][i - 1].z + ((intervals[a] - dist[a]) / dist2) * (arts[a][i].z - arts[a][i - 1].z)
        );
        resampledArticulations[a].push(p);
        arts[a].splice(i, 0, p);
        dist[a] = 0.0;
      }
      else dist[a] += dist2;
    }
  }

  // it may fall a rounding-error short of adding the last articulation's point
  for (let a = 0; a < this.numberOfArticulations; a += 1) {
    while (resampledArticulations[a].length <= this.numberOfPoints) {
      resampledArticulations[a].push(arts[a][arts[a].length - 1]);
    }
  }

  return resampledArticulations;
}

/**
 *  Scale all articulations' points.
 *
 *  @return the scaled articulations' points.
 */
UVPRecognizer.prototype.scale = function(articulations) {
  // compute the min and max values for x, y, and z coordinates
  let minX = +Infinity, maxX = -Infinity;
  let minY = +Infinity, maxY = -Infinity;
  let minZ = +Infinity, maxZ = -Infinity;
  for (let a = 0; a < this.numberOfArticulations; a += 1) {
    for (let i = 0; i < this.numberOfPoints; i += 1) {
  		minX = Math.min(minX, articulations[a][i].x);
  		minY = Math.min(minY, articulations[a][i].y);
      minZ = Math.min(minZ, articulations[a][i].z);
  		maxX = Math.max(maxX, articulations[a][i].x);
  		maxY = Math.max(maxY, articulations[a][i].y);
      maxZ = Math.max(maxZ, articulations[a][i].z);
  	}
  }
  // scale all articulations' points
  let size = Math.max(maxX - minX, Math.max(maxY - minY, maxZ - minZ));
  let newArticulations = [];
  for (let a = 0; a < this.numberOfArticulations; a += 1) {
    newArticulations[a] = [];
    for (let i = 0; i < this.numberOfPoints; i += 1) {
      newArticulations[a][i] = new Point(
        (articulations[a][i].x - minX) / size,
        (articulations[a][i].y - minY) / size,
        (articulations[a][i].z - minZ) / size
      );
    }
  }
	return newArticulations;
}

/**
 *  Translate all articulations' points towards the reference.
 *
 *  @return the translated articulations' points.
 */
UVPRecognizer.prototype.translate = function(articulations, reference) {
	let newArticulations = [];
  let centroid = this.centroid(articulations);
  for (let a = 0; a < this.numberOfArticulations; a += 1) {
    newArticulations[a] = [];
    for (let i = 0; i < this.numberOfPoints; i += 1) {
  		newArticulations[a][i] = new Point(
        articulations[a][i].x + reference.x - centroid.x,
        articulations[a][i].y + reference.y - centroid.y,
        articulations[a][i].z + reference.z - centroid.z
      );
  	}
  }
	return newArticulations;
}

/**
 *  Compute the global centroid of all articulations' points.
 *
 *  @return the centroid of all articulations' points.
 */
UVPRecognizer.prototype.centroid = function(articulations) {
  let count = 0;
  let dX = 0.0, dY = 0.0, dZ = 0.0;
  for (let a = 0; a < this.numberOfArticulations; a += 1) {
    for (let i = 0; i < articulations[a].length; i += 1) {
      dX += articulations[a][i].x;
      dY += articulations[a][i].y;
      dZ += articulations[a][i].z;
      count += 1;
    }
  }
  return new Point(dX / count, dY / count, dZ / count);
}

/**
 *  Compute the path length of an array of points: the sum of the Euclidean
 *  distance between the consecutive points.
 *
 *  @return the path length of an array of points.
 */
UVPRecognizer.prototype.pathLength = function(points) {
  let length = 0.0;
  for (let i = 1; i < points.length - 1; i += 1) {
    length += this.betweenPointsEuclideanDistance(points[i - 1], points[i]);
  }
  return length;
}

/**
 *  Compute the Euclidean distance between two points a and b.
 *
 *  @return the Euclidean distance between two points a and b.
 */
UVPRecognizer.prototype.betweenPointsEuclideanDistance = function(a, b) {
  let dX = b.x - a.x;
  let dY = b.y - a.y;
  let dZ = b.z - a.z;
  return Math.sqrt(dX * dX + dY * dY + dZ * dZ);
}

/**
 *  Compute the dissimilarity score between two arrays of articulations via the
 *  flexible cloud matching procedure in both directions.
 *
 *  @return the dissimilarity score between two arrays of articulations.
 */
UVPRecognizer.prototype.cloudMatching = function(articulationsA, articulationsB, minSoFar) {
  return Math.min(
    this.cloudDistance(articulationsA, articulationsB, minSoFar),
    this.cloudDistance(articulationsB, articulationsA, minSoFar)
  );
}

/**
 *  Compute the dissimilarity score between two arrays of articulations via
 *  the flexible cloud matching procedure: shapes from the first array can be
 *  matched to any shape that belongs to the same articulation in the second
 *  array, and shapes from the second array that have not been matched yet can
 *  be matched to any shape that belongs to the same articulation in the first
 *  array.
 *
 *  @return the dissimilarity score between two arrays of articulations.
 */
UVPRecognizer.prototype.cloudDistance = function(articulationsA, articulationsB, minSoFar) {
  let dissimilarity = 0;

  // all shapes from articulationsB are *not* matched for now
  let matchedPoints = [];
  for (let b = 0; b < this.numberOfArticulations; b += 1) {
    matchedPoints[b] = [];
    for (let j = 0; j < this.numberOfPoints; j += 1) {
      matchedPoints[b][j] = false;
    }
  }

  // match each shape from articulationsA with the closest shape from
  // articulationsB that belongs to the same articulation
  for (let a = 0; a < this.numberOfArticulations; a += 1) {
    for (let i = 0; i < this.numberOfPoints; i += 1) {
      let minD = +Infinity;
      let indexPoint = -1;
      for (let j = 0; j < this.numberOfPoints; j += 1) {
        let d = this.betweenPointsEuclideanDistance(articulationsA[a][i], articulationsB[a][j]);
        if (d < minD) {
          minD = d;
          indexPoint = j;
        }
      }
      dissimilarity += minD;
      matchedPoints[a][indexPoint] = true;
      if (dissimilarity > minSoFar) return dissimilarity; // early abandoning
    }
  }

  // match each shape from articulationsB that has not been matched yet with the
  // closest shape from articulationsA that belongs to the same articulation
  for (let b = 0; b < this.numberOfArticulations; b += 1) {
    for (let j = 0; j < this.numberOfPoints; j += 1) {
      if(!matchedPoints[b][j]) {
        let minD = +Infinity;
        let indexPoint = -1;
        for (let i = 0; i < this.numberOfPoints; i += 1) {
          let d = this.betweenPointsEuclideanDistance(articulationsA[b][i], articulationsB[b][j]);
          if (d < minD) minD = d;
        }
        dissimilarity += minD;
        matchedPoints[b][j] = true;
        if (dissimilarity > minSoFar) return dissimilarity; // early abandoning
      }
    }
  }

  return dissimilarity;
}

module.exports = {
  Point,
  UVPRecognizer
};