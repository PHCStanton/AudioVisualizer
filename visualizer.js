import { analyser } from './audioContext.js';

// DOM elements
const visualizerSelect = document.getElementById('visualizer');
const visualizerCanvas = document.getElementById('visualizer-canvas');
const canvasCtx = visualizerCanvas.getContext('2d');

// Module state
let currentVisualizerAnimation = null;
let visualizerType = 'bar'; // Default visualizer

visualizerSelect.addEventListener('change', function() {
    visualizerType = visualizerSelect.value;
});

/**
 * Start visualization based on the selected visualizer type
 * @param {AnalyserNode} [analyserNode=analyser] - The analyser node to use for visualization
 */
function visualize(analyserNode = analyser) {
    console.log('Starting visualization with type:', visualizerType);
    
    try {
        // Cancel any existing animation
        if (currentVisualizerAnimation) {
            console.log('Canceling existing animation');
            cancelAnimationFrame(currentVisualizerAnimation);
        }

        if (visualizerType === 'bar') {
            console.log('Drawing bar graph');
            drawBarGraph(analyserNode);
        } else if (visualizerType === 'kaleidoscope') {
            console.log('Drawing kaleidoscope');
            drawKaleidoscope(analyserNode);
        } else if (visualizerType === 'kaleidoscope-b') {
            console.log('Drawing kaleidoscope B');
            drawKaleidoscopeB(analyserNode);
        } else {
            console.log('Clearing canvas');
            canvasCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
        }
    } catch (error) {
        console.error('Error in visualize:', error);
    }
}

function drawBarGraph(analyser) {
    if (!analyser) {
        console.error('No analyser provided to drawBarGraph');
        return;
    }
    
    try {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function draw() {
            try {
                currentVisualizerAnimation = requestAnimationFrame(draw);

                analyser.getByteFrequencyData(dataArray);

                canvasCtx.fillStyle = 'rgb(0, 0, 0)';
                canvasCtx.fillRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);

                const barWidth = (visualizerCanvas.width / bufferLength) * 2.5;
                let barHeight;
                let x = 0;
                const barColor = document.getElementById('bar-color').value;

                for (let i = 0; i < bufferLength; i++) {
                    barHeight = dataArray[i];

                    canvasCtx.fillStyle = barColor;
                    canvasCtx.fillRect(x, visualizerCanvas.height - barHeight / 2, barWidth, barHeight / 2);

                    x += barWidth + 1;
                }
            } catch (drawError) {
                console.error('Error in bar graph animation frame:', drawError);
                cancelAnimationFrame(currentVisualizerAnimation);
            }
        }

        draw();
    } catch (error) {
        console.error('Error setting up bar graph visualization:', error);
    }
}

function drawKaleidoscope(analyser) {
    if (!analyser) {
        console.error('No analyser provided to drawKaleidoscope');
        return;
    }
    
    try {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const centerX = visualizerCanvas.width / 2;
        const centerY = visualizerCanvas.height / 2;
        const segments = 60;
        let rotation = 0;

        function draw() {
            try {
                currentVisualizerAnimation = requestAnimationFrame(draw);

                analyser.getByteFrequencyData(dataArray);

                canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                canvasCtx.fillRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);

                for (let i = 0; i < segments; i++) {
                    const angle = (i / segments) * Math.PI * 2;
                    const frequencyIndex = i % bufferLength;
                    const barHeight = dataArray[frequencyIndex];
                    const radius = 50 + barHeight / 2;

                    const x = centerX + radius * Math.cos(angle + rotation);
                    const y = centerY + radius * Math.sin(angle + rotation);

                    const hue = (i / segments) * 360 + Date.now() % 360 / 4;
                    canvasCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;

                    canvasCtx.beginPath();
                    canvasCtx.arc(x, y, barHeight / 20, 0, Math.PI * 2);
                    canvasCtx.fill();
                }

                rotation += dataArray[0] / 1000;
            } catch (drawError) {
                console.error('Error in kaleidoscope animation frame:', drawError);
                cancelAnimationFrame(currentVisualizerAnimation);
            }
        }

        draw();
    } catch (error) {
        console.error('Error setting up kaleidoscope visualization:', error);
    }
}

function drawKaleidoscopeB(analyser) {
    if (!analyser) {
        console.error('No analyser provided to drawKaleidoscopeB');
        return;
    }
    
    try {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const centerX = visualizerCanvas.width / 2;
        const centerY = visualizerCanvas.height / 2;
        const segments = 120; // Increased segments
        let rotation = 0;

        function draw() {
            try {
                currentVisualizerAnimation = requestAnimationFrame(draw);

                analyser.getByteFrequencyData(dataArray);

                canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // Add slight trail effect
                canvasCtx.fillRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);

                for (let i = 0; i < segments; i++) {
                    const angle = (i / segments) * Math.PI * 2;
                    const frequencyIndex = i % bufferLength;
                    const barHeight = dataArray[frequencyIndex];
                    const radius = 50 + barHeight / 2;

                    const x = centerX + radius * Math.cos(angle + rotation);
                    const y = centerY + radius * Math.sin(angle + rotation);

                    const hue = (i / segments) * 360 + Date.now() % 360 / 4; // Color cycling
                    canvasCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;

                    canvasCtx.beginPath();
                    canvasCtx.arc(x, y, barHeight / 20, 0, Math.PI * 2); // Draw circles
                    canvasCtx.fill();
                }

                rotation += dataArray[0] / 1000; // Rotate based on audio
            } catch (drawError) {
                console.error('Error in kaleidoscope B animation frame:', drawError);
                cancelAnimationFrame(currentVisualizerAnimation);
            }
        }

        draw();
    } catch (error) {
        console.error('Error setting up kaleidoscope B visualization:', error);
    }
}

export { visualize, currentVisualizerAnimation };
