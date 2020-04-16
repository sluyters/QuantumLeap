class GestureSet {

    constructor(name) {
        this.name = name;
        this.gestures = new Map();
        this.G = 0;
        this.TperG = Infinity; //Templates per Gesture Class
    }

    addGestureClass(gestureClass){
        this.gestures.set(gestureClass.name,gestureClass);
        this.G +=1;
        this.TperG = Math.min(this.TperG, gestureClass.TperG);
    }

    getGestureClass(){
        return this.gestures;
    }

}

module.exports = {
    GestureSet
};