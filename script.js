/**
 * ------------------------------------------------
 * PART 1: CONFIGURATION & STATE
 * ------------------------------------------------
 */
const config = {
    particleCount: 15000,
    particleSize: 0.15,
    baseColor: 0x00d2ff,
    lerpSpeed: 0.08, // Speed of morphing
    reactivity: 0.1  // Speed of hand reaction
};

const state = {
    handDetected: false,
    handClosedStrength: 0, // 0 = Open, 1 = Closed
    handPosition: { x: 0, y: 0, z: 0 }, // Normalized coordinates (-1 to 1)
    fingertips: [], // Array of {x, y, z}
    currentShape: 'sphere',
    colorMode: 'static', // 'static' or 'rainbow'
    targetPositions: [], // Float32Array
    originalPositions: [] // Float32Array
};

/**
 * ------------------------------------------------
 * PART 2: THREE.JS SETUP
 * ------------------------------------------------
 */
const canvas = document.querySelector('#c');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
scene.fog = new THREE.FogExp2(0x050505, 0.03);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 8;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// --- PARTICLE SYSTEM CREATION ---

// Generate a soft glow texture programmatically
function getTexture() {
    const size = 32;
    const cvs = document.createElement('canvas');
    cvs.width = size; cvs.height = size;
    const ctx = cvs.getContext('2d');
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.3)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,size,size);
    const texture = new THREE.Texture(cvs);
    texture.needsUpdate = true;
    return texture;
}

const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(config.particleCount * 3);

// Initialize arrays
state.targetPositions = new Float32Array(config.particleCount * 3);
state.originalPositions = new Float32Array(config.particleCount * 3);

// Fill with random initial data
for (let i = 0; i < config.particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
    state.targetPositions[i] = positions[i];
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
    size: config.particleSize,
    color: config.baseColor,
    map: getTexture(),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

/**
 * ------------------------------------------------
 * PART 3: SHAPE GENERATORS (MATH)
 * ------------------------------------------------
 */
function generateShape(type) {
    const arr = state.targetPositions;
    const count = config.particleCount;

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        let x, y, z;

        if (type === 'sphere') {
            const r = 4;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            x = r * Math.sin(phi) * Math.cos(theta);
            y = r * Math.sin(phi) * Math.sin(theta);
            z = r * Math.cos(phi);
        } 
        else if (type === 'cube') {
            const size = 5;
            x = (Math.random() - 0.5) * size;
            y = (Math.random() - 0.5) * size;
            z = (Math.random() - 0.5) * size;
        }
        else if (type === 'torus') {
            const R = 3.5; // Major radius
            const r = 1.2; // Minor radius
            const u = Math.random() * Math.PI * 2;
            const v = Math.random() * Math.PI * 2;
            x = (R + r * Math.cos(v)) * Math.cos(u);
            y = (R + r * Math.cos(v)) * Math.sin(u);
            z = r * Math.sin(v);
        }
        else if (type === 'helix') {
            const t = i / count * 20; // Turns
            x = Math.cos(t * 3) * 2;
            y = (i / count - 0.5) * 10;
            z = Math.sin(t * 3) * 2;
            // Add some random scatter volume
            x += (Math.random() - 0.5);
            z += (Math.random() - 0.5);
        }
        else if (type === 'love') {
            // Heart shape formula: 
            // x = 16 sin^3(t)
            // y = 13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t)
            const t = Math.random() * Math.PI * 2;
            x = 16 * Math.pow(Math.sin(t), 3);
            y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
            z = (Math.random() - 0.5) * 5;
            
            // Scale down for 3D scene
            const scale = 0.25;
            x *= scale;
            y *= scale;
        }
        else if (type === 'dna') {
            const t = (i / count) * Math.PI * 4; // 2 full turns
            const side = i % 2 === 0 ? 1 : -1;
            const r = 2;
            x = Math.cos(t) * r * side;
            y = (i / count - 0.5) * 12;
            z = Math.sin(t) * r * side;
            
            // Add some noise for volume
            x += (Math.random() - 0.5) * 0.5;
            z += (Math.random() - 0.5) * 0.5;
        }
        else if (type === 'galaxy') {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 8;
            const arms = 3;
            const armAngle = (Math.floor(Math.random() * arms) / arms) * Math.PI * 2;
            const spiral = radius * 0.8;
            
            x = Math.cos(angle + spiral + armAngle) * radius;
            y = (Math.random() - 0.5) * (radius * 0.2); // Flatness
            z = Math.sin(angle + spiral + armAngle) * radius;
        }
        else if (type === 'pyramid') {
            const size = 6;
            const r1 = Math.random();
            const r2 = Math.random();
            const face = Math.floor(Math.random() * 5); // 4 sides + 1 base
            
            if (face === 0) { // Base
                x = (r1 - 0.5) * size;
                y = -size / 3;
                z = (r2 - 0.5) * size;
            } else { // 4 Slanted faces
                const h = r1 * size;
                const offset = (1 - r1) * (size / 2);
                const sideR = (r2 - 0.5) * 2; // -1 to 1
                
                if (face === 1) { x = offset; z = sideR * offset; y = h - size/3; }
                if (face === 2) { x = -offset; z = sideR * offset; y = h - size/3; }
                if (face === 3) { z = offset; x = sideR * offset; y = h - size/3; }
                if (face === 4) { z = -offset; x = sideR * offset; y = h - size/3; }
                
                y = (1 - r1) * size - size/2;
            }
        }
        else if (type === 'star') {
            const t = Math.random() * Math.PI * 2;
            const rBase = Math.random() * 5;
            const spikes = 5;
            // Star radius formula: r = a + b * cos(k * theta)
            const r = 3 + 2 * Math.cos(spikes * t);
            const noise = (Math.random()) * r;
            x = Math.cos(t) * noise;
            y = Math.sin(t) * noise;
            z = (Math.random() - 0.5) * 2;
        }

        arr[i3] = x;
        arr[i3 + 1] = y;
        arr[i3 + 2] = z;
    }
}

