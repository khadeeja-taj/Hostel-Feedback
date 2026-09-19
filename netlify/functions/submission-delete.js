// POST /api/admin/submission/delete — admin only. Delete one response by id.
const S = require("./_shared");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return S.json(405, { ok: false });
  if (!S.isAdmin(event)) return S.json(401, { ok: false });
  let data = {};
  try { data = JSON.parse(event.body || "{}"); } catch (_) {}
  const id = parseInt(data.id, 10);
  if (!id) return S.json(400, { ok: false, error: "missing id" });
  try {
    const db = S.supa();
    const { error } = await db.from("submissions").delete().eq("id", id);
    if (error) throw error;
    return S.json(200, { ok: true });
  } catch (e) {
    return S.json(500, { ok: false, error: String(e.message || e) });
  }
};
