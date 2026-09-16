/**
 * SPACE EXPLORATION CENTER — SITE-THEMED ORBIT RETICLE CURSOR
 * Cyan crosshair + orbiting satellite. States:
 *  hover (links/buttons) / drag (3D canvases) / view (cards/planets) / down (click)
 */
(function () {
  'use strict';

  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduced) return;
  if ('ontouchstart' in window && navigator.maxTouchPoints > 0) return;

  var dot = document.createElement('div');
  dot.className = 'space-cursor-dot';
  document.body.appendChild(dot);

  var ring = document.createElement('div');
  ring.className = 'space-cursor-ring';
  var sat = document.createElement('span');
  sat.className = 'space-cursor-satellite';
  ring.appendChild(sat);
  document.body.appendChild(ring);

  var label = document.createElement('div');
  label.className = 'space-cursor-label';
  label.textContent = '';
  document.body.appendChild(label);

  var mouseX = window.innerWidth / 2;
  var mouseY = window.innerHeight / 2;
  var ringX = mouseX;
  var ringY = mouseY;
  var labelX = mouseX;
  var labelY = mouseY;

  function place(el, x, y) {
    el.style.transform = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-50%)';
  }

  window.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    document.body.classList.remove('cursor-hidden');
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
    dot.style.transform = '';
    // dot uses left/top; ring+label use rAF lerp via transform
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', function () {
    document.body.classList.add('cursor-hidden');
  });
  document.documentElement.addEventListener('mouseenter', function () {
    document.body.classList.remove('cursor-hidden');
  });

  window.addEventListener('mousedown', function () {
    document.body.classList.add('cursor-down');
  });
  window.addEventListener('mouseup', function () {
    document.body.classList.remove('cursor-down');
  });

  function update() {
    var speed = document.body.classList.contains('cursor-hover') ? 0.32 : 0.18;
    ringX += (mouseX - ringX) * speed;
    ringY += (mouseY - ringY) * speed;
    labelX += (mouseX - labelX) * 0.22;
    labelY += (mouseY - labelY) * 0.22;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    label.style.left = labelX + 'px';
    label.style.top = labelY + 'px';
    requestAnimationFrame(update);
  }
  update();

  function clearStates() {
    document.body.classList.remove('cursor-hover', 'cursor-drag', 'cursor-view');
    label.textContent = '';
  }

  // Delegated hover — works for dynamically added nodes, no intervals
  document.addEventListener('mouseover', function (e) {
    var t = e.target.closest(
      '#solar-system-canvas, #planet-discovery-canvas, #journey-canvas, ' +
      '#spacecraft-canvas, #galaxy-canvas, #phenomena-canvas, #cta-space-canvas, ' +
      '#hero-canvas, canvas, .journey-viewport-box, .spacecraft-canvas-box'
    );
    if (t) {
      clearStates();
      document.body.classList.add('cursor-drag');
      label.textContent = 'DRAG ◉ EXPLORE';
      return;
    }
    var v = e.target.closest(
      '.holographic-galaxy-card, .journey-grid-card, .hud-card, ' +
      '.timeline-card, .discovery-post-card, .planet-viewer-canvas-box'
    );
    if (v) {
      clearStates();
      document.body.classList.add('cursor-view');
      label.textContent = 'VIEW ✦';
      return;
    }
    var h = e.target.closest('a, button, input, textarea, select, label');
    if (h) {
      clearStates();
      document.body.classList.add('cursor-hover');
      return;
    }
    clearStates();
  }, { passive: true });
})();
