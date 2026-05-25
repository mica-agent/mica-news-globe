// DOM references
const containerEl = container.querySelector('#globe-container');
const loadingEl = container.querySelector('#loading-overlay');
const errorOverlay = container.querySelector('#error-overlay');
const errorText = containerEl?.querySelector ? null : null;
const newsOverlay = container.querySelector('#news-overlay');
const newsClose = container.querySelector('#news-close');

// State
let scene, camera, renderer, globe, markersGroup;
let markers = [];
let animationId;
let newsItems = [];
let lastRefresh = 0;

// Region-to-lat/lng mapping
const regionMap = [
  { keywords: ['usa', 'united states', 'new york', 'washington', 'california', 'boston', 'las vegas', 'miami', 'chicago', 'texas'], lat: 39.0, lng: -98.0 },
  { keywords: ['uk', 'london', 'britain', 'england', 'manchester', 'birmingham'], lat: 54.0, lng: -2.0 },
  { keywords: ['france', 'paris', 'lyon', 'marseille'], lat: 46.0, lng: 2.0 },
  { keywords: ['germany', 'berlin', 'munich', 'frankfurt', 'hamburg'], lat: 51.0, lng: 9.0 },
  { keywords: ['china', 'beijing', 'shanghai', 'hong kong', 'hk', 'shenzhen'], lat: 35.0, lng: 105.0 },
  { keywords: ['japan', 'tokyo', 'osaka', 'kyoto', 'japanese'], lat: 36.0, lng: 138.0 },
  { keywords: ['korea', 'seoul', 'south korea', 'north korea', 'korean'], lat: 36.0, lng: 128.0 },
  { keywords: ['india', 'mumbai', 'delhi', 'bangalore', 'bombay', 'indian'], lat: 21.0, lng: 78.0 },
  { keywords: ['australia', 'sydney', 'melbourne', 'perth', 'brisbane', 'australian'], lat: -25.0, lng: 134.0 },
  { keywords: ['canada', 'toronto', 'vancouver', 'montreal', 'canadian'], lat: 56.0, lng: -106.0 },
  { keywords: ['russia', 'moscow', 'russian'], lat: 61.0, lng: 105.0 },
  { keywords: ['brazil', 'sao paulo', 'rio', 'brazilian'], lat: -14.0, lng: -51.0 },
  { keywords: ['mexico', 'mexico city', 'mexican'], lat: 23.0, lng: -102.0 },
  { keywords: ['south africa', 'johannesburg', 'cape town', 'africa'], lat: -30.0, lng: 25.0 },
  { keywords: ['nigeria', 'lagos', 'kenya', 'nairobi', 'egypt', 'cairo'], lat: 8.0, lng: 10.0 },
  { keywords: ['turkey', 'istanbul', 'ankara', 'turkish'], lat: 39.0, lng: 35.0 },
  { keywords: ['italy', 'rome', 'milan', 'italian'], lat: 42.0, lng: 12.0 },
  { keywords: ['spain', 'madrid', 'barcelona', 'spanish'], lat: 40.0, lng: -4.0 },
  { keywords: ['portugal', 'lisbon', 'portuguese'], lat: 39.0, lng: -8.0 },
  { keywords: ['netherlands', 'amsterdam', 'dutch'], lat: 52.0, lng: 5.0 },
  { keywords: ['sweden', 'norway', 'denmark', 'finland', 'oslo', 'stockholm'], lat: 62.0, lng: 15.0 },
  { keywords: ['poland', 'warsaw', 'polish'], lat: 52.0, lng: 20.0 },
  { keywords: ['ukraine', 'kyiv', 'kiev', 'ukrainian'], lat: 49.0, lng: 31.0 },
  { keywords: ['vietnam', 'hanoi', 'ho chi', 'vietnamese'], lat: 16.0, lng: 106.0 },
  { keywords: ['thailand', 'bangkok', 'thai'], lat: 15.0, lng: 101.0 },
  { keywords: ['indonesia', 'jakarta', 'indonesian'], lat: -5.0, lng: 120.0 },
  { keywords: ['philippines', 'manila', 'filipino'], lat: 13.0, lng: 122.0 },
  { keywords: ['malaysia', 'kuala lumpur', 'malaysian'], lat: 4.0, lng: 102.0 },
  { keywords: ['singapore', 'singaporean'], lat: 1.0, lng: 104.0 },
  { keywords: ['new zealand', 'auckland', 'wellington', 'kiwi'], lat: -41.0, lng: 174.0 },
  { keywords: ['ireland', 'dublin', 'irish'], lat: 53.0, lng: -8.0 },
  { keywords: ['belgium', 'brussels', 'dutch', 'flemish'], lat: 51.0, lng: 4.0 },
  { keywords: ['switzerland', 'zurich', 'swiss'], lat: 47.0, lng: 8.0 },
  { keywords: ['austria', 'vienna', 'austrian'], lat: 48.0, lng: 14.0 },
  { keywords: ['czech', 'prague', 'praha'], lat: 50.0, lng: 15.0 },
  { keywords: ['greece', 'athens', 'greek'], lat: 39.0, lng: 22.0 },
  { keywords: ['romania', 'bucharest', 'romanian'], lat: 46.0, lng: 25.0 },
  { keywords: ['hungary', 'budapest', 'hungarian'], lat: 47.0, lng: 19.0 },
  { keywords: ['saudi', 'riyadh', 'jeddah', 'saudi arabia', 'dubai', 'uae', 'doha', 'qatar', 'kuwait', 'middle east'], lat: 24.0, lng: 45.0 },
  { keywords: ['israel', 'tel aviv', 'jerusalem', 'israeli', 'palestinian'], lat: 31.0, lng: 35.0 },
  { keywords: ['argentina', 'buenos aires', 'argentine'], lat: -38.0, lng: -64.0 },
  { keywords: ['chile', 'santiago', 'chilean'], lat: -35.0, lng: -71.0 },
  { keywords: ['colombia', 'bogota', 'colombian'], lat: 4.0, lng: -74.0 },
  { keywords: ['peru', 'lima', 'peruvian'], lat: -10.0, lng: -76.0 },
  { keywords: ['venezuela', 'caracas', 'venezuelan'], lat: 7.0, lng: -66.0 },
  { keywords: ['cuba', 'havana', 'cuban'], lat: 22.0, lng: -79.0 },
  { keywords: ['morocco', 'casablanca', 'moroccan'], lat: 32.0, lng: -6.0 },
  { keywords: ['ghana', 'accra', 'senegal', 'ivory coast'], lat: 8.0, lng: -2.0 },
];

