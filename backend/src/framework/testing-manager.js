const { getKFCVTestingScenarios } = require("./testings/kfcv-testing");
const { getLOOCVTestingScenarios } = require("./testings/loocv-testing");
const { getTTSTestingScenarios } = require("./testings/tts-testing");

function getTestingScenarios(recognizerType, globalSettings) {
  let testingScenarios = [];
  globalSettings.general.testingParams.types.forEach(testingSettings => {
    switch (testingSettings.paramName) {
      case 'tts':
        testingScenarios.push(...getTTSTestingScenarios(recognizerType, testingSettings, globalSettings));
        break;
      case 'loocv':
        testingScenarios.push(...getLOOCVTestingScenarios(recognizerType, testingSettings, globalSettings));
        break;
      case 'kfcv':
        testingScenarios.push(...getKFCVTestingScenarios(recognizerType, testingSettings, globalSettings));
        break;
      default:
        throw new Error(`Unknown testing type: ${testingSettings.paramName}.`);
    }
  });
  return testingScenarios;
}

module.exports = {
  getTestingScenarios,
}







