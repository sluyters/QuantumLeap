class Vector {
    constructor(arrayOrVectorOrSize, vectorOrconst, t) {
        /**
         * Initialize an m-component vector, setting each
         * component to a constant value.
         */
        if (arrayOrVectorOrSize > 0 && (Number.isInteger(vectorOrconst) || vectorOrconst === Number.POSITIVE_INFINITY || vectorOrconst === Number.NEGATIVE_INFINITY)) {
            this.data = new Array(arrayOrVectorOrSize)
            for (var i = 0; i < arrayOrVectorOrSize; i++) {
                this.data[i] = vectorOrconst;
            }
        }
        /**
         * Create an unitialized m-component vector.
         */
        else if (Number.isInteger(arrayOrVectorOrSize)) {
            this.data = new Array(arrayOrVectorOrSize)
            for (var i = 0; i < arrayOrVectorOrSize; i++) {
                this.data[i] = 0;
            }
        }
        /**
         * Initialize a new vector as a sum of two vectors.
         */
        else if (arrayOrVectorOrSize instanceof Vector && vectorOrconst instanceof Vector) {
            let m = arrayOrVectorOrSize.size();
    
            if (arrayOrVectorOrSize.size() != vectorOrconst.size()) {
                throw new Error("The size of the two vectors must be equal");
            }
    
            this.data = new Array(m);
    
            for (let i = 0; i < m; i++) {
                let d = (1.0 - t) * a.data[i];
                d += t * b.data[i];
                this.data[i] = d;
            }
        }
        /**
         * Initialize a new vector from an existing data array.
         */
        else if (arrayOrVectorOrSize instanceof Array) {
            this.data = new Array(arrayOrVectorOrSize.length);
            for (var i = 0; i < arrayOrVectorOrSize.length; i++) {
                this.data[i] = arrayOrVectorOrSize[i];
            }
        }
    }

    size() {
        return this.data.length;
    }

    getData() {
        return this.data;
    }

    setData(data) {
        this.data = data;
    }

    set(rhs) {
        for (let i = 0; i < this.data.length; i++) {
            this.data[i] = rhs;
        }
    }

    elementAt(idx) {
        return this.data[idx];
    }
    
    negative() {
        var m = this.data.length;
        var vec = new Vector(m);
    
        for (var i = 0; i < m; i++) {
            vec.data[i] = -this.data[i];
        }
    
        return vec;
    }

    multiply(rhs) {
        if (rhs instanceof Vector) {
            var m = this.data.length;
            var vec = new Vector(m);
    
            for (var i = 0; i < m; i++) {
                vec.data[i] = this.data[i] * rhs.data[i];
            }
    
            return vec;
        } else {
            var m = this.data.length;
            var vec = new Vector(m);
    
            for (var i = 0; i < m; i++) {
                vec.data[i] = this.data[i] * rhs;
            }
    
            return vec;
        }
    }
    
    divide(rhs) {
        if (rhs instanceof Vector) {
            var m = this.data.length;
            var vec = new Vector(m);
    
            for (var i = 0; i < m; i++) {
                vec.data[i] = this.data[i] / rhs.data[i];
            }
    
            return vec;
        } else {
            var m = this.data.length;
            var vec = new Vector(m);
    
            for (var i = 0; i < m; i++) {
                vec.data[i] = this.data[i] / rhs;
            }
    
            return vec;
        }
    }

    add(rhs) {
        var m = this.data.length;
        var vec = new Vector(m);
    
        for (var i = 0; i < m; i++) {
            vec.data[i] = this.data[i] + rhs.data[i];
        }
    
        return vec;
    }
    
    subtract(rhs) {
        var m = this.data.length;
        var vec = new Vector(m);
    
        for (var i = 0; i < m; i++) {
            vec.data[i] = this.data[i] - rhs.data[i];
        }
    
        return vec;
    }
    
    equals(rhs) {
        var m = this.data.length;
        var ret = 1;
    
        for (var i = 0; i < m; i++) {
            if (this.data[i] !== rhs.data[i]) {
                return false;
            }
        }
    
        return true;
    }

    l2norm2(other) {
        var ret = 0;
    
        for (var i = 0; i < this.data.length; i++) {
            var delta = this.data[i] - other.data[i];
            ret += delta * delta;
        }
    
        return ret;
    }
    
    l2norm(other) {
        if (typeof other !== 'undefined' && other !== null ) {
            return Math.sqrt(this.l2norm2(other));
        } else {
            let ret = 0.0;

            for (let i = 0; i < this.data.length; i++) {
                ret += this.data[i] * this.data[i];
            }

            return Math.sqrt(ret); 
        }
    }

    length() {
        return this.data.length;
    }

    normalize() {
        let length = this.data.length;

        for (let i = 0; i < this.data.length; i++) {
            this.data[i] = this.data[i] / length;
        }

        return this;
    }

    dot(rhs) {
        let ret = 0;

        for (let i = 0; i < this.data.length; i++) {
            ret += this.data[i] * rhs.data[i];
        }

        return ret;
    }

    sum() {
        let ret = 0;

        for (let i = 0; i < this.data.length; i++) {
            ret += this.data[i];
        }

        return ret;
    }

    cumulativeSum() {
        let sum = 0;

        for (let i = 0; i < this.data.length; i++) {
            sum += this.data[i];
            this.data[i] = sum;
        }
    }

    clone() {
        return new Vector(this.data);
    }

    isZero() {
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i] != 0.0) {
                return false;
            }
        }

        return true;
    }

    /**
     * Store component-wise minimum of the two
     */
    minimum(other) {
        for (let i = 0; i < this.data.length; i++) {
            if (other.data[i] < this.data[i]) {
                this.data[i] = other.data[i];
            }
        }
    }

    /**
     * Store component-wise maximum of the two
     */
    maximum(other) {
        for (let i = 0; i < this.data.length; i++) {
            if (other.data[i] > this.data[i]) {
                this.data[i] = other.data[i];
            }
        }
    }
}

module.exports = {
    Vector
}