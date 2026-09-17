# 🏠 IIUI Hostel Feedback System

> A bilingual (English / Arabic + RTL) web app for collecting verified student housing feedback and giving administration a **live, decision-support analytics dashboard**.

<p align="left">
  <img alt="Python" src="https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white">
  <img alt="Flask" src="https://img.shields.io/badge/Flask-Web%20Framework-000000?logo=flask&logoColor=white">
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite&logoColor=white">
  <img alt="Chart.js" src="https://img.shields.io/badge/Chart.js-Analytics-FF6384?logo=chartdotjs&logoColor=white">
  <img alt="Deployed on Railway" src="https://img.shields.io/badge/Deployed-Railway-0B0D0E?logo=railway&logoColor=white">
  <img alt="Languages" src="https://img.shields.io/badge/i18n-EN%20%2F%20عربي-6C2BD9">
</p>

---

## 🌐 Live Demo

| | Link |
|---|---|
| 📋 **Student Survey** | https://web-production-cc56c.up.railway.app |
| 🔐 **Admin Dashboard** | https://web-production-cc56c.up.railway.app/admin |

Students just open the survey link — no account, no setup. One response per student.

---

## ✨ Highlights

- 🎨 **Modern, professional UI** — glassmorphism hero, gradient cards, smooth animations
- 😀 **Creative emoji rating scale** (😞 😕 😐 😊 😄) shown above every service
- 🌍 **Fully bilingual** — English & Arabic with automatic right-to-left layout
- ✅ **Smart student verification** — validates the IIUI Registration Number format, no roster required
- 🚫 **Duplicate-proof** — one submission per registration number
- 📊 **Live analytics dashboard** — KPIs, charts, heatmaps, and service health scores
- 📥 **Export anywhere** — CSV, Excel, and PDF reports (respect active filters)
- ⚡ **Lightweight** — Flask + SQLite, no heavy build tooling, runs on minimal memory

---

## 🧑‍🎓 Student Flow

1. **Cover page** — attractive glass hero with a *Get Started* call-to-action
2. **Role selection** — Student / Admin
3. **Residency check** — "Are you a hostel resident?" *(No → straight to the thank-you screen)*
4. **Verification** — Registration Number + University Email
   - Accepts IIUI formats using `/` **or** `-` separators, e.g. `002136/MSDS/S24` or `4001-FBAS`
   - All fields required · one submission per student (duplicate prevention)
5. **Survey** — **14 services** rated 1–5; a score of 1–2 requires a short comment
6. **Feedback** — 3 optional fields with an *"I'd like to comment / Nothing to add"* toggle
7. **Confirmation** — thank-you screen (no dashboard access for students)

### The 14 rated services
Cleanliness · Maintenance · WiFi / Internet · Security · Food Quality · Dining Staff Behaviour · Dining Cleanliness · Warden Behaviour · Hostel Clerk Behaviour · Medical Center · Gym Facilities · Tuckshop · Transport Facilities · Overall Experience

---

## 🔐 Student Verification

The system verifies students **without needing a pre-uploaded roster**:

1. **Format check** — the Registration Number must look like a real IIUI number
   (alphanumeric parts joined by `/` or `-`).
2. **Email check** — must be a valid email address.
3. **Duplicate guard** — the same Registration Number can only submit once.
4. **Optional roster boost** — if an admin uploads a roster, any *listed* student
   must also match their recorded email (stronger verification), while students
   not on the list can still submit via the format check.

---

## 📊 Admin Dashboard *(single private account)*

- **KPIs** — total responses, average satisfaction, complaints flagged
- **Charts** — bar (per service), doughnut (distribution), trend line, blocks × services heatmap
- **Service health scores** — 0–100 with green / yellow / red status
- **Block analytics (A–G)** — with click-through comment drill-down
- **Academic breakdown** — Bachelor's / Master's / PhD
- **Filters** — block / level / satisfaction re-compute everything live
- **Exports** — CSV, Excel, PDF (respect the active filters)
- **Roster import** — upload a student CSV from the dashboard

---

## 🚀 Run Locally

```bash
# clone, then:
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Open <http://localhost:5000>

---

## ☁️ Deployment (Railway)

The app is production-ready and deployed on [Railway](https://railway.app):

- **`Procfile`** runs the app with Gunicorn: `web: gunicorn app:app --bind 0.0.0.0:$PORT`
- A **persistent volume** is mounted at `/data` so the SQLite database survives restarts
- Configuration is supplied through **environment variables** (see below)

### Required environment variables

| Variable | Purpose | Example |
|---|---|---|
| `DATABASE_PATH` | Where the SQLite file lives (on the volume) | `/data/feedback.db` |
| `SECRET_KEY` | Flask session security | *(long random string)* |
| `ADMIN_USERNAME` | Dashboard login | `admin` |
| `ADMIN_PASSWORD` | Dashboard password | *(your strong password)* |

```bash
export DATABASE_PATH=/data/feedback.db
export SECRET_KEY=some-long-random-secret
export ADMIN_USERNAME=youruser
export ADMIN_PASSWORD=yourstrongpassword
```

---

## 📋 Roster Import (optional)

Import a CSV from the dashboard. Column headers are flexible:

```csv
student_id,full_name,email,room_number,block,academic_level
002101/BSCS/S24,Ahmed Khan,ahmed.khan@iiu.edu.pk,A-101,A,Bachelor's
```

A ready-to-use sample lives in **`sample_residents.csv`**.

---

## 🗃️ Data Model

| Table | Purpose |
|---|---|
| **residents** | Reference roster used to strengthen verification |
| **submissions** | One row per student — 14 ratings + comments, and open feedback |

The database is created automatically on first run.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Flask (Python) |
| Database | SQLite |
| Frontend | Hand-written CSS design system, vanilla JS |
| Charts | Chart.js (via CDN) |
| Server | Gunicorn |
| Hosting | Railway (with persistent volume) |

---

## 📁 Project Structure

```
.
├── app.py              # Flask routes & API
├── config.py           # Settings, 14 categories, verification patterns
├── database.py         # SQLite layer
├── analytics.py        # Dashboard metrics computation
├── requirements.txt    # Python dependencies
├── Procfile            # Railway / Gunicorn start command
├── sample_residents.csv
├── templates/          # Jinja2 HTML (cover, role, student, admin…)
└── static/
    ├── css/style.css   # Design system
    └── js/             # i18n.js, student.js, admin.js
```

---

<p align="center"><em>Built to give students a voice and administration the insight to act. 💜</em></p>
