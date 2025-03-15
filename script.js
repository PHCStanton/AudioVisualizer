import { audioContext, analyser } from './audioContext.js';
import { playTone, stopTone } from './toneGenerator.js';
import { setupAudioNodes, stopMp3, clearMp3 } from './mp3Handler.js';
import { visualize } from './visualizer.js';
import { ensureAudioContextActive } from './utils.js';

// Resume the audio context when the page loads
window.addEventListener('load', async () => {
    try {
        await audioContext.resume();
        console.log('AudioContext resumed successfully');
    } catch (error) {
        console.error('Failed to resume AudioContext:', error);
    }
});

// Add a state change listener to notify users if the context is suspended
audioContext.onstatechange = () => {
    console.log('AudioContext state:', audioContext.state);
    if (audioContext.state === 'suspended') {
        alert('Audio is suspended. Please interact with the page to enable sound.');
    }
};

// DOM elements
const frequencyInput = document.getElementById('frequency');
const playToneButton = document.getElementById('play-tone');
const stopToneButton = document.getElementById('stop-tone');
const stopMp3Button = document.getElementById('stop-mp3');
const clearMp3Button = document.getElementById('clear-mp3');
const visualizerSelect = document.getElementById('visualizer');
const mp3Uploader = document.getElementById('mp3-uploader');

// Module state
let audioLoadListener = null;

// Event listeners
visualizerSelect.addEventListener('change', () => {
    try {
        visualize();
    } catch (error) {
        console.error('Error changing visualizer:', error);
    }
});

// Play tone button
playToneButton.addEventListener('click', async () => {
    try {
        // Get and validate frequency
        const frequency = parseFloat(frequencyInput.value);
        if (isNaN(frequency) || frequency <= 0) {
            console.error('Invalid frequency value:', frequencyInput.value);
            alert('Please enter a valid frequency value greater than 0.');
            return;
        }
        
        // Play the tone
        playTone(frequency);
    } catch (error) {
        console.error('Error playing tone:', error);
    }
});

// Stop tone button
stopToneButton.addEventListener('click', () => {
    try {
        stopTone();
    } catch (error) {
        console.error('Error stopping tone:', error);
    }
});

// Stop MP3 button
stopMp3Button.addEventListener('click', () => {
    try {
        stopMp3();
    } catch (error) {
        console.error('Error stopping MP3:', error);
    }
});

// Clear MP3 button
clearMp3Button.addEventListener('click', () => {
    try {
        clearMp3();
    } catch (error) {
        console.error('Error clearing MP3:', error);
    }
});

// MP3 uploader
mp3Uploader.addEventListener('change', async (e) => {
    console.log('MP3 file selected');
    
    try {
        // Check if files were selected
        if (!e.target.files || e.target.files.length === 0) {
            console.warn('No files selected');
            return;
        }
        
        const file = e.target.files[0];
        
        // Validate file type specifically for MP3
        if (!file.type.includes('audio/mpeg') && !file.name.endsWith('.mp3')) {
            console.error('Selected file is not an MP3:', file.type);
            alert('Please select an MP3 audio file.');
            return;
        }
        
        console.log('File:', file.name, file.type, file.size);
        
        // Create object URL for the file
        const url = URL.createObjectURL(file);
        console.log('Created object URL:', url);
        
        const audioElement = document.getElementById('audio-player');
        if (!audioElement) {
            console.error('Audio player element not found');
            alert('Audio player element not found. Please check the HTML.');
            return;
        }
        
        // Ensure AudioContext is active
        await ensureAudioContextActive();
        
        // Clean up previous resources
        if (audioElement.src && audioElement.src.startsWith('blob:')) {
            URL.revokeObjectURL(audioElement.src);
        }
        
        // Remove previous event listener if it exists
        if (audioLoadListener) {
            console.log('Removing previous loadeddata listener');
            audioElement.removeEventListener('loadeddata', audioLoadListener);
        }
        
        // Create and store the new event listener
        audioLoadListener = () => {
            console.log('Audio data loaded');
            try {
                setupAudioNodes();
            } catch (setupError) {
                console.error('Error setting up audio nodes:', setupError);
            }
        };
        
        // Add error handling for audio loading
        const errorListener = (errorEvent) => {
            console.error('Error loading audio:', errorEvent);
            alert('Error loading audio file. Please try another file.');
            audioElement.removeEventListener('error', errorListener);
        };
        
        // Add the event listeners before setting the source
        audioElement.addEventListener('loadeddata', audioLoadListener);
        audioElement.addEventListener('error', errorListener);
        console.log('Added audio event listeners');
        
        // Set the audio source
        audioElement.src = url;
        console.log('Set audio source');
        
        // Force a load if needed
        audioElement.load();
        console.log('Forced audio load');
    } catch (error) {
        console.error('Error in MP3 upload handler:', error);
        alert('Error uploading MP3: ' + error.message);
    }
});

// Check browser support for Web Audio API
if (!window.AudioContext && !window.webkitAudioContext) {
    console.error('Web Audio API not supported in this browser');
    // Disable audio controls and show user message
    frequencyInput.disabled = true;
    playToneButton.disabled = true;
    stopToneButton.disabled = true;
    mp3Uploader.disabled = true;
    stopMp3Button.disabled = true;
    clearMp3Button.disabled = true;
    visualizerSelect.disabled = true;

    const message = document.createElement('p');
    message.textContent = 'Web Audio API not supported in this browser. Audio controls are disabled.';
    document.body.appendChild(message);
}
