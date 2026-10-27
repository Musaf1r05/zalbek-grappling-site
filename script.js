document.documentElement.classList.add("js");

const menuButton = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

function closeMenu() {
  if (!menuButton || !siteNav) return;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Открыть меню");
  siteNav.classList.remove("is-open");
}

if (menuButton && siteNav) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Открыть меню" : "Закрыть меню");
    siteNav.classList.toggle("is-open", !isOpen);
  });

  siteNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

const year = document.querySelector("#current-year");
if (year) year.textContent = String(new Date().getFullYear());

const revealItems = document.querySelectorAll(".reveal");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -36px 0px" },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}

const mapElement = document.querySelector("#club-map");
function initializeClubMap() {
  if (!mapElement || !window.L || mapElement.dataset.initialized) return;
  mapElement.dataset.initialized = "true";
  const coordinates = [45.042089, 41.986304];
  const map = window.L.map(mapElement, {
    center: coordinates,
    zoom: 16,
    zoomControl: true,
    scrollWheelZoom: false,
  });

  // OpenStreetMap Germany tiles are public and do not require an API key.
  const tileUrl = "https://tile.openstreetmap.de/{z}/{x}/{y}.png";
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> · tiles <a href="https://www.openstreetmap.de/">openstreetmap.de</a>';
  map.createPane("darkTilesPane").classList.add("leaflet-dark-tiles");
  map.createPane("lightTilesPane").classList.add("leaflet-light-tiles");
  const darkTiles = window.L.tileLayer(tileUrl, { pane: "darkTilesPane", maxZoom: 19, attribution });
  const lightTiles = window.L.tileLayer(tileUrl, { pane: "lightTilesPane", maxZoom: 19, attribution });
  darkTiles.addTo(map);
  window.L.control.layers({ "Тёмная карта": darkTiles, "Светлая карта": lightTiles }, null, {
    position: "topright",
    collapsed: true,
  }).addTo(map);

  const markerIcon = window.L.divIcon({
    className: "club-marker-wrap",
    html: '<span class="club-marker" aria-hidden="true"></span>',
    iconSize: [28, 34],
    iconAnchor: [14, 34],
    popupAnchor: [0, -32],
  });

  window.L.marker(coordinates, { icon: markerIcon })
    .addTo(map)
    .bindPopup("<strong>Academy of Grappling</strong><br>Ставрополь, ул. Ленина, 127<br>Бойцовский клуб «Октагон»");

  window.setTimeout(() => map.invalidateSize(), 150);
}

const galleryVideo = document.querySelector(".gallery-local-video");
if (galleryVideo) {
  galleryVideo.muted = true;
  galleryVideo.defaultMuted = true;
  galleryVideo.loop = true;
  galleryVideo.playsInline = true;
  galleryVideo.setAttribute("playsinline", "");
  galleryVideo.setAttribute("webkit-playsinline", "");

  const playGalleryVideo = () => {
    const playback = galleryVideo.play();
    if (playback && typeof playback.catch === "function") playback.catch(() => {});
  };

  galleryVideo.addEventListener("canplay", playGalleryVideo);
  playGalleryVideo();

  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) playGalleryVideo();
        else galleryVideo.pause();
      });
    }, { threshold: 0.15 });
    videoObserver.observe(galleryVideo);
  }
}

if (mapElement && "IntersectionObserver" in window) {
  const mapObserver = new IntersectionObserver((entries, observer) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    initializeClubMap();
    observer.disconnect();
  }, { rootMargin: "250px" });
  mapObserver.observe(mapElement);
} else {
  initializeClubMap();
}

