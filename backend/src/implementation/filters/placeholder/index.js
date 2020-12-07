const AbstractFilter = require('../../../framework/filters/abstract-filter').AbstractFilter;

class Filter extends AbstractFilter {
  constructor(options) {
    super(options);
  }

  filter(frame) {
    return frame;
  }
}
module.exports = Filter;