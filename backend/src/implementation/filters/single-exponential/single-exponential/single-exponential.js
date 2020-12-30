class SingleExponentialFilter {
  constructor(alpha) {
    this.alpha = alpha;
    this.lastFiltered = undefined;
  }

  filter(x) {
    if (this.lastFiltered === undefined) {
      this.lastFiltered = x;
    } else {
      this.lastFiltered = this.alpha * x + (1.0 - this.alpha) * this.lastFiltered;
    }
    return this.lastFiltered;
  }
}

module.exports = { SingleExponentialFilter };