const AbstractFilter = require('../../../framework/modules/filters/abstract-filter').AbstractFilter;
const SingleExponentialFilter = require('./single-exponential/single-exponential').SingleExponentialFilter;

class Filter extends AbstractFilter {
  constructor(framerate, options) {
    super(options);
    this.filters = {};
    this.alpha = options.alpha;
  }

  filter(frame) {
    frame.articulations.forEach(articulation => {
      let name = articulation.label;
      let coordinates = articulation.point.getCoordinates();
      if (!this.filters[name]) {
        // Initialize filters
        this.filters[name] = coordinates.map(() => new SingleExponentialFilter(this.alpha));
      }
      let filteredCoordinates = coordinates.map((coordinate, index) => this.filters[name][index].filter(coordinate));
      articulation.point.setCoordinates(filteredCoordinates);
    });
    return frame;
  }
}

module.exports = Filter;