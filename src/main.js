import './style.css';

// Initialize when DOM content is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initGlowEffect();
  initMarketplaceFeed();
  initHandshakeVisualizer();
  initLedgerTerminal();
});

/* ==========================================================================
   1. Interactive Card Hover Glow Effect
   ========================================================================== */
function initGlowEffect() {
  const cards = document.querySelectorAll('.dashboard-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* ==========================================================================
   2. Card 1: Bandwidth Marketplace Rotating Transactions
   ========================================================================== */
const MARKETPLACE_TRANSACTIONS = [
  { node: "Node: CubeSat-A", desc: "leased 12GHz Spectrum over Indian Ocean via Smart Contract" },
  { node: "Node: Starlink-X24", desc: "leased 400MHz Uplink over North Sea via Automated Market Maker" },
  { node: "Node: LeoSat-9", desc: "leased 1.8GHz Bandwidth over Tokyo Hub via ERC-1155 Contract" },
  { node: "Node: ExoSphere-3", desc: "leased 8.4GHz Downlink over Cape Town via Space-Multisig Vault" },
  { node: "Node: Helios-B", desc: "leased 2.5GHz Crosslink over South Pacific via Solar-AMM Pool" },
  { node: "Node: AstroNet-X", desc: "leased 15GHz Ka-Band over Amazon Basin via Smart Lease Protocol" },
  { node: "Node: OrbitX-12", desc: "leased 800MHz Telemetry channel over Greenland Ground Link" }
];

function initMarketplaceFeed() {
  const container = document.getElementById('marketplace-active-transaction');
  if (!container) return;

  let currentIndex = 0;

  setInterval(() => {
    // Fade out first
    container.style.opacity = '0';
    container.style.transform = 'translateY(-5px)';

    setTimeout(() => {
      currentIndex = (currentIndex + 1) % MARKETPLACE_TRANSACTIONS.length;
      const tx = MARKETPLACE_TRANSACTIONS[currentIndex];
      
      container.innerHTML = `
        <span class="node-tag text-indigo">${tx.node}</span>
        <p class="trans-desc">${tx.desc}</p>
      `;

      // Fade back in
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    }, 400); // Wait for fade out to complete
  }, 4000);
}

/* ==========================================================================
   3. Card 2: Zero-Trust Handshake Sine Wave Visualizer
   ========================================================================== */
const HANDSHAKE_PHASES = ["STABLE", "SYNC_OK", "ROTATING_KEYS", "AUTHENTICATING", "KEY_EXCHANGE", "SECURE_ACTIVE"];

function initHandshakeVisualizer() {
  const container = document.querySelector('.signal-visualizer-container');
  const phaseText = document.getElementById('handshake-phase-text');
  const linkText = document.getElementById('secure-link-text');
  const pulseLight = document.querySelector('.status-pulse-green');
  
  if (!container) return;

  // Replace default SVG with Canvas for high-performance fluid rendering
  container.innerHTML = '<canvas id="handshake-canvas" style="width: 100%; height: 100%; display: block;"></canvas>';
  const canvas = document.getElementById('handshake-canvas');
  const ctx = canvas.getContext('2d');

  let width = canvas.width = container.clientWidth;
  let height = canvas.height = container.clientHeight;

  // Track resizing
  window.addEventListener('resize', () => {
    if (canvas && container) {
      width = canvas.width = container.clientWidth;
      height = canvas.height = container.clientHeight;
    }
  });

  let phase = 0;
  let waveAmplitude = 12;
  let waveFrequency = 0.025;
  let waveSpeed = 0.12;

  // Animate the Handshake Status Phrases
  let currentPhaseIndex = 0;
  setInterval(() => {
    currentPhaseIndex = (currentPhaseIndex + 1) % HANDSHAKE_PHASES.length;
    const nextPhase = HANDSHAKE_PHASES[currentPhaseIndex];
    
    if (phaseText) {
      phaseText.textContent = nextPhase;
    }

    // Add some visual changes depending on the phase
    if (nextPhase === "AUTHENTICATING" || nextPhase === "KEY_EXCHANGE") {
      // Simulate busy link jitter
      waveAmplitude = 22;
      waveFrequency = 0.055;
      waveSpeed = 0.25;
      if (linkText) linkText.textContent = "SECURE_LINK: HANDSHAKE";
      if (linkText) linkText.style.color = "#fbbf24"; // Amber warning
      if (pulseLight) pulseLight.style.backgroundColor = "#fbbf24";
      if (pulseLight) pulseLight.style.boxShadow = "0 0 10px #fbbf24";
    } else {
      // Back to normal
      waveAmplitude = 12;
      waveFrequency = 0.025;
      waveSpeed = 0.12;
      if (linkText) linkText.textContent = "SECURE_LINK: ACTIVE";
      if (linkText) linkText.style.color = "var(--color-accent-emerald)";
      if (pulseLight) pulseLight.style.backgroundColor = "var(--color-accent-emerald)";
      if (pulseLight) pulseLight.style.boxShadow = "0 0 10px var(--color-accent-emerald)";
    }
  }, 3500);

  // Canvas drawing loop
  function draw() {
    ctx.clearRect(0, 0, width, height);

    const isAlertState = (phaseText && (phaseText.textContent === "AUTHENTICATING" || phaseText.textContent === "KEY_EXCHANGE"));
    const strokeColor = isAlertState ? 'rgba(251, 191, 36, 0.7)' : 'rgba(16, 185, 129, 0.75)';
    const strokeColorSecondary = isAlertState ? 'rgba(251, 191, 36, 0.2)' : 'rgba(16, 185, 129, 0.2)';

    // Draw secondary background wave (phase shifted)
    ctx.beginPath();
    ctx.strokeStyle = strokeColorSecondary;
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x++) {
      const y = height / 2 + Math.sin(x * (waveFrequency * 0.8) - phase * 0.7) * (waveAmplitude * 0.6);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw main glowing wave
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = isAlertState ? '#fbbf24' : '#10b981';
    
    for (let x = 0; x < width; x++) {
      const y = height / 2 + Math.sin(x * waveFrequency - phase) * waveAmplitude;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Reset shadow for next drawing operations
    ctx.shadowBlur = 0;

    phase += waveSpeed;
    requestAnimationFrame(draw);
  }

  draw();
}

/* ==========================================================================
   4. Card 3: Cryptographic Black Box Telemetry Ledger
   ========================================================================== */
let blockHeight = 948102;
const RAD_LEVELS = [12.4, 14.8, 11.2, 18.5, 9.6, 22.1, 15.3, 14.1];
const SAT_COORDINATES = [
  { lat: "34.05N", lon: "118.24W", alt: 524.2, speed: 7.66 },
  { lat: "51.50N", lon: "0.12W", alt: 526.8, speed: 7.65 },
  { lat: "35.67N", lon: "139.65E", alt: 521.1, speed: 7.67 },
  { lat: "22.90S", lon: "43.17W", alt: 529.4, speed: 7.64 },
  { lat: "33.86S", lon: "151.20E", alt: 525.0, speed: 7.66 },
  { lat: "55.75N", lon: "37.61E", alt: 522.9, speed: 7.67 }
];

function generateHexHash() {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 16; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

function initLedgerTerminal() {
  const terminal = document.getElementById('ledger-scrolling-terminal');
  const blockHeightText = document.getElementById('monitor-block-height');
  if (!terminal) return;

  // Add initial mock blocks
  for (let i = 0; i < 5; i++) {
    appendMockBlock(terminal, false);
  }

  // Continuously append new blocks
  const triggerNextAppend = () => {
    const randomDelay = Math.random() * 1500 + 1200; // between 1.2s and 2.7s
    setTimeout(() => {
      appendMockBlock(terminal, true);
      // Increment block height
      blockHeight++;
      if (blockHeightText) {
        blockHeightText.textContent = blockHeight.toLocaleString();
      }
      triggerNextAppend();
    }, randomDelay);
  };

  triggerNextAppend();
}

function appendMockBlock(terminal, animate = true) {
  const coord = SAT_COORDINATES[Math.floor(Math.random() * SAT_COORDINATES.length)];
  const rad = (RAD_LEVELS[Math.floor(Math.random() * RAD_LEVELS.length)] + (Math.random() * 0.8)).toFixed(1);
  const hash = generateHexHash();
  const timestamp = new Date().toISOString().slice(11, 19);

  const blockDiv = document.createElement('div');
  blockDiv.className = 'ledger-block';
  if (!animate) {
    blockDiv.style.animation = 'none';
    blockDiv.style.opacity = '1';
  }

  blockDiv.innerHTML = `
    <span class="block-meta">[${timestamp}] BLK-${blockHeight}</span>
    <span class="block-hash">0x${hash}</span>
    <div style="font-size: 0.68rem; margin-top: 0.1rem; color: var(--color-text-muted);">
      ALT: ${coord.alt}km | RAD: ${rad}mrad/h | LAT: ${coord.lat} | VEL: ${coord.speed}km/s
    </div>
  `;

  terminal.appendChild(blockDiv);

  // Keep terminal clean by limiting children
  while (terminal.children.length > 20) {
    terminal.removeChild(terminal.firstChild);
  }

  // Smooth scroll to bottom
  terminal.scrollTop = terminal.scrollHeight;
}
