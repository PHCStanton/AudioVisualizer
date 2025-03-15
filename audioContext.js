// Create a single shared AudioContext instance
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Create a single shared analyser node
const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;

// Connect the analyser to the destination
analyser.connect(audioContext.destination);

// Export the shared instances
export { audioContext, analyser };
