// GET /api/admin/block/:block — admin only. Comment drill-down for a block.
const S = require("./_shared");
const A = require("./_analytics");

exports.handler = async (event) => {
  if (!S.isAdmin(event)) return S.json(401, { error: "unauthorized" });
  const p = event.queryStringParameters || {};
  const block = p.block;
  if (!block) return S.json(400, { error: "missing block" });
  try {
    const db = S.supa();
    const f = {};
    if (p.academic_level) f.academic_level = p.academic_level;
    if (p.sat_min) f.sat_min = parseInt(p.sat_min, 10);
    if (p.sat_max) f.sat_max = parseInt(p.sat_max, 10);
    f.block = block;
    const subs = await A.fetchSubmissions(db, f);
    return S.json(200, A.blockDetail(block, subs));
  } catch (e) {
    return S.json(500, { error: String(e.message || e) });
  }
};
