/* ===========================================================================
   Admin dashboard — fetch analytics, render charts, filters, export, import
   =========================================================================== */
const COLORS = {
  navy: "#2F5D50", teal: "#E07A4E", gold: "#E8B04B",
  success: "#2E8B57", warning: "#E08A2C", critical: "#D9563F",
  palette: ["#2F5D50", "#3C7566", "#5E9A86", "#E07A4E", "#C4623A",
            "#E8B04B", "#D89A5A", "#8FB3A4", "#2E8B57", "#4E8C7C",
            "#D9563F", "#B8843A"],
};

let charts = {};
let lastData = null;

function getFilters() {
  const params = new URLSearchParams();
  const block = document.getElementById("f_block").value;
  const level = document.getElementById("f_level").value;
  const sat = document.getElementById("f_sat").value;
  if (block) params.set("block", block);
  if (level) params.set("academic_level", level);
  if (sat) {
    const [lo, hi] = sat.split("-");
    params.set("sat_min", lo);
    params.set("sat_max", hi);
  }
  return params;
}

async function loadDashboard() {
  const params = getFilters();
  const res = await fetch("/api/admin/analytics?" + params.toString());
  if (res.status === 401) { window.location.replace("/admin"); return; }
  const data = await res.json();
  lastData = data;
  render(data);
}

function catLabel(c) { return currentLang === "ar" ? c.ar : c.en; }

function render(data) {
  const hasData = data.kpis.total_responses > 0;
  document.getElementById("dashContent").style.display = hasData ? "block" : "none";
  document.getElementById("emptyState").style.display = hasData ? "none" : "block";
  if (!hasData) return;

  // KPIs
  document.getElementById("kpiTotal").textContent = data.kpis.total_responses;
  document.getElementById("kpiSat").textContent = data.kpis.avg_satisfaction ?? "—";
  document.getElementById("kpiComplaints").textContent = data.kpis.complaint_count;

  renderCategoryChart(data);
  renderDistChart(data);
  renderTrendChart(data);
  renderHeatmap(data);
  renderHealth(data);
  renderBlocks(data);
  renderAcademic(data);
}

function destroy(name) { if (charts[name]) { charts[name].destroy(); delete charts[name]; } }

function renderCategoryChart(data) {
  destroy("cat");
  const ctx = document.getElementById("chartCategory");
  charts.cat = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.category_avgs.map(catLabel),
      datasets: [{
        label: t("kpi_sat"),
        data: data.category_avgs.map((c) => c.avg),
        backgroundColor: data.category_avgs.map((c) =>
          c.avg >= 3.5 ? COLORS.teal : c.avg >= 2.5 ? COLORS.gold : COLORS.critical),
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, max: 5 }, x: { ticks: { font: { size: 10 } } } },
    },
  });
}

function renderDistChart(data) {
  destroy("dist");
  const ctx = document.getElementById("chartDist");
  charts.dist = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: [t("rate_1"), t("rate_2"), t("rate_3"), t("rate_4"), t("rate_5")],
      datasets: [{
        data: data.satisfaction_distribution,
        backgroundColor: [COLORS.critical, "#E08A2C", "#E8B04B", "#5E9A86", "#2F5D50"],
        borderWidth: 2, borderColor: "#fff",
      }],
    },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } } },
  });
}

function renderTrendChart(data) {
  destroy("trend");
  const ctx = document.getElementById("chartTrend");
  charts.trend = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.trend.map((p) => p.date),
      datasets: [{
        label: t("kpi_sat"),
        data: data.trend.map((p) => p.avg),
        borderColor: COLORS.teal, backgroundColor: "rgba(224,122,78,.14)",
        fill: true, tension: .35, pointRadius: 4, pointBackgroundColor: COLORS.teal,
      }],
    },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, max: 5 } } },
  });
}

function heatColor(v) {
  if (v === 0) return "#E5E9EF";
  if (v >= 4) return "#27AE60";
  if (v >= 3) return "#7DCEA0";
  if (v >= 2.5) return "#F39C12";
  if (v >= 1.5) return "#E67E22";
  return "#E74C3C";
}

function renderHeatmap(data) {
  const cats = data.categories;
  let html = "<table><thead><tr><th>" + t("th_block") + "</th>";
  cats.forEach((c) => { html += `<th>${catLabel(c)}</th>`; });
  html += "</tr></thead><tbody>";
  data.heatmap.forEach((row) => {
    html += `<tr><th>${row.block}</th>`;
    row.scores.forEach((v) => {
      const txt = v ? v.toFixed(1) : "—";
      html += `<td class="cell" style="background:${heatColor(v)}">${txt}</td>`;
    });
    html += "</tr>";
  });
  html += "</tbody></table>";
  document.getElementById("heatmap").innerHTML = html;
}

