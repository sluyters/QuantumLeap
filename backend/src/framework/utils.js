function parsePointsNames(selectedPoints) {
  let pointsNames = [];
  Object.keys(selectedPoints).forEach(sensorName => {
    let sensor_point = []
    sensor_point.push.apply(sensor_point, selectedPoints[sensorName].map(pointName => `${pointName}_${sensorName}`))
    pointsNames.push(sensor_point)
  });
  return pointsNames;
}

module.exports = {
  parsePointsNames
};