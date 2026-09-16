/**
 * SPACE EXPLORATION CENTER — HOMEPAGE MASTER LOGIC (js/main.js)
 * Coordinates 10 differentiated homepage 3D sections and HUD telemetry interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 0. SECTION 01: CINEMATIC VIDEO HERO + FALLBACK DETECTION
  // =========================================================================
  let heroFallbackStarted = false;
  let heroFallbackTimer = null;

  function enableHeroFallback() {
    if (heroFallbackStarted) return;
    heroFallbackStarted = true;
    if (heroFallbackTimer) {
      clearTimeout(heroFallbackTimer);
      heroFallbackTimer = null;
    }

    const layer = document.getElementById('hero-video-layer');
    const container = document.getElementById('hero-canvas');
    if (layer) layer.classList.add('video-failed');
    if (container) container.classList.add('fallback-active');

    initHero3D();
  }

  function initHeroVideo() {
    const video = document.getElementById('hero-video');
    const layer = document.getElementById('hero-video-layer');
    const container = document.getElementById('hero-canvas');

    if (!video || !layer || !container) {
      enableHeroFallback();
      return;
    }

    // Force muted so autoplay is always permitted
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');

    let started = false;

    const giveUp = () => {
      if (started) return;
      started = true;
      enableHeroFallback();
    };

    video.addEventListener('error', giveUp, { once: true });

    // If the video still cannot begin playing, hand over to the 3D scene
    heroFallbackTimer = setTimeout(giveUp, 3000);

    const playPromise = video.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(() => {
        if (heroFallbackTimer) { clearTimeout(heroFallbackTimer); heroFallbackTimer = null; }
        started = true;
      }).catch(giveUp);
    } else {
      started = true;
      if (heroFallbackTimer) { clearTimeout(heroFallbackTimer); heroFallbackTimer = null; }
    }

    video.addEventListener('playing', () => {
      if (heroFallbackTimer) { clearTimeout(heroFallbackTimer); heroFallbackTimer = null; }
      started = true;
    });
  }

  // =========================================================================
  // 1. SECTION 01: HERO CINEMATICS (intro reveal, parallax, explore transition)
  // =========================================================================
  function initHeroCinematics() {
    const hero = document.getElementById('hero-section');
    const content = document.getElementById('hero-content');
    if (!hero || !content || typeof gsap === 'undefined') return;

    const eyebrow = content.querySelector('.hero-eyebrow');
    const titleCores = content.querySelectorAll('.title-core');
    const subtitle = document.getElementById('hero-subtitle');
    const cta = document.getElementById('hero-cta-group');
    const telemetry = document.getElementById('hero-telemetry-hud');
    const video = document.getElementById('hero-video');
    const overlay = document.querySelector('.hero-video-overlay');
    const startBtn = document.getElementById('hero-start-explore-btn');

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let introPlayed = false;
    let transitioning = false;
    let usedTransition = false;
    let heroVisible = true;
    let parallaxOn = true;

    // ---- Cinematic load-in ----
    function playIntro() {
      if (introPlayed || prefersReduced) return;
      introPlayed = true;

      gsap.set(eyebrow, { autoAlpha: 0, y: 26 });
      gsap.set(titleCores, { yPercent: 115, opacity: 0 });
      gsap.set(subtitle, { autoAlpha: 0, y: 20 });
      gsap.set(cta, { autoAlpha: 0, y: 18 });
      gsap.set(telemetry, { autoAlpha: 0 });

      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.2)
        .to(titleCores, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.18, ease: 'power4.out' }, 0.4)
        .to(subtitle, { autoAlpha: 1, y: 0, duration: 0.85 }, 0.9)
        .to(cta, { autoAlpha: 1, y: 0, duration: 0.75 }, 1.1)
        .to(telemetry, { autoAlpha: 1, duration: 0.65 }, 1.3);
    }

    // ---- Subtle foreground parallax ----
    if (!prefersReduced) {
      const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

      hero.addEventListener('mousemove', (e) => {
        mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      });

      (function parallaxLoop() {
        requestAnimationFrame(parallaxLoop);
        if (!parallaxOn) return;
        mouse.x += (mouse.tx - mouse.x) * 0.05;
        mouse.y += (mouse.ty - mouse.y) * 0.05;
        gsap.set(content, { x: mouse.x * 12, y: mouse.y * 7 });
      })();
    }

    // ---- Cinematic "Start Exploring" transition ----
    function heroExplore() {
      if (transitioning) return;
      transitioning = true;
      usedTransition = true;

      if (typeof SpaceNav !== 'undefined') {
        SpaceNav.playChirp(440, 'triangle', 0.2);
      }

      if (prefersReduced) {
        const target = document.getElementById('solar-system-section');
        if (target) target.scrollIntoView({ behavior: 'auto' });
        transitioning = false;
        return;
      }

      parallaxOn = false;

      const tl = gsap.timeline({
        onComplete: () => {
          const target = document.getElementById('solar-system-section');
          if (target) target.scrollIntoView({ behavior: 'smooth' });
          setTimeout(() => {
            transitioning = false;
            if (heroVisible) restoreHero();
          }, 1600);
        }
      });

      tl.to(content, { autoAlpha: 0, y: -24, duration: 0.55, ease: 'power2.in' }, 0)
        .to(telemetry, { autoAlpha: 0, duration: 0.4 }, 0.1)
        .to(overlay, { opacity: 0, duration: 1.2, ease: 'power1.inOut' }, 0.25);

      if (video) {
        tl.to(video, { scale: 1.3, filter: 'brightness(1.18)', duration: 1.9, ease: 'power2.inOut' }, 0.1);
      }
    }

    function restoreHero() {
      parallaxOn = true;
      gsap.to(overlay, { opacity: 1, duration: 1.1 });
      if (video) gsap.to(video, { scale: 1.02, filter: 'none', duration: 1.4, ease: 'power2.out' });
      gsap.to(content, { autoAlpha: 1, y: 0, duration: 0.75, ease: 'power2.out' });
      gsap.to(telemetry, { autoAlpha: 1, duration: 0.6 });
    }

    if (startBtn) startBtn.addEventListener('click', heroExplore);

    // Restore the hero polish when it scrolls back into view
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          heroVisible = en.isIntersecting;
          if (heroVisible && usedTransition && !transitioning) {
            restoreHero();
          }
          // Pause hero video decoding while it is off screen so GPU
          // budget goes to the visible section; resume on return.
          if (video && !heroFallbackStarted) {
            if (heroVisible) {
              if (video.paused) {
                const p = video.play();
                if (p && typeof p.catch === 'function') p.catch(() => {});
              }
            } else if (!video.paused) {
              video.pause();
            }
          }
        });
      }, { threshold: 0.35 });
      io.observe(hero);
    }

    // Same treatment when the browser tab itself is hidden
    document.addEventListener('visibilitychange', () => {
      if (!video || heroFallbackStarted) return;
      if (document.hidden) {
        if (!video.paused) video.pause();
      } else if (heroVisible && video.paused) {
        const p = video.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    });

    playIntro();
  }

  // =========================================================================
  // 2. SECTION 01: 3D FALLBACK SCENE (shown only when the video cannot load)
  // =========================================================================
  function initHero3D() {
    const container = document.getElementById('hero-canvas');
    if (!container) return;

    const app = SpaceThree.initScene(container, {
      fov: 45,
      camX: 0,
      camY: 0,
      camZ: 14,
      exposure: 1.2
    });
    if (!app) return;

    const { scene, camera, renderer } = app;

    // Deep volumetric starfield
    const stars = SpaceThree.createStarfield(4500, 1100);
    scene.add(stars);
    const vis = SpaceThree.watchVisibility(container);

    // Realistic Lighting
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.4);
    sunLight.position.set(20, 10, 15);
    scene.add(sunLight);

    const ambient = new THREE.AmbientLight(0x0a192f, 0.4);
    scene.add(ambient);

    // Rotating 3D Earth
    const earthRadius = 4.2;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthTex = SpaceTextures.createEarthTexture(2048, 1024);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.65,
      metalness: 0.1
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.position.set(2.5, -0.4, 0);
    earthMesh.rotation.z = 0.23; // axial tilt
    scene.add(earthMesh);

    // Atmospheric Glow Halo
    const atmo = SpaceThree.createAtmosphere(earthRadius, 0x00f0ff, 1.35, 2.9);
    earthMesh.add(atmo);

    // Rotating Clouds Sphere
    const cloudGeo = new THREE.SphereGeometry(earthRadius * 1.02, 48, 48);
    const cloudTex = SpaceTextures.createEarthCloudsTexture(2048, 1024);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.92
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    earthMesh.add(cloudMesh);

    // Distant Moon
    const moonGeo = new THREE.SphereGeometry(0.8, 24, 24);
    const moonTex = SpaceTextures.createMoonTexture(512, 256);
    const moonMesh = new THREE.Mesh(moonGeo, new THREE.MeshStandardMaterial({ map: moonTex, roughness: 0.9 }));
    moonMesh.position.set(-9.5, 4.0, -12);
    scene.add(moonMesh);

    // Distant Mars
    const marsMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 16),
      new THREE.MeshStandardMaterial({ map: SpaceTextures.createMarsTexture(512, 256), roughness: 0.85 })
    );
    marsMesh.position.set(16, 8, -35);
    scene.add(marsMesh);

    // Distant Jupiter
    const jupMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.8, 24, 24),
      new THREE.MeshStandardMaterial({ map: SpaceTextures.createJupiterTexture(512, 256), roughness: 0.9 })
    );
    jupMesh.position.set(15, 6, -22);
    scene.add(jupMesh);

    // Distant Saturn with rings
    const satGroup = new THREE.Group();
    const satMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.1, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0xd4c092, roughness: 0.85 })
    );
    satGroup.add(satMesh);
    const ringGeo = new THREE.RingGeometry(1.7, 3.0, 48);
    ringGeo.rotateX(Math.PI / 2.3);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xc9b483,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    satGroup.add(new THREE.Mesh(ringGeo, ringMat));
    satGroup.position.set(-14, -5, -16);
    scene.add(satGroup);

    // Floating cosmic particle field
    const particleCount = 900;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 8 + Math.random() * 26;
      pPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPos[i * 3 + 2] = r * Math.cos(phi);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.09,
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Slow cinematic camera drift
    function animate(time) {
      requestAnimationFrame(animate);
      const t = (time || 0) * 0.001;

      earthMesh.rotation.y += 0.0018;
      cloudMesh.rotation.y += 0.0026;
      moonMesh.rotation.y += 0.001;
      stars.rotation.y += 0.00015;
      particles.rotation.y += 0.00035;
      jupMesh.rotation.y += 0.002;

      camera.position.x = Math.sin(t * 0.12) * 2.0;
      camera.position.y = Math.cos(t * 0.16) * 1.3;
      camera.position.z = 14 + Math.sin(t * 0.1) * 1.4;
      camera.lookAt(0, 0, 0);

      if (vis.visible) renderer.render(scene, camera);
    }
    animate();
  }

  // =========================================================================
  // 2. SECTION 02: SOLAR SYSTEM EXPLORER
  // =========================================================================
  function initSolarSystemSection() {
    const canvasBox = document.getElementById('solar-system-canvas');
    if (!canvasBox) return;

    const infoTitle = document.getElementById('solar-info-title');
    const infoType = document.getElementById('solar-info-type');
    const infoDist = document.getElementById('solar-stat-dist');
    const infoDiam = document.getElementById('solar-stat-diam');
    const infoMoons = document.getElementById('solar-stat-moons');
    const infoPeriod = document.getElementById('solar-stat-period');
    const infoTemp = document.getElementById('solar-stat-temp');
    const exploreBtn = document.getElementById('solar-explore-planet-btn');

    const solarApp = SolarSystemEngine.create('solar-system-canvas', {
      onPlanetSelect: (data) => {
        if (infoTitle) infoTitle.textContent = data.name;
        if (infoType) infoType.textContent = data.type;
        if (infoDist) infoDist.textContent = data.distance;
        if (infoDiam) infoDiam.textContent = data.diameter;
        if (infoMoons) infoMoons.textContent = data.moons;
        if (infoPeriod) infoPeriod.textContent = data.period;
        if (infoTemp) infoTemp.textContent = data.temp;

        if (exploreBtn) {
          exploreBtn.href = `pages/planet-detail.html?planet=${data.slug}`;
          exploreBtn.style.display = data.slug === 'sun' ? 'none' : 'inline-flex';
        }

        // Update active HUD button
        document.querySelectorAll('.solar-hud-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.planet === data.slug);
        });
      }
    });

    // Hook HUD Planet selector buttons
    document.querySelectorAll('.solar-hud-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const planetId = btn.dataset.planet;
        if (planetId === 'overview') {
          solarApp.resetView();
          document.querySelectorAll('.solar-hud-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        } else {
          solarApp.focusPlanet(planetId);
        }
      });
    });
  }

  // =========================================================================
  // 3. SECTION 03: PLANET DISCOVERY SHOWCASE
  // =========================================================================
  function initPlanetDiscoverySection() {
    const container = document.getElementById('planet-discovery-canvas');
    if (!container) return;

    const pName = document.getElementById('showcase-planet-name');
    const pTagline = document.getElementById('showcase-planet-tagline');
    const pSummary = document.getElementById('showcase-planet-summary');
    const pDist = document.getElementById('showcase-stat-dist');
    const pRadius = document.getElementById('showcase-stat-radius');
    const pMoons = document.getElementById('showcase-stat-moons');
    const exploreBtn = document.getElementById('showcase-explore-btn');

    const viewer = PlanetViewer.createViewer('planet-discovery-canvas', 'earth');

    function updateShowcaseData(key) {
      const data = viewer.loadPlanet(key);
      if (pName) pName.textContent = data.name;
      if (pTagline) pTagline.textContent = data.tagline;
      if (pSummary) pSummary.textContent = data.summary;
      if (pDist) pDist.textContent = data.stats.distance;
      if (pRadius) pRadius.textContent = data.stats.radius;
      if (pMoons) pMoons.textContent = data.stats.moons;
      if (exploreBtn) exploreBtn.href = `pages/planet-detail.html?planet=${key}`;
    }

    // Tab buttons
    document.querySelectorAll('.planet-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.planet-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateShowcaseData(btn.dataset.planet);
      });
    });
  }

  // =========================================================================
  // 4. SECTION 06: SPACECRAFT 3D SHOWCASE
  // =========================================================================
  function initSpacecraftSection() {
    const container = document.getElementById('spacecraft-canvas');
    if (!container) return;

    const titleEl = document.getElementById('craft-subsystem-title');
    const catEl = document.getElementById('craft-subsystem-cat');
    const descEl = document.getElementById('craft-subsystem-desc');
    const metricsBox = document.getElementById('craft-subsystem-metrics');

    const craftApp = Spacecraft3D.create('spacecraft-canvas', {
      onHotspotSelect: (data) => {
        if (titleEl) titleEl.textContent = data.title;
        if (catEl) catEl.textContent = data.category;
        if (descEl) descEl.textContent = data.desc;

        if (metricsBox) {
          metricsBox.innerHTML = data.telemetry.map(t => `
            <div style="display:flex; justify-content:space-between; padding: 0.35rem 0; border-bottom: 1px dashed rgba(255,255,255,0.1);">
              <span style="color:var(--text-dim);">${t.label}</span>
              <strong style="color:var(--accent-cyan);">${t.val}</strong>
            </div>
          `).join('');
        }

        document.querySelectorAll('.hotspot-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.hotspot === data.id);
        });
      }
    });

    // Subsystem buttons
    document.querySelectorAll('.hotspot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        craftApp.selectHotspot(btn.dataset.hotspot);
      });
    });

    // Select engine by default
    craftApp.selectHotspot('engine');
  }

  // =========================================================================
  // 5. SECTION 07: GALAXIES & DEEP SPACE
  // =========================================================================
  function initGalaxySection() {
    const container = document.getElementById('galaxy-canvas');
    if (!container) return;

    const galaxyApp = Galaxies3D.create('galaxy-canvas', 'spiral');

    document.querySelectorAll('.holographic-galaxy-card').forEach(card => {
      card.addEventListener('click', () => {
        const type = card.dataset.galaxy;
        if (type) galaxyApp.setPreset(type);
      });
    });
  }

  // =========================================================================
  // 6. SECTION 08: COSMIC PHENOMENA
  // =========================================================================
  function initPhenomenaSection() {
    const container = document.getElementById('phenomena-canvas');
    if (!container) return;

    const nameEl = document.getElementById('phenomena-active-name');
    const descEl = document.getElementById('phenomena-active-desc');
    const massEl = document.getElementById('phenomena-stat-mass');
    const tempEl = document.getElementById('phenomena-stat-temp');

    const phenApp = Phenomena3D.create('phenomena-canvas', 'blackhole', {
      onSelect: (data) => {
        if (nameEl) nameEl.textContent = data.name;
        if (descEl) descEl.textContent = data.desc;
        if (massEl) massEl.textContent = data.mass;
        if (tempEl) tempEl.textContent = data.temperature;
      }
    });

    document.querySelectorAll('.phenomena-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.phenomena-item-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        phenApp.loadPhenomenon(btn.dataset.phenomenon);
      });
    });
  }

  // =========================================================================
  // 7. SECTION 10: FINAL CTA DEEP SPACE CANVAS
  // =========================================================================
  function initFinalCTA() {
    const container = document.getElementById('cta-space-canvas');
    if (!container) return;

    const app = SpaceThree.initScene(container, {
      fov: 60,
      camZ: 20,
      exposure: 1.2
    });
    if (!app) return;

    const { scene, camera, renderer } = app;
    const stars = SpaceThree.createStarfield(5000, 800);
    scene.add(stars);
    const vis = SpaceThree.watchVisibility(container);

    function animate() {
      requestAnimationFrame(animate);
      stars.rotation.z += 0.001;
      camera.position.z -= 0.03;
      if (camera.position.z < 5) camera.position.z = 25;
      if (vis.visible) renderer.render(scene, camera);
    }
    animate();

    const ctaBtn = document.getElementById('final-begin-journey-btn');
    if (ctaBtn) {
      ctaBtn.addEventListener('click', (e) => {
        e.preventDefault();
        SpaceNav.triggerWarpJump('pages/solar-system.html');
      });
    }
  }

  // Initialize all homepage modules
  initHeroVideo();
  initHeroCinematics();
  initSolarSystemSection();
  initPlanetDiscoverySection();
  initSpacecraftSection();
  initGalaxySection();
  initPhenomenaSection();
  initFinalCTA();

  // Initialize GSAP scroll animations & counters
  SpaceAnimations.init();
});
