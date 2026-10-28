const PLAN_KEY = "travelgeorgia-plan";
const summaryEl = document.getElementById("plan-summary");
const listEl = document.getElementById("plan-list");

function getPlanIds() {
  return JSON.parse(localStorage.getItem(PLAN_KEY) || "[]");
}

function setPlanIds(ids) {
  localStorage.setItem(PLAN_KEY, JSON.stringify(ids));
}

function removeFromPlan(id) {
  setPlanIds(getPlanIds().filter((x) => x !== id));
  render();
}

function render() {
  const ids = getPlanIds();
  const trails = ids.map((id) => TRAILS.find((t) => t.id === id)).filter(Boolean);

  if (!trails.length) {
    summaryEl.innerHTML = `<p class="plan-empty" style="margin:0;">გეგმა ჯერ ცარიელია — დაამატე ბილიკები <a href="catalog.html" style="color:var(--accent-soft);">კატალოგიდან</a>.</p>`;
    listEl.innerHTML = "";
    return;
  }

  const totalDistance = trails.reduce((sum, t) => sum + t.distanceKm, 0);
  const totalDuration = trails.reduce((sum, t) => sum + t.durationHours, 0);

  summaryEl.innerHTML = `
    <div class="stat"><span class="num">${trails.length}</span><span class="label">ბილიკი გეგმაში</span></div>
    <div class="stat"><span class="num">${totalDistance} კმ</span><span class="label">ჯამური მანძილი</span></div>
    <div class="stat"><span class="num">${totalDuration} სთ</span><span class="label">სავარაუდო დრო</span></div>
  `;

  listEl.innerHTML = trails
    .map(
      (t) => `
    <div class="plan-item">
      <div>
        <h3>${t.name}</h3>
        <div class="meta">${t.region} · ${t.difficulty} · ${formatDistance(t.distanceKm)} · ${formatDuration(t.durationHours)}</div>
      </div>
      <div style="display:flex; gap:10px;">
        <a class="btn btn-ghost" href="details.html?id=${encodeURIComponent(t.id)}">ნახვა</a>
        <button class="btn btn-ghost" data-remove="${t.id}">წაშლა</button>
      </div>
    </div>`
    )
    .join("");

  listEl.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => removeFromPlan(btn.dataset.remove));
  });
}

render();
