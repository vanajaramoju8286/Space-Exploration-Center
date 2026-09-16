/**
 * SPACE EXPLORATION CENTER — 3D PARTICLE VORTEX GALAXY ENGINE
 * Renders 25,000+ points logarithmic spiral arms, elliptical galactic bulges, and nebulae
 */

const Galaxies3D = (function() {
  'use strict';

  const GALAXY_PRESETS = {
    spiral: {
      name: 'Grand Design Spiral (Milky Way / Andromeda)',
      count: 24000,
      arms: 4,
      radius: 20,
      spin: 1.2,
      randomness: 0.35,
      insideColor: 0xffeedd, // Warm golden galactic core
      outsideColor: 0x00f0ff // Electric cyan spiral arms
    },
    elliptical: {
      name: 'Giant Elliptical (Messier 87)',
      count: 20000,
      arms: 0,
      radius: 18,
      spin: 0.1,
      randomness: 0.9,
      insideColor: 0xffffff,
      outsideColor: 0xf59e0b
    },
    nebula: {
      name: 'Emission & Reflection Nebula (Carina / Orion)',
      count: 22000,
      arms: 2,
      radius: 16,
      spin: 0.6,
      randomness: 0.8,
      insideColor: 0xa855f7,
      outsideColor: 0x38bdf8
    },
    clusters: {
      name: 'Globular Star Cluster (Omega Centauri)',
      count: 26000,
      arms: 0,
      radius: 12,
      spin: 0.3,
      randomness: 0.5,
      insideColor: 0x67e8f9,
      outsideColor: 0xffffff
    }
  };

  return {
    getPresets() {
      return GALAXY_PRESETS;
    },

    create(containerId, presetKey = 'spiral', options = {}) {
      const container = document.getElementById(containerId);
      if (!container) return null;

      const app = SpaceThree.initScene(container, {
        fov: 50,
        camX: 0,
        camY: 18,
        camZ: 28,
        controls: true,
        minDistance: 8,
        maxDistance: 65,
        exposure: 1.35
      });
      if (!app) return null;

      const { scene, camera, renderer, controls } = app;
      const vis = SpaceThree.watchVisibility(container);
      camera.lookAt(0, 0, 0);

      // Starfield background
      const stars = SpaceThree.createStarfield(3000, 900);
      scene.add(stars);

      let galaxyPoints = null;
      let galaxyGeometry = null;
      let currentPreset = GALAXY_PRESETS[presetKey] || GALAXY_PRESETS.spiral;

      function generateGalaxy(preset) {
        if (galaxyPoints) {
          scene.remove(galaxyPoints);
          galaxyGeometry.dispose();
        }

        const count = preset.count;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const colorInside = new THREE.Color(preset.insideColor);
        const colorOutside = new THREE.Color(preset.outsideColor);

        for (let i = 0; i < count; i++) {
          // Radius
          const r = Math.random() * preset.radius;

          // Branch/Arm angle
          let branchAngle = 0;
          if (preset.arms > 0) {
            branchAngle = ((i % preset.arms) / preset.arms) * Math.PI * 2;
          }

          const spinAngle = r * preset.spin;

          const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * preset.randomness * r;
          const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * preset.randomness * r;
          const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * preset.randomness * r;

          positions[i * 3] = Math.cos(branchAngle + spinAngle) * r + randomX;
          positions[i * 3 + 1] = randomY;
          positions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ;

          // Color interpolate from core to edge
          const mixedColor = colorInside.clone();
          mixedColor.lerp(colorOutside, r / preset.radius);

          // Add slight sparkle variation
          mixedColor.r += (Math.random() - 0.5) * 0.1;
          mixedColor.g += (Math.random() - 0.5) * 0.1;
          mixedColor.b += (Math.random() - 0.5) * 0.1;

          colors[i * 3] = mixedColor.r;
          colors[i * 3 + 1] = mixedColor.g;
          colors[i * 3 + 2] = mixedColor.b;
        }

        galaxyGeometry = new THREE.BufferGeometry();
        galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleTex = SpaceTextures.createParticleTexture();

        const galaxyMaterial = new THREE.PointsMaterial({
          size: 0.22,
          vertexColors: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          transparent: true,
          opacity: 0.85,
          map: particleTex
        });

        galaxyPoints = new THREE.Points(galaxyGeometry, galaxyMaterial);
        scene.add(galaxyPoints);
      }

      // Initial generation
      generateGalaxy(currentPreset);

      // Animation Loop
      let isRunning = true;
      let animId = null;

      function animate() {
        if (!isRunning) return;
        animId = requestAnimationFrame(animate);

        if (galaxyPoints) {
          galaxyPoints.rotation.y += 0.0018;
        }

        controls.update();
        if (vis.visible) renderer.render(scene, camera);
      }

      animate();

      return {
        setPreset(key) {
          if (GALAXY_PRESETS[key]) {
            currentPreset = GALAXY_PRESETS[key];
            generateGalaxy(currentPreset);
          }
        },
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
