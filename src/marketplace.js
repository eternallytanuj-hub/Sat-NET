import './style.css';

// ==========================================================================
// 1. Mock Database of Available Satellite Resources
// ==========================================================================
const SATELLITE_RESOURCES = [
  {
    id: "astra-leo-09",
    name: "Astra-LEO-09",
    type: "Communications Array",
    orbit: "LEO",
    zone: "North Atlantic Corridor",
    frequencyVal: "14.2 GHz",
    band: "KU_BAND",
    bandwidthVal: "500 Gbps",
    losTotalSeconds: 702, // 11m 42s
    price: 0.045,
    isLeasing: false,
    isLeased: false
  },
  {
    id: "chronos-meo-04",
    name: "Chronos-MEO-04",
    type: "Relay Node",
    orbit: "MEO",
    zone: "Asia Pacific Trans-Oceanic",
    frequencyVal: "28.4 GHz",
    band: "KA_BAND",
    bandwidthVal: "1.2 Tbps",
    losTotalSeconds: 1455, // 24m 15s
    price: 0.082,
    isLeasing: false,
    isLeased: false
  },
  {
    id: "titan-geo-01",
    name: "Titan-GEO-01",
    type: "Heavy Transponder",
    orbit: "GEO",
    zone: "Americas Geosynchronous Zone",
    frequencyVal: "9.6 GHz",
    band: "X_BAND",
    bandwidthVal: "2.4 Tbps",
    losTotalSeconds: null, // Continuous
    price: 0.150,
    isLeasing: false,
    isLeased: false
  },
  {
    id: "kepler-deep-07",
    name: "Kepler-Deep-07",
    type: "DSN Gateway",
    orbit: "DEEP_SPACE",
    zone: "Mars Transit Route Alpha",
    frequencyVal: "32.1 GHz",
    band: "KA_BAND",
    bandwidthVal: "50 Gbps",
    losTotalSeconds: 490, // 08m 10s
    price: 0.220,
    isLeasing: false,
    isLeased: false
  },
  {
    id: "zephyr-leo-14",
    name: "Zephyr-LEO-14",
    type: "High-Gain Beamformer",
    orbit: "LEO",
    zone: "Europe Ground Link Hub",
    frequencyVal: "16.5 GHz",
    band: "KU_BAND",
    bandwidthVal: "800 Gbps",
    losTotalSeconds: 328, // 05m 28s
    price: 0.060,
    isLeasing: false,
    isLeased: false
  },
  {
    id: "vanguard-meo-02",
    name: "Vanguard-MEO-02",
    type: "Computational Slot",
    orbit: "MEO",
    zone: "Indian Ocean Shipping Route",
    frequencyVal: "10.2 GHz",
    band: "X_BAND",
    bandwidthVal: "350 Gbps",
    losTotalSeconds: 1190, // 19m 50s
    price: 0.055,
    isLeasing: false,
    isLeased: false
  },
  {
    id: "aegis-geo-03",
    name: "Aegis-GEO-03",
    type: "Secure Ground Hub",
    orbit: "GEO",
    zone: "Middle East Geosynchronous",
    frequencyVal: "8.4 GHz",
    band: "X_BAND",
    bandwidthVal: "1.5 Tbps",
    losTotalSeconds: null, // Continuous
    price: 0.180,
    isLeasing: false,
    isLeased: false
  },
  {
    id: "hermes-leo-21",
    name: "Hermes-LEO-21",
    type: "Edge Router Node",
    orbit: "LEO",
    zone: "Polar Research Sector",
    frequencyVal: "29.1 GHz",
    band: "KA_BAND",
    bandwidthVal: "950 Gbps",
    losTotalSeconds: 785, // 13m 05s
    price: 0.075,
    isLeasing: false,
    isLeased: false
  }
];

// Cache initial values for resetting LOS countdowns
const INITIAL_LOS_SECONDS = SATELLITE_RESOURCES.map(s => s.losTotalSeconds);

// ==========================================================================
// 2. Active User Leases State
// ==========================================================================
const ACTIVE_LEASES = [
  {
    id: "active-lease-1",
    nodeName: "Sol-LEO-12",
    frequency: "12.5 GHz (Ku-Band)",
    orbit: "LEO",
    timeRemainingSeconds: 522, // 08m 42s
    contractHash: "0x8bf9a89d7f02c65a"
  },
  {
    id: "active-lease-2",
    nodeName: "Ares-MEO-08",
    frequency: "8.9 GHz (X-Band)",
    orbit: "MEO",
    timeRemainingSeconds: 1090, // 18m 10s
    contractHash: "0x7f38d49a622c1e84"
  }
];

