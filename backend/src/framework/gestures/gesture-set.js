class GestureSet {
    constructor(name) {
        this.name = name;
        this.gestures = new Map();
        this.G = 0;
    }

    addGestureClass(gestureClass) {
        this.gestures.set(gestureClass.name, gestureClass);
        this.G += 1;
    }

    removeGestureClass(name) {
        let gestureClassToDelete = this.gestures.get(name);
        if (gestureClassToDelete !== undefined) {
            deletedIndex = gestureClassToDelete.index;
            // Delete gesture class
            this.gestures.delete(name);
            // Update other classes indexes
            for (let [key, gestureClass] of this.gestures) {
                if (gestureClass.index > deletedIndex) {
                    gestureClass.index -= 1;
                }
            } 
            // Update number of gesture classes
            this.G -= 1;
        }
    }

    getUsers() {
        let users = new Set();
        for (let [key, gestureClass] of this.getGestureClasses()) {
            gestureClass.getSamples().forEach(sample => users.add(sample.user));
        }
        return [...users];
    }

    removeUser(user) {
        for (let [key, gestureClass] of this.gestures) {
            gestureClass.samples = gestureClass.samples.filter(sample => user !== sample.user);
            gestureClass.TperG = gestureClass.samples.length;
            // If we deleted all users
            if (gestureClass.TperG === 0) {
                this.removeGestureClass(key);
            }
        } 
    }

    removeUsers(users = []) {
        for (let [key, gestureClass] of this.gestures) {
            gestureClass.samples = gestureClass.samples.filter(sample => !users.includes(sample.user));
            gestureClass.TperG = gestureClass.samples.length;
            // If we deleted all users
            if (gestureClass.TperG === 0) {
                this.removeGestureClass(key);
            }
        }  
    }

    getGestureClasses() {
        return this.gestures;
    }

    getMinTemplate() {
        let TperG = Infinity;
        for (var gestureClass of this.gestures.values()) {
            TperG = Math.min(TperG, gestureClass.TperG);
        }
        return TperG;
    }
}

module.exports = {
    GestureSet
};