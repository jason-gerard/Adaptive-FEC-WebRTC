const { ErrorModel } = require("../static/js/error-model");
const fs = require('fs');

const k = 18; // numPacketsPerFrame
const prevStates = [];
// This parameter is adjustable to record how many previous states should be included in the dataset this in the 
// training of the model
const numPrevStates = 5; 

const output = [];

// Initialize the error model
const model = new ErrorModel();

// This parameter is adjustable to give how many iterations on the dataset, this corresponds to the number of rows
// in the resulting csv file
const numRounds = 100000;
for (let i = 0; i < numRounds; i++) {
    // We don't actually need to know the number of errors only advance the state of the state machine error model
    const numPacketErrors = model.getNumErrors(k);
    
    // This acts as a sliding window where the previous states are a circular array so that we don't take up too much
    // space and have to re-order the array all the time
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

    // This is the index for the circular array, we assign the current state of the error model to it
    prevStates[(i % numPrevStates + numPrevStates) % numPrevStates] = model.state;
}

// Combine all the prev state results into a CSV and write it to the file system
let csv = "";
for (let line of output) {
    csv += line.join(",") + "\n";
}

fs.writeFileSync('./dataset.csv', csv);