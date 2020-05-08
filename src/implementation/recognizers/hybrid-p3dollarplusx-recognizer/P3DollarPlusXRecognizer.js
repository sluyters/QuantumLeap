const AbstractRecognizer = require('../../../framework/recognizers/Recognizer').Recognizer;

/**
 * The $P+ Point-Cloud Recognizer (JavaScript version)
 *
 *  Radu-Daniel Vatavu, Ph.D.
 *  University Stefan cel Mare of Suceava
 *  Suceava 720229, Romania
 *  vatavu@eed.usv.ro
 *
 * The academic publication for the $P+ recognizer, and what should be
 * used to cite it, is:
 *
 *     Vatavu, R.-D. (2017). Improving gesture recognition accuracy on
 *     touch screens for users with low vision. Proceedings of the ACM
 *     Conference on Human Factors in Computing Systems (CHI '17). Denver,
 *     Colorado (May 6-11, 2017). New York: ACM Press, pp. 4667-4679.
 *     https://dl.acm.org/citation.cfm?id=3025941
 *
 * This software is distributed under the "New BSD License" agreement:
 *
 * Copyright (C) 2017-2018, Radu-Daniel Vatavu and Jacob O. Wobbrock. All
 * rights reserved. Last updated July 14, 2018.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the name of the University Stefan cel Mare of Suceava, nor the
 *      names of its contributors may be used to endorse or promote products
 *      derived from this software without specific prior written permission.
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

//
// Point class
//
class Point {
	constructor(x, y, z, id, angle = 0.0) {
        this.x = x;
        this.y = y;
        this.z = z;
		this.id = id;
		this.angle = angle; // normalized turning angle, $P+
    }
}

//
// PointCloud class: a point-cloud template
//
function PointCloud(name, points) // constructor
{
	this.Name = name;
	this.Points = Resample(points, NumPoints);
	this.Points = Scale(this.Points);
	this.Points = TranslateTo(this.Points, Origin);
	this.Points = ComputeNormalizedTurningAngles(this.Points); // $P+
}

//
// PDollarPlusRecognizer constants
//
NumPoints = 16;
const Origin = new Point(0, 0, 0, 0);

//
// PDollarPlusRecognizer class
//
class Recognizer extends AbstractRecognizer {

    constructor(N) {
		super();
		NumPoints = N;
		this.PointClouds = new Array();
		this.conflicts = {};
	}
	
	//
	// The $P+ Point-Cloud Recognizer API begins here -- 3 methods: Recognize(), AddGesture(), DeleteUserGestures()
	//
	recognize(points) {
		if (points.length < 2) {
			//return { 'Name': 'No match', 'Time': 0.0, 'Score': 0.0 };
			return { success: false, name: "", time: 0.0 };
		}

		let t0 = Date.now();
		var candidate = new PointCloud("", points);

		var {u, b} = this.recognizeHelper(candidate);

		if (u != -1 && this.conflicts.hasOwnProperty(this.PointClouds[u].Name)) {
			let dirDist1 = DirDist(candidate.Points, this.PointClouds[u].Points);
			let dirDist2 = DirDist(candidate.Points, this.PointClouds[this.conflicts[this.PointClouds[u].Name].index].Points);
			u = dirDist1 > dirDist2 ? u : this.conflicts[this.PointClouds[u].Name].index;
		}

		let t1 = Date.now();
		return (u == -1) ? { success: false, name: "", time: t1-t0 } :  { success: true, name: this.PointClouds[u].Name, time: t1-t0 };
	}

	addGesture(name, points) {
		var template = new PointCloud(name, points);

		if (this.PointClouds.length > 0) {
			const {u, b} = this.recognizeHelper(template);

			if (u != -1 && this.PointClouds[u].Name != name && (1.0 / b) > 0.8) {
				this.conflicts[name] = {'name': this.PointClouds[u].Name, 'index': u};
				this.conflicts[this.PointClouds[u].Name] =  {'name': name, 'index': this.PointClouds.length};
			}
		}

		this.PointClouds[this.PointClouds.length] = template;

		var num = 0;
		for (var i = 0; i < this.PointClouds.length; i++) {
			if (this.PointClouds[i].Name == name)
				num++;
		}
		return num;
	}

	recognizeHelper(pointcloud) {
		var u = -1;
		var b = +Infinity;
		for (var i = 0; i < this.PointClouds.length; i++) // for each point-cloud template
		{
			var d = Math.min(
				CloudDistance(pointcloud.Points, this.PointClouds[i].Points, b),
				CloudDistance(this.PointClouds[i].Points, pointcloud.Points, b)
				); // $P+
			if (d < b) {
				b = d; // best (least) distance
				u = i; // point-cloud index
			}
		}
		return {u, b};
	}
}

//
// Private helper functions from here on down
//
function CloudDistance(pts1, pts2, minSoFar) // revised for $P+
{
	var matched = new Array(pts1.length); // pts1.length == pts2.length
	for (var k = 0; k < pts1.length; k++)
		matched[k] = false;
	var sum = 0;
	for (var i = 0; i < pts1.length; i++)
	{
		var index = -1;
		var min = +Infinity;
		for (var j = 0; j < pts1.length; j++)
		{
			var d = DistanceWithAngle(pts1[i], pts2[j]);
			if (d < min) {
				min = d;
				index = j;
			}
		}
		matched[index] = true;
		sum += min;
		if (sum >= minSoFar) return sum; // early abandoning
	}
	for (var j = 0; j < matched.length; j++)
	{
		if (!matched[j]) {
			var min = +Infinity;
			for (var i = 0; i < pts1.length; i++) {
				var d = DistanceWithAngle(pts1[i], pts2[j]);
				if (d < min)
					min = d;
			}
			sum += min;
			if (sum >= minSoFar) return sum; // early abandoning
		}
	}
	return sum;
}

function Resample(points, n)
{
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

function Scale(points)
{
	var minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity, minZ = +Infinity, maxZ = -Infinity;
	for (var i = 0; i < points.length; i++) {
		minX = Math.min(minX, points[i].x);
		minY = Math.min(minY, points[i].y);
		minZ = Math.min(minZ, points[i].z);
		maxX = Math.max(maxX, points[i].x);
		maxY = Math.max(maxY, points[i].y);
		maxZ = Math.max(maxY, points[i].z);
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

function TranslateTo(points, pt) // translates points' centroid
{
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

function ComputeNormalizedTurningAngles(points) // $P+
{
	var newpoints = new Array();
	newpoints[0] = new Point(points[0].x, points[0].y, points[0].z, points[0].id); // first point
	for (var i = 1; i < points.length - 1; i++)
	{
		var dx = (points[i+1].x - points[i].x) * (points[i].x - points[i-1].x);
		var dy = (points[i+1].y - points[i].y) * (points[i].y - points[i-1].y);
		var dz = (points[i+1].z - points[i].z) * (points[i].z - points[i-1].z);
		var dn = Distance(points[i+1], points[i]) * Distance(points[i], points[i-1]);
		var cosangle = Math.max(-1.0, Math.min(1.0, (dx + dy + dz) / dn)); // ensure [-1,+1]
		var angle = Math.acos(cosangle) / Math.PI; // normalized angle
		newpoints[newpoints.length] = new Point(points[i].x, points[i].y, points[i].z, points[i].id, angle);
	}
	newpoints[newpoints.length] = new Point( // last point
		points[points.length - 1].x,
		points[points.length - 1].y,
		points[points.length - 1].z,
		points[points.length - 1].id);
	return newpoints;
}

function Centroid(points)
{
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

function PathLength(points) // length traversed by a point path
{
	var d = 0.0;
	for (var i = 1; i < points.length; i++) {
		if (points[i].id == points[i-1].id)
			d += Distance(points[i-1], points[i]);
	}
	return d;
}

function DistanceWithAngle(p1, p2) // $P+
{
	var dx = p2.x - p1.x;
	var dy = p2.y - p1.y;
	var dz = p2.z - p1.z;
	var da = p2.angle - p1.angle;
	return Math.sqrt(dx * dx + dy * dy + dz * dz + da * da);
}

function Distance(p1, p2) // Euclidean distance between two points
{
	var dx = p2.x - p1.x;
	var dy = p2.y - p1.y;
	var dz = p2.z - p1.z;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function DirDist(points1, points2) {
	const padding = 1;
	let dist = 0;
	for (var i = padding; i < NumPoints - (1 + padding); i+=1) {
		let v1x = points1[i+1].x - points1[i].x;
		let v1y = points1[i+1].y - points1[i].y;
		let v1z = points1[i+1].z - points1[i].z;
		let v2x = points2[i+1].x - points2[i].x;
		let v2y = points2[i+1].y - points2[i].y;
		let v2z = points2[i+1].z - points2[i].z;
		dist += v1x * v2x + v1y * v2y + v1z * v2z;
	}
	return dist;
}

module.exports = {
	Point,
	Recognizer
};