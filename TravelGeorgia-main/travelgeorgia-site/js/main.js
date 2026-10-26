// თემის მართვა (Light / Dark Mode)
function initTheme() {
  const saved = localStorage.getItem("travelgeorgia-theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const current = saved || (prefersDark ? "dark" : "light");

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    const btn = document.querySelector(".theme-toggle");
    if (btn) {
      btn.textContent = theme === "dark" ? "☀️" : "🌙";
      btn.setAttribute("aria-label", theme === "dark" ? "ნათელი თემა" : "მუქი თემა");
      btn.setAttribute("title", theme === "dark" ? "ნათელი თემა" : "მუქი თემა");
    }
  }

  applyTheme(current);

  const btn = document.querySelector(".theme-toggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const next = isDark ? "light" : "dark";
      localStorage.setItem("travelgeorgia-theme", next);
      applyTheme(next);
      window.dispatchEvent(new Event("themechange"));
    });
  }
}

// ნავიგაციის მენიუ (მობილურზე გახსნა/დახურვა) და აქტიური ბმულის მონიშვნა
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const list = document.querySelector(".nav-list");
  if (!toggle || !list) return;

  function closeMenu() {
    list.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "მენიუს გახსნა");
    toggle.textContent = "☰";
  }

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = list.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "მენიუს დახურვა" : "მენიუს გახსნა");
    toggle.textContent = isOpen ? "✕" : "☰";
  });

  // მენიუს დახურვა გარედან დაკლიკებისას
  document.addEventListener("click", (e) => {
    if (list.classList.contains("open") && !e.target.closest(".site-header")) {
      closeMenu();
    }
  });

  // Esc კლავიშით დახურვა
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && list.classList.contains("open")) {
      closeMenu();
      toggle.focus();
    }
  });

  // ბმულზე დაკლიკებისას მენიუს დახურვა
  list.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (list.classList.contains("open")) {
        closeMenu();
      }
    });
  });

  // ეკრანის ზომის შეცვლისას მობილური მენიუს გასუფთავება
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && list.classList.contains("open")) {
      closeMenu();
    }
  });

  // მიმდინარე გვერდის ბმულის გააქტიურება
  const current = document.body.dataset.page;
  list.querySelectorAll("a[data-page]").forEach((link) => {
    if (link.dataset.page === current) {
      link.classList.add("active");
    }
  });
}

// უნიკალური რეგიონების სია ბილიკებიდან
function getRegions(trails) {
  return [...new Set(trails.map((t) => t.region))];
}

// ფორმატირება
function formatDistance(km) {
  return `${km} კმ`;
}

function formatDuration(hours) {
  return `${hours} სთ`;
}

// დაუყოვნებლივ თემის შემოწმება (FOUC-ის თავიდან ასაცილებლად)
(function() {
  const saved = localStorage.getItem("travelgeorgia-theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (saved === "dark" || (!saved && prefersDark)) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNav();
});
