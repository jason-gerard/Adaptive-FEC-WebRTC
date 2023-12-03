class ErrorModel {
    constructor() {
        // Set the initial state to the good state of 0 with a 100% probability of 0 errors
        this.state = 0;
        // Probability that a packet is lost, the same packet loss probability is used for all packets for a given frame
        // after all packets are computed we transition to the next probability for the packets of the next frame
        this.states = [0, 10, 20, 30, 40, 50];
        // transitionProbabilities[i][j] -> the probability of transitioning from state i to state j
        // this.transitionProbabilities = [
        //     [80, 4,  4,  4,  4,  4],
        //     [60, 30, 10, 0,  0,  0],
        //     [60, 5,  30, 5,  0,  0],
        //     [60, 0,  5,  30, 5,  0],
        //     [60, 0,  0,  5,  30, 5],
        //     [60, 0,  0,  0,  10, 30],
        // ];

        this.transitionProbabilities = [
            [80, 20, 0,  0,  0,  0],
            [20, 60, 20, 0,  0,  0],
            [0, 20,  60, 20,  0,  0],
            [0, 0,  20,  60, 20,  0],
            [0, 0,  0,  20,  60, 20],
            [0, 0,  0,  0,  80, 20],
        ];
    }

    // Given a specific state i.e. not using the state of the error model class, how many errors can be expected, this
    // is actually random and so running this function multiple times with the same inputs will give different results
    // this is used to give a good prediction of the number of errors
    getNumErrorsByState(numFramesPerPacket, state) {
        let numErrors = 0;
        for (let i = 0; i < numFramesPerPacket; i++) {
            const sample = Math.floor(Math.random() * 100);
            if (sample < this.states[state]) {
                numErrors++;
            }
        }

        return numErrors;
    }
    
    // This is the core function of the class and is used to get the number of errors for this state and compute the
    // next state of the state machine
    getNumErrors(numFramesPerPacket) {
        // This block computes the number of errors for the current state of the state machine
        let numErrors = 0;
        for (let i = 0; i < numFramesPerPacket; i++) {
            // We take a sample between (0, 99) and based on the probability of the state we add an error
            const sample = Math.floor(Math.random() * 100);
            if (sample < this.states[this.state]) {
                numErrors++;
            }
        }
        
        // Calculate which transition to take based on probability
        const sample = Math.floor(Math.random() * 100);
        let result = null;
        let acc = 0;

        // We move through the transition probabilities subtracting each one as we go since they add up to 100, once
        // one of the samples is higher than the remainder we move to that state, this gives the state machines
        // probability of selecting a given transition
        this.transitionProbabilities[this.state].forEach((key, index) => {
            if (result === null && sample >= 100 - key - acc)
                result = index;
            acc += parseFloat(key);
        });
        
        // Set the selected state as the current state of the state machine
        this.state = result;

        return numErrors;
    }
}

// Uncomment to generate dataset
// module.exports = {
//     ErrorModel,
// }