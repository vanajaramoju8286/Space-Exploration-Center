/**
 * SPACE EXPLORATION CENTER — NAVIGATION & WARP PAGE TRANSITION CONTROLLER
 * Handles sticky HUD header, mobile drawer, warp jump transitions, and Web Audio SFX
 */

const SpaceNav = (function() {
  'use strict';

  // Futuristic Web Audio Synthesizer for UI feedback (zero external audio files needed)
  const AudioEngine = {
    ctx: null,
    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
    },
    playChirp(freq = 880, type = 'sine', duration = 0.08) {
      try {
        this.init();
        if (!this.ctx || this.ctx.state === 'suspended') return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.6, this.ctx.currentTime + duration);
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // Audio policy or error
      }
    },
    playWarpSound() {
      try {
        this.init();
        if (!this.ctx || this.ctx.state === 'suspended') return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.6);
      } catch (e) {}
    }
  };

  // Warp Overlay Element
  let warpOverlay = null;

  function initWarpTransition() {
    warpOverlay = document.createElement('div');
    warpOverlay.className = 'warp-transition-overlay';
    warpOverlay.innerHTML = `
      <div class="warp-star-streaks"></div>
      <div class="warp-hud-text">INITIATING HYPERDRIVE JUMP...</div>
    `;
    document.body.appendChild(warpOverlay);

    // Intercept internal links for smooth warp jump transitions
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      // If valid internal page link and not anchor on same page or external
      if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('http')) {
        e.preventDefault();
        triggerWarpJump(href);
      }
    });
  }

  function triggerWarpJump(targetUrl) {
    if (!warpOverlay) return window.location.href = targetUrl;

    AudioEngine.playWarpSound();
    warpOverlay.classList.add('active');

    setTimeout(() => {
      window.location.href = targetUrl;
    }, 450);
  }

  function initHeader() {
    const header = document.querySelector('.site-header');
    if (header) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });
    }

    // Mobile Menu Toggle
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    const drawer = document.querySelector('.mobile-menu-drawer');
    if (toggleBtn && drawer) {
      toggleBtn.addEventListener('click', () => {
        const isOpen = drawer.classList.toggle('open');
        toggleBtn.setAttribute('aria-expanded', isOpen);
      });

      // Close on mobile link click
      drawer.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          drawer.classList.remove('open');
        });
      });
    }

    // Add UI sound on button clicks
    document.querySelectorAll('.btn, .planet-tab-btn, .solar-hud-btn, .hotspot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        AudioEngine.playChirp(920, 'sine', 0.07);
      });
    });
  }

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initWarpTransition();
      initHeader();
    });
  } else {
    initWarpTransition();
    initHeader();
  }

  return {
    triggerWarpJump,
    playChirp: (freq, type, dur) => AudioEngine.playChirp(freq, type, dur)
  };
})();
