// Shared helpers for all functions: Supabase client, config, admin token.
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

// 14 service categories — must match the survey order (rating_1 .. rating_14).
const CATEGORIES = [
  ["cleanliness", "Cleanliness", "النظافة"],
  ["maintenance", "Maintenance", "الصيانة"],
  ["wifi", "WiFi / Internet", "الواي فاي / الإنترنت"],
  ["security", "Security", "الأمن"],
  ["food", "Food Quality", "جودة الطعام"],
  ["mess_staff", "Dining Staff Behaviour", "سلوك طاقم المطعم"],
  ["mess_clean", "Dining Cleanliness", "نظافة المطعم"],
  ["warden", "Warden Behaviour", "سلوك المشرف"],
  ["clerk", "Hostel Clerk Behaviour", "سلوك موظف السكن"],
  ["medical", "Medical Center", "المركز الطبي"],
  ["gym", "Gym Facilities", "الصالة الرياضية"],
  ["tuckshop", "Tuckshop", "المتجر / البقالة"],
  ["transport", "Transport Facilities", "المواصلات"],
  ["overall", "Overall Experience", "التجربة العامة"],
];
const NUM = CATEGORIES.length;
const OVERALL_IDX = NUM; // rating_14 = overall
const BLOCKS = ["A", "B", "C", "D", "E", "F", "G"];
const ACADEMIC_LEVELS = ["Bachelor's", "Master's", "PhD"];
const LOW_RATING_THRESHOLD = 2;

const REGISTRATION_PATTERN = /^\s*[A-Za-z0-9]+([/\-][A-Za-z0-9]+)+\s*$/;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function supa() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_KEY env vars");
  return createClient(url, key, { auth: { persistSession: false } });
}

const SECRET = () => process.env.SECRET_KEY || "change-me";

// --- Simple signed admin token (HMAC, 12h expiry) --------------------------
function makeToken() {
  const exp = Date.now() + 12 * 3600 * 1000;
  const body = Buffer.from(String(exp)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET()).update(body).digest("base64url");
  return `${body}.${sig}`;
}
function verifyToken(token) {
  if (!token) return false;
  const [body, sig] = String(token).split(".");
  if (!body || !sig) return false;
  const expect = crypto.createHmac("sha256", SECRET()).update(body).digest("base64url");
  if (sig.length !== expect.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return false;
  const exp = parseInt(Buffer.from(body, "base64url").toString(), 10);
  return Number.isFinite(exp) && Date.now() < exp;
}
const COOKIE = "hf_admin";
function cookieToken(event) {
  const raw = (event.headers && (event.headers.cookie || event.headers.Cookie)) || "";
  const m = raw.match(new RegExp("(?:^|;\\s*)" + COOKIE + "=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : "";
}
function isAdmin(event) {
  return verifyToken(cookieToken(event));
}
function setCookie(token) {
  const base = `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax`;
  return token ? `${base}; Max-Age=43200` : `${base}; Max-Age=0`;
}

function json(statusCode, obj, extraHeaders) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...(extraHeaders || {}) },
    body: JSON.stringify(obj),
  };
}

module.exports = {
  CATEGORIES, NUM, OVERALL_IDX, BLOCKS, ACADEMIC_LEVELS, LOW_RATING_THRESHOLD,
  REGISTRATION_PATTERN, EMAIL_PATTERN, supa, makeToken, isAdmin, setCookie, json,
};
