/**
 * SPACE EXPLORATION CENTER — CUSTOM FUTURISTIC SPACE RETICLE CURSOR
 * Smooth lerp cursor tracking with magnetic hover physics & reticle states
 */

(function() {
  'use strict';

  // Check if touch device or reduced motion
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return; // Don't activate on touch/mobile
  }

  const dot = document.createElement('div');
  dot.className = 'space-cursor-dot';
  document.body.appendChild(dot);

  const ring = document.createElement('div');
  ring.className = 'space-cursor-ring';
  document.body.appendChild(ring);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let isHovered = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  // Smooth lerp loop for the reticle ring
  function updateCursor() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(updateCursor);
  }
  updateCursor();

  // Attach hover listeners to all interactive buttons, links, canvases, and cards
  function attachHoverListeners() {
    const interactables = document.querySelectorAll('a, button, input, textarea, select, .hud-card, .planet-tab-btn, .hotspot-btn, canvas');
    interactables.forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachHoverListeners);
  } else {
    attachHoverListeners();
  }

  // Re-check periodically for dynamically inserted elements
  setInterval(attachHoverListeners, 2500);
})();
