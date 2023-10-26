const { ErrorModel } = require("../webrtc-testbed/js/error-model");
const fs = require('fs');

const k = 18; // numPacketsPerFrame
const prevStates = [];
const numPrevStates = 5;

const output = [];

const model = new ErrorModel();

const numRounds = 100000;
for (let i = 0; i < numRounds; i++) {
    const numPacketErrors = model.getNumErrors(k);
    
    if (i >= numPrevStates) {
        const prevStatesInOrder = [];
        for (let j = 0; j < numPrevStates; j++) {
            const value = prevStates[((i + j) % numPrevStates + numPrevStates) % numPrevStates];
            prevStatesInOrder.push(value);
        }
        // Save to output
        prevStatesInOrder.push(model.state);
        output.push(prevStatesInOrder)
    }

    prevStates[(i % numPrevStates + numPrevStates) % numPrevStates] = model.state;
}

let csv = "";
for (let line of output) {
    csv += line.join(",") + "\n";
}

fs.writeFileSync('./dataset.csv', csv);