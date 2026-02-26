/* ============================================
   ClimaIQ Dashboard — Mock Data Generators
   Realistic data for all 8 dashboards
   ============================================ */

const DashboardData = (() => {
  const j = DashboardCommon.jitter;
  const ji = DashboardCommon.jitterInt;

  // --- Time labels ---
  function timeLabels(count, intervalMin) {
    const labels = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const t = new Date(now - i * intervalMin * 60000);
      labels.push(t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    }
    return labels;
  }

  function dateLabels(count) {
    const labels = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return labels;
  }

  // --- Generate timeseries data ---
  function genSeries(count, base, variance, trend) {
    const data = [];
    let val = base;
    for (let i = 0; i < count; i++) {
      val = base + (trend || 0) * (i / count) + (Math.random() - 0.5) * variance;
      data.push(Math.round(val * 100) / 100);
    }
    return data;
  }

  // --- 1. Wildfire Overview ---
  function wildfireOverview() {
    const labels = timeLabels(24, 60);
    return {
      stats: {
        fires24h: ji(47, 5),
        fires7d: ji(312, 3),
        fires30d: ji(1284, 2),
        detections24h: ji(156, 5),
        detections7d: ji(1089, 3),
        sensorReadings: ji(24680, 2),
      },
      fireActivity: {
        labels,
        datasets: [
          { label: 'Active Fires', data: genSeries(24, 45, 15, 5), color: '#ff6b35' },
          { label: 'Detections', data: genSeries(24, 130, 40, 10), color: '#00bcd4' },
          { label: 'Alerts', data: genSeries(24, 20, 10, 2), color: '#ffa726' },
        ],
      },
      dataSources: [
        ['NOAA GOES-18', 'Satellite', 'Active', '99.8%', '1.2s'],
        ['NASA VIIRS', 'Satellite', 'Active', '99.5%', '2.1s'],
        ['RAWS Network', 'Weather', 'Active', '98.9%', '0.8s'],
        ['CAL FIRE API', 'Incident', 'Active', '99.2%', '1.5s'],
        ['EPA AirNow', 'Air Quality', 'Active', '97.8%', '3.2s'],
        ['USGS StreamFlow', 'Hydrology', 'Active', '99.1%', '1.8s'],
        ['PurpleAir', 'Sensor', 'Active', '96.5%', '0.9s'],
      ],
      recentFires: [
        ['Caldor Complex', '38.77°N, 120.54°W', '<span class="badge badge-red">HIGH</span>', '2,450 ac', '15%'],
        ['Dixie Remnant', '40.01°N, 121.38°W', '<span class="badge badge-yellow">MEDIUM</span>', '890 ac', '45%'],
        ['Creek Fire NE', '37.21°N, 119.32°W', '<span class="badge badge-red">HIGH</span>', '1,200 ac', '22%'],
        ['Pine Valley IC', '32.82°N, 116.52°W', '<span class="badge badge-green">LOW</span>', '120 ac', '78%'],
        ['Shasta Complex', '40.68°N, 122.39°W', '<span class="badge badge-yellow">MEDIUM</span>', '560 ac', '55%'],
      ],
    };
  }

  // --- 2. System Performance ---
  function systemPerformance() {
    const labels = timeLabels(30, 2);
    return {
      stats: {
        avgResponse: j(127, 5).toFixed(0),
        throughput: ji(2450, 3),
        uptime: j(99.94, 0.02).toFixed(2),
        dataQuality: j(99.7, 0.1).toFixed(1),
      },
      cpu: {
        labels,
        datasets: [
          { label: 'Data Ingestion', data: genSeries(30, 35, 12, 3), color: '#ff6b35' },
          { label: 'API Server', data: genSeries(30, 22, 8, 1), color: '#00bcd4' },
          { label: 'ML Pipeline', data: genSeries(30, 45, 18, -5), color: '#ffa726' },
        ],
      },
      memory: {
        labels,
        datasets: [
          { label: 'Heap Used', data: genSeries(30, 62, 8, 2), color: '#5794f2' },
          { label: 'Heap Total', data: genSeries(30, 78, 4, 1), color: '#ab47bc' },
          { label: 'External', data: genSeries(30, 15, 5, 0), color: '#73bf69' },
        ],
      },
    };
  }

  // --- 3. Data Ingestion: Latency & Fidelity ---
  function ingestionLatency() {
    const labels = timeLabels(30, 2);
    return {
      stats: {
        successRate: j(99.87, 0.05).toFixed(2),
        p95Latency: ji(870, 3),
        duplicateRate: j(0.02, 10).toFixed(3),
        slaOverall: j(99.4, 0.2).toFixed(1),
      },
      latency: {
        labels,
        datasets: [
          { label: 'p50', data: genSeries(30, 320, 60, -10), color: '#73bf69' },
          { label: 'p95', data: genSeries(30, 870, 120, 0), color: '#ffa726' },
          { label: 'p99', data: genSeries(30, 1450, 200, 20), color: '#f2495c' },
        ],
      },
      validationRate: j(99.6, 0.2).toFixed(1),
      throughput: {
        labels,
        datasets: [
          { label: 'Messages/sec', data: genSeries(30, 1200, 300, 50), color: '#00bcd4' },
        ],
      },
      kafkaLag: ji(245, 10),
      quality: {
        labels,
        datasets: [
          { label: 'Quality Score', data: genSeries(30, 98.5, 1.5, 0), color: '#73bf69' },
        ],
      },
      anomalies: {
        labels,
        datasets: [
          { label: 'Anomalies Detected', data: genSeries(30, 3, 4, 0).map(v => Math.max(0, Math.round(v))), color: '#f2495c' },
        ],
      },
      failedMessages: [
        ['msg-8842', 'NOAA GOES', 'Schema Validation', '2m ago', '<span class="badge badge-yellow">RETRY</span>'],
        ['msg-8837', 'PurpleAir', 'Timeout', '5m ago', '<span class="badge badge-red">FAILED</span>'],
        ['msg-8821', 'RAWS', 'Parse Error', '12m ago', '<span class="badge badge-yellow">RETRY</span>'],
        ['msg-8815', 'EPA AirNow', 'Rate Limited', '18m ago', '<span class="badge badge-green">RESOLVED</span>'],
      ],
    };
  }

  // --- 4. Enhanced Latency & Fidelity ---
  function latencyFidelityEnhanced() {
    const labels = timeLabels(30, 2);
    const connectors = ['NOAA', 'VIIRS', 'RAWS', 'CAL FIRE', 'AirNow', 'PurpleAir'];
    return {
      stats: {
        avgLatency: ji(870, 3),
        kafkaLag: ji(245, 10),
        validationRate: j(99.6, 0.15).toFixed(1),
        activeSources: 26,
        ingestionRate: ji(1200, 5),
        qualityScore: j(98.5, 0.3).toFixed(1),
      },
      latencyByConnector: {
        labels,
        datasets: connectors.map((c, i) => ({
          label: c,
          data: genSeries(30, 300 + i * 120, 80, 0),
          color: DashboardCommon.SERIES_COLORS[i],
        })),
      },
      kafkaByTopic: {
        labels,
        datasets: [
          { label: 'fire-detections', data: genSeries(30, 120, 60, 0), color: '#ff6b35' },
          { label: 'weather-data', data: genSeries(30, 80, 40, 0), color: '#00bcd4' },
          { label: 'satellite-imagery', data: genSeries(30, 200, 100, 0), color: '#ffa726' },
          { label: 'sensor-readings', data: genSeries(30, 50, 30, 0), color: '#4caf50' },
        ],
      },
      validationBySource: {
        labels,
        datasets: connectors.slice(0, 4).map((c, i) => ({
          label: c,
          data: genSeries(30, 98 + Math.random() * 2, 1, 0),
          color: DashboardCommon.SERIES_COLORS[i],
        })),
      },
      qualityBySource: {
        labels,
        datasets: connectors.slice(0, 4).map((c, i) => ({
          label: c,
          data: genSeries(30, 96 + Math.random() * 3, 1.5, 0),
          color: DashboardCommon.SERIES_COLORS[i],
        })),
      },
      sourcePerformance: connectors.map((c, i) => [
        c, ji(300 + i * 120, 5) + 'ms', j(97 + Math.random() * 3, 0.2).toFixed(1) + '%',
        ji(150 + i * 50, 8) + '/s', '<span class="badge badge-green">HEALTHY</span>',
      ]),
      validationFailures: connectors.map((c, i) => ({
        label: c, value: Math.round(Math.random() * 15 + 1), max: 50,
        color: DashboardCommon.SERIES_COLORS[i],
      })),
      heatmapData: {
        cols: ['00', '04', '08', '12', '16', '20'],
        rows: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: Array.from({ length: 7 }, () =>
          Array.from({ length: 6 }, () => Math.random() * 0.9 + 0.1)
        ),
      },
    };
  }

  // --- 5. Data Storage: Storage Tiers ---
  function storageTiers() {
    const labels = timeLabels(24, 60);
    return {
      tiers: {
        hot: { latency: ji(12, 5), max: 50, unit: 'ms' },
        warm: { latency: ji(85, 5), max: 200, unit: 'ms' },
        cold: { latency: ji(340, 5), max: 1000, unit: 'ms' },
        archive: { latency: ji(2400, 3), max: 5000, unit: 'ms' },
      },
      storageGrowth: {
        labels: dateLabels(14),
        datasets: [
          { label: 'Hot (SSD)', data: genSeries(14, 120, 5, 15), color: '#f2495c' },
          { label: 'Warm (HDD)', data: genSeries(14, 450, 10, 30), color: '#ffa726' },
          { label: 'Cold (Object)', data: genSeries(14, 1200, 20, 50), color: '#5794f2' },
          { label: 'Archive (Glacier)', data: genSeries(14, 3400, 30, 80), color: '#ab47bc' },
        ],
      },
      stats: {
        totalStorage: '5.17',
        monthlyCost: ji(2840, 2),
        compressionRatio: '3.2x',
        deduplication: j(18.7, 2).toFixed(1),
      },
      queryPerf: {
        labels: ['<10ms', '10-50ms', '50-200ms', '200-500ms', '500ms-1s', '>1s'],
        data: [35, 28, 20, 10, 5, 2],
      },
      capacityUtil: [
        { label: 'Hot Tier', value: 72, max: 100, color: '#f2495c' },
        { label: 'Warm Tier', value: 58, max: 100, color: '#ffa726' },
        { label: 'Cold Tier', value: 41, max: 100, color: '#5794f2' },
        { label: 'Archive', value: 23, max: 100, color: '#ab47bc' },
      ],
    };
  }

  // --- 6. Storage Lifecycle ---
  function storageLifecycle() {
    return {
      distribution: {
        labels: ['Hot (SSD)', 'Warm (HDD)', 'Cold (Object)', 'Archive (Glacier)'],
        data: [120, 450, 1200, 3400],
        colors: ['#f2495c', '#ffa726', '#5794f2', '#ab47bc'],
      },
      stats: {
        totalByTier: '5.17 TB',
        monthlyCost: '$2,840',
      },
      growthTrend: {
        labels: dateLabels(14),
        datasets: [
          { label: 'Total Storage', data: genSeries(14, 4800, 50, 120), color: '#00bcd4' },
          { label: 'Data Ingested', data: genSeries(14, 85, 15, 5), color: '#ff6b35' },
        ],
      },
      migrationEligible: [
        ['fire-detections-2025-11', 'Hot → Warm', '12.4 GB', '45 days old', '<span class="badge badge-yellow">PENDING</span>'],
        ['weather-archive-2025-10', 'Warm → Cold', '38.7 GB', '92 days old', '<span class="badge badge-blue">SCHEDULED</span>'],
        ['satellite-raw-2025-09', 'Cold → Archive', '156.2 GB', '150 days old', '<span class="badge badge-blue">SCHEDULED</span>'],
        ['sensor-logs-2025-08', 'Cold → Archive', '89.1 GB', '180 days old', '<span class="badge badge-green">READY</span>'],
      ],
      cleanupCandidates: [
        ['tmp-processing-batch-447', '2.3 GB', 'Temporary', '14 days', '<span class="badge badge-red">DELETE</span>'],
        ['duplicate-viirs-20251201', '890 MB', 'Duplicate', '30 days', '<span class="badge badge-red">DELETE</span>'],
        ['failed-ingest-logs-nov', '156 MB', 'Failed Ingest', '60 days', '<span class="badge badge-yellow">REVIEW</span>'],
      ],
      qualityBySource: [
        { label: 'NOAA GOES', value: 99.2, max: 100, color: '#73bf69' },
        { label: 'NASA VIIRS', value: 98.7, max: 100, color: '#73bf69' },
        { label: 'RAWS', value: 97.4, max: 100, color: '#ffa726' },
        { label: 'CAL FIRE', value: 99.5, max: 100, color: '#73bf69' },
        { label: 'EPA AirNow', value: 96.1, max: 100, color: '#ffa726' },
        { label: 'PurpleAir', value: 94.8, max: 100, color: '#ffa726' },
      ],
      retentionActions: [
        ['2026-02-25 08:15', 'Auto-Migration', 'fire-detections-2025-10 → Warm', '<span class="badge badge-green">SUCCESS</span>'],
        ['2026-02-25 04:30', 'Compression', 'weather-archive-2025-09 (3.4x ratio)', '<span class="badge badge-green">SUCCESS</span>'],
        ['2026-02-24 22:00', 'Cleanup', 'tmp-batch-processing cleared 4.1 GB', '<span class="badge badge-green">SUCCESS</span>'],
        ['2026-02-24 16:45', 'Deduplication', 'Removed 890 MB duplicate VIIRS data', '<span class="badge badge-green">SUCCESS</span>'],
        ['2026-02-24 12:00', 'Auto-Migration', 'sensor-data-2025-08 → Cold', '<span class="badge badge-green">SUCCESS</span>'],
      ],
      fileCount: {
        labels: ['Hot', 'Warm', 'Cold', 'Archive'],
        data: [ji(14200, 2), ji(38500, 2), ji(92100, 2), ji(245000, 1)],
        colors: ['#f2495c', '#ffa726', '#5794f2', '#ab47bc'],
      },
    };
  }

  // --- 7. Platform Health ---
  function platformHealth() {
    const labels = timeLabels(30, 2);
    return {
      stats: {
        storageUtil: j(78.3, 1).toFixed(1),
        securityAlerts: ji(2, 50),
        dataIntegrity: j(99.97, 0.01).toFixed(2),
        activeFlows: ji(26, 5),
        growthRate: j(2.4, 5).toFixed(1),
        healthScore: j(97.2, 0.5).toFixed(1),
      },
      dataFlow: {
        labels,
        datasets: [
          { label: 'Ingest Rate', data: genSeries(30, 1200, 200, 30), color: '#ff6b35' },
          { label: 'Process Rate', data: genSeries(30, 1150, 180, 25), color: '#00bcd4' },
          { label: 'Store Rate', data: genSeries(30, 1100, 160, 20), color: '#4caf50' },
        ],
      },
      storageByQuality: {
        labels: ['Validated', 'Partial', 'Raw', 'Failed QA'],
        data: [68, 18, 12, 2],
        colors: ['#73bf69', '#ffa726', '#5794f2', '#f2495c'],
      },
      securityTable: [
        ['2026-02-25 09:12', 'INFO', 'TLS certificate renewed — data-ingestion-svc', '<span class="badge badge-green">OK</span>'],
        ['2026-02-25 08:45', 'WARN', 'Unusual query pattern from IP 10.0.3.42', '<span class="badge badge-yellow">MONITOR</span>'],
        ['2026-02-25 04:30', 'INFO', 'Automated backup completed — 5.17 TB verified', '<span class="badge badge-green">OK</span>'],
        ['2026-02-24 22:15', 'INFO', 'Access audit: 142 queries, 0 violations', '<span class="badge badge-green">OK</span>'],
        ['2026-02-24 18:00', 'WARN', 'Rate limit threshold reached — EPA connector', '<span class="badge badge-yellow">RESOLVED</span>'],
      ],
    };
  }

  // --- 8. Analytics Overview ---
  function analyticsOverview() {
    const labels = timeLabels(24, 5);
    const roles = {
      'Admin': { queries: 342, avgResp: 95, sessions: 12, reports: 28, exports: 15, usage: 94 },
      'Fire Chief': { queries: 189, avgResp: 120, sessions: 8, reports: 45, exports: 22, usage: 87 },
      'Data Scientist': { queries: 567, avgResp: 210, sessions: 5, reports: 12, exports: 38, usage: 78 },
      'Data Analyst': { queries: 423, avgResp: 145, sessions: 7, reports: 34, exports: 29, usage: 82 },
      'Field Responder': { queries: 78, avgResp: 65, sessions: 15, reports: 8, exports: 3, usage: 91 },
    };
    return {
      roles,
      defaultRole: 'Admin',
      roleActivity: {
        labels,
        datasets: [
          { label: 'Admin', data: genSeries(24, 15, 5, 0), color: '#ff6b35' },
          { label: 'Fire Chief', data: genSeries(24, 8, 3, 0), color: '#00bcd4' },
          { label: 'Data Scientist', data: genSeries(24, 25, 8, 0), color: '#ffa726' },
          { label: 'Data Analyst', data: genSeries(24, 18, 6, 0), color: '#4caf50' },
          { label: 'Field Responder', data: genSeries(24, 4, 3, 0), color: '#ab47bc' },
        ],
      },
      platformDist: {
        labels: ['Web Dashboard', 'REST API', 'Mobile App', 'CLI Tools', 'Scheduled Reports'],
        data: [42, 28, 15, 8, 7],
        colors: ['#ff6b35', '#00bcd4', '#ffa726', '#4caf50', '#ab47bc'],
      },
      queryTable: [
        ['Q-4821', 'Fire Risk Assessment', 'Data Scientist', '210ms', '<span class="badge badge-green">COMPLETE</span>', '12s ago'],
        ['Q-4820', 'Daily Incident Report', 'Fire Chief', '85ms', '<span class="badge badge-green">COMPLETE</span>', '28s ago'],
        ['Q-4819', 'Sensor Health Check', 'Admin', '45ms', '<span class="badge badge-green">COMPLETE</span>', '45s ago'],
        ['Q-4818', 'Air Quality Trend', 'Data Analyst', '320ms', '<span class="badge badge-green">COMPLETE</span>', '1m ago'],
        ['Q-4817', 'Evacuation Zone Model', 'Fire Chief', '1.2s', '<span class="badge badge-yellow">RUNNING</span>', '2m ago'],
        ['Q-4816', 'Historical Fire Pattern', 'Data Scientist', '4.5s', '<span class="badge badge-blue">QUEUED</span>', '3m ago'],
      ],
    };
  }

  return {
    timeLabels,
    dateLabels,
    genSeries,
    wildfireOverview,
    systemPerformance,
    ingestionLatency,
    latencyFidelityEnhanced,
    storageTiers,
    storageLifecycle,
    platformHealth,
    analyticsOverview,
  };
})();
