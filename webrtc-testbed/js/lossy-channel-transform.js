class LossyTransform { // eslint-disable-line no-unused-vars
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

        if (Math.random() < 0.5) {
            controller.enqueue(frame);
        } else {
            frame.close();
        }
    }
    /** @override */
    destroy() {}
}

class TestLossyTransform { // eslint-disable-line no-unused-vars
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

        if (Math.random() < 0.1) {
            controller.enqueue(frame);
        } else {
            frame.close();
        }
    }
    /** @override */
    destroy() {}
}
