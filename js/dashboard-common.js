/* ============================================
   ClimaIQ Dashboard — Shared Components
   Sidebar, panel factories, theme config
   ============================================ */

const DashboardCommon = (() => {

  // --- Dashboard definitions ---
  const dashboards = [
    { group: 'Operations', items: [
      { id: 'wildfire-overview', label: 'Wildfire Overview', icon: '&#x1F525;' },
      { id: 'system-performance', label: 'System Performance', icon: '&#x2699;' },
    ]},
    { group: 'Data Ingestion', items: [
      { id: 'ingestion-latency', label: 'Latency & Fidelity', icon: '&#x26A1;' },
      { id: 'latency-fidelity-enhanced', label: 'Enhanced Latency', icon: '&#x1F4CA;' },
    ]},
    { group: 'Data Storage', items: [
      { id: 'storage-tiers', label: 'Storage Tiers', icon: '&#x1F4BE;' },
      { id: 'storage-lifecycle', label: 'Storage Lifecycle', icon: '&#x1F504;' },
      { id: 'platform-health', label: 'Platform Health', icon: '&#x1F3C6;' },
    ]},
    { group: 'Analytics', items: [
      { id: 'analytics-platform', label: 'Analytics Platform', icon: '&#x1F9E0;' },
    ]},
  ];

  // --- Chart.js global defaults ---
  const COLORS = {
    fire: '#ff6b35',
    cyan: '#00bcd4',
    amber: '#ffa726',
    red: '#ff3d00',
    green: '#4caf50',
    purple: '#ab47bc',
    blue: '#5794f2',
    grafanaGreen: '#73bf69',
    grafanaYellow: '#ff9830',
    grafanaRed: '#f2495c',
  };

  const SERIES_COLORS = ['#ff6b35', '#00bcd4', '#ffa726', '#ff3d00', '#4caf50', '#ab47bc', '#5794f2', '#b877d9', '#73bf69', '#ff9830'];

  function applyChartDefaults() {
    if (typeof Chart === 'undefined') return;
    Chart.defaults.color = '#a0a0b0';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.font.size = 11;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.pointStyleWidth = 8;
    Chart.defaults.plugins.legend.labels.padding = 16;
    Chart.defaults.plugins.tooltip.backgroundColor = '#1e1e2e';
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.1)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.titleColor = '#f0f0f5';
    Chart.defaults.plugins.tooltip.bodyColor = '#a0a0b0';
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 6;
    Chart.defaults.animation = { duration: 800, easing: 'easeOutQuart' };
  }

  // --- Get current page id ---
  function getCurrentPageId() {
    const path = window.location.pathname;
    const file = path.split('/').pop().replace('.html', '');
    return file || 'wildfire-overview';
  }

  // --- Inject sidebar ---
  function initSidebar() {
    const currentId = getCurrentPageId();
    let html = `
      <div class="sidebar-header">
        <a href="../index.html" class="sidebar-logo">
          <span class="logo-clima">Clima</span><span class="logo-iq">IQ</span>
          <span class="logo-dash">Dash</span>
        </a>
      </div>
      <nav class="sidebar-nav">`;

    dashboards.forEach(group => {
      html += `<div class="sidebar-group">
        <div class="sidebar-group-label">${group.group}</div>`;
      group.items.forEach(item => {
        const active = item.id === currentId ? ' active' : '';
        html += `<a href="${item.id}.html" class="sidebar-link${active}">
          <span class="sidebar-link-icon">${item.icon}</span>
          ${item.label}
        </a>`;
      });
      html += `</div>`;
    });

    html += `</nav>
      <div class="sidebar-back">
        <a href="../index.html">&larr; Back to ClimaIQ.tech</a>
      </div>`;

    const sidebar = document.querySelector('.dashboard-sidebar');
    if (sidebar) sidebar.innerHTML = html;

    // Mobile toggle
    const toggle = document.querySelector('.sidebar-toggle');
    const overlay = document.querySelector('.sidebar-overlay');
    if (toggle) {
      toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
      });
    }
    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
      });
    }
  }

  // --- Inject top bar ---
  function initTopbar(title) {
    const topbar = document.querySelector('.dashboard-topbar');
    if (!topbar) return;
    topbar.innerHTML = `
      <div class="topbar-breadcrumb">
        <span class="crumb">Dashboards</span>
        <span class="crumb-sep">&#x276F;</span>
        <span class="crumb-active">${title}</span>
      </div>
      <div class="topbar-meta">
        <div class="topbar-live">
          <span class="topbar-live-dot"></span>
          LIVE
        </div>
        <span class="topbar-refresh">Auto-refresh: 5s</span>
      </div>`;
  }

  // --- Stat panel component ---
  function createStatPanel(container, { title, value, unit, color, label }) {
    const colorClass = color ? `stat-${color}` : '';
    const bgClass = color ? `stat-bg-${color}` : '';
    container.innerHTML = `
      <div class="panel-header"><span class="panel-title">${title}</span></div>
      <div class="panel-body stat-panel ${colorClass}">
        <div class="stat-value">${value}<span class="stat-unit">${unit || ''}</span></div>
        ${label ? `<div class="stat-label">${label}</div>` : ''}
      </div>`;
    if (color) container.classList.add(bgClass);
  }

  // --- Update stat value (for live updates) ---
  function updateStatValue(panelEl, newValue) {
    const el = panelEl.querySelector('.stat-value');
    if (!el) return;
    const unit = el.querySelector('.stat-unit');
    const unitHtml = unit ? unit.outerHTML : '';
    el.innerHTML = newValue + unitHtml;
  }

  // --- Table panel component ---
  function createTablePanel(container, { title, columns, rows }) {
    let html = `<div class="panel-header"><span class="panel-title">${title}</span></div>
      <div class="panel-body" style="padding:0;overflow-x:auto;">
        <table class="panel-table"><thead><tr>`;
    columns.forEach(col => {
      html += `<th>${col}</th>`;
    });
    html += `</tr></thead><tbody>`;
    rows.forEach(row => {
      html += '<tr>';
      row.forEach(cell => {
        html += `<td>${cell}</td>`;
      });
      html += '</tr>';
    });
    html += `</tbody></table></div>`;
    container.innerHTML = html;
  }

  // --- Gauge component (SVG ring) ---
  function createGaugePanel(container, { title, value, max, unit, thresholds }) {
    const pct = Math.min(value / max * 100, 100);
    const r = 52;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    let color = '#73bf69';
    if (thresholds) {
      for (const t of thresholds) {
        if (value >= t.value) color = t.color;
      }
    }
    container.innerHTML = `
      <div class="panel-header"><span class="panel-title">${title}</span></div>
      <div class="panel-body gauge-wrap">
        <div class="gauge-ring">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle class="gauge-bg" cx="60" cy="60" r="${r}"/>
            <circle class="gauge-fill" cx="60" cy="60" r="${r}"
              stroke="${color}" stroke-dasharray="${circ}" stroke-dashoffset="${offset}"/>
          </svg>
          <div class="gauge-center">
            <span class="gauge-value" style="color:${color}">${value}</span>
            <span class="gauge-label">${unit || ''}</span>
          </div>
        </div>
      </div>`;
  }

  // --- Bar gauge component ---
  function createBarGauge(container, { title, items }) {
    let html = `<div class="panel-header"><span class="panel-title">${title}</span></div>
      <div class="panel-body">`;
    items.forEach(item => {
      const pct = Math.min((item.value / item.max) * 100, 100);
      html += `<div class="bar-gauge-item">
        <span class="bar-gauge-label">${item.label}</span>
        <div class="bar-gauge-track">
          <div class="bar-gauge-fill" style="width:${pct}%;background:${item.color || '#ff6b35'}"></div>
        </div>
        <span class="bar-gauge-value" style="color:${item.color || '#ff6b35'}">${item.value}${item.unit || ''}</span>
      </div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
  }

  // --- Heatmap component ---
  function createHeatmap(container, { title, data, cols, rows: rowLabels }) {
    let html = `<div class="panel-header"><span class="panel-title">${title}</span></div>
      <div class="panel-body">
        <div style="display:flex;gap:4px;align-items:flex-start;">
          <div style="display:flex;flex-direction:column;gap:2px;padding-top:18px;">`;
    rowLabels.forEach(l => {
      html += `<div style="font-size:0.65rem;color:var(--text-muted);height:14px;line-height:14px;text-align:right;padding-right:4px;">${l}</div>`;
    });
    html += `</div><div>
      <div style="display:flex;gap:2px;margin-bottom:4px;">`;
    cols.forEach(c => {
      html += `<div style="font-size:0.6rem;color:var(--text-muted);width:14px;text-align:center;">${c}</div>`;
    });
    html += `</div><div class="heatmap-grid" style="grid-template-columns:repeat(${cols.length}, 14px);">`;
    data.forEach(row => {
      row.forEach(val => {
        const opacity = Math.max(0.05, val);
        html += `<div class="heatmap-cell" style="background:rgba(255,107,53,${opacity});"></div>`;
      });
    });
    html += `</div></div></div></div>`;
    container.innerHTML = html;
  }

  // --- Initialize dashboard page ---
  function init(title) {
    applyChartDefaults();
    initSidebar();
    initTopbar(title);
  }

  // --- Utility: random jitter ---
  function jitter(value, pct) {
    const range = value * (pct / 100);
    return value + (Math.random() * range * 2 - range);
  }

  function jitterInt(value, pct) {
    return Math.round(jitter(value, pct));
  }

  return {
    init,
    createStatPanel,
    updateStatValue,
    createTablePanel,
    createGaugePanel,
    createBarGauge,
    createHeatmap,
    COLORS,
    SERIES_COLORS,
    jitter,
    jitterInt,
    dashboards,
  };
})();
