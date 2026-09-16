/**
 * SPACE EXPLORATION CENTER — ROCKET SHIP CURSOR
 * A tiny spacecraft follows the pointer, banks toward its travel direction,
 * leaves an exhaust trail, and shows a targeting reticle over interactables.
 */

(function() {
  'use strict';

  // Check if touch device or reduced motion
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return; // Don't activate on touch/mobile
  }

  document.documentElement.classList.add('has-space-cursor');

  const ROCKET_SVG = '' +
    '<svg viewBox="0 0 36 36" width="36" height="36" aria-hidden="true">' +
    '<defs>' +
    '<linearGradient id="sc-hull" x1="0" y1="0" x2="1" y2="0">' +
    '<stop offset="0" stop-color="#f8fafc"/><stop offset=".55" stop-color="#cbd5e1"/><stop offset="1" stop-color="#64748b"/>' +
    '</linearGradient>' +
    '<linearGradient id="sc-flame" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#fef08a"/><stop offset=".5" stop-color="#fb923c"/><stop offset="1" stop-color="#f43f5e" stop-opacity="0"/>' +
    '</linearGradient>' +
    '<radialGradient id="sc-glass" cx=".35" cy=".35" r=".95">' +
    '<stop offset="0" stop-color="#a5f3fc"/><stop offset=".6" stop-color="#06b6d4"/><stop offset="1" stop-color="#0e7490"/>' +
    '</radialGradient>' +
    '</defs>' +
    '<g class="flame"><path d="M15 25 L18 34 L21 25 Z" fill="url(#sc-flame)"/></g>' +
    '<path d="M11.5 21 L7 28 L12 26.5 Z" fill="#f43f5e"/>' +
    '<path d="M24.5 21 L29 28 L24 26.5 Z" fill="#f43f5e"/>' +
    '<path d="M18 4 C22.5 9 24.5 15 24.5 23 L11.5 23 C11.5 15 13.5 9 18 4 Z" fill="url(#sc-hull)"/>' +
    '<rect x="16.4" y="23" width="3.2" height="3.4" rx="1.2" fill="#475569"/>' +
    '<circle cx="18" cy="15" r="3.4" fill="url(#sc-glass)" stroke="#e2e8f0" stroke-width="1"/>' +
    '</svg>';

  const ship = document.createElement('div');
  ship.className = 'space-cursor-ship';
  ship.innerHTML = '<div class="ship-rot"><div class="ship-zoom">' + ROCKET_SVG + '</div></div>';
  document.body.appendChild(ship);

  const reticle = document.createElement('div');
  reticle.className = 'space-cursor-target';
  document.body.appendChild(reticle);

  const rot = ship.firstChild;

  // Exhaust particle pool
  const trail = [];
  for (let i = 0; i < 14; i++) {
    const el = document.createElement('div');
    el.className = 'space-cursor-trail';
    el.style.opacity = '0';
    document.body.appendChild(el);
    trail.push({ el: el, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1 });
  }
  let trailIdx = 0;
  let lastSpawnX = -999;
  let lastSpawnY = -999;

  function emit(x, y, spread, speed, life) {
    const p = trail[trailIdx];
    trailIdx = (trailIdx + 1) % trail.length;
    const a = Math.random() * Math.PI * 2;
    const s = speed * (0.4 + Math.random() * 0.6);
    p.x = x;
    p.y = y;
    p.vx = Math.cos(a) * s * spread;
    p.vy = Math.sin(a) * s * spread;
    p.life = life * (0.7 + Math.random() * 0.5);
    p.max = p.life;
  }

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let rx = mx;
  let ry = my;
  let angle = 0;
  let visible = false;
  let lastX = mx;
  let lastY = my;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (!visible) {
      visible = true;
      rx = mx;
      ry = my;
      lastX = mx;
      lastY = my;
      ship.style.opacity = '1';
      reticle.style.opacity = '1';
    }
    const dx = mx - lastSpawnX;
    const dy = my - lastSpawnY;
    if (dx * dx + dy * dy > 100) {
      lastSpawnX = mx;
      lastSpawnY = my;
      const rad = (angle - 90) * Math.PI / 180;
      emit(mx - Math.cos(rad) * 15, my - Math.sin(rad) * 15, 0.35, 0.6, 0.5);
    }
  });

  document.documentElement.addEventListener('mouseleave', () => {
    visible = false;
    ship.style.opacity = '0';
    reticle.style.opacity = '0';
  });

  window.addEventListener('mousedown', () => {
    ship.classList.add('boost');
    for (let i = 0; i < 5; i++) emit(mx, my, 1, 2.4, 0.6);
  });
  window.addEventListener('mouseup', () => {
    ship.classList.remove('boost');
  });

  function lerpAngle(a, b, t) {
    let d = (b - a) % 360;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return a + d * t;
  }

  function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;

    const vx = mx - lastX;
    const vy = my - lastY;
    lastX = mx;
    lastY = my;
    const speed = Math.sqrt(vx * vx + vy * vy);

    if (speed > 0.6) {
      angle = lerpAngle(angle, Math.atan2(vy, vx) * 180 / Math.PI + 90, 0.22);
    }

    ship.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
    rot.style.transform = 'rotate(' + angle + 'deg)';

    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    reticle.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';

    for (let i = 0; i < trail.length; i++) {
      const p = trail[i];
      if (p.life <= 0) continue;
      p.life -= 0.03;
      if (p.life <= 0) {
        p.el.style.opacity = '0';
        continue;
      }
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.94;
      p.vy *= 0.94;
      const k = p.life / p.max;
      p.el.style.opacity = (k * 0.9).toFixed(2);
      p.el.style.transform = 'translate3d(' + p.x + 'px,' + p.y + 'px,0) scale(' + k.toFixed(2) + ')';
    }
  }
  loop();

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
