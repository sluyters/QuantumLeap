/**
 *  UV+ for hand gesture recognition
 *    w/ shapes built from 2 consecutive points and the global centroid;
 *    w/ flexible cloud matching:
 *      1) each shape from the 1st cloud with any closest shape from the 2nd
 *      cloud that belongs to the same articulation;
 *      2) each unmatched shape from the 2nd cloud with any closest shape from
 *      the 1st cloud that belong to the same articulation.
 *
 *  Jackknife's LeapMotion dataset, p=20, gc=8, maxT=1, n=8: 79.81% (0.38ms)
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
 *  Shape constructor
 */
function Shape(x, y, z, w) {
  // (x, y, z, w) coordinates
  this.x = x;
  this.y = y;
  this.z = z;
  this.w = w;
}

 /**
  * Gesture constructor.
  */
function Gesture(articulations, name = 'unknown') {
  // name of the gesture class
  this.name = name;
  // array of articulations' shapes
  this.articulations = articulations;
}

/**
 *  UVPRecognizer constructor.
 */
function UVPRecognizer(numberOfArticulations, numberOfShapes) {
  // number of articulations (paths) per gesture
  this.numberOfArticulations = numberOfArticulations;
  // number of shapes per articulation required to represent a gesture
  this.numberOfShapes = numberOfShapes;
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
    let besTemplate = -1;

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

    return new Array(this.trainingTemplates[bestTemplate].name, t1 - t0);
  }
  return new Array(false, 0); // error: not enough articulations
}

/**
 *  Transform an array of articulations' points into a series of articulations'
 *  shapes after resampling.
 *
 *  @return an array of articulations' shapes.
 */
UVPRecognizer.prototype.preprocess = function(articulations) {
  return this.shape(this.resample(articulations));
}

/**
 *  Transform an array of articulations' points into a series of articulations'
 *  shapes.
 *
 *  @return an array of articulations' shapes.
 */
UVPRecognizer.prototype.shape = function(articulations) {
  let shapedArticulations = [];
  for (let a = 0; a < this.numberOfArticulations; a += 1) {
    shapedArticulations[a] = [];
  }

  // transform all triple of consecutive articulation's points into a shape
  for (let a = 0; a < this.numberOfArticulations; a += 1) {
    for (let i = 1; i < articulations[a].length - 1; i += 1) {
     // from the point i - 1 to the point i
     let vectorA = new Point(
       articulations[a][i].x - articulations[a][i - 1].x,
       articulations[a][i].y - articulations[a][i - 1].y,
       articulations[a][i].z - articulations[a][i - 1].z,
     );
     // from the point i to the point i + 1
     let vectorB = new Point(
       articulations[a][i + 1].x - articulations[a][i].x,
       articulations[a][i + 1].y - articulations[a][i].y,
       articulations[a][i + 1].z - articulations[a][i].z,
     )
     let denominator = this.scalarProduct(vectorB, vectorB);
     // add the shape to the array of shapes
     shapedArticulations[a].push(new Shape(
       this.scalarProduct(vectorA, vectorB) / denominator,
       ((vectorA.x * vectorB.y) - (vectorB.x * vectorA.y)) / denominator,
       ((vectorA.x * vectorB.z) - (vectorB.x * vectorA.z)) / denominator,
       ((vectorA.y * vectorB.z) - (vectorB.y * vectorA.z)) / denominator
     ));
    }
  }

  return shapedArticulations;
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
    intervals[a] = this.pathLength(articulations[a]) / (this.numberOfShapes + 1);
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
    while (resampledArticulations[a].length <= this.numberOfShapes + 1) {
      resampledArticulations[a].push(arts[a][arts[a].length - 1]);
    }
  }

  return resampledArticulations;
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
 *  Compute the Euclidean distance between two shapes a and b.
 *
 *  @return the Euclidean distance between two shapes a and b.
 */
UVPRecognizer.prototype.betweenShapesEuclideanDistance = function(a, b) {
  let dX = b.x - a.x;
  let dY = b.y - a.y;
  let dZ = b.z - a.z;
  let dW = b.w - a.w;
  return Math.sqrt(dX * dX + dY * dY + dZ * dZ + dW * dW);
}

/**
 *  Compute the scalar product of two vectors a and b.
 *
 *  @return the scalar product of two vectors a and b.
 */
UVPRecognizer.prototype.scalarProduct = function(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
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
  let matchedShapes = [];
  for (let b = 0; b < this.numberOfArticulations; b += 1) {
    matchedShapes[b] = [];
    for (let j = 0; j < this.numberOfShapes; j += 1) {
      matchedShapes[b][j] = false;
    }
  }

  // match each shape from articulationsA with the closest shape from
  // articulationsB that belongs to the same articulation
  for (let a = 0; a < this.numberOfArticulations; a += 1) {
    for (let i = 0; i < this.numberOfShapes; i += 1) {
      let minD = +Infinity;
      let indexShape = -1;
      for (let j = 0; j < this.numberOfShapes; j += 1) {
        let d = this.betweenShapesEuclideanDistance(articulationsA[a][i], articulationsB[a][j]);
        if (d < minD) {
          minD = d;
          indexShape = j;
        }
      }
      dissimilarity += minD;
      matchedShapes[a][indexShape] = true;
      if (dissimilarity > minSoFar) return dissimilarity; // early abandoning
    }
  }

  // match each shape from articulationsB that has not been matched yet with the
  // closest shape from articulationsA that belongs to the same articulation
  for (let b = 0; b < this.numberOfArticulations; b += 1) {
    for (let j = 0; j < this.numberOfShapes; j += 1) {
      if(!matchedShapes[b][j]) {
        let minD = +Infinity;
        let indexShape = -1;
        for (let i = 0; i < this.numberOfShapes; i += 1) {
          let d = this.betweenShapesEuclideanDistance(articulationsA[b][i], articulationsB[b][j]);
          if (d < minD) minD = d;
        }
        dissimilarity += minD;
        matchedShapes[b][j] = true;
        if (dissimilarity > minSoFar) return dissimilarity; // early abandoning
      }
    }
  }

  return dissimilarity;
}
