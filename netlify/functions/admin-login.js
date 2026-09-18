// POST /api/admin/login — check credentials, return a signed session token.
const S = require("./_shared");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return S.json(405, { ok: false });
  let data = {};
  try { data = JSON.parse(event.body || "{}"); } catch (_) {}

  const username = (data.username || "").trim();
  const password = (data.password || "").trim();
  const U = process.env.ADMIN_USERNAME || "admin";
  const P = process.env.ADMIN_PASSWORD || "iiui2026";

  if (username === U && password === P) {
    return S.json(200, { ok: true }, { "Set-Cookie": S.setCookie(S.makeToken()) });
  }
  return S.json(401, { ok: false });
};
