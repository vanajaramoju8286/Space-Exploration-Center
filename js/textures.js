/**
 * SPACE EXPLORATION CENTER — PROCEDURAL PLANET TEXTURE GENERATOR
 * Generates high-resolution, photorealistic procedural textures via HTML5 Canvas
 * completely eliminating broken external CDN links, CORS issues, and missing assets.
 */

const SpaceTextures = (function() {
  'use strict';

  // Simple pseudo-random Perlin-like 2D noise generator
  function createNoiseMap(width, height, octaves = 4, persistence = 0.5) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    // Generate low-frequency random grid
    const baseGrid = [];
    const gridSize = 32;
    for (let i = 0; i <= gridSize; i++) {
      baseGrid[i] = [];
      for (let j = 0; j <= gridSize; j++) {
        baseGrid[i][j] = Math.random();
      }
    }

    function sampleGrid(u, v) {
      const gx = u * gridSize;
      const gy = v * gridSize;
      const x0 = Math.floor(gx) % gridSize;
      const y0 = Math.floor(gy) % gridSize;
      const x1 = (x0 + 1) % gridSize;
      const y1 = (y0 + 1) % gridSize;
      const fx = gx - Math.floor(gx);
      const fy = gy - Math.floor(gy);

      // Smoothstep interpolation
      const sx = fx * fx * (3 - 2 * fx);
      const sy = fy * fy * (3 - 2 * fy);

      const top = baseGrid[x0][y0] * (1 - sx) + baseGrid[x1][y0] * sx;
      const bottom = baseGrid[x0][y1] * (1 - sx) + baseGrid[x1][y1] * sx;
      return top * (1 - sy) + bottom * sy;
    }

    for (let y = 0; y < height; y++) {
      const v = y / height;
      for (let x = 0; x < width; x++) {
        const u = x / width;
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;

        for (let o = 0; o < octaves; o++) {
          total += sampleGrid((u * frequency) % 1, (v * frequency) % 1) * amplitude;
          maxValue += amplitude;
          amplitude *= persistence;
          frequency *= 2;
        }

        const val = Math.floor((total / maxValue) * 255);
        const idx = (y * width + x) * 4;
        data[idx] = val;
        data[idx + 1] = val;
        data[idx + 2] = val;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

  // Helper to convert canvas to THREE.CanvasTexture
  function toTexture(canvas) {
    if (typeof THREE === 'undefined') return null;
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  // Base path to local assets (index.html lives at root, inner pages under pages/)
  const ASSET_BASE = (function () {
    try {
      const p = (window.location.pathname || '').replace(/\\/g, '/');
      if (p.indexOf('/pages/') !== -1) return '../';
    } catch (e) { /* ignore */ }
    return '';
  })();

  const REMOTE_TEX_BASE = 'https://threejs.org/examples/textures/planets/';

  // Load a real photo texture: local asset first, remote CDN second.
  // The procedural canvas stays in place if both fail.
  function loadRealTexture(localUrl, remoteUrl, onload) {
    if (typeof THREE === 'undefined' || typeof THREE.TextureLoader === 'undefined') return;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(localUrl, onload, undefined, () => {
      loader.load(remoteUrl, onload, undefined, () => { /* keep procedural */ });
    });
  }

  // Copy through a canvas + 1px readback so a tainted/unreadable image
  // (CORS or file:// restrictions) never replaces the working texture.
  function copyToCanvas(img) {
    try {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      if (!w || !h) return null;
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const x = c.getContext('2d');
      x.drawImage(img, 0, 0, w, h);
      x.getImageData(0, 0, 1, 1); // throws if the image is tainted
      return c;
    } catch (e) {
      return null;
    }
  }

  // Swap a live texture's image in place (all materials using it update
  // automatically), keeping the procedural look on any failure.
  function upgradeToReal(tex, localUrl, remoteUrl, process) {
    if (!tex) return;
    loadRealTexture(localUrl, remoteUrl, (t) => {
      try {
        let img = t.image;
        if (typeof process === 'function') {
          img = process(img);
        } else {
          img = copyToCanvas(img);
        }
        if (!img) return;
        tex.image = img;
        tex.encoding = THREE.sRGBEncoding;
        tex.needsUpdate = true;
      } catch (e) { /* keep the procedural texture */ }
    });
  }

  // Convert the black-background real clouds photo into a white layer
  // whose alpha follows cloud brightness (matches existing materials).
  function cloudsPhotoToAlpha(img) {
    const safe = copyToCanvas(img);
    if (!safe) return null;
    const x = safe.getContext('2d');
    const w = safe.width;
    const h = safe.height;
    const imgData = x.getImageData(0, 0, w, h);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const lum = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
      d[i] = 255;
      d[i + 1] = 255;
      d[i + 2] = 255;
      d[i + 3] = lum < 10 ? 0 : Math.min(255, lum * 1.12);
    }
    x.putImageData(imgData, 0, 0);
    return safe;
  }

  return {
    // 0. Soft radial glow particle texture for starfields and engine flares
    createParticleTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.2, 'rgba(0, 240, 255, 0.8)');
      grad.addColorStop(0.6, 'rgba(0, 150, 255, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      return toTexture(canvas);
    },

    // 1. THE SUN: Granulated convective cells + solar flares
    createSunTexture(width = 1024, height = 512) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Base fiery gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#ff7a00');
      grad.addColorStop(0.5, '#ffcc00');
      grad.addColorStop(1, '#ff5500');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Noise turbulence
      const noise = createNoiseMap(width, height, 4, 0.6);
      ctx.globalAlpha = 0.45;
      ctx.globalCompositeOperation = 'overlay';
      ctx.drawImage(noise, 0, 0);

      // High-frequency bright spots (sunspots / flares)
      ctx.globalAlpha = 0.3;
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = 20 + Math.random() * 80;
        const spotGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
        spotGrad.addColorStop(0, '#ffffff');
        spotGrad.addColorStop(0.5, '#ffea00');
        spotGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
      return toTexture(canvas);
    },

    // 2. MERCURY: Cratered rocky gray surface
    createMercuryTexture(width = 1024, height = 512) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#6b6e72';
      ctx.fillRect(0, 0, width, height);

      const noise = createNoiseMap(width, height, 5, 0.55);
      ctx.globalAlpha = 0.5;
      ctx.drawImage(noise, 0, 0);

      // Impact craters
      ctx.globalAlpha = 0.7;
      for (let i = 0; i < 120; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = 4 + Math.random() * 28;
        // Crater rim
        ctx.strokeStyle = '#9ea1a6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
        // Crater shadow
        ctx.fillStyle = '#3a3c40';
        ctx.beginPath();
        ctx.arc(x + 1, y + 1, r * 0.85, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      return toTexture(canvas);
    },

    // 3. VENUS: Sulfuric amber clouds swirling
    createVenusTexture(width = 1024, height = 512) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#c79d63');
      grad.addColorStop(0.3, '#deb887');
      grad.addColorStop(0.7, '#e6c281');
      grad.addColorStop(1, '#b08447');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Swirling cloud bands
      for (let y = 0; y < height; y += 4) {
        const wave = Math.sin(y * 0.05) * 20;
        ctx.fillStyle = (y % 12 === 0) ? 'rgba(255, 230, 180, 0.25)' : 'rgba(160, 110, 50, 0.15)';
        ctx.fillRect(0, y + wave * 0.2, width, 5);
      }

      const noise = createNoiseMap(width, height, 3, 0.5);
      ctx.globalAlpha = 0.35;
      ctx.globalCompositeOperation = 'overlay';
      ctx.drawImage(noise, 0, 0);

      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
      return toTexture(canvas);
    },

    // 4. EARTH: Continents, Deep Oceans, Green/Brown Topography
    createEarthTexture(width = 2048, height = 1024) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Oceans
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
      oceanGrad.addColorStop(0, '#0c274c');
      oceanGrad.addColorStop(0.5, '#0b3b60');
      oceanGrad.addColorStop(1, '#081d38');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, width, height);

      // Procedural Continents using noise threshold
      const noise = createNoiseMap(width, height, 5, 0.52);
      const nCtx = noise.getContext('2d');
      const nData = nCtx.getImageData(0, 0, width, height).data;
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      for (let y = 0; y < height; y++) {
        const lat = (y / height) * Math.PI; // 0 (north pole) to PI (south pole)
        const isPolar = (y < height * 0.1) || (y > height * 0.9);

        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const noiseVal = nData[idx];

          if (isPolar) {
            // Polar ice caps
            data[idx] = 240;
            data[idx + 1] = 248;
            data[idx + 2] = 255;
          } else if (noiseVal > 132) {
            // Landmass
            if (noiseVal > 185) {
              // High mountains / desert
              data[idx] = 168; // R
              data[idx + 1] = 142; // G
              data[idx + 2] = 106; // B
            } else if (noiseVal > 155) {
              // Forest / Grassland
              data[idx] = 52;
              data[idx + 1] = 120;
              data[idx + 2] = 58;
            } else {
              // Coastline / Lowland
              data[idx] = 38;
              data[idx + 1] = 94;
              data[idx + 2] = 52;
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Upgrade to the real Blue Marble photo when available (all Earth
      // materials across the site share this texture and update in place).
      const earthTex = toTexture(canvas);
      upgradeToReal(
        earthTex,
        ASSET_BASE + 'assets/textures/earth_day_2048.jpg',
        REMOTE_TEX_BASE + 'earth_atmos_2048.jpg'
      );
      return earthTex;
    },

    // 4b. EARTH CLOUDS: Separate alpha-transparent layer
    createEarthCloudsTexture(width = 2048, height = 1024) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      const noise = createNoiseMap(width, height, 4, 0.6);
      const nCtx = noise.getContext('2d');
      const nData = nCtx.getImageData(0, 0, width, height).data;
      const imgData = ctx.createImageData(width, height);
      const data = imgData.data;

      for (let i = 0; i < nData.length; i += 4) {
        const val = nData[i];
        if (val > 140) {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
          data[i + 3] = Math.min(240, Math.floor((val - 140) * 2.2));
        } else {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Upgrade to real satellite cloud imagery (luminance becomes alpha).
      const cloudTex = toTexture(canvas);
      upgradeToReal(
        cloudTex,
        ASSET_BASE + 'assets/textures/earth_clouds_1024.png',
        REMOTE_TEX_BASE + 'earth_clouds_1024.png',
        cloudsPhotoToAlpha
      );
      return cloudTex;
    },

    // 5. MARS: Rusty iron oxide red, canyons, white polar caps
    createMarsTexture(width = 1024, height = 512) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Base rusty desert gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#c1440e');
      grad.addColorStop(0.3, '#d1531e');
      grad.addColorStop(0.7, '#a23707');
      grad.addColorStop(1, '#8e2d03');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Dark basalt highlands
      const noise = createNoiseMap(width, height, 4, 0.5);
      ctx.globalAlpha = 0.4;
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(noise, 0, 0);

      // Valles Marineris Canyon slit across equator
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = '#421503';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(width * 0.25, height * 0.52);
      ctx.bezierCurveTo(width * 0.35, height * 0.49, width * 0.45, height * 0.54, width * 0.6, height * 0.51);
      ctx.stroke();

      // Polar Ice Caps (North & South)
      ctx.globalAlpha = 0.95;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#ffffff';
      // North cap
      ctx.beginPath();
      ctx.ellipse(width * 0.5, 10, width * 0.22, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      // South cap
      ctx.beginPath();
      ctx.ellipse(width * 0.5, height - 10, width * 0.18, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1.0;
      return toTexture(canvas);
    },

    // 6. JUPITER: Atmospheric bands & the Great Red Spot
    createJupiterTexture(width = 1024, height = 512) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Alternating atmospheric jet stream bands
      const bands = [
        '#d8ca9f', '#c98a58', '#b56d3b', '#e1d7be', '#c28551',
        '#a15c32', '#d9cca6', '#b36e3e', '#e5dcbe', '#8d4722',
        '#cfbb99', '#bc7645', '#c88656', '#ebd8b7', '#b57042'
      ];

      const bandHeight = height / bands.length;
      for (let i = 0; i < bands.length; i++) {
        ctx.fillStyle = bands[i];
        ctx.fillRect(0, i * bandHeight, width, bandHeight);
      }

      // Band turbulence and eddies
      const noise = createNoiseMap(width, height, 4, 0.6);
      ctx.globalAlpha = 0.35;
      ctx.globalCompositeOperation = 'overlay';
      ctx.drawImage(noise, 0, 0);

      // THE GREAT RED SPOT (Vortex at southern hemisphere)
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.9;
      const spotX = width * 0.65;
      const spotY = height * 0.65;
      const spotR = 45;

      const spotGrad = ctx.createRadialGradient(spotX, spotY, 5, spotX, spotY, spotR);
      spotGrad.addColorStop(0, '#b83b1d');
      spotGrad.addColorStop(0.6, '#cc4e29');
      spotGrad.addColorStop(1, 'rgba(200, 120, 60, 0)');
      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.ellipse(spotX, spotY, spotR * 1.5, spotR, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1.0;
      return toTexture(canvas);
    },

    // 7. SATURN: Warm golden-beige bands
    createSaturnTexture(width = 1024, height = 512) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#9e8964');
      grad.addColorStop(0.25, '#d4c092');
      grad.addColorStop(0.5, '#e4d5ad');
      grad.addColorStop(0.75, '#c9b483');
      grad.addColorStop(1, '#8e7952');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Fine horizontal subtle striations
      for (let y = 0; y < height; y += 3) {
        ctx.fillStyle = (y % 6 === 0) ? 'rgba(255, 255, 255, 0.12)' : 'rgba(100, 80, 50, 0.1)';
        ctx.fillRect(0, y, width, 2);
      }

      return toTexture(canvas);
    },

    // 7b. SATURN'S RINGS: Concentric rings with Cassini division and transparency
    createSaturnRingsTexture(width = 1024, height = 64) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, width, 0);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.1, 'rgba(180, 160, 120, 0.4)');
      grad.addColorStop(0.35, 'rgba(220, 200, 160, 0.85)');
      // Cassini Division (dark gap)
      grad.addColorStop(0.52, 'rgba(20, 15, 10, 0.05)');
      grad.addColorStop(0.57, 'rgba(20, 15, 10, 0.05)');
      // Outer A-Ring
      grad.addColorStop(0.62, 'rgba(200, 180, 140, 0.75)');
      grad.addColorStop(0.9, 'rgba(170, 150, 110, 0.5)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Add thousands of micro ring particles
      for (let x = 0; x < width; x += 2) {
        if (Math.random() > 0.4) {
          ctx.fillStyle = 'rgba(255, 240, 210, 0.2)';
          ctx.fillRect(x, 0, 1, height);
        }
      }

      return toTexture(canvas);
    },

    // 8. URANUS: Pale cyan-ice blue
    createUranusTexture(width = 1024, height = 512) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#5fc6d0');
      grad.addColorStop(0.5, '#7ee2eb');
      grad.addColorStop(1, '#4da8b1');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle atmospheric haze
      for (let y = 0; y < height; y += 8) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(0, y, width, 4);
      }

      return toTexture(canvas);
    },

    // 9. NEPTUNE: Deep rich azure blue, storm streaks
    createNeptuneTexture(width = 1024, height = 512) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#1c3e94');
      grad.addColorStop(0.4, '#275dd6');
      grad.addColorStop(0.7, '#204db5');
      grad.addColorStop(1, '#122c6b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Great Dark Spot
      const spotX = width * 0.4;
      const spotY = height * 0.45;
      const spotGrad = ctx.createRadialGradient(spotX, spotY, 2, spotX, spotY, 35);
      spotGrad.addColorStop(0, '#0c1a40');
      spotGrad.addColorStop(1, 'rgba(28, 62, 148, 0)');
      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.ellipse(spotX, spotY, 50, 25, 0, 0, Math.PI * 2);
      ctx.fill();

      // White cirrus methane clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.ellipse(spotX + 15, spotY + 30, 45, 6, 0.2, 0, Math.PI * 2);
      ctx.fill();

      return toTexture(canvas);
    },

    // 10. MOON: Pale cratered gray
    createMoonTexture(width = 512, height = 256) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#8c8e91';
      ctx.fillRect(0, 0, width, height);

      // Lunar Maria (dark basalt plains)
      const noise = createNoiseMap(width, height, 4, 0.6);
      ctx.globalAlpha = 0.55;
      ctx.drawImage(noise, 0, 0);

      // Bright craters and rays
      ctx.globalAlpha = 0.8;
      for (let i = 0; i < 70; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = 2 + Math.random() * 14;
        ctx.strokeStyle = '#c5c7cb';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.globalAlpha = 1.0;

      // Upgrade to the real lunar reconnaissance photo when available.
      const moonTex = toTexture(canvas);
      upgradeToReal(
        moonTex,
        ASSET_BASE + 'assets/textures/moon_1024.jpg',
        REMOTE_TEX_BASE + 'moon_1024.jpg'
      );
      return moonTex;
    }
  };
})();
