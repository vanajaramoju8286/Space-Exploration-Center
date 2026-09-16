/**
 * SPACE EXPLORATION CENTER — CORE THREE.JS ENGINE & UTILITIES
 * Starfields, Atmospheric Shaders, Responsive Canvases, Camera Control
 */

const SpaceThree = (function() {
  'use strict';

  // Custom Atmospheric Glow Shader (Fresnel effect)
  const AtmosphereShader = {
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPositionNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vPositionNormal;
      uniform vec3 color;
      uniform float intensity;
      uniform float power;
      void main() {
        float glow = 1.0 - dot(vNormal, -vPositionNormal);
        glow = pow(max(0.0, glow), power) * intensity;
        gl_FragColor = vec4(color, glow);
      }
    `
  };

  return {
    // Initialize standard Three.js scene for a container element
    initScene(container, options = {}) {
      if (typeof THREE === 'undefined') {
        console.error('Three.js is not loaded');
        return null;
      }

      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      // 1. Scene
      const scene = new THREE.Scene();
      if (options.fog) {
        scene.fog = new THREE.FogExp2(0x030712, options.fogDensity || 0.001);
      }

      // 2. Camera
      const fov = options.fov || 45;
      const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 3000);
      camera.position.set(options.camX || 0, options.camY || 0, options.camZ || 35);

      // 3. Renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: window.devicePixelRatio < 2,
        alpha: options.alpha !== undefined ? options.alpha : true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = options.exposure || 1.1;

      // Append canvas
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.appendChild(renderer.domElement);

      // OrbitControls if requested and available
      let controls = null;
      if (options.controls && typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = options.rotateSpeed || 0.6;
        controls.zoomSpeed = options.zoomSpeed || 0.8;
        if (options.minDistance) controls.minDistance = options.minDistance;
        if (options.maxDistance) controls.maxDistance = options.maxDistance;
      }

      // Auto resize handler
      function onResize() {
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
      window.addEventListener('resize', onResize);

      return {
        scene,
        camera,
        renderer,
        controls,
        container,
        destroy() {
          window.removeEventListener('resize', onResize);
          renderer.dispose();
          if (controls) controls.dispose();
        }
      };
    },

    // Create deep volumetric starry skybox
    createStarfield(count = 3500, radius = 1000) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      const colorPalette = [
        new THREE.Color(0xffffff), // White
        new THREE.Color(0x93c5fd), // Soft blue
        new THREE.Color(0x67e8f9), // Cyan
        new THREE.Color(0xfde047), // Pale yellow
        new THREE.Color(0xf472b6)  // Faint magenta
      ];

      for (let i = 0; i < count; i++) {
        // Spherical distribution
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = radius * (0.6 + 0.4 * Math.cbrt(Math.random()));

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const particleTex = SpaceTextures.createParticleTexture();

      const material = new THREE.PointsMaterial({
        size: 2.2,
        vertexColors: true,
        map: particleTex,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      return new THREE.Points(geometry, material);
    },

    // Create realistic planetary atmospheric glow mesh
    createAtmosphere(radius, colorHex = 0x00f0ff, intensity = 1.2, power = 3.0) {
      const geometry = new THREE.SphereGeometry(radius * 1.07, 48, 48);
      const color = new THREE.Color(colorHex);

      const material = new THREE.ShaderMaterial({
        vertexShader: AtmosphereShader.vertexShader,
        fragmentShader: AtmosphereShader.fragmentShader,
        uniforms: {
          color: { value: new THREE.Vector3(color.r, color.g, color.b) },
          intensity: { value: intensity },
          power: { value: power }
        },
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false
      });

      return new THREE.Mesh(geometry, material);
    },

    // Track whether a canvas container is on screen so render loops
    // can skip GPU work while their section is scrolled out of view.
    watchVisibility(container) {
      const state = { visible: true, disconnect() {} };

      if (container && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach(en => {
            state.visible = en.isIntersecting;
          });
        }, { threshold: 0.02 });
        io.observe(container);
        state.disconnect = () => io.disconnect();
      }
      return state;
    },

    // Mouse parallax tracking helper
    initParallax(camera, maxOffset = 2.0) {
      const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
      const originalPos = { x: camera.position.x, y: camera.position.y };

      window.addEventListener('mousemove', (e) => {
        mouse.targetX = ((e.clientX / window.innerWidth) - 0.5) * maxOffset;
        mouse.targetY = -((e.clientY / window.innerHeight) - 0.5) * maxOffset;
      });

      return function update() {
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;
        camera.position.x = originalPos.x + mouse.x;
        camera.position.y = originalPos.y + mouse.y;
      };
    }
  };
})();
