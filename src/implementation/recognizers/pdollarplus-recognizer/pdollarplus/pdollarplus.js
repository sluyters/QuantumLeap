const {
	performance,
	PerformanceObserver
} = require('perf_hooks');
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
function $PP_Point(x, y, id, angle = 0.0)
{
	this.X = x;
	this.Y = y;
	this.ID = id;
	this.Angle = angle; // normalized turning angle, $P+
}
//
// $PP_PointCloud class: a point-cloud template
//
function $PP_PointCloud(name, points) // constructor
{
	this.Name = name;
	this.Points = $PP_Resample(points.slice(0, points.length), $PP_NumPoints);
	this.Points = $PP_Scale(this.Points.slice(0, this.Points.length));
	this.Points = $PP_TranslateTo(this.Points.slice(0, this.Points.length), $PP_Origin);
	this.Points = $PP_ComputeNormalizedTurningAngles(this.Points.slice(0, this.Points.length)); // $P+
}
//
// Result class
//
function $PP_Result(name, score, ms) // constructor
{
	this.Name = name;
	this.Score = score;
	this.Time = ms;
}
//
// PDollarPlusRecognizer constants
//
const $PP_NumPointClouds = 0;
const $PP_NumPoints = 8;
const $PP_Origin = new $PP_Point(0,0,0);
//
// PDollarPlusRecognizer class
//
function PDollarPlusRecognizer() // constructor
{
	this.$PP_PointClouds = new Array();
	//
	// The $P+ Point-Cloud Recognizer API begins here -- 3 methods: Recognize(), AddGesture(), DeleteUserGestures()
	//
	this.Recognize = function(points, nbrPoints)
	{
		let t0 = performance.now();
		this.$PP_NumPoints = nbrPoints;
		var candidate = new $PP_PointCloud("", points);

		var u = -1;
		var b = +Infinity;
		for (var i = 0; i < this.$PP_PointClouds.length; i++) // for each point-cloud template
		{
			var d = Math.min(
				$PP_CloudDistance(candidate.Points, this.$PP_PointClouds[i].Points, b),
				$PP_CloudDistance(this.$PP_PointClouds[i].Points, candidate.Points, b)
				); // $P+
			if (d < b) {
				b = d; // best (least) distance
				u = i; // point-cloud index
			}
		}
		let t1 = performance.now();
		return (u == -1) ? new $PP_Result("No match.", 0.0, t1-t0) : new $PP_Result(this.$PP_PointClouds[u].Name, b > 1.0 ? 1.0 / b : 1.0, t1-t0);
	}
	this.AddGesture = function(name, points, nbrPoints)
	{
		this.$PP_NumPoints = nbrPoints;
		this.$PP_PointClouds[this.$PP_PointClouds.length] = new $PP_PointCloud(name, points);
		var num = 0;
		for (var i = 0; i < this.$PP_PointClouds.length; i++) {
			if (this.$PP_PointClouds[i].Name == name)
				num++;
		}
		return num;
	}
	this.RemoveGesture = function(name) 
	{
		this.$PP_PointClouds = this.$PP_PointClouds.filter(pointCloud => pointCloud.Name !== name);
	}
	this.DeleteUserGestures = function()
	{
		this.$PP_PointClouds.length = 0; // clears any beyond the original set
		return 0;
	}
}
//
// Private helper functions from here on down
//
function $PP_CloudDistance(pts1, pts2, minSoFar) // revised for $P+
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
			var d = $PP_DistanceWithAngle(pts1[i], pts2[j]);
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
				var d = $PP_DistanceWithAngle(pts1[i], pts2[j]);
				if (d < min)
					min = d;
			}
			sum += min;
			if (sum >= minSoFar) return sum; // early abandoning
		}
	}
	return sum;
}
function $PP_Resample(points, n)
{
	var I = $PP_PathLength(points) / (n - 1); // interval length
	var D = 0.0;
	var newpoints = new Array(points[0]);
	for (var i = 1; i < points.length; i++)
	{
		if (points[i].ID == points[i-1].ID)
		{
			var d = $PP_Distance(points[i-1], points[i]);
			if ((D + d) >= I)
			{
				var qx = points[i-1].X + ((I - D) / d) * (points[i].X - points[i-1].X);
				var qy = points[i-1].Y + ((I - D) / d) * (points[i].Y - points[i-1].Y);
				var q = new $PP_Point(qx, qy, points[i].ID);
				newpoints[newpoints.length] = q; // append new point 'q'
				points.splice(i, 0, q); // insert 'q' at position i in points s.t. 'q' will be the next i
				D = 0.0;
			}
			else D += d;
		}
	}
	if (newpoints.length == n - 1) // sometimes we fall a rounding-error short of adding the last point, so add it if so
		newpoints[newpoints.length] = new $PP_Point(points[points.length - 1].X, points[points.length - 1].Y, points[points.length - 1].ID);
	return newpoints;
}
function $PP_Scale(points)
{
	var minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity;
	for (var i = 0; i < points.length; i++) {
		minX = Math.min(minX, points[i].X);
		minY = Math.min(minY, points[i].Y);
		maxX = Math.max(maxX, points[i].X);
		maxY = Math.max(maxY, points[i].Y);
	}
	var size = Math.max(maxX - minX, maxY - minY);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = (points[i].X - minX) / size;
		var qy = (points[i].Y - minY) / size;
		newpoints[newpoints.length] = new $PP_Point(qx, qy, points[i].ID);
	}
	return newpoints;
}
function $PP_TranslateTo(points, pt) // translates points' centroid
{
	var c = $PP_Centroid(points);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = points[i].X + pt.X - c.X;
		var qy = points[i].Y + pt.Y - c.Y;
		newpoints[newpoints.length] = new $PP_Point(qx, qy, points[i].ID);
	}
	return newpoints;
}
function $PP_ComputeNormalizedTurningAngles(points) // $P+
{
	var newpoints = new Array();
	newpoints[0] = new $PP_Point(points[0].X, points[0].Y, points[0].ID); // first point
	for (var i = 1; i < points.length - 1; i++)
	{
		var dx = (points[i+1].X - points[i].X) * (points[i].X - points[i-1].X);
		var dy = (points[i+1].Y - points[i].Y) * (points[i].Y - points[i-1].Y);
		var dn = $PP_Distance(points[i+1], points[i]) * $PP_Distance(points[i], points[i-1]);
		var cosangle = Math.max(-1.0, Math.min(1.0, (dx + dy) / dn)); // ensure [-1,+1]
		var angle = Math.acos(cosangle) / Math.PI; // normalized angle
		newpoints[newpoints.length] = new $PP_Point(points[i].X, points[i].Y, points[i].ID, angle);
	}
	newpoints[newpoints.length] = new $PP_Point( // last point
		points[points.length - 1].X,
		points[points.length - 1].Y,
		points[points.length - 1].ID);
	return newpoints;
}
function $PP_Centroid(points)
{
	var x = 0.0, y = 0.0;
	for (var i = 0; i < points.length; i++) {
		x += points[i].X;
		y += points[i].Y;
	}
	x /= points.length;
	y /= points.length;
	return new $PP_Point(x, y, 0);
}
function $PP_PathLength(points) // length traversed by a point path
{
	var d = 0.0;
	for (var i = 1; i < points.length; i++) {
		if (points[i].ID == points[i-1].ID)
			d += $PP_Distance(points[i-1], points[i]);
	}
	return d;
}
function $PP_DistanceWithAngle(p1, p2) // $P+
{
	var dx = p2.X - p1.X;
	var dy = p2.Y - p1.Y;
	var da = p2.Angle - p1.Angle;
	return Math.sqrt(dx * dx + dy * dy + da * da);
}
function $PP_Distance(p1, p2) // Euclidean distance between two points
{
	var dx = p2.X - p1.X;
	var dy = p2.Y - p1.Y;
	return Math.sqrt(dx * dx + dy * dy);
}

module.exports = {
	$PP_Point,
	PDollarPlusRecognizer
};