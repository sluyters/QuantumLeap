class AbstractFilter {
  constructor(options) {
    // Empty
  }

  filter(frame) {
    throw new Error('You have to implement this function');
  }
}

module.exports = {
  AbstractFilter
}