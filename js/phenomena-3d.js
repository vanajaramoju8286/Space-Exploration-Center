/**
 * SPACE EXPLORATION CENTER — 3D COSMIC PHENOMENA ENGINE
 * Interactive WebGL simulations for Black Holes, Supernovas, Solar Flares, and Comets
 */

const Phenomena3D = (function() {
  'use strict';

  const PHENOMENA_DATA = {
    blackhole: {
      name: 'Supermassive Black Hole',
      subtitle: 'Sagittarius A* Gravitational Singularity',
      type: 'Gravitational Singularity & Accretion Disk',
      mass: '4.15 Million Solar Masses',
      eventHorizon: '12 Million km (Schwarzschild Radius)',
      temperature: '10 Billion Kelvin (Accretion Plasma)',
      desc: 'A region of spacetime where gravity is so intense that nothing—not even light—can escape. Matter falling into the supermassive black hole forms a superheated, rapidly swirling accretion disk radiating energetic X-rays and relativistic particle jets.'
    },
    supernova: {
      name: 'Type II Core-Collapse Supernova',
      subtitle: 'Cataclysmic Stellar Demise',
      type: 'Thermonuclear Stellar Detonation',
      mass: '20 Solar Masses Progenitor',
      eventHorizon: 'Shockwave Expanding at 15,000 km/s',
      temperature: '100 Billion Kelvin at Core Detonation',
      desc: 'The explosive death of a massive star whose iron core collapses under immense gravity in milliseconds, rebounding into an apocalyptic shockwave that outshines entire galaxies and synthesizes all heavy elements across the cosmos.'
    },
    flare: {
      name: 'Coronal Mass Ejection & Solar Flare',
      subtitle: 'Class X20+ Magnetic Reconnection',
      type: 'Magnetohydrodynamic Plasma Eruption',
      mass: '1 Billion Metric Tons Plasma Ejected',
      eventHorizon: 'Prominence Arc Spanning 450,000 km',
      temperature: '20 Million Kelvin In Reconnection Zone',
      desc: 'A massive burst of solar radiation caused by magnetic field lines twisting, snapping, and violently reconnecting in stellar atmospheres, releasing the energy equivalent of billions of megatons of TNT.'
    },
    comet: {
      name: 'Interstellar Comet & Ion Tail',
      subtitle: 'Pristine Oort Cloud Nomad',
      type: 'Dirty Snowball & Volatile Sublimation',
      mass: '500 Billion Metric Tons',
      eventHorizon: 'Ion Gas Tail Extending 150 Million km',
      temperature: '-220°C (Core) to 40°C (Sunlit Volatiles)',
      desc: 'Ancient cosmic wanderer composed of frozen methane, water ice, and prebiotic organic dust. As it approaches the sun, solar wind vaporizes volatiles, creating a glowing coma and dual tails stretching across astronomical units.'
    }
  };

  return {
    getData(id) {
      return PHENOMENA_DATA[id.toLowerCase()] || PHENOMENA_DATA.blackhole;
    },

    create(containerId, initialType = 'blackhole', options = {}) {
      const container = document.getElementById(containerId);
      if (!container) return null;

      const app = SpaceThree.initScene(container, {
        fov: 50,
        camX: 0,
        camY: 4,
        camZ: 18,
        controls: true,
        minDistance: 6,
        maxDistance: 45,
        exposure: 1.3
      });
      if (!app) return null;

      const { scene, camera, renderer, controls } = app;
      const vis = SpaceThree.watchVisibility(container);

      // Deep space starry background
      const stars = SpaceThree.createStarfield(3000, 900);
      scene.add(stars);

      const phenomenaGroup = new THREE.Group();
      scene.add(phenomenaGroup);

      let currentType = initialType;
      let activeMeshes = [];
      let updateFn = null;

      function loadPhenomenon(type) {
        currentType = type;

        // Cleanup previous
        while (phenomenaGroup.children.length > 0) {
          phenomenaGroup.remove(phenomenaGroup.children[0]);
        }
        activeMeshes = [];

        if (type === 'blackhole') {
          setupBlackHole();
        } else if (type === 'supernova') {
          setupSupernova();
        } else if (type === 'flare') {
          setupSolarFlare();
        } else if (type === 'comet') {
          setupComet();
        }

        if (options.onSelect) {
          options.onSelect(PHENOMENA_DATA[type]);
        }
      }

      // 1. BLACK HOLE (Event Horizon, Photon Sphere, Relativistic Accretion Disk, Particle Vortex)
      function setupBlackHole() {
        // Event Horizon: Pitch Black Sphere absorbing 100% of light
        const bhGeo = new THREE.SphereGeometry(3.0, 48, 48);
        const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const bhMesh = new THREE.Mesh(bhGeo, bhMat);
        phenomenaGroup.add(bhMesh);

        // Gravitational Lensing Halo (Photon Ring)
        const photonGeo = new THREE.SphereGeometry(3.2, 32, 32);
        const photonMat = new THREE.ShaderMaterial({
          vertexShader: `
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            varying vec3 vNormal;
            void main() {
              float intensity = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
              gl_FragColor = vec4(0.0, 0.94, 1.0, 1.0) * intensity * 2.2;
            }
          `,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          transparent: true
        });
        const photonMesh = new THREE.Mesh(photonGeo, photonMat);
        phenomenaGroup.add(photonMesh);

        // Accretion Disk Particles (Spiral Vortex)
        const particleCount = 12000;
        const pGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const particleData = [];

        const colorInner = new THREE.Color(0x00f0ff);
        const colorMid = new THREE.Color(0xf59e0b);
        const colorOuter = new THREE.Color(0xef4444);

        for (let i = 0; i < particleCount; i++) {
          const r = 3.6 + Math.pow(Math.random(), 1.5) * 8.5; // Radius from center
          const angle = Math.random() * Math.PI * 2;
          const y = (Math.random() - 0.5) * 0.45 * (r / 5);

          positions[i * 3] = Math.cos(angle) * r;
          positions[i * 3 + 1] = y;
          positions[i * 3 + 2] = Math.sin(angle) * r;

          // Color based on radial temperature
          const t = (r - 3.6) / 8.5;
          const col = t < 0.4 ? colorInner.clone().lerp(colorMid, t / 0.4) : colorMid.clone().lerp(colorOuter, (t - 0.4) / 0.6);
          colors[i * 3] = col.r;
          colors[i * 3 + 1] = col.g;
          colors[i * 3 + 2] = col.b;

          particleData.push({
            r: r,
            angle: angle,
            speed: 0.035 * (3.6 / r) // Keplerian-like differential rotation
          });
        }

        pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const pMat = new THREE.PointsMaterial({
          size: 0.18,
          vertexColors: true,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending
        });

        const diskPoints = new THREE.Points(pGeo, pMat);
        diskPoints.rotation.x = 0.35; // Tilt toward camera
        phenomenaGroup.add(diskPoints);

        updateFn = function() {
          const posAttr = pGeo.attributes.position;
          const arr = posAttr.array;

          for (let i = 0; i < particleCount; i++) {
            const p = particleData[i];
            p.angle += p.speed;
            arr[i * 3] = Math.cos(p.angle) * p.r;
            arr[i * 3 + 2] = Math.sin(p.angle) * p.r;
          }
          posAttr.needsUpdate = true;
          diskPoints.rotation.z += 0.002;
        };
      }

      // 2. SUPERNOVA
      function setupSupernova() {
        // Glowing Core
        const coreGeo = new THREE.SphereGeometry(1.5, 32, 32);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const core = new THREE.Mesh(coreGeo, coreMat);
        phenomenaGroup.add(core);

        // Expanding Particle Blast Wave
        const count = 9000;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const cols = new Float32Array(count * 3);
        const velocities = [];

        const c1 = new THREE.Color(0x38bdf8);
        const c2 = new THREE.Color(0xa855f7);
        const c3 = new THREE.Color(0xf43f5e);

        for (let i = 0; i < count; i++) {
          const dir = new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
          ).normalize();

          const speed = 0.04 + Math.random() * 0.08;
          velocities.push(dir.multiplyScalar(speed));

          pos[i * 3] = dir.x * 2;
          pos[i * 3 + 1] = dir.y * 2;
          pos[i * 3 + 2] = dir.z * 2;

          const col = Math.random() > 0.5 ? c1.clone().lerp(c2, Math.random()) : c2.clone().lerp(c3, Math.random());
          cols[i * 3] = col.r;
          cols[i * 3 + 1] = col.g;
          cols[i * 3 + 2] = col.b;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));

        const mat = new THREE.PointsMaterial({
          size: 0.22,
          vertexColors: true,
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: 0.8
        });

        const points = new THREE.Points(geo, mat);
        phenomenaGroup.add(points);

        updateFn = function() {
          const arr = geo.attributes.position.array;
          for (let i = 0; i < count; i++) {
            const v = velocities[i];
            arr[i * 3] += v.x;
            arr[i * 3 + 1] += v.y;
            arr[i * 3 + 2] += v.z;

            // Reset when expanded too far
            const distSq = arr[i * 3] * arr[i * 3] + arr[i * 3 + 1] * arr[i * 3 + 1] + arr[i * 3 + 2] * arr[i * 3 + 2];
            if (distSq > 160) {
              arr[i * 3] = 0;
              arr[i * 3 + 1] = 0;
              arr[i * 3 + 2] = 0;
            }
          }
          geo.attributes.position.needsUpdate = true;
          points.rotation.y += 0.003;
        };
      }

      // 3. SOLAR FLARE
      function setupSolarFlare() {
        // Solar Surface Segment
        const sunGeo = new THREE.SphereGeometry(6, 48, 48);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });
        const sun = new THREE.Mesh(sunGeo, sunMat);
        sun.position.x = -6;
        phenomenaGroup.add(sun);

        // Magnetic Arch Loop (Torus segment)
        const loopGeo = new THREE.TorusGeometry(3.5, 0.45, 16, 64, Math.PI);
        const loopMat = new THREE.MeshBasicMaterial({
          color: 0xffee44,
          transparent: true,
          opacity: 0.85
        });
        const loopMesh = new THREE.Mesh(loopGeo, loopMat);
        loopMesh.position.set(0, 1.2, 0);
        loopMesh.rotation.z = -Math.PI / 4;
        phenomenaGroup.add(loopMesh);

        // Ejected Plasma Sparks
        const count = 4000;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const cols = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
          pos[i * 3] = (Math.random() - 0.2) * 8;
          pos[i * 3 + 1] = (Math.random() - 0.2) * 8;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 4;

          cols[i * 3] = 1.0;
          cols[i * 3 + 1] = 0.5 + Math.random() * 0.5;
          cols[i * 3 + 2] = 0.1;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));

        const mat = new THREE.PointsMaterial({
          size: 0.18,
          vertexColors: true,
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: 0.9
        });

        const points = new THREE.Points(geo, mat);
        phenomenaGroup.add(points);

        updateFn = function() {
          loopMesh.rotation.y += 0.005;
          points.rotation.y += 0.003;
        };
      }

      // 4. COMET
      function setupComet() {
        // Icy Nucleus
        const nucGeo = new THREE.DodecahedronGeometry(0.8, 1);
        const nucMat = new THREE.MeshStandardMaterial({ color: 0xdde5ee, roughness: 0.9 });
        const nucleus = new THREE.Mesh(nucGeo, nucMat);
        phenomenaGroup.add(nucleus);

        // Coma Atmosphere Glow
        const comaGeo = new THREE.SphereGeometry(1.8, 24, 24);
        const comaMat = new THREE.MeshBasicMaterial({
          color: 0x67e8f9,
          transparent: true,
          opacity: 0.45,
          blending: THREE.AdditiveBlending
        });
        const coma = new THREE.Mesh(comaGeo, comaMat);
        phenomenaGroup.add(coma);

        // Dynamic Streamer Tail
        const count = 5000;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const cols = new Float32Array(count * 3);
        const tailData = [];

        for (let i = 0; i < count; i++) {
          const t = Math.random();
          const dist = t * 14.0;
          const spread = Math.pow(t, 0.7) * 2.2;
          const x = -dist;
          const y = (Math.random() - 0.5) * spread;
          const z = (Math.random() - 0.5) * spread;

          pos[i * 3] = x;
          pos[i * 3 + 1] = y;
          pos[i * 3 + 2] = z;

          cols[i * 3] = 0.2;
          cols[i * 3 + 1] = 0.8 + 0.2 * Math.random();
          cols[i * 3 + 2] = 1.0;

          tailData.push({ x: x, baseSpread: spread });
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));

        const mat = new THREE.PointsMaterial({
          size: 0.15,
          vertexColors: true,
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: 0.65
        });

        const tail = new THREE.Points(geo, mat);
        phenomenaGroup.add(tail);

        updateFn = function() {
          nucleus.rotation.x += 0.01;
          nucleus.rotation.y += 0.015;
          tail.rotation.x += 0.002;
        };
      }

      // Initial Load
      loadPhenomenon(initialType);

      // Animation loop
      let isRunning = true;
      let animId = null;

      function animate() {
        if (!isRunning) return;
        animId = requestAnimationFrame(animate);

        if (updateFn) updateFn();

        controls.update();
        if (vis.visible) renderer.render(scene, camera);
      }

      animate();

      return {
        loadPhenomenon,
        destroy() {
          isRunning = false;
          if (animId) cancelAnimationFrame(animId);
          vis.disconnect();
          app.destroy();
        }
      };
    }
  };
})();
