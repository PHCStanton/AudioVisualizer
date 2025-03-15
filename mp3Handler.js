import { audioContext, analyser } from './audioContext.js';
import { visualize, currentVisualizerAnimation } from './visualizer.js';
import { ensureAudioContextActive, ensureAnalyserOutput } from './utils.js';

// DOM elements
const mp3Uploader = document.getElementById('mp3-uploader');
const audioPlayer = document.getElementById('audio-player');

// Module state
let mp3Source = null;
let audioLoadListener = null;

// This event listener is now in script.js

// Keep track of whether we've already created a MediaElementSource
let mediaElementSourceCreated = false;

async function setupAudioNodes() {
    console.log('Setting up audio nodes');
    
    try {
        await ensureAudioContextActive();
        ensureAnalyserOutput();
        
        if (!audioPlayer.src) {
            console.warn('Audio player has no source');
            return;
        }
        
        console.log('Audio player has source:', audioPlayer.src);
        
        // Only create a new MediaElementSource if we haven't already
        if (!mediaElementSourceCreated) {
            console.log('Creating new MediaElementSource');
            mp3Source = audioContext.createMediaElementSource(audioPlayer);
            mediaElementSourceCreated = true;
            console.log('Created new media element source');
        } else if (mp3Source) {
            console.log('Using existing MediaElementSource');
        } else {
            console.warn('MediaElementSource was created but is null');
            return;
        }
        
        // Connect the source to the analyser
        mp3Source.connect(analyser);
        console.log('Connected mp3Source to analyser');
        
        // Start playback
        try {
            await audioPlayer.play();
            console.log('Audio playback started');
        } catch (playError) {
            console.error('Error starting playback:', playError);
            alert('Failed to play MP3: ' + playError.message);
        }
        
        // Start visualization
        visualize();
        console.log('Visualization started');
    } catch (error) {
        console.error('Error in setupAudioNodes:', error);
        alert('Error setting up audio nodes: ' + error.message);
    }
}

function stopMp3() {
    try {
        // Cancel any existing animation
        if (currentVisualizerAnimation) {
            cancelAnimationFrame(currentVisualizerAnimation);
        }
        
        // Stop and clean up audio source
        if (mp3Source) {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
            
            // Revoke object URL if it exists
            if (audioPlayer.src && audioPlayer.src.startsWith('blob:')) {
                URL.revokeObjectURL(audioPlayer.src);
            }
            
            try {
                mp3Source.disconnect(analyser);
            } catch (disconnectError) {
                console.error('Error disconnecting mp3Source:', disconnectError);
            }
            
            mp3Source = null;
        }
    } catch (error) {
        console.error('Error in stopMp3:', error);
    }
}

function clearMp3() {
    try {
        // Revoke object URL if it exists
        if (audioPlayer.src && audioPlayer.src.startsWith('blob:')) {
            URL.revokeObjectURL(audioPlayer.src);
        }
        
        // Clear audio player source
        audioPlayer.src = '';
        audioPlayer.load();
        
        // Disconnect and clean up mp3Source
        if (mp3Source) {
            try {
                mp3Source.disconnect(analyser);
            } catch (disconnectError) {
                console.error("Error disconnecting mp3Source:", disconnectError);
            } finally {
                mp3Source = null;
            }
        }
        
        // Reset the MediaElementSource created flag if needed
        // This allows creating a new MediaElementSource when a new file is loaded
        mediaElementSourceCreated = false;
    } catch (error) {
        console.error('Error in clearMp3:', error);
    }
}

export { setupAudioNodes, stopMp3, clearMp3 };
