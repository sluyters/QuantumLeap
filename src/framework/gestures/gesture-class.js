class GestureClass {

    constructor(name, index) {
        this.name = name;
        this.samples = [];
        this.index = index;
        this.TperG = 0;
    }

    addSample(sample) {
        this.samples.push(sample);
        this.TperG += 1;
    }

    getSamples() {
        return this.samples;
    }

}

module.exports = {
    GestureClass
};