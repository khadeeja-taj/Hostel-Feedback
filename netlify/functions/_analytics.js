// Port of analytics.py — computes every dashboard figure from submissions.
const S = require("./_shared");
const { CATEGORIES, NUM, OVERALL_IDX, BLOCKS, ACADEMIC_LEVELS, LOW_RATING_THRESHOLD } = S;

const avg = (values) => {
  const v = values.filter((x) => x !== null && x !== undefined);
  return v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 100) / 100 : null;
};

async function fetchSubmissions(db, filters = {}) {
  let q = db.from("submissions").select("*");
  if (filters.block) q = q.eq("block", filters.block);
  if (filters.academic_level) q = q.eq("academic_level", filters.academic_level);
  const { data, error } = await q;
  if (error) throw error;
  let rows = data || [];
  const smin = filters.sat_min, smax = filters.sat_max;
  if (smin != null || smax != null) {
    const lo = smin != null ? smin : 1, hi = smax != null ? smax : 5;
    rows = rows.filter((r) => {
      const val = r[`rating_${OVERALL_IDX}`];
      return val != null && val >= lo && val <= hi;
    });
  }
  return rows;
}

const STOP = new Set(("the and for with this that have are was but not you all any can had her his our out very too is in to of a it we no so they there their from has been more some what").split(" "));
function keywords(text) {
  return (text || "").toLowerCase().split(/\s+/)
    .map((w) => w.replace(/^[.,!?;:()"']+|[.,!?;:()"']+$/g, ""))
    .filter((w) => w.length > 3 && !STOP.has(w));
}

function compute(subs) {
  const survey = subs.filter((s) => (s.is_resident ?? 1) === 1 && s.rating_1 != null);
  const total = subs.length, totalSurveys = survey.length;

  const avgSatisfaction = avg(survey.map((s) => s[`rating_${OVERALL_IDX}`]));

  let complaintCount = 0;
  for (const s of survey)
    for (let i = 1; i <= NUM; i++) {
      const r = s[`rating_${i}`];
      if (r != null && r <= LOW_RATING_THRESHOLD) complaintCount++;
    }

  const category_avgs = CATEGORIES.map(([key, en, ar], idx) => ({
    key, en, ar, avg: avg(survey.map((s) => s[`rating_${idx + 1}`])) || 0,
  }));

  const dist = [0, 0, 0, 0, 0];
  for (const s of survey) {
    const v = s[`rating_${OVERALL_IDX}`];
    if (v != null && v >= 1 && v <= 5) dist[v - 1]++;
  }

  const heatmap = BLOCKS.map((block) => {
    const bs = survey.filter((s) => s.block === block);
    return { block, scores: CATEGORIES.map((_, idx) => avg(bs.map((s) => s[`rating_${idx + 1}`])) || 0) };
  });

  const byDay = {};
  for (const s of survey) {
    const day = (s.created_at || "").slice(0, 10);
    const v = s[`rating_${OVERALL_IDX}`];
    if (day && v != null) (byDay[day] = byDay[day] || []).push(v);
  }
  const trend = Object.keys(byDay).sort().map((d) => ({ date: d, avg: avg(byDay[d]) }));

  const block_analytics = BLOCKS.map((block) => {
    const bs = survey.filter((s) => s.block === block);
    if (!bs.length) return { block, responses: 0, satisfaction: null, complaints: 0, per_service: {}, common_issues: [] };
    const per_service = {}; let complaints = 0;
    CATEGORIES.forEach(([key], idx) => {
      per_service[key] = avg(bs.map((s) => s[`rating_${idx + 1}`])) || 0;
      complaints += bs.filter((s) => s[`rating_${idx + 1}`] != null && s[`rating_${idx + 1}`] <= LOW_RATING_THRESHOLD).length;
    });
    const words = {};
    for (const s of bs) for (const w of keywords(s.main_issues)) words[w] = (words[w] || 0) + 1;
    const common = Object.entries(words).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([w]) => w);
    return {
      block, responses: bs.length,
      satisfaction: avg(bs.map((s) => s[`rating_${OVERALL_IDX}`])),
      complaints, per_service, common_issues: common,
    };
  });

  const academic = ACADEMIC_LEVELS.map((lvl) => {
    const ls = survey.filter((s) => s.academic_level === lvl);
    let complaints = 0;
    for (const s of ls) for (let i = 1; i <= NUM; i++) {
      const r = s[`rating_${i}`]; if (r != null && r <= LOW_RATING_THRESHOLD) complaints++;
    }
    return {
      level: lvl, count: ls.length,
      pct: totalSurveys ? Math.round((1000 * ls.length) / totalSurveys) / 10 : 0,
      satisfaction: avg(ls.map((s) => s[`rating_${OVERALL_IDX}`])), complaints,
    };
  });

  const service_health = CATEGORIES.map(([key, en, ar], idx) => {
    const a = avg(survey.map((s) => s[`rating_${idx + 1}`]));
    const score = a ? Math.round((a / 5) * 100) : 0;
    const status = score >= 70 ? "healthy" : score >= 45 ? "attention" : "critical";
    return { key, en, ar, score, status, avg: a || 0 };
  });
  const rated = service_health.filter((h) => h.avg > 0);
  const best_service = rated.length ? rated.reduce((a, b) => (b.avg > a.avg ? b : a)) : null;
  const worst_service = rated.length ? rated.reduce((a, b) => (b.avg < a.avg ? b : a)) : null;
  const ratedBlocks = block_analytics.filter((b) => b.satisfaction != null);
  const worst_block = ratedBlocks.length ? ratedBlocks.reduce((a, b) => (b.satisfaction < a.satisfaction ? b : a)) : null;

  return {
    kpis: { total_responses: total, total_surveys: totalSurveys, avg_satisfaction: avgSatisfaction, complaint_count: complaintCount },
    category_avgs, satisfaction_distribution: dist, heatmap, trend,
    block_analytics, academic, service_health, best_service, worst_service, worst_block,
    categories: CATEGORIES.map(([key, en, ar]) => ({ key, en, ar })),
  };
}

function blockDetail(block, subs) {
  const bs = subs.filter((s) => s.block === block && (s.is_resident ?? 1) === 1);
  const positive = [], negative = [], suggestions = [], issues = [];
  for (const s of bs) {
    for (let i = 1; i <= NUM; i++) {
      const c = s[`comment_${i}`], r = s[`rating_${i}`];
      if (c && c.trim()) {
        const entry = { category: CATEGORIES[i - 1][1], comment: c.trim(), rating: r };
        if (r != null && r <= LOW_RATING_THRESHOLD) negative.push(entry);
        else if (r != null && r >= 4) positive.push(entry);
      }
    }
    if (s.suggestions) suggestions.push(s.suggestions);
    if (s.main_issues) issues.push(s.main_issues);
  }
  return { block, positive, negative, suggestions, issues };
}

module.exports = { fetchSubmissions, compute, blockDetail };
