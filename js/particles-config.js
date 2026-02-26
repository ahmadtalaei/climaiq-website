/* ============================================
   ClimaIQ — Fire Particle Configuration
   particles.js hero background
   ============================================ */

(function () {
  'use strict';

  // Wait for particles.js to load
  if (typeof particlesJS === 'undefined') return;

  var fireConfig = {
    particles: {
      number: {
        value: 80,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: ['#ff6b35', '#ffa726', '#ff3d00', '#ff8a65', '#ffcc80'],
      },
      shape: {
        type: 'circle',
      },
      opacity: {
        value: 0.4,
        random: true,
        anim: {
          enable: true,
          speed: 1,
          opacity_min: 0.05,
          sync: false,
        },
      },
      size: {
        value: 3,
        random: true,
        anim: {
          enable: true,
          speed: 2,
          size_min: 0.5,
          sync: false,
        },
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: '#ff6b35',
        opacity: 0.08,
        width: 1,
      },
      move: {
        enable: true,
        speed: 1.2,
        direction: 'top',
        random: true,
        straight: false,
        out_mode: 'out',
        bounce: false,
        attract: {
          enable: true,
          rotateX: 600,
          rotateY: 1200,
        },
      },
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: {
          enable: true,
          mode: 'grab',
        },
        onclick: {
          enable: true,
          mode: 'push',
        },
        resize: true,
      },
      modes: {
        grab: {
          distance: 180,
          line_linked: {
            opacity: 0.25,
          },
        },
        push: {
          particles_nb: 3,
        },
      },
    },
    retina_detect: true,
  };

  // Initialize hero particles
  particlesJS('particles-js', fireConfig);

  // Initialize footer particles (subtler)
  var footerEl = document.getElementById('particles-js-footer');
  if (footerEl) {
    var footerConfig = JSON.parse(JSON.stringify(fireConfig));
    footerConfig.particles.number.value = 30;
    footerConfig.particles.opacity.value = 0.2;
    footerConfig.particles.line_linked.opacity = 0.04;
    footerConfig.particles.move.speed = 0.6;
    footerConfig.interactivity.events.onhover.enable = false;
    footerConfig.interactivity.events.onclick.enable = false;
    particlesJS('particles-js-footer', footerConfig);
  }
})();
