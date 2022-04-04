class CircularBuffer {
    constructor(size = 0) {
        this.head = 0;
        this.tail = 0;
        this._size = size;
        if (size > 0) {
            this.data = new Array(size);
        } else {
            this.data = undefined;
        }
    }

    size() {
        return this._size;
    }

    count() {
        let ret = this.tail - this.head;

        if (ret < 0) {
            ret += this._size;
        }

        return ret;
    }

    resize(size) {
        this.head = 0;
        this.tail = 0;
        this._size = size;
        this.data = new Array(size);
    }

    insert(item) {
        // Insert
        this.data[this.tail] = item;

        // Increment tail
        this.tail = (this.tail + 1) % this._size;

        // Push out old data
        if (this.tail == this.head) {
            this.head = (this.head + 1) % this._size;
        }
    }

    /**
     * Remove and return element at the end
     */
    pop() {
        let ret = this.data[this.head];
        this.head = (this.head + 1) % this._size;
        return ret;
    }

    /**
     * Reset indices to zero, 
     * which effectively clears the buffer.
     */
    clear() {
        this.head = 0;
        this.tail = 0;
    }

    /** 
     * Return true uf the buffer is empty,
     * and false otherwise.
     */
    empty() {
        return (this.head == this.tail);
    }

    /**
     * Return true if the buffer is full,
     * and false otherwise.
     */
    full() {
        return (this.head == ((this.tail + 1) % this._size));
    }

    getValue(idx) {
        if (idx < 0) {
            idx = this.tail + idx;

            if (idx < 0) {
                idx += this._size;
            }
        } else {
            idx += this.head;
        }

        idx = idx % this._size;

        return this.data[idx];
    }

    setValue(idx, value) {
        if (idx < 0) {
            idx = this.tail + idx;

            if (idx < 0) {
                idx += this._size;
            }
        } else {
            idx += this.head;
        }

        idx = idx % this._size;

        this.data[idx] = value;
    }

    copy(start, end) {
        // Could be optimized
        let ret = [];

        for (let idx = start; idx <= end; idx++) {
            ret.push(this.getValue(idx));
        }

        return ret;
    }
}

module.exports = {
    CircularBuffer
};