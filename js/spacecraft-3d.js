/**
 * SPACE EXPLORATION CENTER — 3D SPACECRAFT MODEL & HOTSPOT ENGINE
 * Interactive 3D spacecraft built with Three.js procedural geometry & interactive telemetry hotspots
 */

const Spacecraft3D = (function() {
  'use strict';

  // Subsystem telemetry data
  const SUBSYSTEM_DATA = {
    engine: {
      id: 'engine',
      title: 'Aerojet AJ10 & Ion Thruster Array',
      category: 'Propulsion & Orbital Maneuvering',
      status: 'Nominal (100% Thrust Ready)',
      power: '33.4 kN Thrust Output',
      desc: 'High-efficiency dual-mode propulsion system combining hypergolic bipropellant engines for high-thrust maneuvers with xenon ion thrusters for ultra-efficient deep space interplanetary transit.',
      telemetry: [
        { label: 'Chamber Pressure', val: '1.24 MPa' },
        { label: 'Propellant Mass', val: '9,280 kg' },
        { label: 'Specific Impulse (Isp)', val: '316 s (Biprop) / 3,200 s (Ion)' },
        { label: 'Nozzle Temp', val: '1,420°C' }
      ]
    },
    solar: {
      id: 'solar',
      title: 'UltraFlex Photovoltaic Wings',
      category: 'Power Generation & Storage',
      status: 'Active (Sun Tracking Locked)',
      power: '11.2 kW Generation at 1.0 AU',
      desc: 'Four multi-junction gallium-arsenide solar array wings mounted on two-axis gimbals providing uninterrupted autonomous solar tracking throughout cis-lunar and interplanetary trajectories.',
      telemetry: [
        { label: 'Total Array Area', val: '42.5 m²' },
        { label: 'Battery Reserve (Li-ion)', val: '120 kWh (98%)' },
        { label: 'Solar Flux Efficiency', val: '32.4%' },
        { label: 'Gimbal Tracking Angle', val: '44.8° Azimuth' }
      ]
    },
    comms: {
      id: 'comms',
      title: 'X/Ka-Band High-Gain Parabolic Reflector',
      category: 'Deep Space Telecommunications',
      status: 'Uplink Established (DSN Goldstone)',
      power: '100W TWTA Output',
      desc: 'Gimballed 2.4-meter carbon-composite parabolic reflector supporting high-bandwidth Ka-band scientific downlink and optical laser communication transceiver capable of 250 Mbps at lunar distances.',
      telemetry: [
        { label: 'Downlink Frequency', val: '32.05 GHz (Ka-Band)' },
        { label: 'Latency (Round-Trip)', val: '2.56 s' },
        { label: 'Bit Error Rate (BER)', val: '< 10⁻¹¹' },
        { label: 'Signal Strength', val: '-84 dBm' }
      ]
    },
    instruments: {
      id: 'instruments',
      title: 'Multispectral Deep Space Science Suite',
      category: 'Scientific Payload & Sensors',
      status: 'Surveying Target Orbit',
      power: '650W Sensor Draw',
      desc: 'Advanced instrumentation suite comprising a thermal infrared imaging spectrometer, magnetometer boom, cosmic ray radiation detector, and autonomous star tracker inertial guidance units.',
      telemetry: [
        { label: 'Radiation Sensor', val: '0.45 mSv/day' },
        { label: 'Magnetometer Field', val: '4.8 nT' },
        { label: 'Spectral Bands', val: '0.35 - 5.2 µm' },
        { label: 'Optical Resolution', val: '0.28 arcsec/pixel' }
      ]
    },
    crew: {
      id: 'crew',
      title: 'Pressurized Crew Module & ECLSS',
      category: 'Habitation & Environmental Life Support',
      status: 'Atmosphere Balanced (21% O2 / 78% N2)',
      power: 'Nominal 4-Astronaut Support',
      desc: 'Carbon-fiber reinforced titanium pressure vessel with closed-loop CO2 scrubbers, water recycling loop, integrated glass cockpit avionics, and high-energy radiation storm shelter.',
      telemetry: [
        { label: 'Cabin Pressure', val: '101.3 kPa (14.7 psi)' },
        { label: 'O2 Concentration', val: '20.9%' },
        { label: 'Cabin Temp', val: '21.5°C' },
        { label: 'Habitable Volume', val: '19.55 m³' }
      ]
    }
  };

  // Build the 3D procedural spacecraft mesh
  function buildSpacecraftModel() {
    const ship = new THREE.Group();

    // Metallic Hull Materials
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.8,
      roughness: 0.25
    });

    const darkHullMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.35
    });

    const solarMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      metalness: 0.95,
      roughness: 0.1,
      emissive: 0x0284c7,
      emissiveIntensity: 0.25
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.15
    });

    const engineGlowMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff
    });

    // 1. Crew Capsule / Command Module (Cone)
    const coneGeo = new THREE.ConeGeometry(2.4, 3.2, 32);
    const capsuleMesh = new THREE.Mesh(coneGeo, hullMat);
    capsuleMesh.position.y = 4.2;
    ship.add(capsuleMesh);

    // Docking Port (Top Ring)
    const dockGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.5, 24);
    const dockMesh = new THREE.Mesh(dockGeo, darkHullMat);
    dockMesh.position.y = 5.9;
    ship.add(dockMesh);

    // Cockpit Windows (Visor Band)
    const windowGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.4, 24, 1, false, 0, Math.PI * 0.8);
    const windowMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 1.0 });
    const windowMesh = new THREE.Mesh(windowGeo, windowMat);
    windowMesh.position.set(0, 4.3, 0.05);
    windowMesh.rotation.y = Math.PI * 0.6;
    ship.add(windowMesh);

    // 2. Service Module Cylinder (Main Body)
    const bodyGeo = new THREE.CylinderGeometry(2.4, 2.4, 4.5, 32);
    const bodyMesh = new THREE.Mesh(bodyGeo, hullMat);
    bodyMesh.position.y = 0.5;
    ship.add(bodyMesh);

    // Radiator Panels Bands
    const radGeo = new THREE.CylinderGeometry(2.45, 2.45, 1.2, 32);
    const radMesh = new THREE.Mesh(radGeo, darkHullMat);
    radMesh.position.y = 1.2;
    ship.add(radMesh);

    // 3. Engine Section & Nozzles (Bottom)
    const engineBaseGeo = new THREE.CylinderGeometry(2.4, 1.8, 1.5, 32);
    const engineBase = new THREE.Mesh(engineBaseGeo, darkHullMat);
    engineBase.position.y = -2.5;
    ship.add(engineBase);

    // Main Engine Nozzle Bell
    const nozzleGeo = new THREE.ConeGeometry(1.2, 2.0, 32, 1, true);
    nozzleGeo.rotateX(Math.PI);
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.3 });
    const nozzleMesh = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzleMesh.position.y = -3.8;
    ship.add(nozzleMesh);

    // Engine Ion Plasma Core
    const ionGeo = new THREE.SphereGeometry(0.7, 16, 16);
    const ionMesh = new THREE.Mesh(ionGeo, engineGlowMat);
    ionMesh.position.y = -3.7;
    ship.add(ionMesh);

    // 4. Solar Wings (X-Wing 4 Arrays)
    const wingLength = 7.5;
    const wingWidth = 1.8;
    const wingThick = 0.08;

    const wingAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
    wingAngles.forEach(angle => {
      const wingArm = new THREE.Group();
      wingArm.rotation.y = angle;

      // Boom spar
      const sparGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.0, 8);
      sparGeo.rotateZ(Math.PI / 2);
      const spar = new THREE.Mesh(sparGeo, darkHullMat);
      spar.position.x = 2.4 + 1.5;
      spar.position.y = 0;
      wingArm.add(spar);

      // Photovoltaic Panel
      const panelGeo = new THREE.BoxGeometry(wingLength, wingThick, wingWidth);
      const panelMesh = new THREE.Mesh(panelGeo, solarMat);
      panelMesh.position.x = 2.4 + 3.0 + (wingLength / 2);
      panelMesh.position.y = 0;
      wingArm.add(panelMesh);

      ship.add(wingArm);
    });

    // 5. High-Gain Parabolic Dish Antenna
    const dishArm = new THREE.Group();
    dishArm.position.set(2.6, 2.0, 0);

    const boomGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8);
    boomGeo.rotateZ(Math.PI / 3);
    const boom = new THREE.Mesh(boomGeo, darkHullMat);
    dishArm.add(boom);

    // Parabolic Dish (Half sphere / hemisphere)
    const dishGeo = new THREE.SphereGeometry(1.4, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    dishGeo.rotateX(-Math.PI / 3);
    const dishMesh = new THREE.Mesh(dishGeo, goldMat);
    dishMesh.position.set(1.4, 0.8, 0);
    dishArm.add(dishMesh);

    // Sub-reflector feed horn
    const feedGeo = new THREE.ConeGeometry(0.15, 0.7, 12);
    feedGeo.rotateX(-Math.PI / 3);
    const feedMesh = new THREE.Mesh(feedGeo, darkHullMat);
    feedMesh.position.set(1.6, 1.2, 0);
    dishArm.add(feedMesh);

    ship.add(dishArm);

    // 6. Science Instruments Boom (Magnetometer & Sensors)
    const sciArm = new THREE.Group();
    sciArm.position.set(-2.5, 1.8, 0);
    const sciBoomGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.5, 8);
    sciBoomGeo.rotateZ(-Math.PI / 3);
    const sciBoom = new THREE.Mesh(sciBoomGeo, darkHullMat);
    sciArm.add(sciBoom);

    const sensorBox = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.8), goldMat);
    sensorBox.position.set(-2.0, 1.2, 0);
    sciArm.add(sensorBox);

    ship.add(sciArm);

    return ship;
  }

  // Create Hotspot Pin Marker
  function createHotspotPin(id, position, label) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.userData = { isHotspot: true, id: id, label: label };

    // Core Glowing Sphere
    const pinGeo = new THREE.SphereGeometry(0.28, 16, 16);
    const pinMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const pinMesh = new THREE.Mesh(pinGeo, pinMat);
    group.add(pinMesh);

    // Outer Pulsing Ring
    const ringGeo = new THREE.RingGeometry(0.4, 0.52, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    group.add(ringMesh);

    group.userData.ring = ringMesh;
    return group;
  }

  return {
    getSubsystem(id) {
      return SUBSYSTEM_DATA[id] || SUBSYSTEM_DATA.engine;
    },

    getAllSubsystems() {
      return SUBSYSTEM_DATA;
    },

    create(containerId, options = {}) {
      const container = document.getElementById(containerId);
      if (!container) return null;

      const app = SpaceThree.initScene(container, {
        fov: 45,
        camX: 8,
        camY: 5,
        camZ: 15,
        controls: true,
        minDistance: 6,
        maxDistance: 35,
        exposure: 1.2
      });
      if (!app) return null;

      const { scene, camera, renderer, controls } = app;
      const vis = SpaceThree.watchVisibility(container);

      // Deep space starry environment
      const stars = SpaceThree.createStarfield(2000, 700);
      scene.add(stars);

      // Studio Spacecraft Key & Rim Lighting
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
      keyLight.position.set(15, 20, 20);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0x0284c7, 1.2);
      fillLight.position.set(-15, -10, -10);
      scene.add(fillLight);

      const cyanRim = new THREE.DirectionalLight(0x00f0ff, 1.0);
      cyanRim.position.set(0, 15, -20);
      scene.add(cyanRim);

      const ambient = new THREE.AmbientLight(0x0f172a, 0.5);
      scene.add(ambient);

      // Add Spacecraft Model
      const craft = buildSpacecraftModel();
      // Lay craft at an appealing cinematic angle
      craft.rotation.z = -0.35;
      craft.rotation.x = 0.2;
      scene.add(craft);

      // Create Hotspots at key subsystems
      const hotspots = [
        createHotspotPin('crew', new THREE.Vector3(0, 4.5, 2.2), 'Crew Module'),
        createHotspotPin('solar', new THREE.Vector3(7.5, 0, 0), 'Solar Wings'),
        createHotspotPin('engine', new THREE.Vector3(0, -3.8, 1.6), 'Ion Propulsion'),
        createHotspotPin('comms', new THREE.Vector3(3.8, 2.5, 0), 'High-Gain Dish'),
        createHotspotPin('instruments', new THREE.Vector3(-4.0, 2.8, 0), 'Science Suite')
      ];

      craft.add(...hotspots);

      // Raycasting for hotspot clicks & hovers
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      function onPointerDown(e) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const pinMeshes = [];
        hotspots.forEach(h => {
          h.children.forEach(c => pinMeshes.push(c));
        });

        const hits = raycaster.intersectObjects(pinMeshes, false);
        if (hits.length > 0) {
          const hitPin = hits[0].object.parent;
          if (hitPin && hitPin.userData.id) {
            selectHotspot(hitPin.userData.id);
          }
        }
      }

      renderer.domElement.addEventListener('pointerdown', onPointerDown);

      function selectHotspot(id) {
        const data = SUBSYSTEM_DATA[id];
        if (!data) return;

        if (options.onHotspotSelect) {
          options.onHotspotSelect(data);
        }
      }

      // Animation Loop
      let isRunning = true;
      let animId = null;
      let pulseTime = 0;

      function animate() {
        if (!isRunning) return;
        animId = requestAnimationFrame(animate);

        pulseTime += 0.05;

        // Pulse hotspot rings and billboard them towards camera
        hotspots.forEach(h => {
          if (h.userData.ring) {
            const scale = 1.0 + Math.sin(pulseTime * 2.5) * 0.25;
            h.userData.ring.scale.set(scale, scale, 1);
            h.userData.ring.quaternion.copy(camera.quaternion);
          }
        });

        // Gentle idle spacecraft tumble when not dragging
        if (!controls || controls.state === undefined || controls.state === -1) {
          craft.rotation.y += 0.002;
        }

        if (controls) controls.update();
        if (vis.visible) renderer.render(scene, camera);
      }

      animate();

      return {
        selectHotspot,
        destroy() {
          isRunning = false;
          if (animId) cancelAnimationFrame(animId);
          vis.disconnect();
          renderer.domElement.removeEventListener('pointerdown', onPointerDown);
          app.destroy();
        }
      };
    }
  };
})();