// Initial Shape
generateShape('sphere');

/**
 * ------------------------------------------------
 * PART 4: ANIMATION LOOP & PHYSICS
 * ------------------------------------------------
 */
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    const positions = geometry.attributes.position.array;
    const targets = state.targetPositions;

    // Rotate entire system slowly
    particles.rotation.y += 0.005;
    particles.rotation.z += 0.002;

    // Follow hand position
    if (state.handDetected) {
        // Map normalized hand position to 3D world space
        const targetX = state.handPosition.x * 12;
        const targetY = state.handPosition.y * 8;
        
        particles.position.x += (targetX - particles.position.x) * config.lerpSpeed;
        particles.position.y += (targetY - particles.position.y) * config.lerpSpeed;
    } else {
        // Return to center if no hand detected
        particles.position.x *= 0.95;
        particles.position.y *= 0.95;
    }

    // HAND INTERACTION LOGIC
    // 0.0 = Open (Target Shape), 1.0 = Closed (Implode/Contract)
    const handFactor = state.handClosedStrength; 

    for (let i = 0; i < config.particleCount; i++) {
        const i3 = i * 3;
        
        // 1. Get Base Target from Shape
        let tx = targets[i3];
        let ty = targets[i3 + 1];
        let tz = targets[i3 + 2];

        // 2. Apply Hand Influence
        if (state.handDetected) {
            // Contraction Modifier
            const contraction = 1 - (handFactor * 0.9);
            tx = tx * contraction;
            ty = ty * contraction;
            tz = tz * contraction;

            // --- MAGNET FINGERS LOGIC ---
            // Each finger tip pulls nearby particles
            state.fingertips.forEach(f => {
                const fx = f.x * 12; // Map to world space
                const fy = f.y * 8;
                const fz = 0; // Keeping depth simple for now

                const dx = fx - positions[i3];
                const dy = fy - positions[i3+1];
                const dz = fz - positions[i3+2];
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

                if (dist < 3) {
                    const force = (3 - dist) * 0.15;
                    tx += dx * force;
                    ty += dy * force;
                    tz += dz * force;
                }
            });
        }

        // 3. Move current position towards target (LERP)
        positions[i3]     += (tx - positions[i3]) * config.lerpSpeed;
        positions[i3 + 1] += (ty - positions[i3 + 1]) * config.lerpSpeed;
        positions[i3 + 2] += (tz - positions[i3 + 2]) * config.lerpSpeed;
    }

    // Dynamic Color Mode
    if (state.colorMode === 'rainbow') {
        const hue = (time * 0.1) % 1;
        material.color.setHSL(hue, 0.8, 0.5);
    }

    geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
}

/**
 * ------------------------------------------------
 * PART 5: MEDIAPIPE HAND TRACKING
 * ------------------------------------------------
 */
const videoElement = document.getElementById('input_video');
const previewCanvas = document.getElementById('webcam-preview');
const previewCtx = previewCanvas.getContext('2d');
const statusText = document.getElementById('status');

