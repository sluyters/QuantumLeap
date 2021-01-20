// Modify react-create-app config to support calls to fs
// https://stackoverflow.com/questions/35681254/fs-existssync-is-not-a-function-node-js-electron-app
// https://github.com/wwlib/cra-craco-electron-example

let target = 'web';
if (process.env.REACT_APP_MODE === 'electron') {
  target = 'electron-renderer';
}
console.log(`craco.config.js: setting webpack target to: ${target}`);

module.exports = {
  webpack: {
      configure: {
          target: target
      }
  }
};