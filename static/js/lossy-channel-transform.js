// This class represents the Standard solution which involves no error correction, that is the number of correctable
// errors is 0. This acts as the baseline to show what the sink or receiving user would see if there was no error
// correction happening
class StandardLossyTransform { // eslint-disable-line no-unused-vars
    constructor() {
        // Initialize the error model used for the channel
        this.errorModel = new ErrorModel();
    }

    /** @override */
    async init() {}
    /** @override */
    async transform(frame, controller) {
        // Initialize the start time of the packet transformation, this is used to compute the delay
        const start = +new Date();

        // Record metrics
        updateCount("frameCountStandard");
        
        const numPacketsPerFrame = 18; // https://chromium.googlesource.com/external/webrtc/+/master/modules/pacing/g3doc/index.md
        const numCorrectableErrors = 0;

        // Record metrics
        updateCountByAmount("overheadPacketCountStandard", 0);

        // Compute the number of packet errors for this frame
        const numPacketErrors = this.errorModel.getNumErrors(numPacketsPerFrame);
        if (numPacketErrors > 0) {
            // Record metrics
            updateCount("errorCountBCStandard");
        }
        
        if (numPacketErrors > numCorrectableErrors) {
            // Drop the frame
            frame.close();
            // Record metrics
            updateCount("errorCountACStandard");
        } else {
            // Enqueuing the frame is adding it back, this means that there were no errors or that the errors were
            // able to be corrected
            controller.enqueue(frame);
            // Record metrics
            updateCount("frameDisplayedStandard");
            // Record metrics
            updateCountByAmount("dataPacketCountStandard", numPacketsPerFrame);
        }

        // This is the difference or delta in milliseconds from the start of the transform to the end, we use this to
        // record the average delay of the solution
        const delta = +new Date() - start;
        // Record metrics
        recordDelay("Standard", delta);
    }
    /** @override */
    destroy() {}
}

class CorrectedLossyTransform { // eslint-disable-line no-unused-vars
    constructor() {
        // Initialize the error model used for the channel
        this.errorModel = new ErrorModel();
    }
    
    /** @override */
    async init() {}
    /** @override */
    async transform(frame, controller) {
        // Initialize the start time of the packet transformation, this is used to compute the delay
        const start = +new Date();

        // Record metrics
        updateCount("frameCountCorrected");
        
        // Use the default (n, k) pair
        const n = 22;
        const k = 18;

        // Record metrics
        updateCountByAmount("overheadPacketCountCorrected", n - k);
        
        // Compute the maximum number of packets that can be corrected
        const numCorrectableErrors = (n - k) / 2;

        // Compute the number of packet errors for this frame
        const numPacketErrors = this.errorModel.getNumErrors(k);
        if (numPacketErrors > 0) {
            // Record metrics
            updateCount("errorCountBCCorrected");
        }

        if (numPacketErrors > numCorrectableErrors) {
            // Drop the frame
            frame.close();
            // Record metrics
            updateCount("errorCountACCorrected");
        } else {
            // Enqueuing the frame is adding it back, this means that there were no errors or that the errors were
            // able to be corrected
            controller.enqueue(frame);
            // Record metrics
            updateCount("frameDisplayedCorrected");
            // Record metrics
            updateCountByAmount("dataPacketCountCorrected", k);
        }

        // This is the difference or delta in milliseconds from the start of the transform to the end, we use this to
        // record the average delay of the solution
        const delta = +new Date() - start;
        // Record metrics
        recordDelay("Corrected", delta);
    }
    /** @override */
    destroy() {}
}

class CorrectedMLLossyTransform { // eslint-disable-line no-unused-vars
    constructor() {
        // Initialize the error model used for the channel
        this.errorModel = new ErrorModel();
        // The initial k and n before the ML model has a previous state, this will only be used for the packets of
        // the first frame
        this.k = 18;
        this.n = 22;
    }
    
    /** @override */
    async init() {}
    /** @override */
    async transform(frame, controller) {
        // Initialize the start time of the packet transformation, this is used to compute the delay
        const start = +new Date();

        // Record metrics
        updateCount("frameCountCorrectedML");
        
        // Get the next state from the ML model, first select the local or remote host
        const host = window.location.href.includes(":5000") ? "http://127.0.0.1:5000" : "https://comp-691-project.onrender.com";
        // Make the GET request to the API with the previous state the get the next state
        const res = await fetch(`${host}/predict?states=${this.errorModel.state}`);
        const { state } = await res.json();
        
        // Compute the expected number of errors for the predicted state
        const expectedNumErrors = this.errorModel.getNumErrorsByState(this.k, +state);
        // Work backwards using the Reed-Solomon coding formula to figure out how many redundant bits are need i.e. n
        this.n = (expectedNumErrors * 2) + this.k;

        // Record metrics
        recordNewN(this.n);
        // Record metrics
        updateCountByAmount("overheadPacketCountCorrectedML", this.n - this.k);
        
        // Compute the maximum number of packets that can be corrected
        const numCorrectableErrors = (this.n - this.k) / 2;

        // Compute the number of packet errors for this frame
        const numPacketErrors = this.errorModel.getNumErrors(this.k);
        if (numPacketErrors > 0) {
            // Record metrics
            updateCount("errorCountBCCorrectedML");
        }

        if (numPacketErrors > numCorrectableErrors) {
            // Drop the frame
            frame.close();
            // Record metrics
            updateCount("errorCountACCorrectedML");
        } else {
            // Enqueuing the frame is adding it back, this means that there were no errors or that the errors were
            // able to be corrected
            controller.enqueue(frame);
            // Record metrics
            updateCount("frameDisplayedCorrectedML");
            // Record metrics
            updateCountByAmount("dataPacketCountCorrectedML", this.k);
        }

        // This is the difference or delta in milliseconds from the start of the transform to the end, we use this to
        // record the average delay of the solution
        const delta = +new Date() - start;
        // Record metrics
        recordDelay("CorrectedML", delta);
    }
    /** @override */
    destroy() {}
}

// Below are helper functions used to update the UI as the test is running so we can see the live results of what is
// going on

// This is used for incrementing any UI count by 1
async function updateCount(name) {
    const count = document.getElementById(name);
    count.innerHTML = `${+count.innerHTML + 1}`;
}

// This is used for incrementing any UI count by a given amount
async function updateCountByAmount(name, amount) {
    const count = document.getElementById(name);
    count.innerHTML = `${+count.innerHTML + amount}`;
}

// This is used for the ML Correction solution to record the different value of n each frame
async function recordNewN(n) {
    const list = document.getElementById("nList");
    list.innerHTML += `${n}:`;
}

// This is used to record the list of delays for each solution so that we can compute the average delay for a test run
async function recordDelay(name, n) {
    const list = document.getElementById(`delay${name}`);
    list.innerHTML += `${n}:`;
}