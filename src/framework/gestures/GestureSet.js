class GestureSet {

    constructor(name) {
        this.name = name;
        this.gestures = new Map();
    }

    addGestureClass(gestureClass){
        this.gestures.set(gestureClass.name,gestureClass);
    }

    getGestureClass(){
        return this.gestures;
    }

}

module.exports = {
    GestureSet
};