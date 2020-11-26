class Frame {
  constructor(timestamp) {
    this.timestamp = timestamp;
    this.hasData = false;
    this.articulations = [];
  }

  addArticulation(articulation) {
    this.articulations.push(articulation);
  }

  getArticulation(name) {
    for (const articulation of this.articulations) {
      if (articulation.label === name) {
        return articulation;
      }
    }
    return null;
  }
}

class Articulation {
  constructor(label, point) {
    this.label = label;
    this.point = point;
  }
}

module.exports = {
  Frame,
  Articulation
}