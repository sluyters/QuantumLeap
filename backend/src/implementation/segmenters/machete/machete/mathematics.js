function boundingBox(trajectory) {
    let minPoint = trajectory[0].clone();
    let maxPoint = trajectory[0].clone();

    for (let i = 1; i < trajectory.length; i++) {
        minPoint.minimum(trajectory[i]);
        maxPoint.maximum(trajectory[i]);
    }

    return { minPoint, maxPoint }
}

// Helper function
function douglasPeuckerRDensity(points, splits, start, end, threshold) {
    // base case
    if (start + 1 > end) {
        return;
    }

    let AB = points[end].subtract(points[start]);
    let denom = AB.dot(AB);

    let largest = Number.NEGATIVE_INFINITY;
    let selected = -1;

    for (let i = start + 1; i < end; i++) {
        let AC = points[i].subtract(points[start]);
        let numer = AC.dot(AB);
        let d2 = AC.dot(AC) - numer * numer / denom;

        if (denom === 0.0) {
            d2 = AC.l2norm();
        }

        let v1 = points[i].subtract(points[start]);
        let v2 = points[end].subtract(points[i]);

        let l1 = v1.l2norm();
        let l2 = v2.l2norm();

        let dot = v1.dot(v2);
        // Protect against zero length vector
        dot = dot / ((l1 * l2 > 0) ? (l1 * l2) : 1.0);
        dot = Math.max(-1.0, Math.min(1.0, dot));
        let angle = Math.acos(dot);
        d2 = d2 * (angle / Math.PI);

        if (d2 > largest) {
            largest = d2;
            selected = i;
        }
    }

    if (selected === -1) {
        //Debug.Log("DouglasPeuckerR: nothing selected");
        //Debug.Log(String.Format("start {0}, end {1}", start, end));
        // something went wrong: FIXME how do I exit?
    }

    largest = Math.max(0.0, largest);
    largest = Math.sqrt(largest);

    if (largest < threshold) {
        return;
    }

    douglasPeuckerRDensity(points, splits, start, selected, threshold);

    douglasPeuckerRDensity(points, splits, selected, end, threshold);

    splits[selected][1] = largest;
}

// Renamed into douglasPeuckerDensityHelper
// Removed splits in argument (second argument)
function douglasPeuckerDensityHelper(points, minimumThreshold) {
    // Create split entry for each point
    let splits = [];

    for (let i = 0; i < points.length; i++) {
        splits.push([i, 0]);
    }

    // Modified tuples class in Dataset to make {set} not private
    splits[0][1] = Number.MAX_VALUE;
    splits[splits.length - 1][1] = Number.MAX_VALUE;

    // Recursively evaluate all splits
    douglasPeuckerRDensity(points, splits, 0, points.length - 1, minimumThreshold);

    // Sort in descending order by second value
    splits.sort((a, b) => b[1] - a[1]);

    //console.log(splits)

    // Added
    return splits;
}

// Removed output argument (second argument)
function douglasPeuckerDensity(trajectory, minimumThreshold) {
    let splits = douglasPeuckerDensityHelper(trajectory, minimumThreshold);
    let indicies = [];
    let output = [];

    let ret = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < splits.length; i++) {
        let idx = splits[i][0];
        let score = splits[i][1];

        if (score < minimumThreshold) { 
            continue; 
        }

        indicies.push(idx);
    }

    indicies.sort();

    for (let i = 0; i < indicies.length; i++) {
        output.push(trajectory[indicies[i]]);
    }

    // TODO clearer output
    return [ ret, output ];
}

function vectorize(trajectory, normalize) {
    let vectors = [];

    for (let i = 1; i < trajectory.length; i++) {
        let vec = trajectory[i].subtract(trajectory[i - 1]);

        if (normalize) {
            vec.normalize();
        }

        vectors.push(vec);
    }

    return vectors;
}

function pathLength(points) {
    let ret = 0;

    for (let i = 1; i < points.length; i++) {
        ret += points[i].l2norm(points[i - 1]);
    }

    return ret;
}

module.exports.Mathematics = {
    boundingBox,
    douglasPeuckerDensity,
    vectorize,
    pathLength
}