const AbstractFilter = require('../../../framework/filters/abstract-filter').AbstractFilter;
const OneEuroFilter = require('./OneEuroFilter/OneEuroFilter').OneEuroFilter;

class Filter extends AbstractFilter {
  constructor(options) {
    super(options);
  }

  filter(frame) {
    // TODO
    return frame;
  }
}

module.exports = Filter;