const categoryColors = {
  breaking: 0xff4444,
  tech: 0x4488ff,
  business: 0xffcc00,
  science: 0x44cc44,
  sports: 0xff8844,
  politics: 0xaa44ff,
  health: 0x44cccc,
  world: 0xcccccc,
  entertainment: 0xff66aa,
};

function getMarkerColor(item) {
  const text = (item.title + ' ' + (item.description || '')).toLowerCase();
  if (text.match(/\b(breaking|urgent|crisis|alert|emergency|flash)\b/)) return categoryColors.breaking;
  if (text.match(/\b(tech|technology|ai|software|startup|chip|semiconductor|apple|google|meta|microsoft|openai|tesla|nvidia)\b/)) return categoryColors.tech;
  if (text.match(/\b(market|stock|trade|wall street|finance|bank|earnings|revenue|profit|crypto|bitcoin)\b/)) return categoryColors.business;
  if (text.match(/\b(science|research|discovery|nasa|space|climate|health|medical|drug|study)\b/)) return categoryColors.science;
  if (text.match(/\b(sport|football|basketball|soccer|tennis|olympic|nba|nfl|premier league)\b/)) return categoryColors.sports;
  if (text.match(/\b(politic|election|congress|parliament|senate|white house|prime minister|campaign|vote|bill)\b/)) return categoryColors.politics;
  if (text.match(/\b(world|international|global|diplomatic|summit|united nations|foreign)\b/)) return categoryColors.world;
  return categoryColors.world;
}

