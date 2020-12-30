class DoubleExponentialFilter {
  constructor(alpha) {
    this.alpha = alpha;
    this.lastFiltered1 = undefined;
    this.lastFiltered2 = undefined;
  }

  filter(x) {
    if (this.lastFiltered1 === undefined) {
      this.lastFiltered1 = x;
    } else {
      this.lastFiltered1 = this.alpha * x + (1.0 - this.alpha) * this.lastFiltered1;
    }
    if (this.lastFiltered2 === undefined) {
      this.lastFiltered2 = this.lastFiltered1;
    } else {
      this.lastFiltered2 = this.alpha * this.lastFiltered1 + (1.0 - this.alpha) * this.lastFiltered2;
    }
    return 2 * this.lastFiltered1 - this.lastFiltered2;
  }
}

module.exports = { DoubleExponentialFilter };