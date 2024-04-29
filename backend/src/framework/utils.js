function parsePointsNames(selectedPoints) {
  let pointsNames = [];
  Object.keys(selectedPoints).forEach(sensorName => {
    pointsNames.push.apply(pointsNames, selectedPoints[sensorName].map(pointName => `${pointName}_${sensorName}`))
  });
  return pointsNames;
}

/**
 * Return a random number between min and max.
 */
function getRandomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

/**
 * Shuffle an array in place with Durstenfeld's shuffle algorithm (https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm)
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements i and j
  }
}

/**
 * 
 * @param {array} array 
 * @param {integer} n : the number of subarrays
 * @param {boolean} balanced : if true, attemps to balance all sub-arrays. If false, all but the last sub-array will have the same number of elements.
 */
function splitArray(array, n, balanced) {
  if (n < 2) {
    return array;
  }
  length = array.length;
  splits = [];
  i = 0;
  if (length % n === 0) {
    let size = Math.floor(length / n);
    while (i < length) {
      splits.push(array.slice(i, i += size));
    }
  } else if (balanced) {
    while (i < length) {
      let size = Math.ceil((length - i) / n);
      splits.push(array.slice(i, i += size));
      n--;
    }
  } else {
    n --;
    let size = Math.floor(length / n);
    if (length % size === 0)
      size--;
    while (i < size * n) {
      splits.push(array.slice(i, i += size));
    }
    splits.push(array.slice(size * n));
  }
  return splits;
}

module.exports = {
  parsePointsNames,
  getRandomNumber,
  shuffleArray,
  splitArray,
};