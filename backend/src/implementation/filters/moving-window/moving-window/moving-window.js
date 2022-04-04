class MovingWindowFilter {
  constructor(windowSize, type) {
    this.windowSize = windowSize;
    this.filterFn;
    switch (type) {
      case 'average':
        this.filterFn = average;
        break;
      case 'median':
        this.filterFn = median;
        break;
      default:
        this.filterFn = average;
    }
    this.window = [];
  }

  filter(x) {
    if(this.window.length < this.windowSize) {
      this.window.push(x);
    } else {
      this.window.shift();
      this.window.push(x);
    }
    return this.filterFn(this.window);
  }
}

function average(x) {
  var sum = 0;
  for (var i=0; i < x.length; ++i) {
    sum += x[i];
  }
  return sum / x.length;
}

function median(x) {
  x2 = x.slice().sort((a, b) => a - b );
  var half = Math.floor(x2.length / 2);
  if (x2.length % 2) {
    return x2[half];
  }
  return (x2[half - 1] + x2[half]) / 2;
}

module.exports = { MovingWindowFilter };