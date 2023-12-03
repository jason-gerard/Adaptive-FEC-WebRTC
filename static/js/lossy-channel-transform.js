class StandardLossyTransform { // eslint-disable-line no-unused-vars
    constructor() {
        this.errorModel = new ErrorModel();
        this.numFrameDrops = 0;
    }

    /** @override */
    async init() {}
    /** @override */
    async transform(frame, controller) {
        const start = +new Date();

        updateCount("frameCountStandard");
        
        const numPacketsPerFrame = 18; // https://chromium.googlesource.com/external/webrtc/+/master/modules/pacing/g3doc/index.md
        const numCorrectableErrors = 0;
        
        updateCountByAmount("overheadPacketCountStandard", 0);

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
            updateCountByAmount("dataPacketCountStandard", numPacketsPerFrame);
        }

        const delta = +new Date() - start;
        recordDelay("Standard", delta);
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
        const start = +new Date();

        updateCount("frameCountCorrected");
        
        // Use the default (n, k) pair
        const n = 22;
        const k = 18;

        updateCountByAmount("overheadPacketCountCorrected", n - k);
        
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
            updateCountByAmount("dataPacketCountCorrected", k);
        }

        const delta = +new Date() - start;
        recordDelay("Corrected", delta);
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
        const start = +new Date();
        
        updateCount("frameCountCorrectedML");
        
        // Get the next state from the ML model
        const host = window.location.href.includes(":5000") ? "http://127.0.0.1:5000" : "https://comp-691-project.onrender.com";
        const res = await fetch(`${host}/predict?states=${this.errorModel.state}`);
        const { state } = await res.json();
        let expectedNumErrors = this.errorModel.getNumErrorsByState(this.k, +state);
        this.n = (expectedNumErrors * 2) + this.k;

        recordNewN(this.n);
        updateCountByAmount("overheadPacketCountCorrectedML", this.n - this.k);
        
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
            updateCountByAmount("dataPacketCountCorrectedML", this.k);
        }
        
        const delta = +new Date() - start;
        recordDelay("CorrectedML", delta);
    }
    /** @override */
    destroy() {}
}

async function updateCount(name) {
    const count = document.getElementById(name);
    count.innerHTML = `${+count.innerHTML + 1}`;
}

async function updateCountByAmount(name, amount) {
    const count = document.getElementById(name);
    count.innerHTML = `${+count.innerHTML + amount}`;
}

async function recordNewN(n) {
    const list = document.getElementById("nList");
    list.innerHTML += `${n}:`;
}

async function recordDelay(name, n) {
    const list = document.getElementById(`delay${name}`);
    list.innerHTML += `${n}:`;
}