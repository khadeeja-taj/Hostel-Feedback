"""
SQLite database layer for the IIUI Hostel Feedback System.

Two tables:
  - residents:   reference roster imported by admin (used for verification)
  - submissions: one row per student response
"""
import sqlite3
from contextlib import contextmanager

import config

# rating_1..12 + comment_1..12 columns built from the category count
_NUM_CATEGORIES = len(config.CATEGORIES)


def _build_submission_columns():
    cols = []
    for i in range(1, _NUM_CATEGORIES + 1):
        cols.append(f"rating_{i} INTEGER")
        cols.append(f"comment_{i} TEXT")
    return ",\n            ".join(cols)


@contextmanager
def get_db():
    conn = sqlite3.connect(config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    """Create tables if they do not exist."""
    with get_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS residents (
                student_id     TEXT PRIMARY KEY,
                full_name      TEXT NOT NULL,
                email          TEXT,
                room_number    TEXT,
                block          TEXT,
                academic_level TEXT
            )
            """
        )
        conn.execute(
            f"""
            CREATE TABLE IF NOT EXISTS submissions (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id     TEXT NOT NULL,
                full_name      TEXT,
                email          TEXT,
                room_number    TEXT,
                block          TEXT,
                academic_level TEXT,
                is_resident    INTEGER DEFAULT 1,
                {_build_submission_columns()},
                main_issues               TEXT,
                suggestions               TEXT,
                additional_comments       TEXT,
                created_at     TEXT DEFAULT (datetime('now'))
            )
            """
        )


def find_resident(student_id, email):
    """Return the resident row if student_id + email match the roster, else None."""
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM residents WHERE LOWER(TRIM(student_id)) = LOWER(TRIM(?))",
            (student_id,),
        ).fetchone()
    if not row:
        return None
    # Email must also match (case-insensitive). If roster has no email stored, accept.
    if row["email"] and email:
        if row["email"].strip().lower() != email.strip().lower():
            return None
    return dict(row)


def resident_exists(student_id):
    """True if the roster contains this Registration Number (any email)."""
    with get_db() as conn:
        row = conn.execute(
            "SELECT 1 FROM residents WHERE LOWER(TRIM(student_id)) = LOWER(TRIM(?)) LIMIT 1",
            (student_id,),
        ).fetchone()
    return row is not None


def submission_exists(student_id, room_number):
    """Duplicate prevention: one submission per Student ID (+ Room Number)."""
    with get_db() as conn:
        row = conn.execute(
            """
            SELECT 1 FROM submissions
            WHERE LOWER(TRIM(student_id)) = LOWER(TRIM(?))
            LIMIT 1
            """,
            (student_id,),
        ).fetchone()
    return row is not None


def insert_submission(data):
    """Insert a submission dict. Keys must match column names."""
    keys = list(data.keys())
    placeholders = ", ".join(["?"] * len(keys))
    columns = ", ".join(keys)
    with get_db() as conn:
        cur = conn.execute(
            f"INSERT INTO submissions ({columns}) VALUES ({placeholders})",
            [data[k] for k in keys],
        )
        return cur.lastrowid


def replace_residents(rows):
    """Wipe and reload the roster from a list of dicts."""
    with get_db() as conn:
        conn.execute("DELETE FROM residents")
        for r in rows:
            conn.execute(
                """
                INSERT OR REPLACE INTO residents
                    (student_id, full_name, email, room_number, block, academic_level)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    r.get("student_id", "").strip(),
                    r.get("full_name", "").strip(),
                    r.get("email", "").strip(),
                    r.get("room_number", "").strip(),
                    r.get("block", "").strip(),
                    r.get("academic_level", "").strip(),
                ),
            )


def resident_count():
    with get_db() as conn:
        return conn.execute("SELECT COUNT(*) AS c FROM residents").fetchone()["c"]


def get_submissions(filters=None):
    """Return submissions as list of dicts, applying optional filters."""
    filters = filters or {}
    clauses = []
    params = []

    if filters.get("block"):
        clauses.append("block = ?")
        params.append(filters["block"])
    if filters.get("academic_level"):
        clauses.append("academic_level = ?")
        params.append(filters["academic_level"])

    where = (" WHERE " + " AND ".join(clauses)) if clauses else ""
    with get_db() as conn:
        rows = conn.execute(f"SELECT * FROM submissions{where}", params).fetchall()
    result = [dict(r) for r in rows]

    # Satisfaction range filter applied in Python (based on overall = rating_12)
    smin = filters.get("sat_min")
    smax = filters.get("sat_max")
    if smin is not None or smax is not None:
        overall_idx = _NUM_CATEGORIES  # rating_12 is the overall experience
        lo = smin if smin is not None else 1
        hi = smax if smax is not None else 5
        filtered = []
        for r in result:
            val = r.get(f"rating_{overall_idx}")
            if val is not None and lo <= val <= hi:
                filtered.append(r)
        result = filtered
    return result
