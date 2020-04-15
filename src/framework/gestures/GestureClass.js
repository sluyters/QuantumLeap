class GestureClass {

    constructor(name, index) {
        this.name = name;
        this.samples = [];
        this.index = index;
    }

    addSample(data){
        this.samples.push(data);
    }

    getSample(){
        return this.samples;
    }

}

module.exports = {
    GestureClass
};