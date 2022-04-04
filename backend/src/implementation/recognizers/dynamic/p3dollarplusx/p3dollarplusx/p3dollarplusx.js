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

const { performance } = require('perf_hooks');

//
// Point class
//
function Point(x, y, z, id, angle = 0.0)
{
	this.X = x;
    this.Y = y;
    this.Z = z;
	this.ID = id;
	this.Angle = angle; // normalized turning angle, $P+
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
// Result class
//
function Result(name, score, ms) // constructor
{
	this.Name = name;
	this.Score = score;
	this.Time = ms;
}
//
// P3DollarPlusXRecognizer constants
//
var NumPoints = 32;
const Origin = new Point(0,0,0,0);
//
// P3DollarPlusXRecognizer class
//
function P3DollarPlusXRecognizer(numPoints) // constructor
{
	this.PointClouds = new Array();
	this.Conflicts = {};
	NumPoints = numPoints;
	//
	// The $P+ Point-Cloud Recognizer API begins here -- 4 methods: Recognize(), AddGesture(), RemoveGesture(), DeleteUserGestures()
	//
	this.Recognize = function(points)
	{
		var t0 = performance.now();
		var candidate = new PointCloud("", points);
		var {u, b} = this.RecognizeHelper(candidate);
		if (u != -1 && this.Conflicts.hasOwnProperty(this.PointClouds[u].Name)) {
			let dirDist1 = DirDist(candidate.Points, this.PointClouds[u].Points);
			let dirDist2 = DirDist(candidate.Points, this.PointClouds[this.Conflicts[this.PointClouds[u].Name].Index].Points);
			u = dirDist1 > dirDist2 ? u : this.Conflicts[this.PointClouds[u].Name].Index;
		}
		var t1 = performance.now();
		return (u == -1) ? new Result("No match.", 0.0, t1-t0) : new Result(this.PointClouds[u].Name, b > 1.0 ? 1.0 / b : 1.0, t1-t0);
	}
	this.AddGesture = function(name, points)
	{
		var template = new PointCloud(name, points);
		if (this.PointClouds.length > 0) {
			const {u, b} = this.RecognizeHelper(template);
			if (u != -1 && this.PointClouds[u].Name != name && (1.0 / b) > 0.8) {
				this.Conflicts[name] = {'Name': this.PointClouds[u].Name, 'Index': u};
				this.Conflicts[this.PointClouds[u].Name] =  {'Name': name, 'Index': this.PointClouds.length};
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
    this.RemoveGesture = function(name) 
    {
		this.PointClouds = this.PointClouds.filter(pointCloud => pointCloud.Name !== name);
		// Remove entry in Conflicts
		if (this.Conflicts.hasOwnProperty(name)) {
			let otherGestureName = this.Conflicts[name].Name;
			delete this.Conflicts[name];
			delete this.Conflicts[otherGestureName];
		}
	}
	this.DeleteUserGestures = function()
	{
		this.PointClouds.length = NumPointClouds; // clears any beyond the original set
		return NumPointClouds;
	}
	this.RecognizeHelper = function(pointCloud) 
	{
		var u = -1;
		var b = +Infinity;
		for (var i = 0; i < this.PointClouds.length; i++) // for each point-cloud template
		{
			var d = Math.min(
				CloudDistance(pointCloud.Points, this.PointClouds[i].Points, b),
				CloudDistance(this.PointClouds[i].Points, pointCloud.Points, b)
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
	for (var i = 1; i < points.length && newpoints.length <= n; i++)
	{
		if (points[i].ID == points[i-1].ID)
		{
			var d = Distance(points[i-1], points[i]);
			if ((D + d) >= I)
			{
				var qx = points[i-1].X + ((I - D) / d) * (points[i].X - points[i-1].X);
				var qy = points[i-1].Y + ((I - D) / d) * (points[i].Y - points[i-1].Y);
                var qz = points[i-1].Z + ((I - D) / d) * (points[i].Z - points[i-1].Z);
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
function Scale(points)
{
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
function TranslateTo(points, pt) // translates points' centroid
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
function ComputeNormalizedTurningAngles(points) // $P+
{
	var newpoints = new Array();
	newpoints[0] = new Point(points[0].X, points[0].Y, points[0].Z, points[0].ID); // first point
	for (var i = 1; i < points.length - 1; i++)
	{
		var dx = (points[i+1].X - points[i].X) * (points[i].X - points[i-1].X);
        var dy = (points[i+1].Y - points[i].Y) * (points[i].Y - points[i-1].Y);
        var dz = (points[i+1].Z - points[i].Z) * (points[i].Z - points[i-1].Z);
		var dn = Distance(points[i+1], points[i]) * Distance(points[i], points[i-1]);
		var cosangle = Math.max(-1.0, Math.min(1.0, (dx + dy + dz) / dn)); // ensure [-1,+1]
		var angle = Math.acos(cosangle) / Math.PI; // normalized angle
		newpoints[newpoints.length] = new Point(points[i].X, points[i].Y, points[i].Z, points[i].ID, angle);
	}
	newpoints[newpoints.length] = new Point( // last point
		points[points.length - 1].X,
        points[points.length - 1].Y,
        points[points.length - 1].Z,
		points[points.length - 1].ID);
	return newpoints;
}
function Centroid(points)
{
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
		if (points[i].ID == points[i-1].ID)
			d += Distance(points[i-1], points[i]);
	}
	return d;
}
function DistanceWithAngle(p1, p2) // $P+
{
	var dx = p2.X - p1.X;
    var dy = p2.Y - p1.Y;
    var dz = p2.Z - p1.Z;
	var da = p2.Angle - p1.Angle;
	return Math.sqrt(dx * dx + dy * dy + dz * dz + da * da);
}
function Distance(p1, p2) // Euclidean distance between two points
{
	var dx = p2.X - p1.X;
	var dy = p2.Y - p1.Y;
	var dz = p2.Z - p1.Z;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
function DirDist(points1, points2) 
{
	const padding = 2;
	let dist = 0;
	for (var i = padding; i < NumPoints - (1 + padding); i+=1) {
		let v1x = points1[i+1].X - points1[i].X;
		let v1y = points1[i+1].Y - points1[i].Y;
		let v1z = points1[i+1].Z - points1[i].Z;
		let v2x = points2[i+1].X - points2[i].X;
		let v2y = points2[i+1].Y - points2[i].Y;
		let v2z = points2[i+1].Z - points2[i].Z;
		dist += v1x * v2x + v1y * v2y + v1z * v2z;
	}
	return dist;
}

module.exports = {
	Point,
	P3DollarPlusXRecognizer
};