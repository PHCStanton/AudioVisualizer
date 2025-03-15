import { audioContext, analyser } from './audioContext.js';
import { visualize } from './visualizer.js';
import { ensureAudioContextActive, ensureAnalyserOutput } from './utils.js';

// Audio source for tone generation
let source = null;

function createWhiteNoise() {
    const bufferSize = 2 * audioContext.sampleRate;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    return whiteNoise;
}

function createPinkNoise() {
    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    const bufferSize = 2 * audioContext.sampleRate;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + white * 0.5362;
        output[i] *= 0.11;
    }
    const pinkNoise = audioContext.createBufferSource();
    pinkNoise.buffer = noiseBuffer;
    pinkNoise.loop = true;
    return pinkNoise;
}

async function playTone(frequency) {
    try {
        await ensureAudioContextActive();
        ensureAnalyserOutput();
        
        stopTone(); // Clear any existing tone

        const freq = parseFloat(frequency);
        if (isNaN(freq) || freq <= 0) {
            throw new Error('Invalid frequency value. Must be a number greater than 0.');
        }
        
        console.log('Playing tone with frequency:', freq);
        
        const waveformInput = document.querySelector('input[name="waveform"]:checked');
        const noiseTypeInput = document.querySelector('input[name="noiseType"]:checked');
        
        if (!waveformInput || !noiseTypeInput) {
            throw new Error('Waveform or noise type selection is missing. Please check the UI.');
        }
        
        const waveform = waveformInput.value;
        const noiseType = noiseTypeInput.value;

        console.log('Waveform:', waveform, 'Noise type:', noiseType);

        if (noiseType === 'none') {
            const oscillator = audioContext.createOscillator();
            oscillator.type = waveform;
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);

            oscillator.connect(analyser);
            oscillator.start();
            source = oscillator;
            console.log('Oscillator started');
        } else if (noiseType === 'white') {
            source = createWhiteNoise();
            source.connect(analyser);
            source.start();
            console.log('White noise started');
        } else if (noiseType === 'pink') {
            source = createPinkNoise();
            source.connect(analyser);
            source.start();
            console.log('Pink noise started');
        }
        
        // Call visualize to update the visualization
        visualize();
        console.log('Visualization started');
    } catch (error) {
        console.error('Error in playTone:', error);
        alert('Error playing tone: ' + error.message);
    }
}

function stopTone() {
    if (source) {
        try {
            source.stop();
        } catch (error) {
            console.error('Error stopping tone:', error);
        } finally {
            source = null;
        }
    }
}

export { createWhiteNoise, createPinkNoise, playTone, stopTone };
