function parsePointsNames(selectedPoints) {
  let pointsNames = [];
  Object.keys(selectedPoints).forEach(sensorName => {
    pointsNames.push.apply(pointsNames, selectedPoints[sensorName].map(pointName => `${pointName}_${sensorName}`))
  });
  return pointsNames;
}

module.exports = {
  parsePointsNames
};