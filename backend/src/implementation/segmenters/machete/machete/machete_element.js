class MacheteElement {
  constructor(column, startAngleDegrees) {
    this.score = 0.0;
    this.startFrameNo = 0;
    this.endFrameNo = 0;
    this.column = 0.0;
    this.runningScore = 0.0
    this.total = 0.0

    if (
      (typeof column !== 'undefined' && column !== null) && 
      (typeof startAngleDegrees !== 'undefined' && startAngleDegrees !== null)
    ) {
      this.column = column;
      this.runningScore = Number.POSITIVE_INFINITY;
      this.total = Number.EPSILON;

      if (column === 0) {
          let angle = startAngleDegrees * Math.PI / 180.0;
          let threshold = 1.0 - Math.cos(angle);
          this.score = threshold * threshold;

          this.runningScore = 0.0;
          this.total = 0.0;
      }
    }
    //console.log(this.column, this.score, this.runningScore, this.total)
  }

  getNormalizedWarpingPathCost() {
    if (this.column === 0) {
      return this.score;
    }
    return this.runningScore / this.total;
  }

  update(extendThis, frameNo, cost, length) {
    this.startFrameNo = extendThis.startFrameNo;
    this.endFrameNo = frameNo;
    cost *= length;

    this.runningScore = extendThis.runningScore + cost;
    this.total = extendThis.total + length;
  }
}

module.exports = {
  MacheteElement
};