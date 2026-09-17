"""
IIUI Hostel Feedback System — Flask application.

Lightweight web app (Flask + SQLite). Serves a bilingual (EN/AR + RTL)
student feedback flow and a private, single-admin analytics dashboard.
"""
import csv
import io
import json
import os
import re
from functools import wraps

from flask import (
    Flask, render_template, request, jsonify, session,
    redirect, url_for, send_file, abort,
)

import config
import database
import analytics

app = Flask(__name__)
app.secret_key = config.SECRET_KEY

NUM = len(config.CATEGORIES)

@app.after_request
def _no_cache(resp):
    resp.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    resp.headers["Pragma"] = "no-cache"
    resp.headers["Expires"] = "0"
    return resp



# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------
database.init_db()


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get("is_admin"):
            if request.path.startswith("/api/"):
                return jsonify({"error": "unauthorized"}), 401
            return redirect(url_for("admin_login_page"))
        return fn(*args, **kwargs)
    return wrapper


# ---------------------------------------------------------------------------
# Public pages
# ---------------------------------------------------------------------------
@app.route("/")
def cover():
    return render_template("cover.html")


@app.route("/start")
def role_select():
    return render_template("role.html")


@app.route("/student")
def student_flow():
    return render_template("student.html", categories=config.CATEGORIES,
                           blocks=config.BLOCKS, levels=config.ACADEMIC_LEVELS,
                           low_threshold=config.LOW_RATING_THRESHOLD)


# ---------------------------------------------------------------------------
# Student API
# ---------------------------------------------------------------------------
@app.route("/api/verify", methods=["POST"])
def api_verify():
    """Verify a student before they may submit feedback.

    Strategy:
      1. Registration Number must match the IIUI format (config.REGISTRATION_PATTERN).
      2. Email must be a valid address.
      3. The student must not have already submitted (duplicate guard).
      4. If a roster has been uploaded and contains this Registration Number,
         the email must also match that record (extra protection). When no
         roster is loaded, the format check alone is sufficient.
    """
    data = request.get_json(force=True)
    student_id = (data.get("student_id") or "").strip()
    email = (data.get("email") or "").strip()

    if not student_id or not email:
        return jsonify({"ok": False, "reason": "missing"}), 400

    if not re.match(config.REGISTRATION_PATTERN, student_id):
        return jsonify({"ok": False, "reason": "format"})

    if not re.match(config.EMAIL_PATTERN, email):
        return jsonify({"ok": False, "reason": "email"})

    if database.submission_exists(student_id, data.get("room_number")):
        return jsonify({"ok": False, "reason": "duplicate"})

    resident = database.find_resident(student_id, email)
    if resident:
        # Roster present and matched — return the known details.
        return jsonify({"ok": True, "matched": True, "resident": {
            "full_name": resident.get("full_name"),
            "room_number": resident.get("room_number"),
            "block": resident.get("block"),
            "academic_level": resident.get("academic_level"),
        }})

    # If the roster has entries for this exact Registration Number but the
    # email did not match, block it. (find_resident returns None on mismatch.)
    if database.resident_exists(student_id):
        return jsonify({"ok": False, "reason": "nomatch"})

    # No roster entry for this student — reject (only registered students can provide feedback).
    return jsonify({"ok": False, "reason": "not_in_roster"})

@app.route("/api/submit", methods=["POST"])
def api_submit():
    data = request.get_json(force=True)
    student_id = (data.get("student_id") or "").strip()

    row = {
        "student_id": student_id,
        "full_name": (data.get("full_name") or "").strip(),
        "email": (data.get("email") or "").strip(),
        "room_number": (data.get("room_number") or "").strip(),
        "block": (data.get("block") or "").strip(),
        "academic_level": (data.get("academic_level") or "").strip(),
        "is_resident": 1 if data.get("is_resident", True) else 0,
        "main_issues": (data.get("main_issues") or "").strip(),
        "suggestions": (data.get("suggestions") or "").strip(),
        "additional_comments": (data.get("additional_comments") or "").strip(),
    }

    ratings = data.get("ratings") or {}
    comments = data.get("comments") or {}
    for i in range(1, NUM + 1):
        val = ratings.get(str(i)) or ratings.get(i)
        row[f"rating_{i}"] = int(val) if val else None
        row[f"comment_{i}"] = (comments.get(str(i)) or comments.get(i) or "").strip() or None

    new_id = database.insert_submission(row)
    return jsonify({"ok": True, "id": new_id})


