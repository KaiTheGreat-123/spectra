const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');

let audioCtx, analyser, source, audio;
let isPlaying = false;
let isSeeking = false; 

let bufferLength = 256;
let dataArray = new Uint8Array(bufferLength);

const btnPlay = document.getElementById('btnPlay');
const btnStop = document.getElementById('btnStop');
const statusText = document.getElementById('statusText');
const audioUpload = document.getElementById('audioUpload');

const colorPrimary = document.getElementById('colorPrimary');
const colorSecondary = document.getElementById('colorSecondary');

const slScale = document.getElementById('slScale');
const slSmoothing = document.getElementById('slSmoothing');
const slRadius = document.getElementById('slRadius');
const slThickness = document.getElementById('slThickness');
const slRotation = document.getElementById('slRotation');

const progressBar = document.getElementById('progressBar');
const timeCurrent = document.getElementById('timeCurrent');
const timeTotal = document.getElementById('timeTotal'); 

let visualScale = parseFloat(slScale.value);
let visualRadius = parseFloat(slRadius.value) / 100;
let visualThickness = parseFloat(slThickness.value);
let visualRotation = parseFloat(slRotation.value);
let rotationAngle = 0; 

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateThemeColors() {
  document.documentElement.style.setProperty('--c-primary', colorPrimary.value);
  document.documentElement.style.setProperty('--c-secondary', colorSecondary.value);
}
colorPrimary.addEventListener('input', updateThemeColors);
colorSecondary.addEventListener('input', updateThemeColors);

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function initAudioSystem() {
  if (audioCtx) return; 
  
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = parseFloat(slSmoothing.value);
  
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  
  audio = new Audio();
  audio.crossOrigin = "anonymous"; 
  
  source = audioCtx.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  
  audio.addEventListener('loadedmetadata', () => {
    progressBar.max = audio.duration;
    timeTotal.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    if (!isSeeking) {
      progressBar.value = audio.currentTime;
      timeCurrent.textContent = formatTime(audio.currentTime);
    }
  });
  
  audio.addEventListener('ended', () => {
    btnStop.click();
    progressBar.value = 0;
    timeCurrent.textContent = "0:00";
  });

  audio.addEventListener('error', () => {
    setStatus('ERR: FAILED TO LOAD AUDIO', colorSecondary.value);
    btnStop.click();
  });
}

function loadAudioSource(src, sourceName) {
  initAudioSystem();
  if (isPlaying) btnStop.click(); 
  audio.src = src;
  audio.load();
  setStatus(`SYS: ${sourceName} LOADED`, 'var(--text-main)');
}

function setStatus(msg, color) {
  statusText.textContent = msg;
  statusText.style.color = color;
}

progressBar.addEventListener('input', () => {
  isSeeking = true;
  timeCurrent.textContent = formatTime(progressBar.value);
});

progressBar.addEventListener('change', () => {
  if (audio) {
    audio.currentTime = progressBar.value;
  }
  isSeeking = false;
});

audioUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const objectURL = URL.createObjectURL(file);
    loadAudioSource(objectURL, 'LOCAL FILE');
  }
});

btnPlay.addEventListener('click', () => {
  if (!audio || !audio.src) {
    setStatus('ERR: NO AUDIO SELECTED', colorSecondary.value);
    return;
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  audio.play();
  isPlaying = true;
  
  btnPlay.classList.add('active');
  btnStop.classList.remove('active');
  setStatus('SYS: VISUALIZING', colorPrimary.value);
});

btnStop.addEventListener('click', () => {
  if (audio) {
    audio.pause();
  }
  isPlaying = false;
  
  btnStop.classList.add('active');
  btnPlay.classList.remove('active');
  setStatus('SYS: VISUALIZER STOPPED', colorSecondary.value);
});

slScale.addEventListener('input', (e) => {
  visualScale = parseFloat(e.target.value);
  e.target.previousElementSibling.querySelector('.slider-value').textContent = visualScale.toFixed(1);
});

slSmoothing.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  if (analyser) analyser.smoothingTimeConstant = val;
  e.target.previousElementSibling.querySelector('.slider-value').textContent = val.toFixed(2);
});

slRadius.addEventListener('input', (e) => {
  visualRadius = parseFloat(e.target.value) / 100;
  e.target.previousElementSibling.querySelector('.slider-value').textContent = e.target.value + '%';
});

slThickness.addEventListener('input', (e) => {
  visualThickness = parseFloat(e.target.value);
  e.target.previousElementSibling.querySelector('.slider-value').textContent = e.target.value + 'px';
});

slRotation.addEventListener('input', (e) => {
  visualRotation = parseFloat(e.target.value);
  e.target.previousElementSibling.querySelector('.slider-value').textContent = visualRotation.toFixed(1);
});

function animateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  
  if (isPlaying && analyser) {
    analyser.getByteFrequencyData(dataArray);
  } else if (analyser) {
    for (let i = 0; i < bufferLength; i++) {
      dataArray[i] = Math.max(0, dataArray[i] - 5);
    }
  }
  
  rotationAngle += (0.005 * visualRotation);
  
  ctx.save();
  ctx.translate(cx, cy);
  
  if (visualRotation > 0) {
    ctx.rotate(rotationAngle);
  }
  
  const baseRadius = Math.min(canvas.width, canvas.height) * visualRadius;
  
  drawWaveformHalf(baseRadius, 1, colorPrimary.value, colorSecondary.value, visualThickness);
  drawWaveformHalf(baseRadius, -1, colorPrimary.value, colorSecondary.value, visualThickness);

  ctx.restore();
  requestAnimationFrame(animateCanvas);
}

function drawWaveformHalf(baseRadius, direction, color1, color2, thickness) {
  const usefulBins = Math.floor(bufferLength * 0.75); 
  const angleStep = Math.PI / usefulBins; 
  
  ctx.beginPath();
  
  for (let i = 0; i < usefulBins; i++) {
    const value = dataArray ? dataArray[i] : 0;
    const percent = value / 255;
    const amplitude = percent * 200 * visualScale;
    
    const theta = (i * angleStep * direction) - (Math.PI / 2);
    
    const r = baseRadius + amplitude;
    const x = Math.cos(theta) * r;
    const y = Math.sin(theta) * r;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  const gradient = ctx.createLinearGradient(-baseRadius * 2, 0, baseRadius * 2, 0);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  
  ctx.strokeStyle = gradient;
  ctx.lineWidth = thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}
animateCanvas();

const btnToggleMenu = document.getElementById('btnToggleMenu');
const sidebar = document.getElementById('sidebar');

function setMenu(open) {
  sidebar.classList.toggle('open', open);
  btnToggleMenu.textContent = open ? 'X CLOSE' : '≡ MENU';
}

btnToggleMenu.addEventListener('click', () => {
  setMenu(!sidebar.classList.contains('open'));
});

canvas.addEventListener('click', () => setMenu(false));