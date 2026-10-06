# Spectra || audio visualizer

Spectra is a sleek, browser-based audio visualizer. Built with vanilla JavaScript, the Web Audio API, and HTML5 Canvas, Spectra transforms any audio file into a real-time, symmetrical circular waveform.

## Features

* **Real-Time Audio Analysis:** Utilizes the Web Audio API (`AnalyserNode`) to extract frequency data and drive visual geometry.
* **High-Performance Canvas Rendering:** Uses pure mathematical paths rather than CSS shadows or DOM elements to maintain 60fps even with high-resolution FFT sizes.
* **Colors:** Live-updating dual accent color pickers.
* **Dynamics:** Adjust amplitude scaling and audio smoothing (FFT time constant) on the fly.
* **Geometry:** Control base radius, line thickness, and continuous canvas rotation.

* **Audio Controls:** Upload local MP3/WAV files. Includes a full-width scrubbing progress bar.
* **Modern UI/UX:** Floating, translucent docks over a full-screen canvas. Fully responsive with a collapsible menu for mobile devices.

## Tech Stack

* HTML5 Canvas
* Web Audio API
* Vanilla JavaScript
* CSS3

## Usage Parameters

* **Amplitude Scale:** Multiplies the height of the waveform spikes.
* **Audio Smoothing:** Controls how quickly the bars fall back down (higher = smoother, lower = more jittery/reactive).
* **Base Radius:** Sets the resting size of the circle as a percentage of the screen size.
* **Line Thickness:** Adjusts the stroke width of the canvas path.
* **Rotation Speed:** Adds a constant spin to the visualizer (0.0 keeps it perfectly stationary).

## How to access

Spectra is a published git hub page website so it can be accessed simply by using the link below:

``https://kaithegreat-123.github.io/spectra/``

Copy paste in your browser and enjoy!

## Author
**Made by Kai**
