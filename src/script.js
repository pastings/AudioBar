const lockToggle = document.getElementById('lock-toggle');
const lockIcon = document.getElementById('lock-icon');
const settingsToggle = document.getElementById('settings-toggle');
const barContainer = document.getElementById('bar-container');
const visualizerMesh = document.getElementById('visualizer-mesh');
const settingsMesh = document.getElementById('settings-mesh');
const artistText = document.getElementById('artist-text');
const swatches = document.querySelectorAll('.color-swatch');
const sensitivitySlider = document.getElementById('sensitivity-slider');

let isLocked = false;
let isSettingsOpen = false;
const BAR_COUNT = 64;
const barsArray = [];

const root = document.documentElement;
const savedColor = localStorage.getItem('ab-color') || '#bc13fe';
const savedGlow = localStorage.getItem('ab-glow') || 'rgba(188, 19, 254, 0.5)';
let currentSensitivity = parseFloat(localStorage.getItem('ab-sens')) || 1.2;

root.style.setProperty('--accent', savedColor);
root.style.setProperty('--accent-glow', savedGlow);
sensitivitySlider.value = currentSensitivity;

swatches.forEach(swatch => {
    if(swatch.dataset.hex === savedColor) swatch.classList.add('active');
});

for (let i = 0; i < BAR_COUNT; i++) {
    const bar = document.createElement('div');
    bar.classList.add('v-bar');
    visualizerMesh.appendChild(bar);
    barsArray.push(bar);
}

lockToggle.addEventListener('click', () => {
    isLocked = !isLocked;
    barContainer.classList.toggle('locked', isLocked);
    lockIcon.className = isLocked ? 'ri-lock-fill' : 'ri-lock-unlock-line';
});

settingsToggle.addEventListener('click', () => {
    isSettingsOpen = !isSettingsOpen;
    visualizerMesh.classList.toggle('active', !isSettingsOpen);
    settingsMesh.classList.toggle('active', isSettingsOpen);
    settingsToggle.classList.toggle('active', isSettingsOpen);
    artistText.textContent = isSettingsOpen ? "CONFIGURATION" : "ACTIVE LISTENER";
});

swatches.forEach(swatch => {
    swatch.addEventListener('click', (e) => {
        const hex = e.target.dataset.hex;
        const glow = e.target.dataset.glow;
        root.style.setProperty('--accent', hex);
        root.style.setProperty('--accent-glow', glow);
        localStorage.setItem('ab-color', hex);
        localStorage.setItem('ab-glow', glow);
        swatches.forEach(s => s.classList.remove('active'));
        e.target.classList.add('active');
    });
});

sensitivitySlider.addEventListener('input', (e) => {
    currentSensitivity = parseFloat(e.target.value);
    localStorage.setItem('ab-sens', currentSensitivity);
});

async function initSystemAudioCapture() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: { mandatory: { chromeMediaSource: 'desktop' } },
            video: { mandatory: { chromeMediaSource: 'desktop' } }
        });

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyzer = audioContext.createAnalyser();
        
        analyzer.fftSize = 256; 
        analyzer.smoothingTimeConstant = 0.85;
        source.connect(analyzer);

        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function renderFrame() {
            requestAnimationFrame(renderFrame);
            
            if (!isSettingsOpen) {
                analyzer.getByteFrequencyData(dataArray);

                for (let i = 0; i < BAR_COUNT; i++) {
                    let rawValue = dataArray[i * 2] || 0; 
                    let percent = ((rawValue / 255) * 100) * currentSensitivity;
                    
                    percent = Math.min(100, percent);
                    
                    barsArray[i].style.height = `${Math.max(4, percent)}%`;

                    if (percent > 15) {
                        barsArray[i].classList.add('active-freq');
                    } else {
                        barsArray[i].classList.remove('active-freq');
                    }

                    if (percent > 75) {
                        barsArray[i].classList.add('peak');
                    } else {
                        barsArray[i].classList.remove('peak');
                    }
                }
            }
        }
        renderFrame();
    } catch (err) {
        console.error("Audio error:", err);
    }
}

window.addEventListener('DOMContentLoaded', initSystemAudioCapture);
