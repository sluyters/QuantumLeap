class GestureClass {

    constructor(name) {
        this.name = name;
        this.samples = [];
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