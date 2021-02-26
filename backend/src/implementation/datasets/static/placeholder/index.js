const GestureSet = require('../../../../framework/gestures/gesture-set').GestureSet;

function loadDataset(name, datasetPath, identifier, sensorPointsNames) {
    return new GestureSet(name);
}

module.exports = {
    loadDataset
};