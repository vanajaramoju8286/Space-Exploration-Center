/**
 * SPACE EXPLORATION CENTER — GSAP SCROLLTRIGGER & CINEMATIC JOURNEY CONTROLLER
 * Controls Section 04 Space Journey camera fly-through, telemetry counters, and HUD reveals
 */

const SpaceAnimations = (function() {
  'use strict';

  // Initialize Section 04 Interactive 3D Journey Through Space
  function initSpaceJourney() {
    const journeySection = document.getElementById('space-journey-section');
    const canvasContainer = document.getElementById('journey-canvas');
    if (!journeySection || !canvasContainer) return;

    // Three.js scene for the journey
    const app = SpaceThree.initScene(canvasContainer, {
      fov: 55,
      camX: 2.0,
      camY: -0.5,
      camZ: 28,
      exposure: 1.2
    });
    if (!app) return;

    const { scene, camera, renderer } = app;
    const vis = SpaceThree.watchVisibility(canvasContainer);

    // Starfield Tunnel (6,000 stars distributed along a deep cylindrical flight corridor)
    const starCount = 6000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starCols = new Float32Array(starCount * 3);

    const corridorLength = 600;

    for (let i = 0; i < starCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 6 + Math.random() * 45;
      const z = (Math.random() - 0.5) * corridorLength;

      starPos[i * 3] = Math.cos(angle) * radius;
      starPos[i * 3 + 1] = Math.sin(angle) * radius;
      starPos[i * 3 + 2] = z;

      starCols[i * 3] = 0.6 + 0.4 * Math.random();
      starCols[i * 3 + 1] = 0.8 + 0.2 * Math.random();
      starCols[i * 3 + 2] = 1.0;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCols, 3));

    const starTex = SpaceTextures.createParticleTexture();
    const starMat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      map: starTex,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const starTunnel = new THREE.Points(starGeo, starMat);
    scene.add(starTunnel);

    // Add Waypoint Celestial Bodies along the flight path (Z: 20 -> -280)
    // 1. Earth & Moon (Z: 15)
    const earthGroup = new THREE.Group();
    earthGroup.position.set(5, -1, 15);
    const earthMesh = new THREE.Mesh(
      new THREE.SphereGeometry(3.5, 32, 32),
      new THREE.MeshStandardMaterial({ map: SpaceTextures.createEarthTexture(1024, 512), roughness: 0.7 })
    );
    earthGroup.add(earthMesh);
    const earthAtmo = SpaceThree.createAtmosphere(3.5, 0x00f0ff, 1.2, 3.0);
    earthGroup.add(earthAtmo);
    scene.add(earthGroup);

    // 2. Moon (Z: -30)
    const moonMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.6, 24, 24),
      new THREE.MeshStandardMaterial({ map: SpaceTextures.createMoonTexture(512, 256), roughness: 0.9 })
    );
    moonMesh.position.set(-6, 2, -30);
    scene.add(moonMesh);

    // 3. Mars (Z: -90)
    const marsGroup = new THREE.Group();
    marsGroup.position.set(7, -2, -90);
    const marsMesh = new THREE.Mesh(
      new THREE.SphereGeometry(3.0, 32, 32),
      new THREE.MeshStandardMaterial({ map: SpaceTextures.createMarsTexture(1024, 512), roughness: 0.85 })
    );
    marsGroup.add(marsMesh);
    const marsAtmo = SpaceThree.createAtmosphere(3.0, 0xd1531e, 1.1, 3.2);
    marsGroup.add(marsAtmo);
    scene.add(marsGroup);

    // 4. Jupiter (Z: -160)
    const jupMesh = new THREE.Mesh(
      new THREE.SphereGeometry(7.5, 36, 36),
      new THREE.MeshStandardMaterial({ map: SpaceTextures.createJupiterTexture(1024, 512), roughness: 0.85 })
    );
    jupMesh.position.set(-11, 4, -160);
    scene.add(jupMesh);

    // 5. Saturn with Rings (Z: -230)
    const saturnGroup = new THREE.Group();
    saturnGroup.position.set(9, -3, -230);
    const satMesh = new THREE.Mesh(
      new THREE.SphereGeometry(5.8, 36, 36),
      new THREE.MeshStandardMaterial({ map: SpaceTextures.createSaturnTexture(1024, 512), roughness: 0.85 })
    );
    saturnGroup.add(satMesh);

    const ringGeo = new THREE.RingGeometry(8.0, 14.5, 64);
    ringGeo.rotateX(Math.PI / 2.2);
    const ringMat = new THREE.MeshStandardMaterial({
      map: SpaceTextures.createSaturnRingsTexture(1024, 64),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    saturnGroup.add(ringMesh);
    scene.add(saturnGroup);

    // Lighting
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.set(30, 20, 50);
    scene.add(sunLight);
    const ambient = new THREE.AmbientLight(0x1e293b, 0.45);
    scene.add(ambient);

    // Waypoint coordinates definition
    const WAYPOINTS = [
      { id: 0, name: 'Earth', z: 28, x: 2.0, y: -0.5 },
      { id: 1, name: 'Moon', z: -18, x: -3.5, y: 1.0 },
      { id: 2, name: 'Mars', z: -78, x: 3.5, y: -1.0 },
      { id: 3, name: 'Jupiter', z: -142, x: -6.0, y: 2.0 },
      { id: 4, name: 'Saturn', z: -208, x: 5.0, y: -1.5 }
    ];

    let currentWaypoint = 0;
    let targetCamPos = { x: WAYPOINTS[0].x, y: WAYPOINTS[0].y, z: WAYPOINTS[0].z };
    let isAutopilot = false;
    let autopilotInterval = null;

    function flyToWaypoint(index) {
      if (index < 0 || index >= WAYPOINTS.length) return;
      currentWaypoint = index;
      const wp = WAYPOINTS[index];
      targetCamPos.x = wp.x;
      targetCamPos.y = wp.y;
      targetCamPos.z = wp.z;

      // Update HUD buttons
      document.querySelectorAll('.solar-hud-btn[data-waypoint]').forEach(b => {
        b.classList.toggle('active', parseInt(b.dataset.waypoint, 10) === index);
      });

      // Update Grid cards
      document.querySelectorAll('.journey-grid-card').forEach(c => {
        c.classList.toggle('active', parseInt(c.dataset.waypoint, 10) === index);
      });

      if (typeof SpaceNav !== 'undefined') {
        SpaceNav.playChirp(700 + index * 130, 'sine', 0.08);
      }
    }

    // Attach click listeners to top waypoint buttons
    document.querySelectorAll('.solar-hud-btn[data-waypoint]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.waypoint, 10);
        flyToWaypoint(idx);
      });
    });

    // Attach click listeners to waypoint cards
    document.querySelectorAll('.journey-grid-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.waypoint, 10);
        flyToWaypoint(idx);
      });
    });

    // Autopilot toggle button
    const autoBtn = document.getElementById('journey-autopilot-btn');
    const autoLabel = document.getElementById('autopilot-label');
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        isAutopilot = !isAutopilot;
        if (isAutopilot) {
          if (autoLabel) autoLabel.textContent = 'AUTOPILOT: ON';
          autoBtn.style.background = 'rgba(0, 240, 255, 0.2)';
          autopilotInterval = setInterval(() => {
            const nextIdx = (currentWaypoint + 1) % WAYPOINTS.length;
            flyToWaypoint(nextIdx);
          }, 4500);
        } else {
          if (autoLabel) autoLabel.textContent = 'AUTOPILOT: OFF';
          autoBtn.style.background = 'transparent';
          if (autopilotInterval) clearInterval(autopilotInterval);
        }
      });
    }

    // Mouse drag rotation for interactive inspection
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    canvasContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    canvasContainer.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      camera.rotation.y -= deltaX * 0.003;
      camera.rotation.x -= deltaY * 0.003;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    // Touch support
    canvasContainer.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    canvasContainer.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;

      camera.rotation.y -= deltaX * 0.004;
      camera.rotation.x -= deltaY * 0.004;

      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    // Render loop
    let isRunning = true;
    function animate() {
      if (!isRunning) return;
      requestAnimationFrame(animate);

      // Smooth camera interpolation towards target waypoint
      camera.position.z += (targetCamPos.z - camera.position.z) * 0.045;
      camera.position.x += (targetCamPos.x - camera.position.x) * 0.045;
      camera.position.y += (targetCamPos.y - camera.position.y) * 0.045;

      earthMesh.rotation.y += 0.004;
      moonMesh.rotation.y += 0.002;
      marsMesh.rotation.y += 0.0035;
      jupMesh.rotation.y += 0.005;
      satMesh.rotation.y += 0.004;
      starTunnel.rotation.z += 0.0006;

      if (vis.visible) renderer.render(scene, camera);
    }
    animate();
  }

  // Animated Telemetry Counters (Section 09 Discoveries)
  function initCounters() {
    const counters = document.querySelectorAll('.counter-number');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const targetNum = parseInt(el.getAttribute('data-target') || '0', 10);
          const prefix = el.getAttribute('data-prefix') || '';
          const suffix = el.getAttribute('data-suffix') || '';

          if (typeof gsap !== 'undefined') {
            const obj = { val: 0 };
            gsap.to(obj, {
              val: targetNum,
              duration: 2.2,
              ease: 'power2.out',
              onUpdate: () => {
                el.textContent = `${prefix}${Math.floor(obj.val).toLocaleString()}${suffix}`;
              }
            });
          } else {
            el.textContent = `${prefix}${targetNum.toLocaleString()}${suffix}`;
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    counters.forEach(c => observer.observe(c));
  }

  // Timeline center line draws from top to bottom as the section scrolls into view
  function initTimelineLine() {
    const line = document.querySelector('.timeline-center-line');
    const section = document.getElementById('mission-timeline-section');
    if (!line || !section) return;

    // Path 1: GSAP ScrollTrigger (loaded via CDN on index.html).
    // NOTE: ScrollTrigger registers as a global, NOT as gsap.ScrollTrigger.
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      gsap.set(line, { x: 0, xPercent: -50, transformOrigin: 'top center' });
      gsap.fromTo(
        line,
        { scaleY: 0.001 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            end: 'bottom 55%',
            scrub: true
          }
        }
      );

      // Re-measure trigger positions once fonts/media have settled
      window.addEventListener('load', () => {
        if (typeof ScrollTrigger.refresh === 'function') ScrollTrigger.refresh();
      });
      return;
    }

    // Path 2: dependency-free fallback — identical draw driven by scroll position
    line.style.transformOrigin = 'top center';

    function paint() {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = Math.min(1, Math.max(0, (vh * 0.75 - rect.top) / (vh * 0.2 + rect.height)));
      line.style.transform = 'translateX(-50%) scaleY(' + Math.max(p, 0.001).toFixed(4) + ')';
    }

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        paint();
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    paint();
  }

  return {
    init() {
      initSpaceJourney();
      initCounters();
      initTimelineLine();
    }
  };
})();
