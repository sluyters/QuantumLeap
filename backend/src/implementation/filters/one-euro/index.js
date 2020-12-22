const { Articulation } = require('../../../framework/frames/frame');

const AbstractFilter = require('../../../framework/modules/filters/abstract-filter').AbstractFilter;
const OneEuroFilter = require('./OneEuroFilter/OneEuroFilter').OneEuroFilter;

class Filter extends AbstractFilter {
  constructor(framerate, options) {
    super(options);
    this.filters = {};
    this.framerate = framerate;
    this.minCutoff = options.minCutoff;
    this.beta = options.beta;
  }

  filter(frame) {
    frame.articulations.forEach(articulation => {
      let name = articulation.label;
      let coordinates = articulation.point.getCoordinates();
      if (!this.filters[name]) {
        // Initialize filters
        this.filters[name] = coordinates.map(() => new OneEuroFilter(this.framerate, this.minCutoff, this.beta));
      }
      let filteredCoordinates = coordinates.map((coordinate, index) => this.filters[name][index].filter(coordinate));
      articulation.point.setCoordinates(filteredCoordinates);
    });
    return frame;
  }
}

module.exports = Filter;