# ---------------------------------------------------------------------------
# Admin auth
# ---------------------------------------------------------------------------
@app.route("/admin")
def admin_login_page():
    if session.get("is_admin"):
        return redirect(url_for("admin_dashboard"))
    return render_template("admin_login.html")


@app.route("/api/admin/login", methods=["POST"])
def api_admin_login():
    data = request.get_json(force=True)
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()
    if username == config.ADMIN_USERNAME and password == config.ADMIN_PASSWORD:
        session["is_admin"] = True
        return jsonify({"ok": True})
    return jsonify({"ok": False}), 401


@app.route("/admin/logout")
def admin_logout():
    session.pop("is_admin", None)
    return redirect(url_for("cover"))


# ---------------------------------------------------------------------------
# Admin dashboard
# ---------------------------------------------------------------------------
@app.route("/admin/dashboard")
@admin_required
def admin_dashboard():
    return render_template("admin_dashboard.html",
                           resident_count=database.resident_count())


def _filters_from_request():
    f = {}
    if request.args.get("block"):
        f["block"] = request.args["block"]
    if request.args.get("academic_level"):
        f["academic_level"] = request.args["academic_level"]
    if request.args.get("sat_min"):
        f["sat_min"] = int(request.args["sat_min"])
    if request.args.get("sat_max"):
        f["sat_max"] = int(request.args["sat_max"])
    return f


@app.route("/api/admin/analytics")
@admin_required
def api_admin_analytics():
    return jsonify(analytics.compute(_filters_from_request()))


@app.route("/api/admin/block/<block>")
@admin_required
def api_admin_block(block):
    return jsonify(analytics.block_detail(block, _filters_from_request()))


@app.route("/api/admin/import", methods=["POST"])
@admin_required
def api_admin_import():
    if "file" not in request.files:
        return jsonify({"ok": False, "error": "no file"}), 400
    f = request.files["file"]
    try:
        content = f.read().decode("utf-8-sig")
    except Exception:
        return jsonify({"ok": False, "error": "could not read file"}), 400

    reader = csv.DictReader(io.StringIO(content))
    rows = []
    # Accept several common header spellings
    for raw in reader:
        norm = {k.strip().lower(): (v or "").strip() for k, v in raw.items() if k}
        rows.append({
            "student_id": norm.get("student_id") or norm.get("id") or norm.get("registration") or norm.get("reg_no") or "",
            "full_name": norm.get("full_name") or norm.get("name") or "",
            "email": norm.get("email") or "",
            "room_number": norm.get("room_number") or norm.get("room") or "",
            "block": norm.get("block") or "",
            "academic_level": norm.get("academic_level") or norm.get("level") or "",
        })
    rows = [r for r in rows if r["student_id"]]
    if not rows:
        return jsonify({"ok": False, "error": "no valid rows found"}), 400

    database.replace_residents(rows)
    return jsonify({"ok": True, "count": len(rows)})


# ---------------------------------------------------------------------------
# Export (respects filters)
# ---------------------------------------------------------------------------
@app.route("/api/admin/export")
@admin_required
def api_admin_export():
    fmt = request.args.get("format", "csv")
    subs = database.get_submissions(_filters_from_request())

    if fmt == "csv":
        return _export_csv(subs)
    if fmt == "excel":
        return _export_excel(subs)
    if fmt == "pdf":
        return _export_pdf(subs)
    return abort(400)


def _flat_headers():
    headers = ["id", "student_id", "full_name", "email", "room_number",
               "block", "academic_level", "is_resident"]
    for i, (key, en, ar) in enumerate(config.CATEGORIES, start=1):
        headers.append(f"rating_{key}")
        headers.append(f"comment_{key}")
    headers += ["main_issues", "suggestions", "additional_comments",
                "created_at"]
    return headers


