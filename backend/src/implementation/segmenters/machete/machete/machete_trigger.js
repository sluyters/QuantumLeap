class MacheteTrigger {
  constructor() {
    this.check = false;
    this.reset();
  }

  reset() {
    this.start = -1;
    this.end = -1;
    this.s1 = Number.POSITIVE_INFINITY;
    this.s2 = Number.POSITIVE_INFINITY;
    this.s3 = Number.POSITIVE_INFINITY;
    this.minimum = false;
    this.sum = 0.0;
    this.count = 0.0;
  }

  getThreshold() {
    let mu = this.sum / this.count;
    let threshold = mu / 2.0;
    return threshold;
  }

  update(score, cf, start, end) {
    this.sum += score;
    this.count += 1.0;
    score *= cf;

    this.s1 = this.s2;
    this.s2 = this.s3;
    this.s3 = score;

    let threshold = this.getThreshold();

    this.check = false;

    if (this.s3 < this.s2) {
        this.start = start;
        this.end = end;
        return;
    }
    if (this.s2 > threshold) {
      return;
    }
    if (this.s1 < this.s2) {
      return;
    }
    if (this.s3 < this.s2) {
      return;
    }

    this.check = true;
  }
}

module.exports = {
  MacheteTrigger
};