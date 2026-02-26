/* ============================================
   ClimaIQ — AI Architecture Animated Diagram
   Canvas-based data flow visualization
   ============================================ */

(function () {
  'use strict';

  var canvas = document.getElementById('architectureCanvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var animationId = null;
  var isVisible = false;
  var time = 0;

  // Colors
  var ORANGE = '#ff6b35';
  var AMBER = '#ffa726';
  var BLUE = '#00bcd4';
  var RED = '#ff3d00';
  var TEXT_PRIMARY = '#f0f0f5';
  var TEXT_SECONDARY = '#a0a0b0';
  var TEXT_MUTED = '#6a6a7a';
  var BG_CARD = '#16161f';
  var BG_NODE = '#1e1e2a';
  var BORDER = 'rgba(255,255,255,0.08)';

  // Node definitions (will be positioned relative to canvas size)
  var nodes = [
    { id: 'cnn', label: 'CNN Satellite', sublabel: 'Analyzer', color: BLUE, weight: '20%', col: 0, row: 0 },
    { id: 'lstm', label: 'LSTM Temporal', sublabel: 'Predictor', color: ORANGE, weight: '25%', col: 1, row: 0 },
    { id: 'rf', label: 'Random Forest', sublabel: 'Classifier', color: AMBER, weight: '20%', col: 2, row: 0 },
    { id: 'physics', label: 'Physics-Informed', sublabel: 'Fire Model', color: RED, weight: '35%', col: 3, row: 0 },
    { id: 'ensemble', label: 'Ensemble', sublabel: 'Meta-Learner', color: ORANGE, weight: '', col: 1.5, row: 1 },
  ];

  // Data flow particles
  var particles = [];
  var MAX_PARTICLES = 40;

  function resizeCanvas() {
    var rect = canvas.parentElement.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);
  }

  function getNodePositions() {
    var rect = canvas.parentElement.getBoundingClientRect();
    var w = rect.width;
    var h = rect.height;

    var paddingX = w < 600 ? 40 : 80;
    var topY = h * 0.28;
    var bottomY = h * 0.72;
    var usableW = w - paddingX * 2;

    var positions = {};
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.id === 'ensemble') {
        positions[node.id] = {
          x: w / 2,
          y: bottomY,
          w: w < 600 ? 110 : 150,
          h: w < 600 ? 52 : 64,
        };
      } else {
        positions[node.id] = {
          x: paddingX + (node.col / 3) * usableW,
          y: topY,
          w: w < 600 ? 90 : 130,
          h: w < 600 ? 52 : 64,
        };
      }
    }
    return positions;
  }

  function drawRoundedRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawNode(node, pos) {
    var x = pos.x - pos.w / 2;
    var y = pos.y - pos.h / 2;
    var r = 12;

    // Glow
    ctx.shadowColor = node.color;
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Background
    drawRoundedRect(x, y, pos.w, pos.h, r);
    ctx.fillStyle = BG_NODE;
    ctx.fill();

    // Border
    ctx.shadowBlur = 0;
    drawRoundedRect(x, y, pos.w, pos.h, r);
    ctx.strokeStyle = node.color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.5 + 0.2 * Math.sin(time * 2 + nodes.indexOf(node));
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Label
    var isSmall = pos.w < 110;
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.font = (isSmall ? '600 10px' : '600 12px') + ' Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (node.sublabel) {
      ctx.fillText(node.label, pos.x, pos.y - (isSmall ? 6 : 8));
      ctx.fillStyle = TEXT_MUTED;
      ctx.font = (isSmall ? '400 8px' : '400 10px') + ' Inter, sans-serif';
      ctx.fillText(node.sublabel, pos.x, pos.y + (isSmall ? 6 : 8));
    } else {
      ctx.fillText(node.label, pos.x, pos.y - (isSmall ? 6 : 8));
      ctx.fillStyle = TEXT_MUTED;
      ctx.font = (isSmall ? '400 8px' : '400 10px') + ' Inter, sans-serif';
      ctx.fillText(node.sublabel, pos.x, pos.y + (isSmall ? 6 : 8));
    }

    // Weight badge
    if (node.weight) {
      var badgeY = pos.y - pos.h / 2 - (isSmall ? 12 : 16);
      ctx.fillStyle = node.color;
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      ctx.arc(pos.x, badgeY, isSmall ? 14 : 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = node.color;
      ctx.font = (isSmall ? 'bold 8px' : 'bold 10px') + ' Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.weight, pos.x, badgeY);
    }
  }

  function drawConnection(fromPos, toPos, color) {
    ctx.beginPath();
    ctx.moveTo(fromPos.x, fromPos.y + fromPos.h / 2);

    var midY = (fromPos.y + fromPos.h / 2 + toPos.y - toPos.h / 2) / 2;
    ctx.bezierCurveTo(
      fromPos.x, midY,
      toPos.x, midY,
      toPos.x, toPos.y - toPos.h / 2
    );

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.2;
    ctx.setLineDash([6, 4]);
    ctx.lineDashOffset = -time * 30;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  function spawnParticle(positions) {
    var sourceNodes = ['cnn', 'lstm', 'rf', 'physics'];
    var srcId = sourceNodes[Math.floor(Math.random() * sourceNodes.length)];
    var from = positions[srcId];
    var to = positions.ensemble;
    var srcNode = nodes.find(function (n) { return n.id === srcId; });

    particles.push({
      x: from.x,
      y: from.y + from.h / 2,
      targetX: to.x,
      targetY: to.y - to.h / 2,
      progress: 0,
      speed: 0.005 + Math.random() * 0.008,
      color: srcNode.color,
      size: 2 + Math.random() * 2,
    });
  }

  function updateAndDrawParticles(positions) {
    // Spawn
    if (particles.length < MAX_PARTICLES && Math.random() < 0.15) {
      spawnParticle(positions);
    }

    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.progress += p.speed;

      if (p.progress >= 1) {
        particles.splice(i, 1);
        continue;
      }

      // Bezier interpolation matching the connection curve
      var t = p.progress;
      var midY = (p.y + p.targetY) / 2;
      // Simplified cubic bezier
      var mt = 1 - t;
      var startX = p.x;
      var startY = p.y;
      // Use start, control1, control2, end for cubic bezier
      var cp1x = p.x;
      var cp1y = midY;
      var cp2x = p.targetX;
      var cp2y = midY;

      var cx = mt * mt * mt * startX + 3 * mt * mt * t * cp1x + 3 * mt * t * t * cp2x + t * t * t * p.targetX;
      var cy = mt * mt * mt * startY + 3 * mt * mt * t * cp1y + 3 * mt * t * t * cp2y + t * t * t * p.targetY;

      // Draw glow
      ctx.beginPath();
      ctx.arc(cx, cy, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.8 * (1 - Math.abs(p.progress - 0.5) * 2);
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }

  function drawOutputArrow(positions) {
    var ens = positions.ensemble;
    var rect = canvas.parentElement.getBoundingClientRect();

    // Arrow below ensemble
    var startY = ens.y + ens.h / 2 + 10;
    var endY = startY + 40;

    ctx.beginPath();
    ctx.moveTo(ens.x, startY);
    ctx.lineTo(ens.x, endY);
    ctx.strokeStyle = ORANGE;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4;
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(ens.x - 6, endY - 6);
    ctx.lineTo(ens.x, endY);
    ctx.lineTo(ens.x + 6, endY - 6);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Output label
    var isSmall = rect.width < 600;
    ctx.fillStyle = TEXT_SECONDARY;
    ctx.font = (isSmall ? '500 9px' : '500 11px') + ' Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Fire Risk Prediction', ens.x, endY + (isSmall ? 16 : 20));
  }

  function drawTitle() {
    var rect = canvas.parentElement.getBoundingClientRect();
    var isSmall = rect.width < 600;

    ctx.fillStyle = TEXT_MUTED;
    ctx.font = (isSmall ? '500 9px' : '500 11px') + ' Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('DATA FLOW', isSmall ? 12 : 24, isSmall ? 10 : 20);

    // Live indicator
    var dotRadius = 4;
    var dotX = rect.width - (isSmall ? 40 : 60);
    var dotY = isSmall ? 14 : 24;

    ctx.beginPath();
    ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#4caf50';
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(time * 3);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#4caf50';
    ctx.font = (isSmall ? '600 8px' : '600 10px') + ' Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('LIVE', dotX + 8, dotY - (isSmall ? 4 : 5));
  }

  function draw() {
    if (!isVisible) return;

    var rect = canvas.parentElement.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    var positions = getNodePositions();
    time += 0.016;

    // Draw title
    drawTitle();

    // Draw connections
    var sourceIds = ['cnn', 'lstm', 'rf', 'physics'];
    for (var i = 0; i < sourceIds.length; i++) {
      var srcNode = nodes.find(function (n) { return n.id === sourceIds[i]; });
      drawConnection(positions[sourceIds[i]], positions.ensemble, srcNode.color);
    }

    // Draw particles
    updateAndDrawParticles(positions);

    // Draw nodes
    for (var j = 0; j < nodes.length; j++) {
      drawNode(nodes[j], positions[nodes[j].id]);
    }

    // Draw output
    drawOutputArrow(positions);

    animationId = requestAnimationFrame(draw);
  }

  // Observe visibility
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          isVisible = true;
          resizeCanvas();
          draw();
        } else {
          isVisible = false;
          if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
          }
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(canvas);

  // Resize handler
  var resizeTimeout;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      if (isVisible) {
        resizeCanvas();
      }
    }, 100);
  });
})();
