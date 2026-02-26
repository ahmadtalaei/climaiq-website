/* ============================================
   ClimaIQ Dashboard — Chart.js Factory
   Timeseries, pie, bar, gauge chart creators
   ============================================ */

const DashboardCharts = (() => {

  const C = DashboardCommon.COLORS;
  const SC = DashboardCommon.SERIES_COLORS;

  // --- Timeseries line chart ---
  function timeseries(canvas, { labels, datasets, yLabel, yMax, stacked, fill }) {
    return new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: datasets.map((ds, i) => ({
          label: ds.label,
          data: ds.data,
          borderColor: ds.color || SC[i % SC.length],
          backgroundColor: fill ? hexToRgba(ds.color || SC[i % SC.length], 0.1) : 'transparent',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.3,
          fill: fill || false,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.03)' },
            ticks: { maxTicksLimit: 8, maxRotation: 0 },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            beginAtZero: true,
            max: yMax,
            stacked: stacked || false,
            title: yLabel ? { display: true, text: yLabel, color: '#6a6a7a' } : undefined,
          },
        },
        plugins: {
          legend: { position: 'top' },
        },
      },
    });
  }

  // --- Area chart (filled timeseries) ---
  function area(canvas, opts) {
    return timeseries(canvas, { ...opts, fill: true });
  }

  // --- Bar chart ---
  function bar(canvas, { labels, datasets, horizontal, stacked, yLabel }) {
    return new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: datasets.map((ds, i) => ({
          label: ds.label,
          data: ds.data,
          backgroundColor: ds.color || SC[i % SC.length],
          borderRadius: 3,
          borderSkipped: false,
        })),
      },
      options: {
        indexAxis: horizontal ? 'y' : 'x',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.03)' },
            stacked: stacked || false,
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            beginAtZero: true,
            stacked: stacked || false,
            title: yLabel ? { display: true, text: yLabel, color: '#6a6a7a' } : undefined,
          },
        },
        plugins: {
          legend: { display: datasets.length > 1 },
        },
      },
    });
  }

  // --- Pie / Doughnut chart ---
  function pie(canvas, { labels, data, colors, doughnut }) {
    return new Chart(canvas, {
      type: doughnut ? 'doughnut' : 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors || SC.slice(0, labels.length),
          borderWidth: 0,
          hoverBorderWidth: 2,
          hoverBorderColor: '#fff',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: doughnut ? '60%' : 0,
        plugins: {
          legend: {
            position: 'right',
            labels: { padding: 12, font: { size: 11 } },
          },
        },
      },
    });
  }

  // --- Update timeseries data (shift + push) ---
  function pushTimeseriesPoint(chart, label, dataPoints) {
    chart.data.labels.push(label);
    chart.data.labels.shift();
    dataPoints.forEach((val, i) => {
      if (chart.data.datasets[i]) {
        chart.data.datasets[i].data.push(val);
        chart.data.datasets[i].data.shift();
      }
    });
    chart.update('none');
  }

  // --- Utility ---
  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  return { timeseries, area, bar, pie, pushTimeseriesPoint, hexToRgba };
})();
