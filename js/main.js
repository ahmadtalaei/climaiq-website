/* ============================================
   ClimaIQ — Main JavaScript
   Scroll Animations, Counters, Navigation
   ============================================ */

(function () {
  'use strict';

  // --- Smooth Scroll Navigation ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        // Close mobile menu if open
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
      }
    });
  });

  // --- Mobile Navigation Toggle ---
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', function () {
    navLinks.classList.toggle('open');
    navToggle.classList.toggle('active');
  });

  // --- Navbar scroll effect ---
  var nav = document.getElementById('nav');
  var lastScroll = 0;

  window.addEventListener('scroll', function () {
    var currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  });

  // --- Scroll Reveal (Intersection Observer) ---
  var revealElements = document.querySelectorAll('.reveal');

  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });

  // --- Animated Counters ---
  function animateCounter(el) {
    var target = parseFloat(el.dataset.target);
    var decimals = parseInt(el.dataset.decimals) || 0;
    var prefix = el.dataset.prefix || '';
    var suffix = el.dataset.suffix || '';
    var duration = 2000;
    var startTime = null;

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function update(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var easedProgress = easeOutQuart(progress);
      var current = target * easedProgress;

      el.textContent = prefix + current.toFixed(decimals) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = prefix + target.toFixed(decimals) + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  // Observe counters
  var counters = document.querySelectorAll('.counter');
  var counterObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  counters.forEach(function (counter) {
    counterObserver.observe(counter);
  });

  // --- Hero stat counters (special — they use stat-value class) ---
  var heroStats = document.querySelectorAll('.stat-value');
  var heroObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          heroObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  heroStats.forEach(function (stat) {
    heroObserver.observe(stat);
  });

  // --- Staggered reveal for grid children ---
  var grids = document.querySelectorAll(
    '.crisis-grid, .platform-grid, .metrics-grid'
  );

  grids.forEach(function (grid) {
    var children = grid.children;
    for (var i = 0; i < children.length; i++) {
      children[i].style.transitionDelay = i * 0.1 + 's';
    }
  });

  // --- Active nav link on scroll ---
  var sections = document.querySelectorAll('.section, .hero');
  var navAnchors = document.querySelectorAll('.nav-links a:not(.nav-cta)');

  var activeObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navAnchors.forEach(function (a) {
            a.style.color = '';
          });
          var activeLink = document.querySelector(
            '.nav-links a[href="#' + id + '"]'
          );
          if (activeLink && !activeLink.classList.contains('nav-cta')) {
            activeLink.style.color = '#ff6b35';
          }
        }
      });
    },
    { threshold: 0.3 }
  );

  sections.forEach(function (section) {
    activeObserver.observe(section);
  });
})();