function renderHealth(data) {
  // Highlights
  let h = "";
  if (data.best_service) h += badgeCard(t("best_service"), catLabelByKey(data, data.best_service.key), data.best_service.score, "healthy");
  if (data.worst_service) h += badgeCard(t("worst_service"), catLabelByKey(data, data.worst_service.key), data.worst_service.score, "critical");
  if (data.worst_block) h += badgeCard(t("worst_block"), "Block " + data.worst_block.block, data.worst_block.satisfaction, "attention");
  document.getElementById("highlights").innerHTML = h;

  let html = "";
  data.service_health.forEach((s) => {
    const color = s.status === "healthy" ? COLORS.success : s.status === "attention" ? COLORS.warning : COLORS.critical;
    html += `
      <div class="health">
        <div class="health__top">
          <span class="health__name">${catLabel(s)}</span>
          <span class="badge badge--${s.status}">${s.status}</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <span class="health__score" style="color:${color}">${s.score}</span>
          <div class="health__bar" style="flex:1"><i style="width:${s.score}%;background:${color}"></i></div>
        </div>
      </div>`;
  });
  document.getElementById("healthGrid").innerHTML = html;
}

function catLabelByKey(data, key) {
  const c = data.categories.find((x) => x.key === key);
  return c ? catLabel(c) : key;
}

function badgeCard(label, value, score, status) {
  const color = status === "healthy" ? COLORS.success : status === "attention" ? COLORS.warning : COLORS.critical;
  return `<div style="flex:1;min-width:160px;border:1px solid var(--line);border-radius:10px;padding:14px;border-left:4px solid ${color}">
    <div style="font-size:.78rem;color:var(--muted);font-weight:600">${label}</div>
    <div style="font-family:var(--serif);font-size:1.1rem;color:var(--navy);margin-top:4px">${value}</div>
    <div style="font-size:.85rem;color:${color};font-weight:700">${score ?? "—"}</div>
  </div>`;
}

function renderBlocks(data) {
  let html = "";
  data.block_analytics.forEach((b) => {
    const sat = b.satisfaction != null ? b.satisfaction.toFixed(2) : "—";
    const clickable = b.responses > 0 ? "clickable" : "";
    html += `<tr class="${clickable}" data-block="${b.block}">
      <td><b>${b.block}</b></td>
      <td>${b.responses}</td>
      <td>${sat}</td>
      <td>${b.complaints}</td>
      <td>${b.responses > 0 ? "🔍" : ""}</td>
    </tr>`;
  });
  const tb = document.getElementById("blockTable");
  tb.innerHTML = html;
  tb.querySelectorAll("tr.clickable").forEach((tr) => {
    tr.addEventListener("click", () => openBlockDetail(tr.dataset.block));
  });
}

function renderAcademic(data) {
  let html = "";
  data.academic.forEach((a) => {
    html += `<tr>
      <td><b>${a.level}</b></td><td>${a.count}</td><td>${a.pct}%</td>
      <td>${a.satisfaction != null ? a.satisfaction.toFixed(2) : "—"}</td>
    </tr>`;
  });
  document.getElementById("academicTable").innerHTML = html;
}


// ---- Block detail modal ---------------------------------------------------
async function openBlockDetail(block) {
  const params = getFilters();
  const res = await fetch(`/api/admin/block/${block}?` + params.toString());
  const d = await res.json();
  document.getElementById("modalTitle").textContent = `${t("block_detail")} — ${block}`;

  const section = (title, items, cls) => {
    if (!items.length) return `<h4 style="margin:14px 0 6px;color:var(--navy)">${title}</h4><p style="color:var(--muted);font-size:.85rem">${t("bd_none")}</p>`;
    let list = items.map((it) => {
      if (typeof it === "string") return `<div class="comment-item">${it}</div>`;
      return `<div class="comment-item ${cls}"><div class="meta">${it.category} · ${it.rating}/5</div>${it.comment}</div>`;
    }).join("");
    return `<h4 style="margin:14px 0 8px;color:var(--navy)">${title}</h4><div class="comment-list">${list}</div>`;
  };

  document.getElementById("modalBody").innerHTML =
    section(t("bd_negative"), d.negative, "neg") +
    section(t("bd_positive"), d.positive, "pos") +
    section(t("bd_suggestions"), d.suggestions) +
    section(t("bd_issues"), d.issues);
  document.getElementById("blockModal").classList.add("show");
}
document.getElementById("modalClose").addEventListener("click", () =>
  document.getElementById("blockModal").classList.remove("show"));
document.getElementById("blockModal").addEventListener("click", (e) => {
  if (e.target.id === "blockModal") e.target.classList.remove("show");
});

// ---- Filters --------------------------------------------------------------
["f_block", "f_level", "f_sat"].forEach((id) =>
  document.getElementById(id).addEventListener("change", loadDashboard));
document.getElementById("resetFilters").addEventListener("click", () => {
  ["f_block", "f_level", "f_sat"].forEach((id) => { document.getElementById(id).value = ""; });
  loadDashboard();
});

// ---- Export ---------------------------------------------------------------
document.querySelectorAll("[data-export]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const params = getFilters();
    params.set("format", btn.dataset.export);
    window.location = "/api/admin/export?" + params.toString();
  });
});


// ---- Re-render on language change -----------------------------------------
function onLangChange() { if (lastData) render(lastData); }

document.addEventListener("DOMContentLoaded", loadDashboard);
