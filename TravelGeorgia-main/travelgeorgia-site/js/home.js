// მთავარი გვერდის სტატისტიკისა და რეგიონების ბარათების რენდერი
function renderHomeStats(trails) {
  const regions = getRegions(trails);
  const totalDistance = trails.reduce((sum, t) => sum + t.distanceKm, 0);

  document.getElementById("stat-trails").textContent = trails.length;
  document.getElementById("stat-regions").textContent = regions.length;
  document.getElementById("stat-distance").textContent = totalDistance;
}

function renderRegionGrid(trails) {
  const grid = document.getElementById("region-grid");
  const regions = getRegions(trails);

  grid.innerHTML = regions
    .map((region) => {
      const count = trails.filter((t) => t.region === region).length;
      const sample = trails.find((t) => t.region === region);
      return `
        <a class="region-card" href="catalog.html?region=${encodeURIComponent(region)}">
          <div class="count">${count} ბილიკი</div>
          <h3>${region}</h3>
          <p>მაგ. ${sample.name}</p>
        </a>`;
    })
    .join("");
}

renderHomeStats(TRAILS);
renderRegionGrid(TRAILS);
