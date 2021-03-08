const assert = require('assert');
const CircularBuffer = require('../machete/circular_buffer').CircularBuffer;

describe('Simple circular buffer test', () => {
  it('Count should return 0', () => {
    let buffer = new CircularBuffer();
    assert.strictEqual(buffer.size(), 0);
  });
  it('Count should return 0', () => {
    let buffer = new CircularBuffer();
    assert.strictEqual(buffer.count(), 0);
  });
  it('After resize, size should return 10', () => {
    let buffer = new CircularBuffer();
    buffer.resize(10);
    assert.strictEqual(buffer.size(), 10);
  });
  it('After inserting 3 elements, buffer count should be 2 (buffer is full after size - 1 items)', () => {
    let buffer = new CircularBuffer(3);
    buffer.insert(1);
    buffer.insert(2);
    buffer.insert(3);
    assert.strictEqual(buffer.count(), 2);
  });
  it('After inserting 3 elements, buffer head should be 1', () => {
    let buffer = new CircularBuffer(3);
    buffer.insert(1);
    buffer.insert(2);
    buffer.insert(3);
    assert.strictEqual(buffer.head, 1);
  });
  it('After inserting 3 elements, buffer tail should be 0', () => {
    let buffer = new CircularBuffer(3);
    buffer.insert(1);
    buffer.insert(2);
    buffer.insert(3);
    assert.strictEqual(buffer.tail, 0);
  });
  it('After inserting 4 elements, buffer tail should be 1', () => {
    let buffer = new CircularBuffer(3);
    buffer.insert(1);
    buffer.insert(2);
    buffer.insert(3);
    buffer.insert(4);
    assert.strictEqual(buffer.tail, 1);
  });
  it('After inserting 4 elements, buffer head should be 2', () => {
    let buffer = new CircularBuffer(3);
    buffer.insert(1);
    buffer.insert(2);
    buffer.insert(3);
    buffer.insert(4);
    assert.strictEqual(buffer.head, 2);
  });
  it('After inserting 4 elements, popped data should be 3', () => {
    let buffer = new CircularBuffer(3);
    buffer.insert(1);
    buffer.insert(2);
    buffer.insert(3);
    buffer.insert(4);
    assert.strictEqual(buffer.pop(), 3);
  });
  it('After inserting 4 elements, the buffer should be full', () => {
    let buffer = new CircularBuffer(3);
    buffer.insert(1);
    buffer.insert(2);
    buffer.insert(3);
    buffer.insert(4);
    assert.strictEqual(buffer.full(), true);
  });
  it('copy of the buffer', () => {
    let buffer = new CircularBuffer(3);
    buffer.insert(1);
    buffer.insert(2);
    buffer.insert(3);
    buffer.insert(4);
    assert.strictEqual(buffer.copy(0, 1)[0], 3);
    assert.strictEqual(buffer.copy(0, 1)[1], 4);
  });
});