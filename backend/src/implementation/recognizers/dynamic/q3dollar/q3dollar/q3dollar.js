/**
 * The $Q Super-Quick Recognizer (JavaScript version)
 *
 * Javascript version:
 *
 *  Nathan Magrofuoco
 *  Universite Catholique de Louvain
 *  Louvain-la-Neuve, Belgium
 *  nathan.magrofuoco@uclouvain.be
 *
 * Original $Q authors (C# version):
 *
 *  Radu-Daniel Vatavu, Ph.D.
 *  University Stefan cel Mare of Suceava
 *  Suceava 720229, Romania
 *  radu.vatavu@usm.ro
 *
 *  Lisa Anthony, Ph.D.
 *  Department of CISE
 *  University of Florida
 *  Gainesville, FL, USA 32611
 *  lanthony@cise.ufl.edu
 *
 *  Jacob O. Wobbrock, Ph.D.
 *  The Information School | DUB Group
 *  University of Washington
 *  Seattle, WA, USA 98195-2840
 *  wobbrock@uw.edu
 *
 * The academic publication for the $Q recognizer, and what should be
 * used to cite it, is:
 *
 *    Vatavu, R.-D., Anthony, L. and Wobbrock, J.O. (2018). $Q: A super-quick,
 *    articulation-invariant stroke-gesture recognizer for low-resource devices.
 *    Proceedings of the ACM Conference on Human-Computer Interaction with Mobile
 *    Devices and Services (MobileHCI '18). Barcelona, Spain (September 3-6, 2018).
 *    New York: ACM Press. Article No. 23.
 *    https://dl.acm.org/citation.cfm?id=3229434.3229465
 *
 * This software is distributed under the "New BSD License" agreement:
 *
 * Copyright (c) 2018-2019, Nathan Magrofuoco, Jacob O. Wobbrock, Radu-Daniel Vatavu,
 * and Lisa Anthony. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the names of the University Stefan cel Mare of Suceava,
 *      University of Washington, nor University of Florida, nor the names of its
 *      contributors may be used to endorse or promote products derived from this
 *      software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Radu-Daniel Vatavu OR Lisa Anthony
 * OR Jacob O. Wobbrock BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
 * OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
**/

const { performance } = require('perf_hooks');

