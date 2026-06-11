import './style.css';

// ==========================================================================
// 1. Initial State & Telemetry Parameters
// ==========================================================================
let currentBlockHeight = 125482;
let systemMode = "NORMAL"; // NORMAL, SOLAR_ANOMALY, CYBER_THREAT
let complianceScore = "100% SECURE";
let pingTime = "45.2ms";
let dopplerStatus = "ACTIVE";
let encryptionStatus = "ZERO-TRUST AUTH: ENCRYPTED";

const LOGS_STARTUP = [
  "INIT: Decrypted zero-trust ciphers loaded.",
  "SYNC: Synchronized ledger block height 125480.",
  "LINK: Ground station G-Alpha handshaking Node Astra-LEO-09.",
  "SECURE: Ground link verified. AES-GCM-256 communication stable."
];

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initGlowEffect();
  initTerminalLogs();
  initVisualizerCanvas();
  initLedgerStream();
  initSimulationControls();
});

/* ==========================================================================
   2. Spotlights & Glow
   ========================================================================== */
function initGlowEffect() {
  document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.status-metric-card, .visualizer-card, .sidebar-panel');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* ==========================================================================
   3. Operations Console Terminal Logs
   ========================================================================== */
function initTerminalLogs() {
  const container = document.getElementById('terminal-logs-container');
  if (!container) return;

  // Print startup logs
  LOGS_STARTUP.forEach((log, index) => {
    setTimeout(() => {
      appendTerminalLog(log);
    }, index * 600);
  });
}

function appendTerminalLog(message) {
  const container = document.getElementById('terminal-logs-container');
  if (!container) return;

  const timestamp = new Date().toISOString().slice(11, 19);
  const logDiv = document.createElement('div');
  logDiv.className = 'terminal-log-item';
  
  // Format based on type of log
  if (message.includes("ALERT") || message.includes("WARN")) {
    logDiv.classList.add('log-warning');
  } else if (message.includes("SUCCESS") || message.includes("RECOVERY")) {
    logDiv.classList.add('log-success');
  } else {
    logDiv.classList.add('log-info');
  }

  logDiv.innerHTML = `<span class="log-time">[${timestamp} UTC]</span> <span class="log-msg">${message}</span>`;
  container.appendChild(logDiv);
  container.scrollTop = container.scrollHeight;
}

/* ==========================================================================
   4. Secure Communication Visualizer (Canvas Animation Engine)
   ========================================================================== */
let visualizerWidth = 0;
let visualizerHeight = 0;

function initVisualizerCanvas() {
  const canvas = document.getElementById('visualizer-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const container = canvas.parentElement;
  
  const resizeCanvas = () => {
    visualizerWidth = canvas.width = container.clientWidth;
    visualizerHeight = canvas.height = Math.max(280, container.clientHeight);
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Define Nodes coordinates
  const getGroundNodePos = () => ({ x: 120, y: visualizerHeight - 70 });
  const getSatNodePos = () => ({ x: visualizerWidth - 140, y: 70 });

  // Animated Particles along link
  const particles = [];
  const maxParticles = 12;
  for (let i = 0; i < maxParticles; i++) {
    particles.push({
      progress: i / maxParticles, // 0 to 1
      speed: 0.006 + Math.random() * 0.003,
      size: 3 + Math.random() * 2,
      direction: Math.random() > 0.5 ? 1 : -1 // 1: GS -> Sat, -1: Sat -> GS
    });
  }

  let satAngle = 0;

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, visualizerWidth, visualizerHeight);

    const gs = getGroundNodePos();
    const sat = getSatNodePos();
    
    // Add orbital wobble to satellite
    sat.x += Math.sin(satAngle) * 8;
    sat.y += Math.cos(satAngle * 0.5) * 5;
    satAngle += 0.015;

    // A. Draw Orbit Path for Satellite
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 8]);
    ctx.ellipse(visualizerWidth / 2, visualizerHeight / 2, visualizerWidth * 0.45, visualizerHeight * 0.35, Math.PI / 12, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // B. Draw Communication Beam Line
    ctx.beginPath();
    ctx.moveTo(gs.x, gs.y);
    ctx.lineTo(sat.x, sat.y);

    let beamGlow = 6;
    let beamWidth = 2.5;

    if (systemMode === "NORMAL") {
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)'; // Emerald green
      ctx.shadowColor = '#10b981';
    } else if (systemMode === "SOLAR_ANOMALY") {
      // Flicker amber beam
      const flicker = Math.random() * 0.45 + 0.15;
      ctx.strokeStyle = `rgba(245, 158, 11, ${flicker})`; // Amber flickering
      ctx.shadowColor = '#f59e0b';
      beamGlow = 14;
      beamWidth = 3.5;
    } else if (systemMode === "CYBER_THREAT") {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)'; // Red threat
      ctx.shadowColor = '#ef4444';
      beamWidth = 3;
    }

    ctx.lineWidth = beamWidth;
    ctx.shadowBlur = beamGlow;
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset shadow

    // C. Draw Earth Station (G-Alpha)
    ctx.beginPath();
    ctx.arc(gs.x, gs.y + 30, 60, Math.PI, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();

    // Radar Dish Stand
    ctx.beginPath();
    ctx.moveTo(gs.x, gs.y);
    ctx.lineTo(gs.x - 8, gs.y + 15);
    ctx.lineTo(gs.x + 8, gs.y + 15);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();

    // Radar Dish Bowl
    ctx.beginPath();
    ctx.arc(gs.x, gs.y - 5, 18, 0.75 * Math.PI, 0.25 * Math.PI, true);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.font = '500 10px var(--font-mono)';
    ctx.fillStyle = 'var(--color-text-secondary)';
    ctx.fillText("NODE: G-ALPHA", gs.x - 38, gs.y + 35);

    // D. Draw Satellite (Astra-LEO-09)
    // Solar Panel Left
    ctx.fillStyle = 'rgba(99, 102, 241, 0.6)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.fillRect(sat.x - 38, sat.y - 5, 20, 10);
    ctx.strokeRect(sat.x - 38, sat.y - 5, 20, 10);

    // Solar Panel Right
    ctx.fillRect(sat.x + 18, sat.y - 5, 20, 10);
    ctx.strokeRect(sat.x + 18, sat.y - 5, 20, 10);

    // Connectors
    ctx.beginPath();
    ctx.moveTo(sat.x - 18, sat.y);
    ctx.lineTo(sat.x + 18, sat.y);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Sat Core Body
    ctx.beginPath();
    ctx.arc(sat.x, sat.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // Sat Glowing Core Dot
    ctx.beginPath();
    ctx.arc(sat.x, sat.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = systemMode === "NORMAL" ? '#10b981' : (systemMode === "SOLAR_ANOMALY" ? '#fbbf24' : '#ef4444');
    ctx.fill();

    ctx.font = '500 10px var(--font-mono)';
    ctx.fillStyle = 'var(--color-text-secondary)';
    ctx.fillText("ASTRA-LEO-09", sat.x - 36, sat.y + 25);

    // E. Draw Animated Data Packet Particles
    particles.forEach(p => {
      p.progress += p.speed;
      if (p.progress > 1) {
        p.progress = 0;
        p.size = 3 + Math.random() * 2;
      }

      // Calculate particle position along the straight link
      let progressVal = p.direction === 1 ? p.progress : (1 - p.progress);
      
      let px = gs.x + (sat.x - gs.x) * progressVal;
      let py = gs.y + (sat.y - gs.y) * progressVal;

      // Anomaly Jitter Effect
      if (systemMode === "SOLAR_ANOMALY") {
        px += (Math.random() - 0.5) * 22;
        py += (Math.random() - 0.5) * 22;
      }

      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, 2 * Math.PI);

      if (systemMode === "NORMAL") {
        ctx.fillStyle = 'rgba(52, 211, 153, 0.9)'; // emerald
      } else if (systemMode === "SOLAR_ANOMALY") {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.7)'; // amber warning
      } else if (systemMode === "CYBER_THREAT") {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.8)'; // red threat
      }

      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   5. Black Box Explorer / Telemetry Ledger Stream
   ========================================================================== */
function generateHexHash() {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 16; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

function initLedgerStream() {
  const tbody = document.getElementById('ledger-stream-tbody');
  if (!tbody) return;

  // Add initial telemetry entries
  for (let i = 0; i < 8; i++) {
    appendLedgerRow(tbody, false);
    currentBlockHeight++;
  }

  // Set up rolling interval (prepend a new block every 1.6 seconds)
  setInterval(() => {
    appendLedgerRow(tbody, true);
    currentBlockHeight++;
  }, 1600);
}

function appendLedgerRow(tbody, animate = true) {
  const timestamp = new Date().toISOString();
  // Z timestamp format (Zulu)
  const zuluTime = timestamp.slice(11, 19) + "Z";
  
  const hash = "0x" + generateHexHash();

  let tempVal = (294.1 + (Math.random() * 1.5 - 0.75)).toFixed(1);
  let thrustState = "IDLE";
  let radLevel = (48.2 + (Math.random() * 6 - 3)).toFixed(1);
  let vel = (7.66 + (Math.random() * 0.02 - 0.01)).toFixed(2);

  // Anomaly Override parameters
  if (systemMode === "SOLAR_ANOMALY") {
    tempVal = (298.4 + (Math.random() * 2.5)).toFixed(1);
    thrustState = "AUX_RE-ROUTE";
    radLevel = (852.4 + (Math.random() * 60)).toFixed(1);
    vel = (7.64 - (Math.random() * 0.03)).toFixed(2);
  } else if (systemMode === "CYBER_THREAT") {
    tempVal = (294.5 + (Math.random() * 0.5)).toFixed(1);
    thrustState = "ENCRYPT_LOCK";
    radLevel = (48.5 + (Math.random() * 2)).toFixed(1);
  }

  const payload = `{"temp": ${tempVal}, "thruster": "${thrustState}", "radiation": ${radLevel}, "velocity": ${vel}}`;

  const row = document.createElement('tr');
  row.className = 'ledger-row';
  if (animate) {
    row.classList.add('new-row-animate');
  }

  row.innerHTML = `
    <td class="font-mono">${currentBlockHeight.toLocaleString()}</td>
    <td class="text-cyan font-mono">${hash}</td>
    <td class="font-mono text-secondary">${zuluTime}</td>
    <td class="payload-cell font-mono">${payload}</td>
  `;

  // Prepend row (new items at top)
  tbody.insertBefore(row, tbody.firstChild);

  // Maintain clean grid (limit to 12 rows)
  while (tbody.children.length > 12) {
    tbody.removeChild(tbody.lastChild);
  }
}

/* ==========================================================================
   6. Simulation Controls (Handlers & Anomaly Recovery Cycles)
   ========================================================================== */
let solarTimeout = null;
let cyberTimeout = null;

function initSimulationControls() {
  const btnSolar = document.getElementById('btn-trigger-solar');
  const btnCyber = document.getElementById('btn-trigger-cyber');

  const complianceText = document.getElementById('compliance-text');
  const pingVal = document.getElementById('overlay-ping-val');
  const dopplerVal = document.getElementById('overlay-doppler-val');
  const encryptionVal = document.getElementById('overlay-encryption-val');
  const linkText = document.getElementById('link-status-text');
  const linkBadge = document.getElementById('link-status-badge');
  const linkPulse = document.getElementById('link-pulse-light');
  const missionDot = document.getElementById('mission-status-dot');

  if (btnSolar) {
    btnSolar.addEventListener('click', () => {
      // Clear any pending recovery timeouts
      if (solarTimeout) clearTimeout(solarTimeout);
      if (cyberTimeout) triggerCyberRecovery(); // Recover cyber immediately if active
      
      systemMode = "SOLAR_ANOMALY";
      btnSolar.disabled = true;
      btnSolar.classList.add('btn-active-amber');
      btnCyber.disabled = true; // disable cyber during solar storm

      // 1. Shift UI state values to Warning
      if (complianceText) {
        complianceText.textContent = "92% STABLE (DEGRADED)";
        complianceText.className = "status-metric-text text-amber font-numeric";
      }
      if (pingVal) pingVal.textContent = "840.4ms";
      if (dopplerVal) {
        dopplerVal.textContent = "AUX_JITTER";
        dopplerVal.className = "overlay-metric-val text-amber font-mono";
      }
      if (encryptionVal) {
        encryptionVal.textContent = "LINK_MODE: INTERFERENCE";
        encryptionVal.style.color = "#fbbf24";
      }
      if (linkText) linkText.textContent = "LINK STABILITY DEGRADED";
      if (linkBadge) linkBadge.className = "connection-status-pill badge-warning";
      if (linkPulse) linkPulse.className = "status-pulse-amber";
      if (missionDot) missionDot.className = "status-indicator-pulse pulse-amber";

      // 2. Append operational alert logs
      appendTerminalLog("ALERT: Solar flares detected at sector LEO-9.");
      appendTerminalLog("ALERT: Radiation levels exceeding 850 mrad/hr.");
      appendTerminalLog("WARN: Ground station G-Alpha experiencing Doppler shift Jitter.");
      appendTerminalLog("WARN: Ground link bandwidth throttled to auxiliary backup rerouting.");

      // 3. Trigger auto-recovery cycle (6 seconds)
      solarTimeout = setTimeout(() => {
        triggerSolarRecovery();
      }, 6000);
    });
  }

  if (btnCyber) {
    btnCyber.addEventListener('click', () => {
      // Clear any pending recovery timeouts
      if (cyberTimeout) clearTimeout(cyberTimeout);
      if (solarTimeout) triggerSolarRecovery(); // Recover solar immediately if active

      systemMode = "CYBER_THREAT";
      btnCyber.disabled = true;
      btnCyber.classList.add('btn-active-amber');
      btnSolar.disabled = true; // disable solar during cyber threat

      // 1. Shift UI state to Threat Alert
      if (complianceText) {
        complianceText.textContent = "SECURITY CHALLENGE REQUIRED";
        complianceText.className = "status-metric-text text-red font-numeric";
      }
      if (pingVal) pingVal.textContent = "45.8ms";
      if (dopplerVal) {
        dopplerVal.textContent = "ACTIVE";
        dopplerVal.className = "overlay-metric-val text-emerald font-mono";
      }
      if (encryptionVal) {
        encryptionVal.textContent = "ZERO-TRUST CHALLENGE: ACTIVE";
        encryptionVal.style.color = "#ef4444"; // red
      }
      if (linkText) linkText.textContent = "ZERO-TRUST CHALLENGE DETECTED";
      if (linkBadge) linkBadge.className = "connection-status-pill badge-danger";
      if (linkPulse) linkPulse.className = "status-pulse-red";
      if (missionDot) missionDot.className = "status-indicator-pulse pulse-red";

      // 2. Append operational threat logs
      appendTerminalLog("ALERT: Unverified cryptographic challenge mismatch on port 404.");
      appendTerminalLog("ALERT: Zero-trust compliance failed at Block " + currentBlockHeight + ".");
      appendTerminalLog("INFO: Initiating cryptographic key-pair rotation on Node Astra-LEO-09.");
      appendTerminalLog("WARN: Auxiliary links isolated to prevent telemetry spoofing.");

      // 3. Trigger auto-recovery cycle (6 seconds)
      cyberTimeout = setTimeout(() => {
        triggerCyberRecovery();
      }, 6000);
    });
  }

  // Recovery functions
  function triggerSolarRecovery() {
    systemMode = "NORMAL";
    btnSolar.disabled = false;
    btnSolar.classList.remove('btn-active-amber');
    btnCyber.disabled = false;

    // Reset UI metrics
    if (complianceText) {
      complianceText.textContent = "100% SECURE";
      complianceText.className = "status-metric-text text-emerald font-numeric";
    }
    if (pingVal) pingVal.textContent = "45.2ms";
    if (dopplerVal) {
      dopplerVal.textContent = "ACTIVE";
      dopplerVal.className = "overlay-metric-val text-emerald font-mono";
    }
    if (encryptionVal) {
      encryptionVal.textContent = "ZERO-TRUST AUTH: ENCRYPTED";
      encryptionVal.style.color = "var(--color-text-primary)";
    }
    if (linkText) linkText.textContent = "ZERO-TRUST LINK ACTIVE";
    if (linkBadge) linkBadge.className = "connection-status-pill";
    if (linkPulse) linkPulse.className = "status-pulse-green";
    if (missionDot) missionDot.className = "status-indicator-pulse";

    appendTerminalLog("RECOVERY: Solar Storm anomaly resolved. Radiation nominal.");
    appendTerminalLog("SUCCESS: Ground Link G-Alpha shifted back to primary Ka-Band path.");
  }

  function triggerCyberRecovery() {
    systemMode = "NORMAL";
    btnCyber.disabled = false;
    btnCyber.classList.remove('btn-active-amber');
    btnSolar.disabled = false;

    // Reset UI metrics
    if (complianceText) {
      complianceText.textContent = "100% SECURE";
      complianceText.className = "status-metric-text text-emerald font-numeric";
    }
    if (pingVal) pingVal.textContent = "45.2ms";
    if (dopplerVal) {
      dopplerVal.textContent = "ACTIVE";
      dopplerVal.className = "overlay-metric-val text-emerald font-mono";
    }
    if (encryptionVal) {
      encryptionVal.textContent = "ZERO-TRUST AUTH: ENCRYPTED";
      encryptionVal.style.color = "var(--color-text-primary)";
    }
    if (linkText) linkText.textContent = "ZERO-TRUST LINK ACTIVE";
    if (linkBadge) linkBadge.className = "connection-status-pill";
    if (linkPulse) linkPulse.className = "status-pulse-green";
    if (missionDot) missionDot.className = "status-indicator-pulse";

    appendTerminalLog("SUCCESS: Cipher ciphers rotated. Zero-trust validation active.");
    appendTerminalLog("RECOVERY: Connection integrity verified. Mission channels secure.");
  }
}
