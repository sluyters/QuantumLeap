const AbstractDynamicRecognizer = require('../../../../framework/recognizers/dynamic/abstract-dynamic-recognizer').AbstractDynamicRecognizer;
const math = require('mathjs');
const Spline = require('cubic-spline');


class Point {
	constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}


let NumPoints = 8;
let pathName;

class Recognizer extends AbstractDynamicRecognizer {

    static name = "ThreeCentRecognizer";
    
    constructor(options, dataset) {
		super();
        NumPoints = options.samplingPoints;
        pathName = options.pathName;
        this.templates = {};
        this.threshold = Infinity;
		if (dataset!==undefined){
			dataset.getGestureClasses().forEach((gesture) => {
				gesture.getSamples().forEach(sample => {
						this.addGesture(gesture.name, sample);
					}
				);
			});
		}
    }  

    addGesture(name, sample) {
        let points = convert(sample);
        points = normalizeP(points, NumPoints);
        if (!this.templates.hasOwnProperty(name)) {
            this.templates[name] = [];
        }
        this.templates[name].push(points);
        let distances = new Array();
        // For each class of gesture
        Object.keys(this.templates).forEach((name) => {
            // Compute the distance between each pair of gesture in the class, add it to distances
            for (let i = 0; i < this.templates[name].length; i++) {
                for (let k = i+1; k < this.templates[name].length; k++) {
                    distances.push(gestureDistance(this.templates[name][i], this.templates[name][k]));
                }
            }
        });

        if (distances.length > 0) {
            // Remove outliers and sort distances
            //distances = rmOutliers(distances);
            distances = distances.sort(function(a, b){return a - b});
            // Histogram heuristic to compute decision distance threshold
            var hist = histogram(distances, 30);
            var max = Math.max(...hist["values"]);
            var indexMax = hist["values"].indexOf(max);
            var binWidth = hist["binWidth"];
            var distancesHist = (((indexMax) * binWidth) + ((indexMax + 1) * binWidth)) / 2;
            this.threshold = distancesHist;
        }
    }

    removeGesture(name) {
        console.log("Cannot remove gesture!");
    }

    recognize(sample) {
		let points = convert(sample);
        let t0 = Date.now();
        points = normalizeP(points, NumPoints);
        let bestFitClass = "";
        //let minDist = this.threshold;
        let minDist = Infinity;
        // Compare gesture w/ each template
        Object.keys(this.templates).forEach((name) => {
            for (let i = 0; i < this.templates[name].length; i++) {
                let tmpDist = gestureDistance(points, this.templates[name][i]);
                if (tmpDist < minDist) {
                    minDist = tmpDist;
                    bestFitClass = name;
                }
            }
        }); 
        let t1 = Date.now();
		return (bestFitClass === "") ? { name: "", time: t1-t0, 'Score': 0.0 } : { name: bestFitClass, time: t1-t0, 'Score': minDist };
	}
    
    toString() {
        return `${Recognizer.name} [ samplingPoints = ${NumPoints}, pathName = ${pathName} ]`;
    }
}

function convert(sample) {
    return sample.paths[pathName].strokes[0].points;
}

function histogram(data, numBins) {
    let binWidth = math.round((math.max(data) / numBins) + 0.0005, 3);
    let currentItemId = 0;
    var bins = new Array(numBins).fill(0);
    for (let i = 0; i < numBins; i++) {
        while (currentItemId < math.size(data)[0] && (data[currentItemId] < (i + 1) * binWidth || i == numBins - 1)) {
            bins[i] += 1;
            currentItemId += 1;
        }
    }
    return { "values": bins, "binWidth": binWidth };
}

function gestureDistance(points1, points2) {
    let dq = 0;
    for (var i = 0; i < points1.length; i++) {
        var dx = points1[i].x - points2[i].x;
        var dy = points1[i].y - points2[i].y;
        var dz = points1[i].z - points2[i].z;
        dq += dx * dx + dy * dy + dz * dz;
    }
    return dq;
}

function normalizeP(points, n) {
    let dist = [0];
    for (let i = 1; i < points.length; i++) {
        dx = points[i].x - points[i-1].x;
        dy = points[i].y - points[i-1].y;
        dz = points[i].z - points[i-1].z;
        dist.push(Math.sqrt(dx * dx + dy * dy + dz * dz));
    }
    var s = cumsum(dist);
    var len = s[s.length - 1];
    // Resample
    let h = (points.length-1) / (n - 1);
    let xq = math.range(0, points.length - 1, h)._data;
    xq.push(points.length - 1);
    let x = [];
    let xAxis = [];
    let yAxis = [];
    let zAxis = [];
    for (let i = 0; i < points.length; i++) {
        x.push(i);
        xAxis.push(points[i].x);
        yAxis.push(points[i].y);
        zAxis.push(points[i].z);
    }
    let sX = spline(x, xAxis, xq);
    let sY = spline(x, yAxis, xq);
    let sZ = spline(x, zAxis, xq);
    let avgX = sX.reduce((a,b) => a + b, 0) / sX.length;
    let avgY = sY.reduce((a,b) => a + b, 0) / sY.length;
    let avgZ = sZ.reduce((a,b) => a + b, 0) / sZ.length;
    let newPoints = [];
    for (let i = 0; i < xq.length; i++) {
        // Center (wrt. centroid) and scale
        newPoints.push(new Point((sX[i] - avgX) / len, (sY[i] - avgY) / len, (sZ[i] - avgZ) / len));
    }
    return newPoints;
}

function cumsum(data) {
    var acc = 0;
    return math.map(data, function(x) {
        acc += x;
        return acc;
    })
}

// cubic interpolation of x and y.
// xq: query points
function spline(x, y, xq) {
    const spline = new Spline(x, y);
    var s = new Array(xq.length);
    for (let i = 0; i < xq.length; i++) {
        s[i] = spline.at(xq[i]);
    }
    return s;
}

module.exports = Recognizer;