// GET /api/admin/submissions — admin only. Full list of responses (newest first).
const S = require("./_shared");
const A = require("./_analytics");

exports.handler = async (event) => {
  if (!S.isAdmin(event)) return S.json(401, { error: "unauthorized" });
  const p = event.queryStringParameters || {};
  const f = {};
  if (p.block) f.block = p.block;
  if (p.academic_level) f.academic_level = p.academic_level;
  if (p.sat_min) f.sat_min = parseInt(p.sat_min, 10);
  if (p.sat_max) f.sat_max = parseInt(p.sat_max, 10);
  try {
    const db = S.supa();
    const subs = await A.fetchSubmissions(db, f);
    subs.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
    return S.json(200, { submissions: subs });
  } catch (e) {
    return S.json(500, { error: String(e.message || e) });
  }
};