//
// Point class
//
function Point(x, y, z, id) // constructor
{
	this.X = x;
	this.Y = y;
	this.Z = z;
	this.ID = id;  // stroke ID to which this point belongs (1,2,3,etc.)
	this.IntX = 0; // for indexing into the LUT
	this.IntY = 0; // for indexing into the LUT
	this.IntZ = 0; // for indexing into the LUT
}
//
// PointCloud class
//
function PointCloud(name, points) // constructor
{
	this.Name = name;
	this.Points = Resample(points, NumPoints);
	this.Points = Scale(this.Points);
	this.Points = TranslateTo(this.Points, Origin);
	this.Points = MakeIntCoords(this.Points); // fills in (IntX, IntY, IntZ) values
	this.LUT = ComputeLUT(this.Points);
}
//
// Result class
//
function Result(name, score, ms) // constructor
{
	this.Name = name;
	this.Score = score;
	this.Time = ms;
}
//
// Q3DollarRecognizer constants
//
let NumPoints = 32;
const Origin = new Point(0, 0, 0, 0);
const MaxIntCoord = 1024; // (IntX, IntY, IntZ) range from [0, MaxIntCoord - 1]
const LUTSize = 16; // default size of the lookup table is 16 x 16 x 16
const LUTScaleFactor = MaxIntCoord / LUTSize; // used to scale from (IntX, IntY, IntZ) to LUT
//
// Q3DollarRecognizer class
//
function Q3DollarRecognizer(numPoints) // constructor
{
	this.PointClouds = new Array();
	NumPoints = numPoints;
	//
	// The $Q3 Point-Cloud Recognizer API begins here -- 4 methods: Recognize(), AddGesture(), RemoveGesture(), DeleteUserGestures()
	//
	this.Recognize = function (points) {
		var t0 = performance.now();
		var candidate = new PointCloud("", points);

		var u = -1;
		var b = +Infinity;
		for (var i = 0; i < this.PointClouds.length; i++) // for each point-cloud template
		{
			var d = CloudMatch(candidate, this.PointClouds[i], b);
			if (d < b) {
				b = d; // best (least) distance
				u = i; // point-cloud index
			}
		}
		var t1 = performance.now();
		return (u == -1) ? new Result("No match.", 0.0, t1 - t0) : new Result(this.PointClouds[u].Name, b > 1.0 ? 1.0 / b : 1.0, t1 - t0);
	}
	this.AddGesture = function (name, points) {
		this.PointClouds.push(new PointCloud(name, points));
		var num = 0;
		for (var i = 0; i < this.PointClouds.length; i++) {
			if (this.PointClouds[i].Name == name)
				num++;
		}
		return num;
	}
	this.RemoveGesture = function (name) {
		this.PointClouds = this.PointClouds.filter(pointCloud => pointCloud.Name !== name);
	}
	this.DeleteUserGestures = function () {
		this.PointClouds.length = NumPointClouds; // clears any beyond the original set
		return NumPointClouds;
	}
}
//
// Private helper functions from here on down
//
function CloudMatch(candidate, template, minSoFar) {
	var n = candidate.Points.length;
	var step = Math.floor(Math.pow(n, 0.5));

	var LB1 = ComputeLowerBound(candidate.Points, template.Points, step, template.LUT);
	let LB2 = ComputeLowerBound(template.Points, candidate.Points, step, candidate.LUT);

	for (var i = 0, j = 0; i < n; i += step, j++) {
		if (LB1[j] < minSoFar)
			minSoFar = Math.min(minSoFar, CloudDistance(candidate.Points, template.Points, i, minSoFar));
		if (LB2[j] < minSoFar)
			minSoFar = Math.min(minSoFar, CloudDistance(template.Points, candidate.Points, i, minSoFar));
	}
	return minSoFar;
}
function CloudDistance(pts1, pts2, start, minSoFar) {
	var n = pts1.length;
	var unmatched = new Array(); // indices for pts2 that are not matched
	for (var j = 0; j < n; j++)
		unmatched[j] = j;
	var i = start;  // start matching with point 'start' from pts1
	var weight = n; // weights decrease from n to 1
	var sum = 0.0;  // sum distance between the two clouds
	do {
		var u = -1;
		var b = +Infinity;
		for (var j = 0; j < unmatched.length; j++) {
			d = SqrEuclideanDistance(pts1[i], pts2[unmatched[j]]);
			if (d < b) {
				b = d;
				u = j;
			}
		}
		unmatched.splice(u, 1); // remove item at index 'u'
		sum += weight * b;
		if (sum >= minSoFar)
			return sum; // early abandoning
		weight--;
		i = (i + 1) % n;
	} while (i != start);
	return sum;
}
function ComputeLowerBound(pts1, pts2, step, LUT) {
	var n = pts1.length;
	var LB = new Array(Math.floor(n / step) + 1);
	var SAT = new Array(n);
	LB[0] = 0.0;
	for (var i = 0; i < n; i++) {
		var x = Math.round(pts1[i].IntX / LUTScaleFactor);
		var y = Math.round(pts1[i].IntY / LUTScaleFactor);
		var z = Math.round(pts1[i].IntZ / LUTScaleFactor);
		var index = LUT[x][y][z];
		var d = SqrEuclideanDistance(pts1[i], pts2[index]);
		SAT[i] = (i == 0) ? d : SAT[i - 1] + d;
		LB[0] += (n - i) * d;
	}
	for (var i = step, j = 1; i < n; i += step, j++)
		LB[j] = LB[0] + i * SAT[n - 1] - n * SAT[i - 1];
	return LB;
}
function Resample(points, n) {
	var I = PathLength(points) / (n - 1); // interval length
	var D = 0.0;
	var newpoints = new Array(points[0]);
	for (var i = 1; i < points.length && newpoints.length <= n; i++) {
		if (points[i].ID == points[i - 1].ID) {
			var d = EuclideanDistance(points[i - 1], points[i]);
			if ((D + d) >= I) {
				var qx = points[i - 1].X + ((I - D) / d) * (points[i].X - points[i - 1].X);
				var qy = points[i - 1].Y + ((I - D) / d) * (points[i].Y - points[i - 1].Y);
				var qz = points[i - 1].Z + ((I - D) / d) * (points[i].Z - points[i - 1].Z);
				var q = new Point(qx, qy, qz, points[i].ID);
				newpoints[newpoints.length] = q; // append new point 'q'
				points.splice(i, 0, q); // insert 'q' at position i in points s.t. 'q' will be the next i
				D = 0.0;
			}
			else D += d;
		}
	}
	if (newpoints.length == n - 1) // sometimes we fall a rounding-error short of adding the last point, so add it if so
		newpoints[newpoints.length] = new Point(points[points.length - 1].X, points[points.length - 1].Y, points[points.length - 1].Z, points[points.length - 1].ID);
	return newpoints;
}
function Scale(points) {
	var minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity, minZ = +Infinity, maxZ = -Infinity;
	for (var i = 0; i < points.length; i++) {
		minX = Math.min(minX, points[i].X);
		minY = Math.min(minY, points[i].Y);
		minZ = Math.min(minZ, points[i].Z);
		maxX = Math.max(maxX, points[i].X);
		maxY = Math.max(maxY, points[i].Y);
		maxZ = Math.max(maxZ, points[i].Z);
	}
	var size = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = (points[i].X - minX) / size;
		var qy = (points[i].Y - minY) / size;
		var qz = (points[i].Z - minZ) / size;
		newpoints[newpoints.length] = new Point(qx, qy, qz, points[i].ID);
	}
	return newpoints;
}
function TranslateTo(points, pt) // translates points' centroid to pt
{
	var c = Centroid(points);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = points[i].X + pt.X - c.X;
		var qy = points[i].Y + pt.Y - c.Y;
		var qz = points[i].Z + pt.Z - c.Z;
		newpoints[newpoints.length] = new Point(qx, qy, qz, points[i].ID);
	}
	return newpoints;
}
function Centroid(points) {
	var x = 0.0, y = 0.0, z = 0.0;
	for (var i = 0; i < points.length; i++) {
		x += points[i].X;
		y += points[i].Y;
		z += points[i].Z;
	}
	x /= points.length;
	y /= points.length;
	z /= points.length;
	return new Point(x, y, z, 0);
}
function PathLength(points) // length traversed by a point path
{
	var d = 0.0;
	for (var i = 1; i < points.length; i++) {
		if (points[i].ID == points[i - 1].ID)
			d += EuclideanDistance(points[i - 1], points[i]);
	}
	return d;
}
function MakeIntCoords(points) {
	for (var i = 0; i < points.length; i++) {
		points[i].IntX = Math.round((points[i].X + 1.0) / 2.0 * (MaxIntCoord - 1));
		points[i].IntY = Math.round((points[i].Y + 1.0) / 2.0 * (MaxIntCoord - 1));
		points[i].IntZ = Math.round((points[i].Z + 1.0) / 2.0 * (MaxIntCoord - 1));
	}
	return points;
}
function ComputeLUT(points) {
	var LUT = new Array();
	for (var i = 0; i < LUTSize; i++) {
		LUT[i] = new Array();
		for (var j = 0; j < LUTSize; j++) {
			LUT[i][j] = new Array();
		}
	}

	for (var x = 0; x < LUTSize; x++) {
		for (var y = 0; y < LUTSize; y++) {
			for (var z = 0; z < LUTSize; z++) {
				var u = -1;
				var b = +Infinity;
				for (var i = 0; i < points.length; i++) {
					var row = Math.round(points[i].IntX / LUTScaleFactor);
					var col = Math.round(points[i].IntY / LUTScaleFactor);
					var layer = Math.round(points[i].IntZ / LUTScaleFactor);
					var d = ((row - x) * (row - x)) + ((col - y) * (col - y)) + ((layer - z) * (layer - z));
					if (d < b) {
						b = d;
						u = i;
					}
				}
				LUT[x][y][z] = u;
			}
		}
	}
	return LUT;
}
function SqrEuclideanDistance(pt1, pt2) {
	var dx = pt2.X - pt1.X;
	var dy = pt2.Y - pt1.Y;
	var dz = pt2.Z - pt1.Z;
	return (dx * dx + dy * dy + dz * dz);
}
function EuclideanDistance(pt1, pt2) {
	var s = SqrEuclideanDistance(pt1, pt2);
	return Math.sqrt(s);
}

module.exports = {
	Q3DollarRecognizer,
	Point
}