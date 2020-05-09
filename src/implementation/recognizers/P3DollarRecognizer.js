const Recognizer = require('../../framework/recognizers/Recognizer').Recognizer;


class Point {
	constructor(x, y, z, id) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.id = id;
    }
}

class PointCloud {
    constructor(name, points) {
        this.Name = name;
        this.Points = Resample(points, NumPoints);
        this.Points = Scale(this.Points);
        this.Points = TranslateTo(this.Points, Origin);
    }
}

//
// P3DollarRecognizer constants
//
let NumPoints = 32;
const Origin = new Point(0,0,0,0);

class P3DollarRecognizer extends Recognizer {

	static name = "P3DollarRecognizer";

    constructor(options, dataset) {
		super();
		NumPoints = options.samplingPoints;
		this.PointClouds = new Array();

		if (dataset!==undefined){
			dataset.getGestureClass().forEach((gesture, key, self) => {
				gesture.getSample().forEach(sample => {
						this.addGesture(gesture.name, sample);
					}
				);
			});
		}
    }

    addGesture(name, sample){
		let points = convert(sample);
        this.PointClouds.push(new PointCloud(name, points));
		var num = 0;
		for (var i = 0; i < this.PointClouds.length; i++) {
			if (this.PointClouds[i].Name == name)
				num++;
		}
		return num;
    }

    recognize(sample){
		let points = convert(sample);
        var t0 = Date.now();
        var candidate = new PointCloud("", points);

		var u = -1;
		var b = +Infinity;
		for (var i = 0; i < this.PointClouds.length; i++) // for each point-cloud template
		{
			var d = GreedyCloudMatch(candidate.Points, this.PointClouds[i]);
			if (d < b) {
				b = d; // best (least) distance
				u = i; // point-cloud index
			}
		}
		var t1 = Date.now();
		return (u == -1) ? { 'Name': 'No match', 'Time': t1-t0 } : { 'Name': this.PointClouds[u].Name, 'Time': t1-t0 };
    }

}

function convert(sample){
    return sample.paths["rightPalmPosition"].strokes[0].points;
}

//
// Private helper functions from here on down
//
function GreedyCloudMatch(points, P) {
	var e = 0.50;
	var step = Math.floor(Math.pow(points.length, 1.0 - e));
	var min = +Infinity;
	for (var i = 0; i < points.length; i += step) {
        var d1 = CloudDistance(points, P.Points, i);
        var d2 = CloudDistance(P.Points, points, i);
		min = Math.min(min, Math.min(d1, d2)); // min3
	}
	return min;
}

function CloudDistance(pts1, pts2, start) {
	var matched = new Array(pts1.length); // pts1.length == pts2.length
	for (var k = 0; k < pts1.length; k++)
		matched[k] = false;
	var sum = 0;
	var i = start;
	do
	{
		var index = -1;
		var min = +Infinity;
		for (var j = 0; j < matched.length; j++)
		{
			if (!matched[j]) {
				var d = Distance(pts1[i], pts2[j]);
				if (d < min) {
					min = d;
					index = j;
				}
			}
		}
		matched[index] = true;
		var weight = 1 - ((i - start + pts1.length) % pts1.length) / pts1.length;
		sum += weight * min;
		i = (i + 1) % pts1.length;
	} while (i != start);
	return sum;
}

function Resample(points, n) {
	var I = PathLength(points) / (n - 1); // interval length
	var D = 0.0;
	var newpoints = new Array(points[0]);
	for (var i = 1; i < points.length; i++)
	{
		if (points[i].id == points[i-1].id)
		{
			var d = Distance(points[i-1], points[i]);
			if ((D + d) >= I)
			{
				var qx = points[i-1].x + ((I - D) / d) * (points[i].x - points[i-1].x);
                var qy = points[i-1].y + ((I - D) / d) * (points[i].y - points[i-1].y);
                var qz = points[i-1].z + ((I - D) / d) * (points[i].z - points[i-1].z);
				var q = new Point(qx, qy, qz, points[i].id);
				newpoints[newpoints.length] = q; // append new point 'q'
				points.splice(i, 0, q); // insert 'q' at position i in points s.t. 'q' will be the next i
				D = 0.0;
			}
			else D += d;
		}
	}
	if (newpoints.length == n - 1) // sometimes we fall a rounding-error short of adding the last point, so add it if so
		newpoints[newpoints.length] = new Point(points[points.length - 1].x, points[points.length - 1].y, points[points.length - 1].z, points[points.length - 1].id);
	return newpoints;
}

function Scale(points) {
	var minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity, minZ = +Infinity, maxZ = -Infinity;
	for (var i = 0; i < points.length; i++) {
		minX = Math.min(minX, points[i].x);
        minY = Math.min(minY, points[i].y);
        minZ = Math.min(minZ, points[i].z);
		maxX = Math.max(maxX, points[i].x);
        maxY = Math.max(maxY, points[i].y);
        maxZ = Math.max(maxZ, points[i].z);
	}
	var size = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = (points[i].x - minX) / size;
        var qy = (points[i].y - minY) / size;
        var qz = (points[i].z - minZ) / size;
		newpoints[newpoints.length] = new Point(qx, qy, qz, points[i].id);
	}
	return newpoints;
}

// Translates points' centroid to pt
function TranslateTo(points, pt) {
	var c = Centroid(points);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = points[i].x + pt.x - c.x;
        var qy = points[i].y + pt.y - c.y;
        var qz = points[i].z + pt.z - c.z;
		newpoints[newpoints.length] = new Point(qx, qy, qz, points[i].id);
	}
	return newpoints;
}

function Centroid(points) {
	var x = 0.0, y = 0.0, z = 0.0;
	for (var i = 0; i < points.length; i++) {
		x += points[i].x;
        y += points[i].y;
        z += points[i].z;
	}
	x /= points.length;
    y /= points.length;
    z /= points.length;
	return new Point(x, y, z, 0);
}

// Length traversed by a point path
function PathLength(points) {
	var d = 0.0;
	for (var i = 1; i < points.length; i++) {
		if (points[i].id == points[i-1].id)
			d += Distance(points[i-1], points[i]);
	}
	return d;
}

// Euclidean distance between two points
function Distance(p1, p2) {
	var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    var dz = p2.z - p1.z;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

module.exports = {
    P3DollarRecognizer
}
