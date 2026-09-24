// POST /api/submit — insert one feedback submission.
const S = require("./_shared");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return S.json(405, { ok: false, error: "method" });
  let data = {};
  try { data = JSON.parse(event.body || "{}"); } catch (_) {}

  const t = (v) => (v || "").toString().trim();
  const genId = () => "anon-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  const row = {
    student_id: t(data.student_id) || genId(),
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
    let attempt = { ...row };
    // Retry loop: if the database is missing a newly-added column (e.g.
    // rating_15/comment_15 before the migration is run), drop the offending
    // column(s) and try again so submissions never fail for that reason.
    for (let tries = 0; tries < 5; tries++) {
      const { data: inserted, error } = await db
        .from("submissions").insert(attempt).select("id").single();
      if (!error) return S.json(200, { ok: true, id: inserted.id });

      const msg = String(error.message || error);
      // Find a column name that this insert sent but the schema doesn't have.
      const missing = Object.keys(attempt).find(
        (k) => msg.includes(`'${k}'`) || msg.includes(`"${k}"`) || msg.includes(` ${k} `)
      );
      const looksMissing = /column|schema cache|PGRST204|does not exist/i.test(msg);
      if (missing && looksMissing) {
        delete attempt[missing];
        continue;
      }
      throw error;
    }
    return S.json(500, { ok: false, error: "insert_failed" });
  } catch (e) {
    return S.json(500, { ok: false, error: String(e.message || e) });
  }
};