// Global Stats trackers
let totalActiveLinks = 1248;
let availableBandwidth = 4.20;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initGlowEffect();
  initAnalyticsSparklines();
  initMarketplaceFilters();
  renderListings();
  renderActiveLeases();
  startGlobalTimer();
});

/* ==========================================================================
   3. Aesthetic Hover Spotlights
   ========================================================================== */
function initGlowEffect() {
  // Glow for analytics cards and listing grid cards
  document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.metric-card, .listing-card');
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
   4. Analytics Sparkline Generation
   ========================================================================== */
function initAnalyticsSparklines() {
  const statsLeases = document.getElementById('stats-active-leases');
  if (statsLeases) {
    statsLeases.textContent = totalActiveLinks.toLocaleString();
  }
}

/* ==========================================================================
   5. Listings Rendering & Filtering
   ========================================================================== */
let searchFilter = "";
let orbitFilter = "ALL";
let bandFilter = "ALL";
let losFilter = "ALL";

function initMarketplaceFilters() {
  const searchInput = document.getElementById('marketplace-search-input');
  const orbitSelect = document.getElementById('filter-orbit');
  const bandSelect = document.getElementById('filter-band');
  const losSelect = document.getElementById('filter-los');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchFilter = e.target.value.toLowerCase().trim();
      renderListings();
    });
  }

  if (orbitSelect) {
    orbitSelect.addEventListener('change', (e) => {
      orbitFilter = e.target.value;
      renderListings();
    });
  }

  if (bandSelect) {
    bandSelect.addEventListener('change', (e) => {
      bandFilter = e.target.value;
      renderListings();
    });
  }

  if (losSelect) {
    losSelect.addEventListener('change', (e) => {
      losFilter = e.target.value;
      renderListings();
    });
  }
}

function formatTime(seconds) {
  if (seconds === null) return "Continuous";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s < 10 ? '0' : ''}${s}s`;
}

function renderListings() {
  const gridContainer = document.getElementById('listings-grid-container');
  const emptyState = document.getElementById('listings-empty');
  const listingsCountText = document.getElementById('listings-count');

  if (!gridContainer) return;

  // Clear previous grid contents
  gridContainer.innerHTML = '';

  // Filter listings
  const filteredListings = SATELLITE_RESOURCES.filter(sat => {
    // Hide leased satellites
    if (sat.isLeased) return false;

    // Search query matches name, type, zone
    const matchesSearch = sat.name.toLowerCase().includes(searchFilter) ||
                          sat.type.toLowerCase().includes(searchFilter) ||
                          sat.zone.toLowerCase().includes(searchFilter) ||
                          sat.orbit.toLowerCase().includes(searchFilter);

    // Dropdown filters
    const matchesOrbit = orbitFilter === "ALL" || sat.orbit === orbitFilter;
    const matchesBand = bandFilter === "ALL" || sat.band === bandFilter;

    // Availability pass filters
    let matchesLos = true;
    if (losFilter === "IMMEDIATE") {
      matchesLos = sat.losTotalSeconds === null || sat.losTotalSeconds > 300; // > 5 min or continuous
    } else if (losFilter === "SHORT") {
      matchesLos = sat.losTotalSeconds !== null && sat.losTotalSeconds <= 1800; // <= 30 mins
    } else if (losFilter === "LONG") {
      matchesLos = sat.losTotalSeconds === null || sat.losTotalSeconds > 600; // > 10 mins
    }

    return matchesSearch && matchesOrbit && matchesBand && matchesLos;
  });

  // Update listings counter
  if (listingsCountText) {
    listingsCountText.textContent = filteredListings.length;
  }

  // Show empty state if no listings match filters
  if (filteredListings.length === 0) {
    emptyState.style.display = 'flex';
    gridContainer.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  gridContainer.style.display = 'grid';

  // Render cards
  filteredListings.forEach(sat => {
    const card = document.createElement('div');
    card.className = `listing-card ${sat.isLeasing ? 'leasing-in-progress' : ''}`;
    card.id = `sat-card-${sat.id}`;

    // Compute status indicators
    const isLOSWarning = sat.losTotalSeconds !== null && sat.losTotalSeconds < 300;
    const losColorClass = isLOSWarning ? 'text-amber' : 'text-emerald';

    card.innerHTML = `
      <div class="card-glow-element bg-indigo-glow"></div>
      
      <div class="listing-card-header">
        <div class="asset-title-group">
          <h3 class="asset-title">${sat.name}</h3>
          <span class="asset-badge orbit-${sat.orbit.toLowerCase()}">${sat.orbit}</span>
        </div>
        <span class="asset-type">${sat.type}</span>
      </div>

      <div class="listing-card-body">
        <div class="metrics-row">
          <span class="metric-label-inline">COVERAGE ZONE</span>
          <span class="metric-val-inline font-bold">${sat.zone}</span>
        </div>
        
        <div class="metrics-grid-inline">
          <div class="metrics-col">
            <span class="metric-label-inline">FREQUENCY</span>
            <span class="metric-val-inline">${sat.frequencyVal} (${sat.band.replace('_', ' ')})</span>
          </div>
          <div class="metrics-col">
            <span class="metric-label-inline">BANDWIDTH</span>
            <span class="metric-val-inline">${sat.bandwidthVal}</span>
          </div>
        </div>

        <div class="metrics-row los-status">
          <span class="metric-label-inline">LOS PASS WINDOW</span>
          <span class="metric-val-inline ${losColorClass} font-mono" id="los-timer-${sat.id}">
            ${formatTime(sat.losTotalSeconds)}
          </span>
        </div>
      </div>

      <div class="listing-card-footer">
        <div class="price-container">
          <span class="price-label">PRICE RATE</span>
          <div class="price-value">
            <span class="price-amt font-mono">${sat.price.toFixed(3)}</span>
            <span class="price-denom">COMP / min</span>
          </div>
        </div>
        
        <button class="btn-lease-action" id="btn-lease-${sat.id}" ${sat.isLeasing ? 'disabled' : ''}>
          <span>${sat.isLeasing ? 'DEPLOYING ESCROW...' : 'Instant Lease'}</span>
          <svg class="btn-lease-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    `;

    // Attach lease listener
    const leaseBtn = card.querySelector(`#btn-lease-${sat.id}`);
    if (leaseBtn) {
      leaseBtn.addEventListener('click', () => initiateLease(sat.id));
    }

    gridContainer.appendChild(card);
  });
}

