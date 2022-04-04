
/**
 * 
 * @param {string} level "error" | "warn" | "info" | debug
 */
function log(level, text) {
  let date = new Date().toISOString();
  switch(level) {
    case "error":
      console.error(`${date} \x1b[41mERROR\x1b[0m ${text}`);
      break;
    case "warn":
      console.error(`${date} \x1b[43mWARN\x1b[0m ${text}`);
      break;
    case "info":
      console.log(`${date} \x1b[44mINFO\x1b[0m ${text}`);
      break;
    case "debug": 
      console.log((`${date} \x1b[46mDEBUG\x1b[0m ${text}`))
  }
}

module.exports = { log };