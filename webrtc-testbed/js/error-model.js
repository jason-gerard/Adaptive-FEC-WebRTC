class ErrorModel {
    constructor() {
        this.state = 0;
        // Probability that a packet is lost, the same packet loss probability is used for all packets for a given frame
        // after all packets are computed we transition to the next probability for the packets of the next frame
        this.states = [0, 10, 20, 30, 40, 50];
        // transitionProbabilities[i][j] -> the probability of transitioning from state i to state j
        this.transitionProbabilities = [
            [80, 4,  4,  4,  4,  4],
            [60, 30, 10, 0,  0,  0],
            [60, 5,  30, 5,  0,  0],
            [60, 0,  5,  30, 5,  0],
            [60, 0,  0,  5,  30, 5],
            [60, 0,  0,  0,  10, 30],
        ];
    }
    
    getNumErrors(numFramesPerPacket) {
        let numErrors = 0;
        for (let i = 0; i < numFramesPerPacket; i++) {
            const sample = Math.floor(Math.random() * 100);
            if (sample < this.states[this.state]) {
                numErrors++;
            }
        }
        
        // Calculate which transition to take based on probability
        const sample = Math.floor(Math.random() * 100);
        let result = null;
        let acc = 0;

        this.transitionProbabilities[this.state].forEach((key, index) => {
            if (result === null && sample >= 100 - key - acc)
                result = index;
            acc += parseFloat(key);
        });
        
        this.state = result;

        return numErrors;
    }
}

// Console test
// const model = new ErrorModel();
// for (let i = 0; i < 100; i++) {
//     console.log("state", model.state);
//     console.log("num errors", model.getNumErrors());
// }