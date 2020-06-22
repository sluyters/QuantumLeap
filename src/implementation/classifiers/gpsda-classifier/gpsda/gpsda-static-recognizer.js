
class Recognizer {
    static name = "GPSDAlphaRecognizer";

    constructor(alpha = 1) {
        this.alpha = alpha;
        this.numPoints = 6;
        this.templates = [];
    }

    recognize(points) {
        if (points.length != this.numPoints) {
            return { success: false, name: 'No match', time: 0.0 };
        }
        var t0 = Date.now();
        var candidate = new CPS("", points, this.alpha);
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
        return (bestTemplate === null) ? { success: false, name: 'No match', time: t1-t0 } : { success: true, name: bestTemplate.name, time: t1-t0 };
    }

    addGesture(name, points) {
        if (points.length != this.numPoints) {
            return false;
        }
        this.templates.push(new CPS(name, points, this.alpha));
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
    constructor(name, points, alpha) {
        this.name = name;
        this.cps = computeCPS(points, alpha);
        //console.log(this.cps)
    }
}

/**
 * TODO generalize to any dimension
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
function computeCPS(points, alpha) {
    let barycentre = getBarycentre(points);
    let avgDistance = getAvgAlphaDistance(barycentre, points, alpha);
    let cps = [];
    for (var i = 0; i < points.length - 1; i++) {
        for (var j = i + 1; j < points.length; j++) {
            let alphaDistance = Math.pow(getDistance(points[i], points[j]), alpha);
            cps.push(alphaDistance / avgDistance);
        }
    }
    cps.sort();
    return cps;
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
function getAvgAlphaDistance(refPoint, points, alpha) {
    var d = 0.0;
    for (const point of points) {
        d += Math.pow(getDistance(point, refPoint), alpha);
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

// let rec = new Recognizer();
// let points1 = [new Point(-50, -50, 0), new Point(50, -50, 0), new Point(50, 50, 0), new Point(-50, 50, 0)];
// let points2 = [new Point(-50, -50, 0), new Point(50, -50, 0), new Point(0, 0, 0), new Point(-50, 50, 0)];
// let points3 = [new Point(-20, -20, 0), new Point(20, -20, 0), new Point(0, 0, 0), new Point(-18, 18, 0)];
// let points4 = [new Point(-50, 0, 0), new Point(50, 0, 0), new Point(0, 50, 0), new Point(0, -50, 0)];
// rec.addGesture("square", points1);
// rec.addGesture("triangle", points2);
// console.log(rec.recognize(points1));
// console.log(rec.recognize(points2));
// console.log(rec.recognize(points3));
// console.log(rec.recognize(points4));


