// GET /admin/logout — clear the admin cookie and send the user home.
const S = require("./_shared");

exports.handler = async () => ({
  statusCode: 302,
  headers: { Location: "/", "Set-Cookie": S.setCookie(""), "Cache-Control": "no-store" },
  body: "",
});
