class StandardLossyTransform { // eslint-disable-line no-unused-vars
    constructor() {
        this.errorModel = new ErrorModel();
        this.numFrameDrops = 0;
    }

    /** @override */
    async init() {}
    /** @override */
    async transform(frame, controller) {
        const numPacketsPerFrame = 10;
        const numCorrectableErrors = 0;

        // Compute the number of packet errors for this frame
        const numPacketErrors = this.errorModel.getNumErrors(numPacketsPerFrame);
        
        if (numPacketErrors > numCorrectableErrors) {
            // Drop the frame
            frame.close();
            this.numFrameDrops++;
            console.log("Standard frame drop", this.numFrameDrops);
        } else {
            controller.enqueue(frame);
        }
    }
    /** @override */
    destroy() {}
}

class CorrectedLossyTransform { // eslint-disable-line no-unused-vars
    constructor() {
        this.errorModel = new ErrorModel();
        this.numFrameDrops = 0;
    }
    
    /** @override */
    async init() {}
    /** @override */
    async transform(frame, controller) {
        // Use the default (n, k) pair
        const n = 14;
        const k = 10;

        // Compute the maximum number of packets that can be corrected
        const numCorrectableErrors = (n - k) / 2;

        // Compute the number of packet errors for this frame
        const numPacketErrors = this.errorModel.getNumErrors(n);

        if (numPacketErrors > numCorrectableErrors) {
            // Drop the frame
            frame.close();
            this.numFrameDrops++;
            console.log("Corrected frame drop", this.numFrameDrops);
        } else {
            controller.enqueue(frame);
        }
    }
    /** @override */
    destroy() {}
}

class CorrectedMLLossyTransform { // eslint-disable-line no-unused-vars
    /** @override */
    async init() {}
    /** @override */
    async transform(frame, controller) {
        // Get the (n, k) pair from the ML model

        // Compute the maximum number of packets that can be corrected
        // numCorrectableErrors = (n - k) / 2

        // Compute the number of packet errors for this frame
        // If numPacketErrors > numCorrectableErrors
        // then frame.close()
        // else all the packets for that frame were able to be corrected so controller.enqueue(frame)

        if (Math.random() < 0.9) {
            controller.enqueue(frame);
        } else {
            frame.close();
        }
    }
    /** @override */
    destroy() {}
}
