const AbstractFilter = require('../../../framework/modules/filters/abstract-filter').AbstractFilter;
const MovingWindowFilter = require('./moving-window/moving-window').MovingWindowFilter;

class Filter extends AbstractFilter {
  constructor(framerate, options) {
    super(options);
    this.filters = {};
    this.windowSize = options.windowSize;
    this.type = options.type;
  }

  filter(frame) {
    frame.articulations.forEach(articulation => {
      let name = articulation.label;
      let coordinates = articulation.point.getCoordinates();
      if (!this.filters[name]) {
        // Initialize filters
        this.filters[name] = coordinates.map(() => new MovingWindowFilter(this.windowSize, this.type));
      }
      let filteredCoordinates = coordinates.map((coordinate, index) => this.filters[name][index].filter(coordinate));
      articulation.point.setCoordinates(filteredCoordinates);
    });
    return frame;
  }
}

module.exports = Filter;