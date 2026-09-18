// POST /api/submit — insert one feedback submission.
const S = require("./_shared");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return S.json(405, { ok: false, error: "method" });
  let data = {};
  try { data = JSON.parse(event.body || "{}"); } catch (_) {}

  const t = (v) => (v || "").toString().trim();
  const row = {
    student_id: t(data.student_id),
    full_name: t(data.full_name),
    email: t(data.email),
    room_number: t(data.room_number),
    block: t(data.block),
    academic_level: t(data.academic_level),
    is_resident: data.is_resident === false ? 0 : 1,
    main_issues: t(data.main_issues) || null,
    suggestions: t(data.suggestions) || null,
    additional_comments: t(data.additional_comments) || null,
  };

  const ratings = data.ratings || {};
  const comments = data.comments || {};
  for (let i = 1; i <= S.NUM; i++) {
    const v = ratings[String(i)] ?? ratings[i];
    row[`rating_${i}`] = v ? parseInt(v, 10) : null;
    const c = (comments[String(i)] ?? comments[i] ?? "").toString().trim();
    row[`comment_${i}`] = c || null;
  }

  try {
    const db = S.supa();
    const { data: inserted, error } = await db
      .from("submissions").insert(row).select("id").single();
    if (error) throw error;
    return S.json(200, { ok: true, id: inserted.id });
  } catch (e) {
    return S.json(500, { ok: false, error: String(e.message || e) });
  }
};
