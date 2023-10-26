class StandardLossyTransform { // eslint-disable-line no-unused-vars
    constructor() {
        this.errorModel = new ErrorModel();
        this.numFrameDrops = 0;
    }

    /** @override */
    async init() {}
    /** @override */
    async transform(frame, controller) {
        const numPacketsPerFrame = 18; // https://chromium.googlesource.com/external/webrtc/+/master/modules/pacing/g3doc/index.md
        const numCorrectableErrors = 0;

        // Compute the number of packet errors for this frame
        const numPacketErrors = this.errorModel.getNumErrors(numPacketsPerFrame);
        if (numPacketErrors > 0) {
            updateCount("errorCountBCStandard");
        }
        
        if (numPacketErrors > numCorrectableErrors) {
            // Drop the frame
            frame.close();
            this.numFrameDrops++;
            updateCount("errorCountACStandard");
        } else {
            controller.enqueue(frame);
            updateCount("frameDisplayedStandard");
        }
        
        updateCount("frameCountStandard");
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
        const n = 22;
        const k = 18;

        // Compute the maximum number of packets that can be corrected
        const numCorrectableErrors = (n - k) / 2;

        // Compute the number of packet errors for this frame
        const numPacketErrors = this.errorModel.getNumErrors(k);
        if (numPacketErrors > 0) {
            updateCount("errorCountBCCorrected");
        }

        if (numPacketErrors > numCorrectableErrors) {
            // Drop the frame
            frame.close();
            this.numFrameDrops++;
            updateCount("errorCountACCorrected");
        } else {
            controller.enqueue(frame);
            updateCount("frameDisplayedCorrected");
        }
        
        updateCount("frameCountCorrected");
    }
    /** @override */
    destroy() {}
}

class CorrectedMLLossyTransform { // eslint-disable-line no-unused-vars
    constructor() {
        this.errorModel = new ErrorModel();
        this.numFrameDrops = 0;
        this.k = 18;
        this.n = 22;
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
        if (numPacketErrors > 0) {
            updateCount("errorCountBCCorrectedML");
        }

        if (numPacketErrors > numCorrectableErrors) {
            // Drop the frame
            frame.close();
            this.numFrameDrops++;
            updateCount("errorCountACCorrectedML");
        } else {
            controller.enqueue(frame);
            updateCount("frameDisplayedCorrectedML");
        }

        updateCount("frameCountCorrectedML");
    }
    /** @override */
    destroy() {}
}

async function updateCount(name) {
    const count = document.getElementById(name);
    count.innerHTML = `${+count.innerHTML + 1}`;
}