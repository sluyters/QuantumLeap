const assert = require('assert');
const Vector = require('../machete/vector').Vector;
const Mathematics = require('../machete/mathematics').Mathematics;

describe('Simple mathematics test', () => {
  it('boundingBox', () => {
    let v1 = new Vector([1, 2, 3]);
    let v2 = new Vector([10, 1, 3]);
    let { minPoint, maxPoint } = Mathematics.boundingBox([v1, v2]);
    console.log(minPoint, maxPoint)
    assert.strictEqual(minPoint.data[0], 1);
    assert.strictEqual(minPoint.data[1], 1);
    assert.strictEqual(minPoint.data[2], 3);
    assert.strictEqual(maxPoint.data[0], 10);
    assert.strictEqual(maxPoint.data[1], 2);
    assert.strictEqual(maxPoint.data[2], 3);
  });
});