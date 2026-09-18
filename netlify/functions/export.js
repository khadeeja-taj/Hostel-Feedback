// GET /api/admin/export?format=csv — admin only. Download submissions as CSV.
const S = require("./_shared");
const A = require("./_analytics");

function csvCell(v) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

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

    const headers = ["id", "student_id", "full_name", "email", "room_number", "block", "academic_level", "is_resident"];
    S.CATEGORIES.forEach(([key]) => { headers.push(`rating_${key}`, `comment_${key}`); });
    headers.push("main_issues", "suggestions", "additional_comments", "created_at");

    const lines = [headers.join(",")];
    for (const s of subs) {
      const row = [s.id, s.student_id, s.full_name, s.email, s.room_number, s.block, s.academic_level, s.is_resident];
      S.CATEGORIES.forEach((_, idx) => { row.push(s[`rating_${idx + 1}`], s[`comment_${idx + 1}`]); });
      row.push(s.main_issues, s.suggestions, s.additional_comments, s.created_at);
      lines.push(row.map(csvCell).join(","));
    }
    const csv = "﻿" + lines.join("\r\n"); // BOM for Excel UTF-8

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="hostel_feedback.csv"',
        "Cache-Control": "no-store",
      },
      body: csv,
    };
  } catch (e) {
    return S.json(500, { error: String(e.message || e) });
  }
};