def _row_values(s):
    vals = [s.get("id"), s.get("student_id"), s.get("full_name"), s.get("email"),
            s.get("room_number"), s.get("block"), s.get("academic_level"),
            s.get("is_resident")]
    for i in range(1, NUM + 1):
        vals.append(s.get(f"rating_{i}"))
        vals.append(s.get(f"comment_{i}"))
    vals += [s.get("main_issues"), s.get("suggestions"), s.get("additional_comments"),
             s.get("created_at")]
    return vals


def _export_csv(subs):
    out = io.StringIO()
    writer = csv.writer(out)
    writer.writerow(_flat_headers())
    for s in subs:
        writer.writerow(_row_values(s))
    mem = io.BytesIO(out.getvalue().encode("utf-8-sig"))
    return send_file(mem, mimetype="text/csv", as_attachment=True,
                     download_name="hostel_feedback.csv")


def _export_excel(subs):
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill

    wb = Workbook()
    ws = wb.active
    ws.title = "Submissions"
    headers = _flat_headers()
    ws.append(headers)
    header_fill = PatternFill("solid", fgColor="1F3A5F")
    for cell in ws[1]:
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = header_fill
    for s in subs:
        ws.append(_row_values(s))
    mem = io.BytesIO()
    wb.save(mem)
    mem.seek(0)
    return send_file(mem, as_attachment=True, download_name="hostel_feedback.xlsx",
                     mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")


def _export_pdf(subs):
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import cm
    from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                    TableStyle)
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

    data = analytics.compute(_filters_from_request())
    mem = io.BytesIO()
    doc = SimpleDocTemplate(mem, pagesize=A4, topMargin=2 * cm, bottomMargin=2 * cm)
    styles = getSampleStyleSheet()
    navy = colors.HexColor("#1F3A5F")
    title_style = ParagraphStyle("title", parent=styles["Title"], textColor=navy)
    h2 = ParagraphStyle("h2", parent=styles["Heading2"], textColor=navy)

    elements = [Paragraph("IIUI Hostel Feedback — Report", title_style),
                Paragraph("Quality-Control Analytics Summary", styles["Normal"]),
                Spacer(1, 0.6 * cm)]

    k = data["kpis"]
    kpi_table = Table([
        ["Total Responses", "Avg Satisfaction", "Complaints"],
        [k["total_responses"], k["avg_satisfaction"] or "—",
         k["complaint_count"]],
    ], colWidths=[4 * cm] * 3)
    kpi_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), navy),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTSIZE", (0, 1), (-1, 1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements += [kpi_table, Spacer(1, 0.8 * cm)]

    elements.append(Paragraph("Service Health Scores", h2))
    health_rows = [["Service", "Score (0-100)", "Status"]]
    for h in data["service_health"]:
        health_rows.append([h["en"], h["score"], h["status"].title()])
    health_table = Table(health_rows, colWidths=[7 * cm, 4 * cm, 4 * cm])
    style = [("BACKGROUND", (0, 0), (-1, 0), navy),
             ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
             ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
             ("FONTSIZE", (0, 0), (-1, -1), 9)]
    for idx, h in enumerate(data["service_health"], start=1):
        c = {"healthy": colors.HexColor("#27AE60"),
             "attention": colors.HexColor("#F39C12"),
             "critical": colors.HexColor("#E74C3C")}[h["status"]]
        style.append(("TEXTCOLOR", (2, idx), (2, idx), c))
    health_table.setStyle(TableStyle(style))
    elements += [health_table, Spacer(1, 0.8 * cm)]

    elements.append(Paragraph("Block Satisfaction", h2))
    block_rows = [["Block", "Responses", "Satisfaction", "Complaints"]]
    for b in data["block_analytics"]:
        block_rows.append([b["block"], b["responses"],
                           b["satisfaction"] or "—", b["complaints"]])
    block_table = Table(block_rows, colWidths=[3 * cm, 4 * cm, 4 * cm, 4 * cm])
    block_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), navy),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ]))
    elements.append(block_table)

    doc.build(elements)
    mem.seek(0)
    return send_file(mem, as_attachment=True, download_name="hostel_feedback_report.pdf",
                     mimetype="application/pdf")


if __name__ == "__main__":
    # Port and debug are environment-driven so the same entrypoint works
    # locally and on Railway (which sets $PORT and runs via gunicorn).
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", port=port, debug=debug)
