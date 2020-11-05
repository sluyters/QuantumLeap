const Sample = require('./sample').Sample;

class PoseData extends Sample {
    constructor(user, id, frame, infosupp) {
        super(user, id, infosupp);
        this.frame = frame;
    }
}

module.exports = {
    PoseData
};