import { audioContext, analyser } from './audioContext.js';

/**
 * Ensures the AudioContext is active by checking its state and resuming it if suspended.
 * @returns {Promise<void>} A promise that resolves when the AudioContext is active.
 * @throws {Error} If the AudioContext cannot be resumed.
 */
async function ensureAudioContextActive() {
    try {
        console.log('AudioContext state before resume:', audioContext.state);
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
            console.log('AudioContext resumed successfully');
        }
        console.log('AudioContext state after resume:', audioContext.state);
    } catch (error) {
        console.error('Failed to resume AudioContext:', error);
        alert('Audio playback is blocked. Please interact with the page to enable sound.');
        throw new Error('AudioContext could not be resumed.');
    }
}

/**
 * Ensures the analyser is properly connected to the audio destination.
 * @throws {Error} If the analyser is invalid or closed.
 */
function ensureAnalyserOutput() {
    try {
        if (!analyser || analyser.context.state === 'closed') {
            throw new Error('Analyser node is invalid or closed.');
        }
        analyser.connect(audioContext.destination);
        console.log('Analyser connected to destination');
    } catch (error) {
        console.error('Error ensuring analyser output:', error);
        alert('Error connecting analyser to output: ' + error.message);
    }
}

export { ensureAudioContextActive, ensureAnalyserOutput };
