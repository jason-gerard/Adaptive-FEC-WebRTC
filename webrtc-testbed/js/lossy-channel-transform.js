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
        const numPacketErrors = this.errorModel.getNumErrors(k);

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
    constructor() {
        this.errorModel = new ErrorModel();
        this.numFrameDrops = 0;
        this.k = 10;
        this.n = 14;
    }
    
    /** @override */
    async init() {}
    /** @override */
    async transform(frame, controller) {
        // Get the next state from the ML model
        // fetch(`http://127.0.0.1:5000/predict?states=${this.errorModel.state}`)
        //     .then(res => res.json())
        //     .then(data => {
        //         let expectedNumErrors = this.errorModel.getNumErrorsByState(this.k, +data.state);
        //         if (expectedNumErrors > 0) {
        //             expectedNumErrors += 1;
        //         }
        //         this.n = (expectedNumErrors * 2) + this.k;
        //     });
        const res = await fetch(`http://127.0.0.1:5000/predict?states=${this.errorModel.state}`);
        const { state } = await res.json();
        let expectedNumErrors = this.errorModel.getNumErrorsByState(this.k, +state);
        this.n = (expectedNumErrors * 2) + this.k;

        // Compute the maximum number of packets that can be corrected
        const numCorrectableErrors = (this.n - this.k) / 2;

        // Compute the number of packet errors for this frame
        const numPacketErrors = this.errorModel.getNumErrors(this.k);

        if (numPacketErrors > numCorrectableErrors) {
            // Drop the frame
            frame.close();
            this.numFrameDrops++;
            console.log("CorrectedML frame drop", this.numFrameDrops);
        } else {
            controller.enqueue(frame);
        }
    }
    /** @override */
    destroy() {}
}
