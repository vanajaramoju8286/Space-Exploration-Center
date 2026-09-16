/**
 * SPACE EXPLORATION CENTER — 3D SOLAR SYSTEM ENGINE
 * Realistic 3D Solar System simulation, orbits, planet selection, camera fly-to
 */

const SolarSystemEngine = (function() {
  'use strict';

  // Comprehensive Planetary Astronomical Dataset
  const PLANET_DATA = {
    sun: {
      name: 'Sun',
      type: 'Yellow Dwarf Star (G2V)',
      distance: '0 AU (0 km)',
      diameter: '1,392,700 km',
      moons: '8 planets, 5 dwarf planets',
      period: '230 Million Years (Galactic)',
      temp: '5,500°C (Surface) / 15M°C (Core)',
      slug: 'sun',
      desc: 'The heart of our solar system, containing 99.86% of the total system mass.'
    },
    mercury: {
      name: 'Mercury',
      type: 'Terrestrial Planet',
      distance: '57.9 Million km (0.39 AU)',
      diameter: '4,879 km',
      moons: '0',
      period: '88 Earth Days',
      temp: '-180°C to 430°C',
      slug: 'mercury',
      desc: 'The smallest and innermost planet, enduring extreme swings in temperature.'
    },
    venus: {
      name: 'Venus',
      type: 'Terrestrial Planet',
      distance: '108.2 Million km (0.72 AU)',
      diameter: '12,104 km',
      moons: '0',
      period: '225 Earth Days',
      temp: '465°C (Runaway Greenhouse)',
      slug: 'venus',
      desc: 'Earth\'s toxic twin with a crushing atmospheric pressure and sulfuric acid clouds.'
    },
    earth: {
      name: 'Earth',
      type: 'Terrestrial Planet (Oasis World)',
      distance: '149.6 Million km (1.00 AU)',
      diameter: '12,742 km',
      moons: '1 (The Moon)',
      period: '365.25 Earth Days',
      temp: '-88°C to 58°C (Avg: 15°C)',
      slug: 'earth',
      desc: 'The only known planetary haven harboring liquid water, complex biochemistry, and conscious life.'
    },
    mars: {
      name: 'Mars',
      type: 'Terrestrial Planet (The Red Planet)',
      distance: '227.9 Million km (1.52 AU)',
      diameter: '6,779 km',
      moons: '2 (Phobos & Deimos)',
      period: '687 Earth Days',
      temp: '-140°C to 20°C',
      slug: 'mars',
      desc: 'A dusty, cold desert world hosting the solar system\'s greatest volcano and canyon systems.'
    },
    jupiter: {
      name: 'Jupiter',
      type: 'Gas Giant',
      distance: '778.5 Million km (5.20 AU)',
      diameter: '139,820 km',
      moons: '95 confirmed',
      period: '11.86 Earth Years',
      temp: '-110°C (Cloud Top)',
      slug: 'jupiter',
      desc: 'The colossal king of planets, with a mass more than twice all other planets combined.'
    },
    saturn: {
      name: 'Saturn',
      type: 'Gas Giant (Ringed Jewel)',
      distance: '1.43 Billion km (9.58 AU)',
      diameter: '116,460 km',
      moons: '146 confirmed',
      period: '29.45 Earth Years',
      temp: '-140°C',
      slug: 'saturn',
      desc: 'Adorned with a dazzling, complex ring system consisting of billions of icy particles.'
    },
    uranus: {
      name: 'Uranus',
      type: 'Ice Giant',
      distance: '2.87 Billion km (19.2 AU)',
      diameter: '50,724 km',
      moons: '28 confirmed',
      period: '84 Earth Years',
      temp: '-195°C',
      slug: 'uranus',
      desc: 'An ice giant rotating on its side at an extreme 98-degree axial tilt.'
    },
    neptune: {
      name: 'Neptune',
      type: 'Ice Giant',
      distance: '4.50 Billion km (30.1 AU)',
      diameter: '49,244 km',
      moons: '16 confirmed',
      period: '164.8 Earth Years',
      temp: '-200°C',
      slug: 'neptune',
      desc: 'The windiest world in the solar system, whipped by supersonic storms exceeding 2,100 km/h.'
    }
  };

  return {
    getPlanetData(key) {
      return PLANET_DATA[key.toLowerCase()] || PLANET_DATA.earth;
    },

    getAllPlanets() {
      return PLANET_DATA;
    },

    // Initialize solar system in a container
    create(containerId, options = {}) {
      const container = document.getElementById(containerId);
      if (!container) return null;

      const app = SpaceThree.initScene(container, {
        fov: 50,
        camX: 0,
        camY: 45,
        camZ: 110,
        controls: true,
        minDistance: 12,
        maxDistance: 450,
        exposure: 1.2
      });
      if (!app) return null;

      const { scene, camera, renderer, controls } = app;
      const vis = SpaceThree.watchVisibility(container);
      camera.lookAt(0, 0, 0);

      // Starfield background
      const stars = SpaceThree.createStarfield(4000, 1200);
      scene.add(stars);

      // Lighting: Sun Light (Point Light at center) + ambient fill
      const ambientLight = new THREE.AmbientLight(0x223355, 0.65);
      scene.add(ambientLight);

      const sunLight = new THREE.PointLight(0xffffff, 2.5, 900, 0.4);
      sunLight.position.set(0, 0, 0);
      scene.add(sunLight);

      // 1. SUN
      const sunGeo = new THREE.SphereGeometry(7, 48, 48);
      const sunTex = SpaceTextures.createSunTexture(1024, 512);
      const sunMat = new THREE.MeshBasicMaterial({ map: sunTex });
      const sunMesh = new THREE.Mesh(sunGeo, sunMat);
      sunMesh.userData = { id: 'sun' };
      scene.add(sunMesh);

      // Sun Outer Corona Flare
      const coronaGeo = new THREE.SphereGeometry(8.5, 32, 32);
      const coronaMat = new THREE.ShaderMaterial({
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
            float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
            gl_FragColor = vec4(1.0, 0.6, 0.1, 1.0) * intensity * 1.8;
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
      });
      const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
      scene.add(coronaMesh);

      // 2. PLANET CONFIGURATIONS
      const planetConfigs = [
        {
          id: 'mercury',
          radius: 1.0,
          orbitDist: 15,
          speed: 0.024,
          rotSpeed: 0.004,
          textureFn: SpaceTextures.createMercuryTexture
        },
        {
          id: 'venus',
          radius: 1.6,
          orbitDist: 22,
          speed: 0.018,
          rotSpeed: 0.002,
          textureFn: SpaceTextures.createVenusTexture,
          atmosphereColor: 0xdeb887
        },
        {
          id: 'earth',
          radius: 1.8,
          orbitDist: 31,
          speed: 0.014,
          rotSpeed: 0.012,
          textureFn: SpaceTextures.createEarthTexture,
          hasClouds: true,
          hasMoon: true,
          atmosphereColor: 0x00f0ff
        },
        {
          id: 'mars',
          radius: 1.3,
          orbitDist: 41,
          speed: 0.011,
          rotSpeed: 0.011,
          textureFn: SpaceTextures.createMarsTexture,
          atmosphereColor: 0xd1531e
        },
        {
          id: 'jupiter',
          radius: 4.2,
          orbitDist: 58,
          speed: 0.007,
          rotSpeed: 0.02,
          textureFn: SpaceTextures.createJupiterTexture
        },
        {
          id: 'saturn',
          radius: 3.5,
          orbitDist: 74,
          speed: 0.005,
          rotSpeed: 0.018,
          textureFn: SpaceTextures.createSaturnTexture,
          hasRings: true
        },
        {
          id: 'uranus',
          radius: 2.4,
          orbitDist: 89,
          speed: 0.0035,
          rotSpeed: 0.014,
          textureFn: SpaceTextures.createUranusTexture,
          atmosphereColor: 0x7ee2eb
        },
        {
          id: 'neptune',
          radius: 2.3,
          orbitDist: 104,
          speed: 0.0028,
          rotSpeed: 0.013,
          textureFn: SpaceTextures.createNeptuneTexture,
          atmosphereColor: 0x275dd6
        }
      ];

      const planets = [];
      const interactableObjects = [sunMesh];

      // Build each planet and its orbit track
      planetConfigs.forEach(cfg => {
        // Orbit ring line
        const orbitPoints = [];
        const segments = 128;
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          orbitPoints.push(new THREE.Vector3(Math.cos(theta) * cfg.orbitDist, 0, Math.sin(theta) * cfg.orbitDist));
        }
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        const orbitMat = new THREE.LineBasicMaterial({
          color: 0x00f0ff,
          transparent: true,
          opacity: 0.18
        });
        const orbitLine = new THREE.Line(orbitGeo, orbitMat);
        scene.add(orbitLine);

        // Planet Pivot container for smooth orbit rotation
        const pivot = new THREE.Group();
        scene.add(pivot);

        // Planet Mesh
        const pGeo = new THREE.SphereGeometry(cfg.radius, 36, 36);
        const pTex = cfg.textureFn();
        const pMat = new THREE.MeshStandardMaterial({
          map: pTex,
          roughness: 0.85,
          metalness: 0.1
        });
        const planetMesh = new THREE.Mesh(pGeo, pMat);
        planetMesh.position.x = cfg.orbitDist;
        planetMesh.userData = { id: cfg.id };
        pivot.add(planetMesh);
        interactableObjects.push(planetMesh);

        // Atmospheric Halo if defined
        if (cfg.atmosphereColor) {
          const atmo = SpaceThree.createAtmosphere(cfg.radius, cfg.atmosphereColor, 1.1, 3.2);
          planetMesh.add(atmo);
        }

        // Earth Clouds layer
        let cloudsMesh = null;
        if (cfg.hasClouds) {
          const cloudGeo = new THREE.SphereGeometry(cfg.radius * 1.025, 36, 36);
          const cloudTex = SpaceTextures.createEarthCloudsTexture();
          const cloudMat = new THREE.MeshStandardMaterial({
            map: cloudTex,
            transparent: true,
            opacity: 0.9,
            blending: THREE.NormalBlending
          });
          cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
          planetMesh.add(cloudsMesh);
        }

        // Earth Moon
        let moonPivot = null;
        if (cfg.hasMoon) {
          moonPivot = new THREE.Group();
          planetMesh.add(moonPivot);
          const moonGeo = new THREE.SphereGeometry(0.35, 24, 24);
          const moonTex = SpaceTextures.createMoonTexture();
          const moonMat = new THREE.MeshStandardMaterial({ map: moonTex, roughness: 0.9 });
          const moonMesh = new THREE.Mesh(moonGeo, moonMat);
          moonMesh.position.x = 3.5;
          moonPivot.add(moonMesh);
        }

        // Saturn Rings
        if (cfg.hasRings) {
          const ringGeo = new THREE.RingGeometry(cfg.radius * 1.35, cfg.radius * 2.5, 64);
          // Align ring flat horizontally
          ringGeo.rotateX(Math.PI / 2);
          const ringTex = SpaceTextures.createSaturnRingsTexture();
          const ringMat = new THREE.MeshStandardMaterial({
            map: ringTex,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.88,
            roughness: 0.7
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = 0.2; // Slight orbital inclination
          planetMesh.add(ringMesh);
        }

        planets.push({
          id: cfg.id,
          pivot,
          mesh: planetMesh,
          cloudsMesh,
          moonPivot,
          speed: cfg.speed,
          rotSpeed: cfg.rotSpeed,
          angle: Math.random() * Math.PI * 2,
          orbitDist: cfg.orbitDist,
          radius: cfg.radius
        });
      });

      // Orbit speed control multiplier
      let speedFactor = 1.0;
      let targetFocus = null; // Target planet to fly-to

      // Raycaster for user clicks and hovers
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      function onCanvasClick(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactableObjects, true);

        if (intersects.length > 0) {
          let hitObj = intersects[0].object;
          while (hitObj.parent && !hitObj.userData.id && hitObj.parent !== scene) {
            hitObj = hitObj.parent;
          }
          const id = hitObj.userData ? hitObj.userData.id : null;
          if (id) {
            focusPlanet(id);
          }
        }
      }

      renderer.domElement.addEventListener('click', onCanvasClick);

      // Smooth Camera Fly-To function
      function focusPlanet(planetId) {
        const data = PLANET_DATA[planetId.toLowerCase()];
        if (!data) return;

        // Dispatch HUD event
        if (options.onPlanetSelect) {
          options.onPlanetSelect(data);
        }

        if (planetId === 'sun') {
          targetFocus = { target: new THREE.Vector3(0, 0, 0), camPos: new THREE.Vector3(0, 15, 30) };
          return;
        }

        const pObj = planets.find(p => p.id === planetId);
        if (pObj) {
          const worldPos = new THREE.Vector3();
          pObj.mesh.getWorldPosition(worldPos);

          const offsetDist = Math.max(pObj.radius * 3.8, 6.5);
          targetFocus = {
            target: worldPos,
            camPos: new THREE.Vector3(worldPos.x + offsetDist, worldPos.y + offsetDist * 0.5, worldPos.z + offsetDist),
            planet: pObj
          };
        }
      }

      // Reset Camera to Solar Overview
      function resetView() {
        targetFocus = {
          target: new THREE.Vector3(0, 0, 0),
          camPos: new THREE.Vector3(0, 45, 110)
        };
      }

      // Animation Loop
      let isRunning = true;
      let animationFrameId = null;

      function animate() {
        if (!isRunning) return;
        animationFrameId = requestAnimationFrame(animate);

        // Rotate Sun
        sunMesh.rotation.y += 0.002 * speedFactor;

        // Orbits & Rotations
        planets.forEach(p => {
          p.angle += p.speed * 0.5 * speedFactor;
          p.pivot.rotation.y = p.angle;
          p.mesh.rotation.y += p.rotSpeed * speedFactor;

          if (p.cloudsMesh) {
            p.cloudsMesh.rotation.y += p.rotSpeed * 1.3 * speedFactor;
          }
          if (p.moonPivot) {
            p.moonPivot.rotation.y += 0.04 * speedFactor;
          }
        });

        // Smooth Camera Transition toward Target Focus
        if (targetFocus) {
          if (targetFocus.planet) {
            targetFocus.planet.mesh.getWorldPosition(targetFocus.target);
            const offsetDist = Math.max(targetFocus.planet.radius * 3.8, 6.5);
            targetFocus.camPos.set(
              targetFocus.target.x + offsetDist,
              targetFocus.target.y + offsetDist * 0.4,
              targetFocus.target.z + offsetDist
            );
          }

          camera.position.lerp(targetFocus.camPos, 0.04);
          controls.target.lerp(targetFocus.target, 0.04);

          if (camera.position.distanceTo(targetFocus.camPos) < 0.2) {
            targetFocus = null; // Reached target
          }
        }

        controls.update();
        if (vis.visible) renderer.render(scene, camera);
      }

      animate();

      return {
        focusPlanet,
        resetView,
        setSpeed(factor) {
          speedFactor = factor;
        },
        destroy() {
          isRunning = false;
          if (animationFrameId) cancelAnimationFrame(animationFrameId);
          vis.disconnect();
          renderer.domElement.removeEventListener('click', onCanvasClick);
          app.destroy();
        }
      };
    }
  };
})();
