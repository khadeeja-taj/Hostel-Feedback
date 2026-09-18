// GET /api/admin/analytics — admin only. Returns dashboard metrics.
const S = require("./_shared");
const A = require("./_analytics");

function filtersFrom(event) {
  const p = event.queryStringParameters || {};
  const f = {};
  if (p.block) f.block = p.block;
  if (p.academic_level) f.academic_level = p.academic_level;
  if (p.sat_min) f.sat_min = parseInt(p.sat_min, 10);
  if (p.sat_max) f.sat_max = parseInt(p.sat_max, 10);
  return f;
}

exports.handler = async (event) => {
  if (!S.isAdmin(event)) return S.json(401, { error: "unauthorized" });
  try {
    const db = S.supa();
    const subs = await A.fetchSubmissions(db, filtersFrom(event));
    return S.json(200, A.compute(subs));
  } catch (e) {
    return S.json(500, { error: String(e.message || e) });
  }
};
