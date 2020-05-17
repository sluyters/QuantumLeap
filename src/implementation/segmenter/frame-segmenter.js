class Segmenter {
    constructor() {
        // Empty
    }

    segment(frame) {
        return { success: true, frames: [frame] };
    }
}

module.exports = {
    Segmenter
};