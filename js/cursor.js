/**
 * SPACE EXPLORATION CENTER — ROCKET CURSOR
 * A small spacecraft follows the mouse and banks toward travel direction,
 * with flickering engine flame + cyan glow, exhaust trail particles,
 * click boost flare, and a trailing orbit ring that locks into a
 * solid targeting circle over interactives.
 * Desktop pointer-fine only; touch + reduced-motion untouched.
 */
(function () {
  'use strict';

  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduced) return;
  if ('ontouchstart' in window && navigator.maxTouchPoints > 0) return;

  document.documentElement.classList.add('has-space-cursor');

  /* --- Ship element (nose points +X so rotation = atan2 angle) --- */
  var ship = document.createElement('div');
  ship.className = 'space-cursor-ship';
  ship.setAttribute('aria-hidden', 'true');
  ship.innerHTML =
    '<div class="ship-rotator">' +
      '<div class="ship-flame"></div>' +
      '<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M4 16 L13 12.5 L13 19.5 Z" fill="#0b1528" stroke="#00f0ff" stroke-width="1.4" stroke-linejoin="round"/>' +
        '<path d="M13 12.5 C18 10.5 23 11 27 16 C23 21 18 21.5 13 19.5 Z" fill="#e2e8f0" stroke="#00f0ff" stroke-width="1.2" stroke-linejoin="round"/>' +
        '<path d="M25 14.2 L28.5 16 L25 17.8 Z" fill="#00f0ff"/>' +
        '<circle cx="19" cy="16" r="2.2" fill="#0b1528" stroke="#00f0ff" stroke-width="1.1"/>' +
        '<circle cx="19" cy="16" r="0.9" fill="#a5f3fc"/>' +
        '<path d="M14.5 12.8 L12 8.5 L16 11 Z" fill="#38bdf8" stroke="#00f0ff" stroke-width="0.9" stroke-linejoin="round"/>' +
        '<path d="M14.5 19.2 L12 23.5 L16 21 Z" fill="#38bdf8" stroke="#00f0ff" stroke-width="0.9" stroke-linejoin="round"/>' +
      '</svg>' +
    '</div>';
  document.body.appendChild(ship);
  var rotator = ship.querySelector('.ship-rotator');
  var flame = ship.querySelector('.ship-flame');

  /* --- Trailing targeting reticle --- */
  var ring = document.createElement('div');
  ring.className = 'space-cursor-ring';
  ring.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ring);

  var mouseX = window.innerWidth / 2;
  var mouseY = window.innerHeight / 2;
  var shipX = mouseX;
  var shipY = mouseY;
  var ringX = mouseX;
  var ringY = mouseY;
  var angle = -30;
  var lastSpawn = 0;

  window.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    document.body.classList.remove('cursor-hidden');
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', function () {
    document.body.classList.add('cursor-hidden');
  });
  document.documentElement.addEventListener('mouseenter', function () {
    document.body.classList.remove('cursor-hidden');
  });

  function lerpAngle(a, b, t) {
    var d = ((b - a + 540) % 360) - 180;
    return a + d * t;
  }

  function spawnParticle(x, y, opts) {
    opts = opts || {};
    var p = document.createElement('div');
    p.className = 'space-cursor-particle';
    var size = opts.size || (2 + Math.random() * 3);
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.margin = (-size / 2) + 'px 0 0 ' + (-size / 2) + 'px';
    var boost = document.body.classList.contains('cursor-boost');
    var color = opts.color || (boost ? '#f59e0b' : (Math.random() < 0.25 ? '#ffffff' : '#00f0ff'));
    p.style.background = color;
    p.style.boxShadow = '0 0 6px ' + color + ', 0 0 12px ' + color;
    document.body.appendChild(p);
    var tx = opts.tx !== undefined ? opts.tx : ((Math.random() - 0.5) * 26);
    var ty = opts.ty !== undefined ? opts.ty : ((Math.random() - 0.5) * 26);
    var dur = opts.dur || (450 + Math.random() * 350);
    try {
      var anim = p.animate(
        [
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: 'translate(' + tx + 'px,' + ty + 'px) scale(0.1)', opacity: 0 }
        ],
        { duration: dur, easing: 'cubic-bezier(0.16,1,0.3,1)' }
      );
      anim.onfinish = function () { p.remove(); };
      setTimeout(function () { if (p.isConnected) p.remove(); }, dur + 100);
    } catch (err) {
      setTimeout(function () { p.remove(); }, 500);
    }
  }

  function burst(x, y) {
    for (var i = 0; i < 14; i++) {
      var a = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
      var dist = 24 + Math.random() * 42;
      spawnParticle(x, y, {
        tx: Math.cos(a) * dist,
        ty: Math.sin(a) * dist,
        size: 2.5 + Math.random() * 3.5,
        color: i % 3 === 0 ? '#ffffff' : (i % 3 === 1 ? '#f59e0b' : '#00f0ff'),
        dur: 500 + Math.random() * 400
      });
    }
  }

  window.addEventListener('mousedown', function (e) {
    document.body.classList.add('cursor-boost');
    burst(e.clientX, e.clientY);
  });
  window.addEventListener('mouseup', function () {
    setTimeout(function () {
      document.body.classList.remove('cursor-boost');
    }, 180);
  });

  /* Targeting lock over links, buttons, cards, canvases */
  var LOCK_SELECTOR = 'a, button, input, textarea, select, label, canvas, ' +
    '.hud-card, .holographic-galaxy-card, .journey-grid-card, .timeline-card, ' +
    '.discovery-post-card, .planet-viewer-canvas-box, .journey-viewport-box, ' +
    '.spacecraft-canvas-box, .solar-hud-btn, .planet-tab-btn, .hotspot-btn, ' +
    '.phenomena-item-btn';
  document.addEventListener('mouseover', function (e) {
    if (e.target && e.target.closest && e.target.closest(LOCK_SELECTOR)) {
      document.body.classList.add('cursor-lock');
    } else {
      document.body.classList.remove('cursor-lock');
    }
  }, { passive: true });

  function frame(now) {
    var dx = mouseX - shipX;
    var dy = mouseY - shipY;
    var dist = Math.sqrt(dx * dx + dy * dy);

    shipX += dx * 0.35;
    shipY += dy * 0.35;
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;

    if (dist > 1.5) {
      var target = Math.atan2(dy, dx) * 180 / Math.PI;
      angle = lerpAngle(angle, target, 0.25);
    }
    rotator.style.transform = 'rotate(' + angle + 'deg)';

    /* Flame flicker scales with velocity */
    var thrust = Math.min(dist / 28, 1);
    var flick = 0.75 + Math.random() * 0.55 + thrust * 0.5;
    flame.style.transform = 'scaleX(' + flick.toFixed(2) + ') scaleY(' + (0.85 + Math.random() * 0.3).toFixed(2) + ')';

    /* Exhaust trail streams from tail while moving */
    if (dist > 3 && now - lastSpawn > 24) {
      lastSpawn = now;
      var rad = angle * Math.PI / 180;
      var tailX = shipX - Math.cos(rad) * 15;
      var tailY = shipY - Math.sin(rad) * 15;
      spawnParticle(tailX, tailY, {
        tx: -Math.cos(rad) * (10 + Math.random() * 16) + (Math.random() - 0.5) * 10,
        ty: -Math.sin(rad) * (10 + Math.random() * 16) + (Math.random() - 0.5) * 10
      });
    }

    ship.style.transform = 'translate(' + shipX + 'px,' + shipY + 'px)';
    ring.style.transform = 'translate(' + ringX + 'px,' + ringY + 'px)' +
      (document.body.classList.contains('cursor-lock') ? ' scale(1.35)' : ' scale(1)');
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
