// POST /api/verify — validate a student before they may submit.
const S = require("./_shared");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return S.json(405, { ok: false, reason: "method" });
  let data = {};
  try { data = JSON.parse(event.body || "{}"); } catch (_) {}

  const studentId = (data.student_id || "").trim();
  const email = (data.email || "").trim();

  if (!studentId || !email) return S.json(400, { ok: false, reason: "missing" });
  if (!S.REGISTRATION_PATTERN.test(studentId)) return S.json(200, { ok: false, reason: "format" });
  if (!S.EMAIL_PATTERN.test(email)) return S.json(200, { ok: false, reason: "email" });

  try {
    const db = S.supa();

    // Duplicate guard — one submission per registration number.
    const { data: dup } = await db
      .from("submissions").select("id").ilike("student_id", studentId).limit(1);
    if (dup && dup.length) return S.json(200, { ok: false, reason: "duplicate" });

    // Optional roster check.
    const { data: res } = await db
      .from("residents").select("*").ilike("student_id", studentId).limit(1);
    if (res && res.length) {
      const r = res[0];
      if (r.email && email && r.email.trim().toLowerCase() !== email.trim().toLowerCase()) {
        return S.json(200, { ok: false, reason: "nomatch" });
      }
      return S.json(200, {
        ok: true, matched: true,
        resident: {
          full_name: r.full_name, room_number: r.room_number,
          block: r.block, academic_level: r.academic_level,
        },
      });
    }

    // No roster entry: accept when the roster is empty, reject when a roster
    // exists but this student is not on it.
    const { count } = await db
      .from("residents").select("*", { count: "exact", head: true });
    if (count && count > 0) return S.json(200, { ok: false, reason: "not_in_roster" });

    return S.json(200, { ok: true, matched: false });
  } catch (e) {
    return S.json(500, { ok: false, reason: "server", error: String(e.message || e) });
  }
};
