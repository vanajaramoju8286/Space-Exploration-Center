/**
 * SPACE EXPLORATION CENTER — PLANET SHOWCASE & DETAIL VIEWER
 * Powers Section 03 Planet Discovery & pages/planet-detail.html
 */

const PlanetViewer = (function() {
  'use strict';

  // Detailed Planetary Scientific Profiles for Detail Pages & Showcase
  const DETAILED_PLANET_PROFILES = {
    mercury: {
      name: 'Mercury',
      eyebrow: 'System Core • Terrestrial World',
      subtitle: 'The Sun-Scorched Messenger',
      tagline: 'Extreme temperature variances, iron core, cratered antiquity',
      summary: 'Mercury is the smallest planet in the Solar System and the closest to the Sun. Its orbit around the Sun takes only 87.97 Earth days, the shortest of all the Sun\'s planets. Because it has virtually no atmosphere to trap heat, nighttime temperatures plunge to -180°C while daytime surfaces bake at 430°C.',
      stats: {
        distance: '57.9M km',
        radius: '2,439.7 km',
        gravity: '3.7 m/s² (0.38g)',
        moons: '0',
        orbitPeriod: '88 Earth Days',
        dayLength: '58.6 Earth Days',
        avgTemp: '167°C',
        density: '5.43 g/cm³'
      },
      atmosphere: {
        composition: [
          { gas: 'Oxygen (O2)', percent: '42%' },
          { gas: 'Sodium (Na)', percent: '29%' },
          { gas: 'Hydrogen (H2)', percent: '22%' },
          { gas: 'Helium (He)', percent: '6%' },
          { gas: 'Trace Minerals', percent: '1%' }
        ],
        pressure: '10⁻¹⁴ bar (Exosphere)',
        color: '#6b6e72'
      },
      missions: [
        { name: 'Mariner 10', year: '1974', type: 'Flyby', status: 'Completed', result: 'Mapped 45% of surface' },
        { name: 'MESSENGER', year: '2011', type: 'Orbiter', status: 'Completed', result: 'Discovered water ice at poles' },
        { name: 'BepiColombo', year: '2025', type: 'Dual Orbiter', status: 'En Route', result: 'Comprehensive magnetosphere mapping' }
      ],
      trivia: [
        'Mercury possesses an enormous metallic core occupying nearly 85% of the planet\'s total radius.',
        'A single solar day on Mercury (from sunrise to sunrise) lasts 176 Earth days—twice as long as its entire year!',
        'Despite being closest to the Sun, water ice remains permanently frozen inside shadowed polar craters.'
      ]
    },
    venus: {
      name: 'Venus',
      eyebrow: 'Inner Belt • Greenhouse Crucible',
      subtitle: 'The Morning Star of Fire and Acid',
      tagline: 'Supercritical CO₂ atmosphere, volcanic plains, retrograde rotation',
      summary: 'Venus is the second planet from the Sun, named after the Roman goddess of love and beauty. Despite the name, it is a ferocious planetary hellscape. Its dense atmosphere composed of 96.5% carbon dioxide traps solar heat in a runaway greenhouse effect, producing surface temperatures hot enough to melt lead.',
      stats: {
        distance: '108.2M km',
        radius: '6,051.8 km',
        gravity: '8.87 m/s² (0.90g)',
        moons: '0',
        orbitPeriod: '224.7 Earth Days',
        dayLength: '243 Earth Days (Retrograde)',
        avgTemp: '464°C',
        density: '5.24 g/cm³'
      },
      atmosphere: {
        composition: [
          { gas: 'Carbon Dioxide (CO2)', percent: '96.5%' },
          { gas: 'Nitrogen (N2)', percent: '3.5%' },
          { gas: 'Sulfur Dioxide (SO2)', percent: '0.015%' },
          { gas: 'Water Vapor', percent: '0.002%' }
        ],
        pressure: '92 bar (Equivalent to 900m underwater on Earth)',
        color: '#deb887'
      },
      missions: [
        { name: 'Venera 7', year: '1970', type: 'Lander', status: 'Completed', result: 'First successful landing on another planet' },
        { name: 'Magellan', year: '1989', type: 'Radar Mapper', status: 'Completed', result: 'High-resolution radar map of 98% surface' },
        { name: 'DAVINCI / VERITAS', year: '2029', type: 'Atmospheric Probe & Orbiter', status: 'Planned', result: 'Investigating ancient oceanic oceans' }
      ],
      trivia: [
        'Venus spins backward compared to almost all other planets (retrograde rotation), so the Sun rises in the west.',
        'Its clouds precipitate corrosive sulfuric acid, which evaporates as virga before reaching the blistering surface.',
        'Venus has more volcanic structures than any other celestial body in the solar system, exceeding 1,600 major volcanoes.'
      ]
    },
    earth: {
      name: 'Earth',
      eyebrow: 'Habitable Zone • Water World',
      subtitle: 'The Pale Blue Citadel of Life',
      tagline: 'Dynamic plate tectonics, protective magnetosphere, liquid hydrosphere',
      summary: 'Earth is the third planet from the Sun and the only astronomical object known to harbor life. About 29% of Earth\'s surface is land consisting of continents and islands, while the remaining 71% is covered with water, mostly by oceans, seas, gulfs, and other salt-water bodies, with rivers, lakes, and glaciers.',
      stats: {
        distance: '149.6M km',
        radius: '6,371.0 km',
        gravity: '9.807 m/s² (1.00g)',
        moons: '1 (Luna)',
        orbitPeriod: '365.25 Days',
        dayLength: '23h 56m 4s',
        avgTemp: '15°C',
        density: '5.51 g/cm³'
      },
      atmosphere: {
        composition: [
          { gas: 'Nitrogen (N2)', percent: '78.08%' },
          { gas: 'Oxygen (O2)', percent: '20.95%' },
          { gas: 'Argon (Ar)', percent: '0.93%' },
          { gas: 'Carbon Dioxide (CO2)', percent: '0.04%' }
        ],
        pressure: '1.013 bar (Sea Level)',
        color: '#00f0ff'
      },
      missions: [
        { name: 'Apollo 11', year: '1969', type: 'Crewed Lunar Landing', status: 'Completed', result: 'First humans to walk on the Moon' },
        { name: 'ISS Orbit', year: '1998–Present', type: 'Space Station', status: 'Active', result: 'Continuous human presence in low Earth orbit' },
        { name: 'Artemis Program', year: '2025–2030', type: 'Crewed Deep Space', status: 'Active', result: 'Permanent human outpost on Lunar South Pole' }
      ],
      trivia: [
        'Earth\'s molten iron outer core generates a geodynamo producing a powerful protective magnetic shield.',
        'Plate tectonics act as a planetary thermostat, recycling carbon and stabilizing global climates over millions of years.',
        'Earth is the densest major planet in the solar system.'
      ]
    },
    mars: {
      name: 'Mars',
      eyebrow: 'Outer Terrestrial • Frontier World',
      subtitle: 'The Crimson Horizon of Exploration',
      tagline: 'Towering shield volcanoes, labyrinth canyons, ancient river deltas',
      summary: 'Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System. The reddish tint of its surface is caused by pervasive iron oxide (rust) in the regolith. Mars holds Olympus Mons, the largest volcano in the solar system, and Valles Marineris, one of the largest canyons in existence.',
      stats: {
        distance: '227.9M km',
        radius: '3,389.5 km',
        gravity: '3.72 m/s² (0.38g)',
        moons: '2 (Phobos, Deimos)',
        orbitPeriod: '687 Earth Days',
        dayLength: '24h 37m 22s',
        avgTemp: '-63°C',
        density: '3.93 g/cm³'
      },
      atmosphere: {
        composition: [
          { gas: 'Carbon Dioxide (CO2)', percent: '95.3%' },
          { gas: 'Nitrogen (N2)', percent: '2.6%' },
          { gas: 'Argon (Ar)', percent: '1.9%' },
          { gas: 'Oxygen & Trace', percent: '0.2%' }
        ],
        pressure: '0.006 bar (0.6% of Earth)',
        color: '#d1531e'
      },
      missions: [
        { name: 'Viking 1 & 2', year: '1976', type: 'Orbiter & Lander', status: 'Completed', result: 'First clear surface photos and soil biochemistry tests' },
        { name: 'Curiosity Rover', year: '2012–Present', type: 'Nuclear Rover', status: 'Active', result: 'Discovered ancient organic molecules and freshwater lake beds' },
        { name: 'Perseverance & Ingenuity', year: '2021–Present', type: 'Rover & Helicopter', status: 'Active', result: 'Caching samples for future Earth return; powered flight on Mars' }
      ],
      trivia: [
        'Olympus Mons stands 22 kilometers high—nearly triple the height of Mount Everest above sea level.',
        'A Martian solar day ("sol") is remarkably close to an Earth day: precisely 24 hours, 39 minutes, and 35 seconds.',
        'Its moon Phobos orbits so closely that gravitational tidal forces will rip it into a planetary ring within 50 million years.'
      ]
    },
    jupiter: {
      name: 'Jupiter',
      eyebrow: 'Outer Realm • Jovian Colossus',
      subtitle: 'The Great Sovereign of Storms',
      tagline: 'Metallic hydrogen mantle, 95 moons, Great Red Spot anticyclone',
      summary: 'Jupiter is the largest planet in the Solar System, with a mass two and a half times that of all the other planets in the Solar System combined. It is a gas giant primarily composed of hydrogen and helium. Its interior is under such extreme pressures that hydrogen transforms into a liquid metallic conductor.',
      stats: {
        distance: '778.5M km',
        radius: '69,911 km',
        gravity: '24.79 m/s² (2.53g)',
        moons: '95 confirmed (Io, Europa, Ganymede, Callisto)',
        orbitPeriod: '11.86 Earth Years',
        dayLength: '9h 55m 30s',
        avgTemp: '-110°C',
        density: '1.33 g/cm³'
      },
      atmosphere: {
        composition: [
          { gas: 'Hydrogen (H2)', percent: '89.8%' },
          { gas: 'Helium (He)', percent: '10.2%' },
          { gas: 'Methane (CH4)', percent: '0.3%' },
          { gas: 'Ammonia (NH3)', percent: '0.026%' }
        ],
        pressure: '2+ Million bar at core mantle',
        color: '#c98a58'
      },
      missions: [
        { name: 'Voyager 1 & 2', year: '1979', type: 'Flyby', status: 'Completed', result: 'Discovered volcanic plumes on Io and Europa\'s smooth ice crust' },
        { name: 'Galileo', year: '1995–2003', type: 'Orbiter & Probe', status: 'Completed', result: 'Confirmed sub-surface liquid ocean on Europa' },
        { name: 'Juno', year: '2016–Present', type: 'Polar Orbiter', status: 'Active', result: 'Investigating deep magnetic dynamo and atmospheric cyclones' }
      ],
      trivia: [
        'The Great Red Spot is an anticyclonic storm larger than the entire planet Earth that has raged for at least 350 years.',
        'Ganymede, Jupiter\'s largest moon, is larger than Mercury and is the only moon in the solar system with its own magnetic field.',
        'Jupiter spins faster than any other planet, completing a full planetary rotation in under 10 hours.'
      ]
    },
    saturn: {
      name: 'Saturn',
      eyebrow: 'Outer Realm • Ringed Titan',
      subtitle: 'The Majestic Crown of Ice',
      tagline: 'Spectacular planetary ring system, low density, hydrocarbon oceans on Titan',
      summary: 'Saturn is the sixth planet from the Sun and the second-largest in the Solar System, after Jupiter. It is a gas giant with an average radius of about nine and a half times that of Earth. Its celebrated ring system extends up to 282,000 kilometers from the planet, yet is on average only 10 to 30 meters thick.',
      stats: {
        distance: '1.43B km',
        radius: '58,232 km',
        gravity: '10.44 m/s² (1.06g)',
        moons: '146 confirmed (Titan, Enceladus, Mimas)',
        orbitPeriod: '29.45 Earth Years',
        dayLength: '10h 33m 38s',
        avgTemp: '-140°C',
        density: '0.687 g/cm³ (Less dense than water!)'
      },
      atmosphere: {
        composition: [
          { gas: 'Hydrogen (H2)', percent: '96.3%' },
          { gas: 'Helium (He)', percent: '3.25%' },
          { gas: 'Methane (CH4)', percent: '0.45%' },
          { gas: 'Ammonia (NH3)', percent: '0.01%' }
        ],
        pressure: '1.4 bar at cloud tops',
        color: '#e4d5ad'
      },
      missions: [
        { name: 'Pioneer 11', year: '1979', type: 'Flyby', status: 'Completed', result: 'First close-range images of rings' },
        { name: 'Cassini-Huygens', year: '2004–2017', type: 'Orbiter & Lander', status: 'Completed', result: 'Landed on Titan; discovered geysers erupting on Enceladus' },
        { name: 'Dragonfly', year: '2028', type: 'Rotorcraft Lander', status: 'Planned', result: 'Autonomous drone flight across Titan\'s prebiotic dunes' }
      ],
      trivia: [
        'Saturn is the only planet in our solar system that is less dense than water; if you had a bathtub large enough, it would float!',
        'Its moon Enceladus shoots massive geysers of salty water vapor into space, which form Saturn\'s entire E-Ring.',
        'At Saturn\'s north pole sits a bizarre, persistent hexagonal atmospheric jet stream spanning 30,000 km across.'
      ]
    },
    uranus: {
      name: 'Uranus',
      eyebrow: 'Distant Ice Realm • Sideways Giant',
      subtitle: 'The Solitary Aquamarine World',
      tagline: '98-degree axial tilt, frozen methane mantle, retro-rotating rings',
      summary: 'Uranus is the seventh planet from the Sun. It has the third-largest planetary radius and fourth-largest planetary mass in the Solar System. Classified as an ice giant, it possesses an interior composed predominantly of water, ammonia, and methane ices overlying a small rocky core.',
      stats: {
        distance: '2.87B km',
        radius: '25,362 km',
        gravity: '8.69 m/s² (0.89g)',
        moons: '28 confirmed (Titania, Oberon, Miranda)',
        orbitPeriod: '84.0 Earth Years',
        dayLength: '17h 14m 24s',
        avgTemp: '-195°C',
        density: '1.27 g/cm³'
      },
      atmosphere: {
        composition: [
          { gas: 'Hydrogen (H2)', percent: '83%' },
          { gas: 'Helium (He)', percent: '15%' },
          { gas: 'Methane (CH4)', percent: '2%' }
        ],
        pressure: '1.2 bar at upper haze',
        color: '#7ee2eb'
      },
      missions: [
        { name: 'Voyager 2', year: '1986', type: 'Flyby', status: 'Completed', result: 'Only spacecraft to visit; discovered 10 moons and 2 rings' },
        { name: 'Uranus Orbiter and Probe', year: '2031–2035', type: 'Flagship Orbiter', status: 'Proposed', result: 'Top priority NASA planetary decadal survey mission' }
      ],
      trivia: [
        'Uranus has an extreme axial tilt of 97.77 degrees, meaning it rotates almost completely on its side, rolling around the Sun like a ball.',
        'Because of this tilt, its poles experience 42 continuous years of uninterrupted sunlight followed by 42 years of total darkness.',
        'Miranda, one of its moons, has a patchwork chevron surface with Verona Rupes, a cliff 20 kilometers high—the tallest in the solar system.'
      ]
    },
    neptune: {
      name: 'Neptune',
      eyebrow: 'Solar Frontier • Deep Ocean Sky',
      subtitle: 'The Supersonic Storm Giant',
      tagline: 'Cryovolcanic moon Triton, supersonic winds exceeding Mach 1.7, deep azure hue',
      summary: 'Neptune is the eighth and farthest-known Solar planet from the Sun. In the Solar System, it is the fourth-largest planet by diameter, the third-most-massive planet, and the densest giant planet. Neptune is 17 times the mass of Earth and is slightly more massive than its near-twin Uranus.',
      stats: {
        distance: '4.50B km',
        radius: '24,622 km',
        gravity: '11.15 m/s² (1.14g)',
        moons: '16 confirmed (Triton, Proteus, Nereid)',
        orbitPeriod: '164.8 Earth Years',
        dayLength: '16h 6m 36s',
        avgTemp: '-201°C',
        density: '1.64 g/cm³'
      },
      atmosphere: {
        composition: [
          { gas: 'Hydrogen (H2)', percent: '80%' },
          { gas: 'Helium (He)', percent: '19%' },
          { gas: 'Methane (CH4)', percent: '1.5%' }
        ],
        pressure: '1 to 5 bar at cloud layers',
        color: '#275dd6'
      },
      missions: [
        { name: 'Voyager 2', year: '1989', type: 'Flyby', status: 'Completed', result: 'Discovered Great Dark Spot and nitrogen geysers on Triton' }
      ],
      trivia: [
        'Neptune features the fastest sustained winds ever recorded on any planet in the solar system, clocking speeds above 2,100 km/h (1,300 mph).',
        'Its largest moon Triton orbits in the opposite direction of Neptune\'s spin (retrograde), proving it is a captured Kuiper Belt object like Pluto.',
        'Since its discovery in 1846, Neptune completed its very first full 165-year orbit around the Sun only recently in 2011.'
      ]
    }
  };

  // Create single interactive 3D planet viewer (used in Section 03 & planet-detail.html)
  function createViewer(containerId, initialPlanet = 'mars', options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    const app = SpaceThree.initScene(container, {
      fov: 42,
      camX: 0,
      camY: 0,
      camZ: options.camZ || 16,
      controls: true,
      minDistance: 8,
      maxDistance: 45,
      exposure: 1.15
    });
    if (!app) return null;

    const { scene, camera, renderer, controls } = app;
    const vis = SpaceThree.watchVisibility(container);

    // Starfield
    const stars = SpaceThree.createStarfield(2500, 800);
    scene.add(stars);

    // Realistic Planetary Lighting: Directional Sun Light from side + ambient fill
    const ambient = new THREE.AmbientLight(0x1a273a, 0.4);
    scene.add(ambient);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(25, 10, 20);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 0.4);
    rimLight.position.set(-20, -10, -15);
    scene.add(rimLight);

    // Planet Group
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    let currentPlanetMesh = null;
    let currentAtmosphereMesh = null;
    let currentCloudsMesh = null;
    let currentRingsMesh = null;

    // Load a planet by key
    function loadPlanet(planetKey) {
      const key = planetKey.toLowerCase();
      const profile = DETAILED_PLANET_PROFILES[key] || DETAILED_PLANET_PROFILES.mars;

      // Clean up previous meshes
      while (planetGroup.children.length > 0) {
        const obj = planetGroup.children[0];
        planetGroup.remove(obj);
      }

      // Radius
      const baseRadius = 5.0;
      const geo = new THREE.SphereGeometry(baseRadius, 64, 64);

      // Select texture
      let tex;
      let atmoColor = 0x00f0ff;
      let hasRings = false;
      let hasClouds = false;

      switch (key) {
        case 'mercury':
          tex = SpaceTextures.createMercuryTexture(2048, 1024);
          atmoColor = null;
          break;
        case 'venus':
          tex = SpaceTextures.createVenusTexture(2048, 1024);
          atmoColor = 0xdeb887;
          break;
        case 'earth':
          tex = SpaceTextures.createEarthTexture(2048, 1024);
          atmoColor = 0x00f0ff;
          hasClouds = true;
          break;
        case 'mars':
          tex = SpaceTextures.createMarsTexture(2048, 1024);
          atmoColor = 0xd1531e;
          break;
        case 'jupiter':
          tex = SpaceTextures.createJupiterTexture(2048, 1024);
          atmoColor = 0xc98a58;
          break;
        case 'saturn':
          tex = SpaceTextures.createSaturnTexture(2048, 1024);
          atmoColor = 0xd4c092;
          hasRings = true;
          break;
        case 'uranus':
          tex = SpaceTextures.createUranusTexture(2048, 1024);
          atmoColor = 0x7ee2eb;
          break;
        case 'neptune':
          tex = SpaceTextures.createNeptuneTexture(2048, 1024);
          atmoColor = 0x275dd6;
          break;
        default:
          tex = SpaceTextures.createMarsTexture(2048, 1024);
          atmoColor = 0xd1531e;
      }

      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: key === 'earth' ? 0.6 : 0.85,
        metalness: 0.05
      });

      currentPlanetMesh = new THREE.Mesh(geo, mat);
      planetGroup.add(currentPlanetMesh);

      // Atmosphere
      if (atmoColor) {
        currentAtmosphereMesh = SpaceThree.createAtmosphere(baseRadius, atmoColor, 1.25, 3.0);
        planetGroup.add(currentAtmosphereMesh);
      }

      // Earth clouds
      if (hasClouds) {
        const cloudGeo = new THREE.SphereGeometry(baseRadius * 1.02, 48, 48);
        const cloudTex = SpaceTextures.createEarthCloudsTexture(2048, 1024);
        const cloudMat = new THREE.MeshStandardMaterial({
          map: cloudTex,
          transparent: true,
          opacity: 0.92
        });
        currentCloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
        planetGroup.add(currentCloudsMesh);
      } else {
        currentCloudsMesh = null;
      }

      // Saturn rings
      if (hasRings) {
        const ringGeo = new THREE.RingGeometry(baseRadius * 1.35, baseRadius * 2.5, 96);
        ringGeo.rotateX(Math.PI / 2.3);
        const ringTex = SpaceTextures.createSaturnRingsTexture(1024, 64);
        const ringMat = new THREE.MeshStandardMaterial({
          map: ringTex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.92
        });
        currentRingsMesh = new THREE.Mesh(ringGeo, ringMat);
        planetGroup.add(currentRingsMesh);
      } else {
        currentRingsMesh = null;
      }

      // Entrance animation
      planetGroup.scale.set(0.1, 0.1, 0.1);
      planetGroup.rotation.y = 0;

      if (typeof gsap !== 'undefined') {
        gsap.to(planetGroup.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 1.2,
          ease: 'power3.out'
        });
      } else {
        planetGroup.scale.set(1, 1, 1);
      }

      return profile;
    }

    // Initial load
    loadPlanet(initialPlanet);

    // Animation Loop
    let isRunning = true;
    let animId = null;

    function animate() {
      if (!isRunning) return;
      animId = requestAnimationFrame(animate);

      if (currentPlanetMesh) {
        currentPlanetMesh.rotation.y += 0.003;
      }
      if (currentCloudsMesh) {
        currentCloudsMesh.rotation.y += 0.0042;
      }

      controls.update();
      if (vis.visible) renderer.render(scene, camera);
    }

    animate();

    return {
      loadPlanet,
      getProfile(key) {
        return DETAILED_PLANET_PROFILES[key.toLowerCase()] || DETAILED_PLANET_PROFILES.earth;
      },
      destroy() {
        isRunning = false;
        if (animId) cancelAnimationFrame(animId);
        vis.disconnect();
        app.destroy();
      }
    };
  }

  return {
    createViewer,
    getPlanetProfile(key) {
      return DETAILED_PLANET_PROFILES[key.toLowerCase()] || DETAILED_PLANET_PROFILES.earth;
    },
    getAllProfiles() {
      return DETAILED_PLANET_PROFILES;
    }
  };
})();