function onResults(results) {
    // Draw Webcam Preview
    previewCtx.save();
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    previewCtx.drawImage(results.image, 0, 0, previewCanvas.width, previewCanvas.height);
    
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        state.handDetected = true;
        statusText.innerText = "Hand Detected";
        statusText.classList.add("active-hand");

        // Get the first hand
        const landmarks = results.multiHandLandmarks[0];

        // Track hand position (using wrist or middle finger base)
        // MediaPipe coords are 0 to 1, we map to -1 to 1
        const wrist = landmarks[0];
        state.handPosition.x = -(wrist.x - 0.5) * 2; // Inverted for mirror effect
        state.handPosition.y = -(wrist.y - 0.5) * 2; // Inverted for standard Y-up

        // Track fingertips (Thumb tip to Pinky tip: 4, 8, 12, 16, 20)
        const tipIds = [4, 8, 12, 16, 20];
        state.fingertips = tipIds.map(id => {
            const tip = landmarks[id];
            return {
                x: -(tip.x - 0.5) * 2,
                y: -(tip.y - 0.5) * 2,
                z: tip.z
            };
        });

        // Draw skeleton on preview
        drawConnectors(previewCtx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 2});

        // --- GESTURE MATH ---
        
        // 1. "Pinch" or "Finger Heart" Gesture Detection (distance between thumb and index tip)
        const dxLove = thumbTip.x - indexTip.x;
        const dyLove = thumbTip.y - indexTip.y;
        const loveDist = Math.sqrt(dxLove * dxLove + dyLove * dyLove);

        // If thumb and index tip are very close (threshold)
        if (loveDist < 0.05) {
            if (state.currentShape !== 'love') {
                setShape('love');
                statusText.innerText = "❤️ LOVE DETECTED ❤️";
                material.color.set(0xff4d6d); // Change to a pink/red color
                document.getElementById('colorPicker').value = "#ff4d6d";
            }
        }

        // 2. Calculate "Openness" vs "Closedness"
        // Distance between Wrist(0) and Middle Finger Tip(12)
        const dx = middleTip.x - wrist.x;
        const dy = middleTip.y - wrist.y;
        const distance = Math.sqrt(dx*dx + dy*dy);

        // Determine thresholds based on observation
        // Open hand usually > 0.3, Closed Fist < 0.15 (normalized coords)
        // We map this range to 0.0 - 1.0
        const minOpen = 0.15; // Fist
        const maxOpen = 0.35; // Open Palm

        let strength = (distance - minOpen) / (maxOpen - minOpen);
        strength = Math.max(0, Math.min(1, strength)); // Clamp 0 to 1

        // Invert: We want 1.0 to be "Closed" (Force applied) and 0.0 to be "Open" (Relaxed)
        // Currently strength is 1 when Open.
        const closedFactor = 1.0 - strength;

        // Smooth out the value to prevent jitter
        state.handClosedStrength += (closedFactor - state.handClosedStrength) * 0.2;

    } else {
        state.handDetected = false;
        statusText.innerText = "No hand detected";
        statusText.classList.remove("active-hand");
        // Slowly return to open state if hand lost
        state.handClosedStrength += (0 - state.handClosedStrength) * 0.05;
    }
    previewCtx.restore();
}

// Initialize MediaPipe Hands
const hands = new Hands({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.onResults(onResults);

/**
 * ------------------------------------------------
 * PART 6: UI INTERACTIONS & EVENTS
 * ------------------------------------------------
 */

// Shape Switching
function setShape(shape) {
    state.currentShape = shape;
    generateShape(shape);
    
    // UI Active State
    document.querySelectorAll('.btn-grid button').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-${shape}`).classList.add('active');
}

// Color Picker
const colorPicker = document.getElementById('colorPicker');
if (colorPicker) {
    colorPicker.addEventListener('input', (e) => {
        state.colorMode = 'static';
        material.color.set(e.target.value);
    });
}

function toggleRainbowMode() {
    state.colorMode = state.colorMode === 'rainbow' ? 'static' : 'rainbow';
    if (state.colorMode === 'static') {
        material.color.set(document.getElementById('colorPicker').value);
    }
}

// Fullscreen
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start App Flow
async function startApp() {
    document.getElementById('loader').style.display = 'none';
    
    // Start Camera
    const cameraUtils = new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({image: videoElement});
        },
        width: 640,
        height: 480
    });
    cameraUtils.start();

    // Start Animation Loop
    animate();
}

// Expose functions to global scope for HTML attributes
window.startApp = startApp;
window.setShape = setShape;
window.toggleFullScreen = toggleFullScreen;
window.toggleRainbowMode = toggleRainbowMode;
