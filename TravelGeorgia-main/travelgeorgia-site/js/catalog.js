const grid = document.getElementById("trail-grid");
const resultCount = document.getElementById("result-count");
const regionSelect = document.getElementById("f-region");
const difficultySelect = document.getElementById("f-difficulty");
const seasonSelect = document.getElementById("f-season");
const searchInput = document.getElementById("f-search");

let modalMap = null;
let modalMarker = null;

function populateRegionFilter() {
  getRegions(TRAILS).forEach((region) => {
    const opt = document.createElement("option");
    opt.value = region;
    opt.textContent = region;
    regionSelect.appendChild(opt);
  });
}

function applyURLParams() {
  const params = new URLSearchParams(window.location.search);
  const region = params.get("region");
  if (region) regionSelect.value = region;
}

function currentFilters() {
  return {
    search: searchInput.value.trim().toLowerCase(),
    region: regionSelect.value,
    difficulty: difficultySelect.value,
    season: seasonSelect.value,
  };
}

function filterTrails(trails, filters) {
  return trails.filter((t) => {
    const matchesSearch =
      !filters.search ||
      t.name.toLowerCase().includes(filters.search) ||
      t.description.toLowerCase().includes(filters.search);
    const matchesRegion = !filters.region || t.region === filters.region;
    const matchesDifficulty = !filters.difficulty || t.difficulty === filters.difficulty;
    const matchesSeason = !filters.season || t.season.includes(filters.season);
    return matchesSearch && matchesRegion && matchesDifficulty && matchesSeason;
  });
}

function trailCardHTML(t) {
  return `
    <article class="trail-card">
      <span class="region-tag">${t.region}</span>
      <h3>${t.name}</h3>
      <div class="trail-meta">
        <span class="difficulty" data-level="${t.difficulty}">${t.difficulty}</span>
        <span>${formatDistance(t.distanceKm)}</span>
        <span>${formatDuration(t.durationHours)}</span>
      </div>
      <p>${t.description}</p>
      <div class="trail-card-actions">
        <a class="btn btn-ghost" href="details.html?id=${encodeURIComponent(t.id)}">დეტალურად ნახვა</a>
        <button type="button" class="btn btn-ghost btn-sm" data-map-btn="${t.id}" title="რუკის ნახვა">📍 რუკა</button>
      </div>
    </article>`;
}

function render() {
  const filtered = filterTrails(TRAILS, currentFilters());
  grid.innerHTML = filtered.length
    ? filtered.map(trailCardHTML).join("")
    : `<p>ამ ფილტრებით ბილიკი ვერ მოიძებნა. სცადე სხვა კომბინაცია.</p>`;
  resultCount.textContent = `ნაპოვნია ${filtered.length} ბილიკი`;
}

function openMapModal(trail) {
  const modal = document.getElementById("map-modal");
  if (!modal) return;

  document.getElementById("modal-region").textContent = trail.region;
  document.getElementById("modal-title").textContent = trail.name;
  document.getElementById("modal-coords").textContent = `${trail.lat.toFixed(4)}° N, ${trail.lng.toFixed(4)}° E`;
  document.getElementById("modal-gmaps-link").href = `https://www.google.com/maps/search/?api=1&query=${trail.lat},${trail.lng}`;
  document.getElementById("modal-detail-link").href = `details.html?id=${encodeURIComponent(trail.id)}`;

  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");

  let attempts = 0;
  function setupMap() {
    if (typeof L === "undefined") {
      if (++attempts < 25) setTimeout(setupMap, 150);
      return;
    }
    const mapEl = document.getElementById("modal-map");
    if (!mapEl) return;

    try {
      if (!modalMap) {
        const topoLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {
          maxZoom: 18,
          attribution: '&copy; Esri &mdash; Topo Map'
        });
        const satLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
          maxZoom: 18,
          attribution: '&copy; Esri &mdash; Satellite'
        });

        modalMap = L.map("modal-map", {
          scrollWheelZoom: false,
          layers: [topoLayer]
        }).setView([trail.lat, trail.lng], 13);

        L.control.layers({
          "რუკა": topoLayer,
          "სატელიტი": satLayer
        }, null, { position: "topright" }).addTo(modalMap);

        modalMarker = L.marker([trail.lat, trail.lng]).addTo(modalMap);
      } else {
        modalMap.setView([trail.lat, trail.lng], 13);
        modalMarker.setLatLng([trail.lat, trail.lng]);
      }

      modalMarker.bindPopup(`
        <div style="font-family:var(--font-body); min-width:160px;">
          <strong style="color:var(--text); font-size:1.02rem;">${trail.name}</strong><br>
          <span style="color:var(--accent); font-weight:600;">${trail.region}</span> · ${trail.difficulty}
        </div>
      `).openPopup();

      setTimeout(() => modalMap.invalidateSize(), 200);
    } catch (err) {
      console.warn("Modal map notice:", err);
    }
  }

  setupMap();
}

function closeMapModal() {
  const modal = document.getElementById("map-modal");
  if (modal) {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  }
}

// ევენთები
[searchInput, regionSelect, difficultySelect, seasonSelect].forEach((el) =>
  el.addEventListener("input", render)
);

grid.addEventListener("click", (e) => {
  const mapBtn = e.target.closest("[data-map-btn]");
  if (mapBtn) {
    e.preventDefault();
    const id = mapBtn.dataset.mapBtn;
    const trail = TRAILS.find((t) => t.id === id);
    if (trail) openMapModal(trail);
  }
});

const closeBtn = document.getElementById("modal-close");
if (closeBtn) closeBtn.addEventListener("click", closeMapModal);

const modalEl = document.getElementById("map-modal");
if (modalEl) {
  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) closeMapModal();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMapModal();
});

populateRegionFilter();
applyURLParams();
render();
