const container = document.getElementById("detail-content");

function getTrailFromURL() {
  const id = new URLSearchParams(window.location.search).get("id");
  return TRAILS.find((t) => t.id === id);
}

function renderNotFound() {
  container.innerHTML = `
    <p>ბილიკი ვერ მოიძებნა.</p>
    <a class="btn btn-ghost" href="catalog.html">← უკან, კატალოგში</a>`;
}

function isInPlan(id) {
  const plan = JSON.parse(localStorage.getItem("travelgeorgia-plan") || "[]");
  return plan.includes(id);
}

function togglePlan(id, btn) {
  let plan = JSON.parse(localStorage.getItem("travelgeorgia-plan") || "[]");
  if (plan.includes(id)) {
    plan = plan.filter((x) => x !== id);
    btn.textContent = "დამატება გეგმაში";
  } else {
    plan.push(id);
    btn.textContent = "✓ დამატებულია გეგმაში";
  }
  localStorage.setItem("travelgeorgia-plan", JSON.stringify(plan));
}

function initTrailMap(t) {
  const mapEl = document.getElementById("trail-map");
  if (!mapEl) return;

  let attempts = 0;
  function buildMap() {
    if (typeof L === "undefined") {
      if (++attempts < 25) setTimeout(buildMap, 200);
      return;
    }
    try {
      const topoLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 18,
        attribution: '&copy; Esri &mdash; Topo Map'
      });

      const satLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 18,
        attribution: '&copy; Esri &mdash; Satellite'
      });

      const map = L.map("trail-map", {
        scrollWheelZoom: false,
        zoomControl: true,
        layers: [topoLayer]
      }).setView([t.lat, t.lng], 13);

      L.control.layers({
        "რუკა": topoLayer,
        "სატელიტი": satLayer
      }, null, { position: "topright" }).addTo(map);

      const marker = L.marker([t.lat, t.lng]).addTo(map);
      marker.bindPopup(`
        <div style="font-family:var(--font-body); min-width:180px;">
          <strong style="font-size:1.02rem; display:block; margin-bottom:4px; color:var(--text);">${t.name}</strong>
          <span style="color:var(--accent); font-weight:600; font-size:0.85rem;">${t.region}</span><br>
          <span style="font-size:0.82rem; color:var(--text-muted);">${t.difficulty} · ${formatDistance(t.distanceKm)}</span>
        </div>
      `).openPopup();

      setTimeout(() => map.invalidateSize(), 250);

      window.addEventListener("themechange", () => {
        setTimeout(() => map.invalidateSize(), 150);
      });
    } catch (err) {
      console.warn("Leaflet map initialization notice:", err);
    }
  }

  buildMap();
}

function renderTrail(t) {
  container.innerHTML = `
    <a class="btn btn-ghost" href="catalog.html" style="margin-bottom:24px;">← უკან, კატალოგში</a>
    <div class="detail-header">
      <div>
        <span class="region-tag">${t.region}</span>
        <h1>${t.name}</h1>
      </div>
      <button class="btn btn-primary" id="plan-btn">
        ${isInPlan(t.id) ? "✓ დამატებულია გეგმაში" : "დამატება გეგმაში"}
      </button>
    </div>

    <div class="detail-meta">
      <div class="item"><span class="num">${t.difficulty}</span><span class="label">სირთულე</span></div>
      <div class="item"><span class="num">${formatDistance(t.distanceKm)}</span><span class="label">მანძილი</span></div>
      <div class="item"><span class="num">${formatDuration(t.durationHours)}</span><span class="label">ხანგრძლივობა</span></div>
    </div>

    <p>${t.description}</p>

    <p class="season-label" style="color:var(--text-muted); margin-bottom:0;">შესაფერისი სეზონები:</p>
    <div class="season-tags">
      ${t.season.map((s) => `<span>${s}</span>`).join("")}
    </div>

    <div class="trail-map-section" id="trail-map-section">
      <div class="map-head">
        <h3>📍 ბილიკის ლოკაცია რუკაზე</h3>
        <span class="map-coords">${t.lat.toFixed(4)}° N, ${t.lng.toFixed(4)}° E</span>
      </div>
      <div id="trail-map" class="trail-map-container"></div>
      <div class="map-actions">
        <a class="btn btn-ghost btn-sm" href="https://www.google.com/maps/search/?api=1&query=${t.lat},${t.lng}" target="_blank" rel="noopener">
          🗺️ Google Maps-ში გახსნა
        </a>
        <a class="btn btn-ghost btn-sm" href="https://www.openstreetmap.org/?mlat=${t.lat}&mlon=${t.lng}#map=14/${t.lat}/${t.lng}" target="_blank" rel="noopener">
          🌍 OpenStreetMap-ში ნახვა
        </a>
      </div>
    </div>
  `;

  document.getElementById("plan-btn").addEventListener("click", (e) => togglePlan(t.id, e.target));
  initTrailMap(t);
}

const trail = getTrailFromURL();
trail ? renderTrail(trail) : renderNotFound();
