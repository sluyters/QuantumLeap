class Recognizer {

    static name = "Recognizer";

    constructor(name) {
        this.name = name;
    }

    addGesture(){
        throw new Error('You must implement this function');
    }

    recognize(){
        throw new Error('You must implement this function');
    }

}

module.exports = {
    Recognizer
};