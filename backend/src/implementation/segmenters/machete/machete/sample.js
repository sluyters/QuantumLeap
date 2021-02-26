/**
 * A class to hold one sample, perhaps loaded from a file.
 */
class Sample {
    constructor(subjectId, gestureId, instanceId) {
        this.gestureName = "";

        this.subjectId = subjectId || 0;
        this.gestureId = gestureId || 0;
        this.instanceId = instanceId || 0;

        this.trajectory = [];
        this.timeStamps = [];
        this.filteredTrajectory = [];
    }

    addTrajectory(trajectory) {
        for (var i = 0; i < trajectory.length; i++) {
            this.trajectory.push(trajectory[i].clone());
        }
    }

    addTimeStamps(timeStamps) {
        for (var i = 0; i < timeStamps.length; i++) {
            this.trajectory.push(timeStamps[i]);
        }
    }

    addFilteredTrajectory(trajectory) {
        for (var i = 0; i < trajectory.length; i++) {
            this.filteredTrajectory.push(trajectory[i].clone());
        }
    }

    clone() {
        let ret = new Sample(this.subjectId, this.gestureId, this.instanceId);
        ret.addTrajectory(this.trajectory);
        ret.addTimeStamps(this.timeStamps);
        ret.addFilteredTrajectory(this.filteredTrajectory);
        return ret;
    }

    // getSubjectId() {
    //     return this.subjectId;
    // }

    // setSubjectId(subjectId) {
    //     this.subjectId = subjectId;
    // }

    // getGestureId() {
    //     return this.gestureId;
    // }

    // setGestureId(gestureId) {
    //     this.gestureId = gestureId;
    // }

    // getInstanceId() {
    //     return this.instanceId;
    // }

    // setInstanceId(instanceId) {
    //     this.instanceId = instanceId;
    // }

    // getGestureName() {
    //     return this.gestureName;
    // }

    // setGestureName(gestureName) {
    //     this.gestureName = gestureName;
    // }
}

module.exports = {
	Sample
};