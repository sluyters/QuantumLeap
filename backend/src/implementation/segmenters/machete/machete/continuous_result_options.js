class ContinuousResultOptions {
    constructor() {
        this.latencyFrameCount = 0;
        this.individualBoundary = false;
        this.abandon = false;
    }
}

const ResultStateT = {
    /**
     * In this state, we are waiting for the score to
     * fall below the rejection threshold.
     */
    'WAIT_FOR_START': 0,
    /**
     * Here, we've fallen below the rejection threshold, 
     * but we've not yet seen the best score. While the
     * score is still dropping, we continue to wait.
     */
    'LOOKING_FOR_MINIMUM': 1,
    /**
     * We believe we've found the minimum score and we
     * are going to report it this frame. Hang out here
     * for just one frame so the application can see that
     * we've 'triggered' a recognition.
     */
    'TRIGGER': 2,
    /**
     * After reporting that we've recognized a gesture, 
     * wait for the score to climb back out of the rejection
     * threshold area. This is also needed if the application
     * doesn't reset the system whenever a gesture is
     * recognized.
     */
    'WAIT_FOR_END': 3
};

class ContinuousResult {
    constructor(options, gid, sample) {
        // Internal Recognition Result state
        this.state = 0;
        this.score =  0.0;
        this.options = undefined;
        this.gid = 0;
        this.boundary = 0;
        // Minimum warping path score observed
        this.minimum = 0.0;
        // The starting frame of the minimum warping path.
        this.startFrameNo = 0;
        // The ending frame of the minimum warping path.
        this.endFrameNo = 0;
        // Rejection threshold
        this.rejectionThreshold = 0.0;
        this.sample = undefined;

        if (
            (typeof options !== 'undefined' && options !== null) &&
            (typeof gid !== 'undefined' && gid !== null) &&
            (typeof sample !== 'undefined' && sample !== null)
        ) {
            this.options = options;
            this.gid = gid;

            this.reset();
            this.boundary = -1;

            this.sample = sample;
        }
    }

    setWaitForStart() {
        // Initial state
        this.state = ResultStateT.WAIT_FOR_START;

        // No minimum found yet
        this.minimum = Number.POSITIVE_INFINITY;
        this.score = this.minimum;

        // Gesture Boundaries
        this.startFrameNo = -1;
        this.endFrameNo = -1;
    }

    reset() {
        this.setWaitForStart();
    }

    /**
     * Based on internal criteria, was a gesture
     * officially recognized?
     */
    triggered() {
        return (this.state === ResultStateT.TRIGGER);
    }

    /**
     * Update internal FSM based on current score.
     */
    update(score, threshold, startFrameNo, endFrameNo, currentFrameNo) {
        // Set up current frame if necessary
        if (currentFrameNo === -2)
            currentFrameNo = endFrameNo;

        // Wait for the score to pass below the
        // rejection threshold
        if (this.state === ResultStateT.WAIT_FOR_START) {
            // If waiting, make sure the minimum matches
            // the actual score.
            this.minimum = score;

            if (score < threshold) {
                this.state = ResultStateT.LOOKING_FOR_MINIMUM;
            }
        }

        // Although the gesture is in the accept zone, we
        // may have not reached the best score yet.
        if (this.state === ResultStateT.LOOKING_FOR_MINIMUM) {
            // save data on new minimum
            if (score <= this.minimum) {
                this.minimum = score;
                this.score = this.minimum;
                this.startFrameNo = startFrameNo;
                this.endFrameNo = endFrameNo;
            }

            //
            // Timeout
            //
            let frameCnt = currentFrameNo - this.endFrameNo;
            let timeout = (frameCnt >= this.options.latencyFrameCount);
            if (timeout === true) {
                this.state = ResultStateT.TRIGGER;
                return;
            }
        }

        // Trigger operation is complete, so advance.
        if (this.state === ResultStateT.TRIGGER) {
            this.state = ResultStateT.WAIT_FOR_END;
        }

        // Wait until we leave the accept zone
        // to avoid triggering again.
        if (this.state === ResultStateT.WAIT_FOR_END) {
            let advance = true;

            //advance &= startFrameNo > boundary;
            advance = advance && (score > this.rejectionThreshold);

            if (advance) {
                // this.Reset();
                this.state = ResultStateT.WAIT_FOR_START;
            }
        }
    }

    /**
     * Called when a gesture is recognized.
     */
    setWaitForEnd(result) {
        this.boundary = result.endFrameNo;
        this.state = ResultStateT.WAIT_FOR_END;
    }

    /**
     * Call when a false positive has occurred. 
     */
    falsePositive(result) {
        // Reset internal state should handle everything.
        this.Reset();

        // Do not reset boundary, because the issue may 
        // just be poor segmentation. So allow new scores
        // to result is quick recognition. 
    }

    /**
     * Get name of state
     */
    stateStr() {
        switch (this.state) {
            case ResultStateT.LOOKING_FOR_MINIMUM:
                return "looking for minimum";
            case ResultStateT.WAIT_FOR_START:
                return "wait for start";
            case ResultStateT.TRIGGER:
                return "trigger";
            case ResultStateT.WAIT_FOR_END:
                return "wait for end";
        }

        return "impossible ResultStateT case";
    }

    static selectResult(results, cancel_with_something_better) {
        let triggered = [];
        let remaining = [];

        // Get all triggered events
        for (let i = 0; i < results.length; i++) {
            let result = results[i];

            if (!result.triggered()) {
                continue;
            }

            triggered.push(result);
        }

        // If none triggered nothing to do
        if (triggered.length === 0) {
            return null;
        }

        for (let i = 0; i < triggered.length; i++) {
            for (let j = 0; j < results.length; j++) {
                let result = results[j];

                if (triggered[i] === result) {
                    continue;
                }

                if (triggered[i].minimum > result.minimum) {
                    if (cancel_with_something_better === true) {
                        triggered[i].setWaitForEnd(result);
                        break;
                    }
                }
            }

            if (triggered[i].triggered()) {
                remaining.push(triggered[i]);
            }
        }

        // Get the best survivor
        if (remaining.length === 0) {
            return null;
        }

        return remaining[0];
    }
}

module.exports = {
    ContinuousResultOptions,
    ContinuousResult
}