/* ==========================================================================
   6. Active Operations Rendering & Interactions
   ========================================================================== */
function renderActiveLeases() {
  const tbody = document.getElementById('active-leases-tbody');
  const countBadge = document.getElementById('active-lease-count');

  if (!tbody) return;

  tbody.innerHTML = '';

  // Update table count badge
  if (countBadge) {
    countBadge.textContent = ACTIVE_LEASES.length;
  }

  if (ACTIVE_LEASES.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="no-active-leases">
          No active channels. Configure a contract above to secure orbital links.
        </td>
      </tr>
    `;
    return;
  }

  ACTIVE_LEASES.forEach(lease => {
    const row = document.createElement('tr');
    row.className = 'active-lease-row';
    row.id = `lease-row-${lease.id}`;

    row.innerHTML = `
      <td class="node-cell font-bold">${lease.nodeName}</td>
      <td class="freq-cell">${lease.frequency}</td>
      <td class="orbit-cell"><span class="table-orbit-badge orbit-${lease.orbit.toLowerCase()}">${lease.orbit}</span></td>
      <td class="timer-cell font-mono text-emerald" id="lease-timer-${lease.id}">${formatTime(lease.timeRemainingSeconds)}</td>
      <td class="hash-cell">
        <div class="hash-wrapper">
          <span class="hash-text font-mono">${lease.contractHash}</span>
          <button class="btn-copy-hash" data-hash="${lease.contractHash}" title="Copy smart contract hash" aria-label="Copy contract hash">
            <svg class="copy-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376A8.965 8.965 0 0 0 12 12.75c-.173 0-.343-.005-.512-.014m6.5 1.29a15.064 15.064 0 0 1-4.887 5.16m1.125-10.376a8.967 8.967 0 0 1-2.3 2.3M16.5 7.75h3.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125H16.5m-3-12h1.5a1.125 1.125 0 0 1 1.125 1.125v1.5a1.125 1.125 0 0 1-1.125 1.125H12M3 10.5h1.5a1.125 1.125 0 0 1 1.125 1.125v1.5a1.125 1.125 0 0 1-1.125 1.125H3" />
            </svg>
          </button>
        </div>
      </td>
      <td class="status-cell">
        <span class="status-badge-connected">
          <span class="status-pulse-green"></span>
          <span>LINK_CONNECTED</span>
        </span>
      </td>
    `;

    // Attach copy clipboard listener
    const copyBtn = row.querySelector('.btn-copy-hash');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => copyToClipboard(copyBtn, lease.contractHash));
    }

    tbody.appendChild(row);
  });
}

function copyToClipboard(button, text) {
  navigator.clipboard.writeText(text).then(() => {
    // Show visual confirmation on the copy button
    const originalSVG = button.innerHTML;
    button.innerHTML = `
      <svg class="copy-success-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="color: var(--color-accent-emerald);">
        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
      </svg>
    `;
    button.style.pointerEvents = 'none';

    setTimeout(() => {
      button.innerHTML = originalSVG;
      button.style.pointerEvents = 'auto';
    }, 1500);
  });
}

// Generate randomized hex strings for mock smart contracts
function generateContractHash() {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 16; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

/* ==========================================================================
   7. Lease Action Simulation (Handshake + Ledger Deployment)
   ========================================================================== */
function initiateLease(satId) {
  const sat = SATELLITE_RESOURCES.find(s => s.id === satId);
  if (!sat || sat.isLeasing || sat.isLeased) return;

  // 1. Enter leasing animation phase (pulse warning)
  sat.isLeasing = true;
  renderListings(); // Redraw grid with disabled and loading card

  // 2. Simulate smart contract handshake deployment delay (1200ms)
  setTimeout(() => {
    // Check if sat still exists (failsafe)
    const targetSat = SATELLITE_RESOURCES.find(s => s.id === satId);
    if (!targetSat) return;

    // Transition to leased state
    targetSat.isLeasing = false;
    targetSat.isLeased = true;

    // Generate contract hash and add to active operations list
    const newLeaseTime = targetSat.losTotalSeconds ? targetSat.losTotalSeconds : 900; // default 15m if continuous
    const newHash = generateContractHash();
    
    ACTIVE_LEASES.unshift({
      id: `active-lease-${targetSat.id}`,
      nodeName: targetSat.name,
      frequency: `${targetSat.frequencyVal} (${targetSat.band.replace('_', ' ')})`,
      orbit: targetSat.orbit,
      timeRemainingSeconds: newLeaseTime,
      contractHash: newHash
    });

    // Update global headers
    totalActiveLinks++;
    availableBandwidth = Math.max(0.1, availableBandwidth - (parseFloat(targetSat.bandwidthVal) / 1000));
    
    // Animate analytics counters
    const leasesCounter = document.getElementById('stats-active-leases');
    const bandwidthCounter = document.getElementById('stats-total-bandwidth');
    if (leasesCounter) leasesCounter.textContent = totalActiveLinks.toLocaleString();
    if (bandwidthCounter) bandwidthCounter.textContent = availableBandwidth.toFixed(2);

    // Refresh UI
    renderListings();
    renderActiveLeases();
  }, 1200);
}

/* ==========================================================================
   8. Countdown Loop (LOS passes and Active Lease times)
   ========================================================================== */
function startGlobalTimer() {
  setInterval(() => {
    let stateChanged = false;

    // A. Decrement Listings LOS windows
    SATELLITE_RESOURCES.forEach((sat, index) => {
      if (sat.losTotalSeconds !== null && !sat.isLeased) {
        sat.losTotalSeconds--;
        
        // If pass finishes, reset to original pass window to simulate orbit cycle
        if (sat.losTotalSeconds <= 0) {
          sat.losTotalSeconds = INITIAL_LOS_SECONDS[index] || 600;
        }
        
        // Update specific timer text directly in DOM for performance
        const timerSpan = document.getElementById(`los-timer-${sat.id}`);
        if (timerSpan) {
          timerSpan.textContent = formatTime(sat.losTotalSeconds);
          // Highlight warning if less than 5 minutes
          if (sat.losTotalSeconds < 300) {
            timerSpan.className = 'metric-val-inline text-amber font-mono';
          } else {
            timerSpan.className = 'metric-val-inline text-emerald font-mono';
          }
        }
      }
    });

    // B. Decrement User Active Leases
    for (let i = ACTIVE_LEASES.length - 1; i >= 0; i--) {
      const lease = ACTIVE_LEASES[i];
      lease.timeRemainingSeconds--;

      // If active lease expires, return satellite to marketplace
      if (lease.timeRemainingSeconds <= 0) {
        // Find matching satellite resource
        const matchedSat = SATELLITE_RESOURCES.find(s => s.name === lease.nodeName);
        if (matchedSat) {
          matchedSat.isLeased = false;
          // Re-deduct from stats
          totalActiveLinks = Math.max(0, totalActiveLinks - 1);
          availableBandwidth += (parseFloat(matchedSat.bandwidthVal) / 1000);
          
          const leasesCounter = document.getElementById('stats-active-leases');
          const bandwidthCounter = document.getElementById('stats-total-bandwidth');
          if (leasesCounter) leasesCounter.textContent = totalActiveLinks.toLocaleString();
          if (bandwidthCounter) bandwidthCounter.textContent = availableBandwidth.toFixed(2);
        }

        // Remove lease
        ACTIVE_LEASES.splice(i, 1);
        stateChanged = true;
      } else {
        // Update direct cell in DOM
        const timerCell = document.getElementById(`lease-timer-${lease.id}`);
        if (timerCell) {
          timerCell.textContent = formatTime(lease.timeRemainingSeconds);
        }
      }
    }

    if (stateChanged) {
      renderListings();
      renderActiveLeases();
    }
  }, 1000);
}
