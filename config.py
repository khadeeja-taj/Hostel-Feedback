"""
Configuration for the IIUI Hostel Feedback System.

Admin credentials and survey definitions live here. In production, override the
admin credentials and secret key using environment variables.
"""
import os

# ---------------------------------------------------------------------------
# Core settings
# ---------------------------------------------------------------------------
SECRET_KEY = os.environ.get("SECRET_KEY", "iiui-hostel-feedback-change-me-in-prod")
DATABASE_PATH = os.environ.get("DATABASE_PATH", os.path.join(os.path.dirname(__file__), "feedback.db"))

# ---------------------------------------------------------------------------
# Single authorized admin account (no public sign-up / self-registration)
# ---------------------------------------------------------------------------
ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "iiui2026")

# ---------------------------------------------------------------------------
# Survey definition — 14 service categories (rating_1 .. rating_14)
# Each entry: (key, English label, Arabic label)
# ---------------------------------------------------------------------------
CATEGORIES = [
    ("cleanliness",   "Cleanliness",                 "النظافة"),
    ("maintenance",   "Maintenance",                 "الصيانة"),
    ("wifi",          "WiFi / Internet",             "الواي فاي / الإنترنت"),
    ("security",      "Security",                    "الأمن"),
    ("food",          "Food Quality",                "جودة الطعام"),
    ("mess_staff",    "Dining Staff Behaviour",      "سلوك طاقم المطعم"),
    ("mess_clean",    "Dining Cleanliness",          "نظافة المطعم"),
    ("warden",        "Warden Behaviour",            "سلوك المشرف"),
    ("clerk",         "Hostel Clerk Behaviour",      "سلوك موظف السكن"),
    ("medical",       "Medical Center",              "المركز الطبي"),
    ("gym",           "Gym Facilities",              "الصالة الرياضية"),
    ("tuckshop",      "Tuckshop",                    "المتجر / البقالة"),
    ("transport",     "Transport Facilities",        "المواصلات"),
    ("overall",       "Overall Experience",          "التجربة العامة"),
]

# Blocks and academic levels used for verification + filtering
BLOCKS = ["A", "B", "C", "D", "E", "F", "G"]
ACADEMIC_LEVELS = ["Bachelor's", "Master's", "PhD"]

# A rating at or below this value forces a written comment
LOW_RATING_THRESHOLD = 2

# ---------------------------------------------------------------------------
# Student verification
# ---------------------------------------------------------------------------
# When no roster is uploaded, students are verified by the *shape* of their
# Registration Number instead. IIUI numbers use "/" and/or "-" as separators,
# for example: 002136/MSDS/S24  or  4001-FBAS  or  002136-MSDS/S24
# The pattern is intentionally lenient: two or more alphanumeric parts joined
# by "/" or "-", with optional surrounding spaces and case-insensitive.
REGISTRATION_PATTERN = r"^\s*[A-Za-z0-9]+([/\-][A-Za-z0-9]+)+\s*$"

# Basic email shape check (something@something.something)
EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
