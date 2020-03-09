const {
  performance,
  PerformanceObserver
} = require('perf_hooks');

/* $C_Point class constructor */
function $C_Point(x, y, t, strokeId) {
  this.X = x;
  this.Y = y;
  this.T = t;
  this.StrokeID = strokeId;
}

/* Gesture class constructor */
function $C_Gesture(points, resamplingPoints, gestureName = "unknown") {
  this.Name = gestureName;
  // preprocessing + gesture representation:
  this.Shapes = $C_Resample(points.slice(0, points.length), resamplingPoints);
  this.Shapes = $C_Shape(this.Shapes, $C_Barycenter(this.Shapes), resamplingPoints);
}

/* CDollarRecognizer */
function CDollarRecognizer(resamplingPoints) {
  this.ResamplingPoints = resamplingPoints;
  this.TrainingTemplates = new Array();

  /**
   *  Saves a new template after preprocessing
   *    @param points an array of $C_Point
   *    @return the preprocessed template
   */
  this.SaveAs = function(points, gestureName) {
    let trainingTemplate = new $C_Gesture(points, this.ResamplingPoints, gestureName);
    this.TrainingTemplates[this.TrainingTemplates.length] = trainingTemplate;
    return trainingTemplate;
  }

  /**
   *  Classifies a candidate gesture after preprocessing and matching
   *    @param points an array of $C_Point
   *    @return an array with the best matching template and the recognition time
   */
  this.Recognize = function(points) {
    let t0 = performance.now(); // starts the timer
    let minDissimilarity = +Infinity;
    let bestTemplate = -1;
    let candidate = new $C_Gesture(points, this.ResamplingPoints);
    // matches each training template to the candidate gesture
    for (let t = 0; t < this.TrainingTemplates.length; t += 1) {
      var dissimilarity = $C_Matching(candidate.Shapes, this.TrainingTemplates[t].Shapes, minDissimilarity);
      if (dissimilarity < minDissimilarity) {
        minDissimilarity = dissimilarity;
        bestTemplate = t;
      }
    }
    let t1 = performance.now(); // stops the timer
    return new Array(this.TrainingTemplates[bestTemplate], t1-t0);
  }
}

/* Private functions used for preprocessing the gestures */

function $C_Resample(points, resamplingPoints) {
  let numberStrokes = points[points.length - 1].StrokeID;
  let int = $C_PathLength(points) / (resamplingPoints + numberStrokes);
  let resampledPoints = new Array(points[0]);
  let dist = 0.0;
  for (let i = 1; i < points.length; i += 1) {
    if (points[i - 1].StrokeID == points[i].StrokeID) {
      let dist2 = $C_EuclideanDistance(points[i - 1], points[i]);
      if ((dist + dist2) >= int) {
        let pX = points[i - 1].X + ((int - dist) / dist2) * (points[i].X - points[i - 1].X);
        let pY = points[i - 1].Y + ((int - dist) / dist2) * (points[i].Y - points[i - 1].Y);
        let pT = points[i - 1].T + ((int - dist) / dist2) * (points[i].T - points[i - 1].T);
        let p = new $C_Point(pX, pY, pT, points[i - 1].StrokeID);
        resampledPoints[resampledPoints.length] = p;
        points.splice(i, 0, p);
        dist = 0.0;
      }
      else dist += dist2;
    }
  }
  // sometimes it falls a rounding-error short of adding the last point
  while (resampledPoints.length <= resamplingPoints + numberStrokes)
    resampledPoints[resampledPoints.length] = new $C_Point(points[points.length - 1].X, points[points.length - 1].Y, points[points.length - 1].T, points[points.length - 1].StrokeID);
  return resampledPoints;
}

function $C_Barycenter(points) {
  let dX = 0.0, dY = 0.0;
  for(let i = 0; i < points.length; i += 1) {
    dX += points[i].X;
    dY += points[i].Y;
  }
  return new $C_Point(dX / points.length, dY / points.length, 0, 0);
}

function $C_Shape(points, barycenter, numberShapes) {
  let shapes = new Array();
  for (let i = 0; i < points.length - 1; i += 1) {
    if (points[i].StrokeID == points[i + 1].StrokeID) {
      // bp1 = bi
      let v1 = new $C_Point(
        points[i].X - barycenter.X,
        points[i].Y - barycenter.Y,
        points[i].T,
        points[i].StrokeID
      );
      // p1p2 = i(i+1)
      let v2 = new $C_Point(
        points[i + 1].X - points[i].X,
        points[i + 1].Y - points[i].Y,
        points[i + 1].T,
        points[i].StrokeID
      );
      let den = $C_ScalarProduct(v2, v2);
      // shape(bpi,pipi+1) = shape(v1, v2)
      shapes[shapes.length] = new $C_Point(
        $C_ScalarProduct(v1, v2) / den,
        ((v1.X * v2.Y) - (v2.X * v1.Y)) / den,
        v2.T,
        v2.StrokeID
      );
    }
  }
  while (shapes.length > numberShapes) shapes.pop();
  return shapes;
}

function $C_PathLength(points) {
  let d = 0.0;
  for(let i=1 ; i < points.length ; i++) {
    if(points[i-1].StrokeID == points[i].StrokeID)
      d += $C_EuclideanDistance(points[i - 1], points[i]);
  }
  return d;
}

function $C_EuclideanDistance(p1, p2)
{
  let dX = p2.X - p1.X;
  let dY = p2.Y - p1.Y;
  return Math.sqrt(dX * dX + dY * dY);
}

function $C_ScalarProduct(a, b) {
  return (a.X * b.X) + (a.Y * b.Y);
}

/* Private functions used to classify the candidate gesture */

function $C_Matching(shapes1, shapes2, minSoFar) {
  return Math.min(
    $C_CloudDistance(shapes1, shapes2, minSoFar),
    $C_CloudDistance(shapes2, shapes1, minSoFar)
  );
}

function $C_CloudDistance(shapes1, shapes2, minSoFar) {
  let numberShapes = shapes1.length;
  let matchedShapes = new Array(numberShapes); // true if a shape from shapes2 has already been matched
  let sum = 0;
  for (let i = 0; i < matchedShapes.length; i += 1)
    matchedShapes[i] = false;
  // matches each shape of shapes1 with any shape from shapes2
  for (let i = 0; i < matchedShapes.length; i += 1) {
    let index = -1;
    let min = +Infinity;
    for (let j = 0; j < matchedShapes.length; j += 1) {
      let d = $C_EuclideanDistance(shapes1[i], shapes2[j]);
      if (d < min) {
        min = d;
        index = j;
      }
    }
    sum += min * 0.85;
    if (sum >= minSoFar) return sum; // early abandoning
    matchedShapes[index] = true;
  }
  // matches each shape of shapes2 that has not been matched yet
  for (let j = 0; j < matchedShapes.length; j += 1) {
    if (!matchedShapes[j]) {
      let min = +Infinity;
      for (let i = 0; i < matchedShapes.length; i += 1) {
        let d = $C_EuclideanDistance(shapes1[i], shapes2[j]);
        if (d < min) min = d;
      }
      sum += min * 1.25;
      if (sum >= minSoFar) return sum; // early abandoning
    }
  }
  return sum;
}

module.exports = {
  $C_Point,
  CDollarRecognizer
};