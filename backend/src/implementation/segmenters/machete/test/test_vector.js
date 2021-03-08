const assert = require('assert');
const Vector = require('../machete/vector').Vector;

describe('Simple vector test', () => {
  it('Constructor only size', () => {
    let v = new Vector(10);
    assert.strictEqual(v.size(), 10);
  });
  it('Constructor list', () => {
    let v = new Vector([1, 2, 3]);
    assert.strictEqual(v.size(), 3);
  });
  it('negative', () => {
    let v = new Vector([1, 2, 3]);
    let v2 = v.negative();
    assert.strictEqual(v2.data[0], -1);
    assert.strictEqual(v2.data[1], -2);
    assert.strictEqual(v2.data[2], -3);
  });
  it('add', () => {
    let v = new Vector([1, 2, 3]);
    let v2 = new Vector([3, 2, 1]);
    let v3 = v.add(v2);
    assert.strictEqual(v3.data[0], 4);
    assert.strictEqual(v3.data[1], 4);
    assert.strictEqual(v3.data[2], 4);
  })
  it('subtract', () => {
    let v = new Vector([1, 2, 3]);
    let v2 = new Vector([3, 2, 1]);
    let v3 = v.subtract(v2);
    assert.strictEqual(v3.data[0], -2);
    assert.strictEqual(v3.data[1], 0);
    assert.strictEqual(v3.data[2], 2);
  })
  it('normalize', () => {
    let v = new Vector([1, 1, 1, 1]);
    v.normalize();
    console.log(v)
    assert.strictEqual(v.data[0], 0.5);
    assert.strictEqual(v.data[1], 0.5);
    assert.strictEqual(v.data[2], 0.5);
    assert.strictEqual(v.data[3], 0.5);
  })
});