function findRegion(text) {
  const lower = text.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const entry of regionMap) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) score += kw.split(' ').length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  return best;
}

function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050510);

  camera = new THREE.PerspectiveCamera(45, containerEl.clientWidth / containerEl.clientHeight, 0.1, 1000);
  camera.position.z = 3.2;

  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(containerEl.clientWidth, containerEl.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  containerEl.appendChild(renderer.domElement);

  // Stars
  const starsGeo = new THREE.BufferGeometry();
  const starPositions = [];
  for (let i = 0; i < 1500; i++) {
    starPositions.push((Math.random() - 0.5) * 500, (Math.random() - 0.5) * 500, (Math.random() - 0.5) * 500);
  }
  starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, sizeAttenuation: true });
  scene.add(new THREE.Points(starsGeo, starsMat));

  // Lights
  const ambient = new THREE.AmbientLight(0x334466, 1.5);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
  dirLight.position.set(5, 3, 5);
  scene.add(dirLight);
  const backLight = new THREE.DirectionalLight(0x4466aa, 0.5);
  backLight.position.set(-5, -3, -5);
  scene.add(backLight);

  // Globe
  const globeRadius = 1.0;
  const globeGeo = new THREE.SphereGeometry(globeRadius, 64, 64);

  const textureLoader = new THREE.TextureLoader();
  const loadTex = () => new Promise((resolve, reject) => {
    textureLoader.load(
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/planets/earth_atmos_2048.jpg',
      (tex) => resolve(tex),
      undefined,
      () => reject(new Error('Texture load failed'))
    );
  });

  loadTex().then((tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    const globeMat = new THREE.MeshPhongMaterial({
      map: tex,
      specular: 0x333333,
      shininess: 15,
    });
    globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);
    globe.add(markersGroup);
    startGlobeRotation();
  }).catch((err) => {
    console.warn('Texture failed, using fallback:', err);
    const globeMat = new THREE.MeshPhongMaterial({
      color: 0x2244aa,
      specular: 0x333333,
      shininess: 15,
      wireframe: false,
    });
    globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);
    globe.add(markersGroup);
    startGlobeRotation();
  });

  // Atmosphere glow
  const atmosGeo = new THREE.SphereGeometry(globeRadius * 1.02, 64, 64);
  const atmosMat = new THREE.MeshPhongMaterial({
    color: 0x4488ff,
    transparent: true,
    opacity: 0.08,
  });
  const atmos = new THREE.Mesh(atmosGeo, atmosMat);
  scene.add(atmos);

  markersGroup = new THREE.Group();

  // Handle resize
  const onResize = () => {
    if (!containerEl.clientWidth) return;
    camera.aspect = containerEl.clientWidth / containerEl.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(containerEl.clientWidth, containerEl.clientHeight);
  };
  const ro = new ResizeObserver(onResize);
  ro.observe(containerEl);
}

function startGlobeRotation() {
  const animate = () => {
    animationId = requestAnimationFrame(animate);
    if (globe) globe.rotation.y += 0.001;
    renderer.render(scene, camera);
  };
  animate();
}

function addMarker(item) {
  if (!markersGroup) return;
  const region = findRegion(item.title + ' ' + (item.description || ''));
  if (!region) return;

  const color = getMarkerColor(item);
  const pos = latLngToVector3(region.lat, region.lng, 1.02);

  const markerGeo = new THREE.SphereGeometry(0.035, 12, 12);
  const markerMat = new THREE.MeshBasicMaterial({ color: color });
  const marker = new THREE.Mesh(markerGeo, markerMat);
  marker.position.copy(pos);
  marker.userData = { item: item };

  // Glow ring
  const ringGeo = new THREE.RingGeometry(0.038, 0.05, 24);
  const ringMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.copy(pos);
  ring.lookAt(new THREE.Vector3(0, 0, 0));

  markersGroup.add(marker);
  markersGroup.add(ring);
  markers.push({ marker, ring, item, time: Date.now() });
}

function renderNewsOverlay(item) {
  container.querySelector('#news-source').textContent = item.source || '';
  container.querySelector('#news-headline').textContent = item.title || '';
  const date = item.pubDate ? new Date(item.pubDate).toLocaleDateString() : '';
  container.querySelector('#news-meta').textContent = date;
  container.querySelector('#news-description').textContent = item.description || '';
  const linkEl = container.querySelector('#news-link');
  linkEl.href = item.link || '#';
  newsOverlay.style.display = 'block';
}

function hideNewsOverlay() {
  newsOverlay.style.display = 'none';
}

async function fetchFeeds() {
  const feeds = [
    { url: 'https://feeds.bbci.co.uk/news/rss.xml', name: 'BBC' },
    { url: 'https://rss.cnn.com/rss/cnn_topstories.rss', name: 'CNN' },
    { url: 'https://feeds.reuters.com/reuters/worldNews', name: 'Reuters' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', name: 'Al Jazeera' },
    { url: 'https://techcrunch.com/feed/', name: 'TechCrunch' },
    { url: 'https://feeds.theguardian.com/theguardian/world/rss', name: 'The Guardian' },
  ];

  const allItems = [];
  for (const feed of feeds) {
    try {
      const resp = await mica.fetch(feed.url);
      if (resp.errorCode || resp.status >= 400) continue;
      const parser = new DOMParser();
      const doc = parser.parseFromString(resp.body, 'text/xml');
      const items = doc.querySelectorAll('item');
      items.forEach((el) => {
        const title = el.querySelector('title')?.textContent || '';
        const link = el.querySelector('link')?.textContent || '';
        const desc = el.querySelector('description')?.textContent || '';
        const pubDate = el.querySelector('pubDate')?.textContent || '';
        if (title) {
          allItems.push({ title, link, description: desc, pubDate, source: feed.name });
        }
      });
    } catch (e) {
      console.warn('Failed to fetch feed:', feed.name, e);
    }
  }
  return allItems;
}

async function init() {
  try {
    initScene();

    // Fetch news
    newsItems = await fetchFeeds();
    newsItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    // Show most recent 80
    newsItems = newsItems.slice(0, 80);

    for (const item of newsItems) {
      addMarker(item);
    }

    // Click handler
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    containerEl.addEventListener('click', (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markersGroup.children);
      if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (obj.userData && obj.userData.item) {
          renderNewsOverlay(obj.userData.item);
        }
      }
    });

    newsClose.addEventListener('click', hideNewsOverlay);

    // Hourly refresh
    const refreshInterval = setInterval(async () => {
      const fresh = await fetchFeeds();
      if (fresh.length > 0) {
        newsItems = fresh.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)).slice(0, 80);
        // Clear old markers
        while (markersGroup.children.length) markersGroup.remove(markersGroup.children[0]);
        markers = [];
        for (const item of newsItems) {
          addMarker(item);
        }
      }
    }, 3600000); // 1 hour
    mica.onDestroy(() => clearInterval(refreshInterval));

    // Hide loading
    if (loadingEl) loadingEl.style.display = 'none';

  } catch (err) {
    console.error('[rss-globe] init failed:', err);
    if (errorOverlay) {
      errorOverlay.style.display = 'flex';
      errorOverlay.querySelector('.error-text').textContent = 'Error: ' + (err && err.message ? err.message : String(err));
    }
  }
}

init();