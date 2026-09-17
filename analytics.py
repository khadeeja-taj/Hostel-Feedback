"""
Analytics computations for the admin dashboard.

Every figure is computed from real submissions in the database. With no data,
all metrics return honest empty / zero states.
"""
from collections import Counter, defaultdict

import config
import database

CATS = config.CATEGORIES
NUM = len(CATS)
OVERALL_IDX = NUM  # rating_12 == overall experience


def _avg(values):
    vals = [v for v in values if v is not None]
    return round(sum(vals) / len(vals), 2) if vals else None


def compute(filters=None):
    subs = database.get_submissions(filters)
    # Residents who actually completed the survey (hostel residents)
    survey_subs = [s for s in subs if s.get("is_resident", 1) == 1 and s.get("rating_1") is not None]

    total = len(subs)
    total_surveys = len(survey_subs)

    # ---- KPIs --------------------------------------------------------------
    overall_scores = [s.get(f"rating_{OVERALL_IDX}") for s in survey_subs]
    avg_satisfaction = _avg(overall_scores)

    # A complaint = any rating <= threshold across categories
    complaint_count = 0
    for s in survey_subs:
        for i in range(1, NUM + 1):
            r = s.get(f"rating_{i}")
            if r is not None and r <= config.LOW_RATING_THRESHOLD:
                complaint_count += 1

    # ---- Average per category (bar chart) ----------------------------------
    category_avgs = []
    for i, (key, en, ar) in enumerate(CATS, start=1):
        avg = _avg([s.get(f"rating_{i}") for s in survey_subs])
        category_avgs.append({"key": key, "en": en, "ar": ar, "avg": avg or 0})

    # ---- Satisfaction distribution (pie 1..5) using overall ----------------
    dist = Counter()
    for s in survey_subs:
        v = s.get(f"rating_{OVERALL_IDX}")
        if v is not None:
            dist[v] += 1
    satisfaction_distribution = [dist.get(i, 0) for i in range(1, 6)]

    # ---- Heatmap: blocks x services ---------------------------------------
    heatmap = []  # rows per block
    for block in config.BLOCKS:
        block_subs = [s for s in survey_subs if s.get("block") == block]
        row = {"block": block, "scores": []}
        for i in range(1, NUM + 1):
            row["scores"].append(_avg([s.get(f"rating_{i}") for s in block_subs]) or 0)
        heatmap.append(row)

    # ---- Trend over time (avg overall per day) -----------------------------
    by_day = defaultdict(list)
    for s in survey_subs:
        day = (s.get("created_at") or "")[:10]
        v = s.get(f"rating_{OVERALL_IDX}")
        if day and v is not None:
            by_day[day].append(v)
    trend = [{"date": d, "avg": _avg(by_day[d])} for d in sorted(by_day.keys())]

    # ---- Block analytics (A-G) --------------------------------------------
    block_analytics = []
    for block in config.BLOCKS:
        bsubs = [s for s in survey_subs if s.get("block") == block]
        if not bsubs:
            block_analytics.append({
                "block": block, "responses": 0, "satisfaction": None,
                "complaints": 0, "per_service": {}, "common_issues": [],
            })
            continue
        per_service = {}
        complaints = 0
        for i, (key, en, ar) in enumerate(CATS, start=1):
            per_service[key] = _avg([s.get(f"rating_{i}") for s in bsubs]) or 0
            complaints += sum(
                1 for s in bsubs
                if s.get(f"rating_{i}") is not None and s.get(f"rating_{i}") <= config.LOW_RATING_THRESHOLD
            )
        # common issue words from main_issues
        words = Counter()
        for s in bsubs:
            for field in ("main_issues",):
                txt = (s.get(field) or "").lower()
                for w in _keywords(txt):
                    words[w] += 1
        block_analytics.append({
            "block": block,
            "responses": len(bsubs),
            "satisfaction": _avg([s.get(f"rating_{OVERALL_IDX}") for s in bsubs]),
            "complaints": complaints,
            "per_service": per_service,
            "common_issues": [w for w, _ in words.most_common(5)],
        })

    # ---- Academic breakdown -----------------------------------------------
    academic = []
    for lvl in config.ACADEMIC_LEVELS:
        lsubs = [s for s in survey_subs if s.get("academic_level") == lvl]
        complaints = sum(
            1 for s in lsubs for i in range(1, NUM + 1)
            if s.get(f"rating_{i}") is not None and s.get(f"rating_{i}") <= config.LOW_RATING_THRESHOLD
        )
        academic.append({
            "level": lvl,
            "count": len(lsubs),
            "pct": round(100 * len(lsubs) / total_surveys, 1) if total_surveys else 0,
            "satisfaction": _avg([s.get(f"rating_{OVERALL_IDX}") for s in lsubs]),
            "complaints": complaints,
        })

    # ---- Service health scores (0-100) ------------------------------------
    service_health = []
    for i, (key, en, ar) in enumerate(CATS, start=1):
        avg = _avg([s.get(f"rating_{i}") for s in survey_subs])
        score = round((avg / 5) * 100) if avg else 0
        if score >= 70:
            status = "healthy"
        elif score >= 45:
            status = "attention"
        else:
            status = "critical"
        service_health.append({"key": key, "en": en, "ar": ar, "score": score,
                               "status": status, "avg": avg or 0})
    rated = [h for h in service_health if h["avg"] > 0]
    best_service = max(rated, key=lambda h: h["avg"]) if rated else None
    worst_service = min(rated, key=lambda h: h["avg"]) if rated else None

    # ---- Worst block highlight --------------------------------------------
    rated_blocks = [b for b in block_analytics if b["satisfaction"] is not None]
    worst_block = min(rated_blocks, key=lambda b: b["satisfaction"]) if rated_blocks else None

    return {
        "kpis": {
            "total_responses": total,
            "total_surveys": total_surveys,
            "avg_satisfaction": avg_satisfaction,
            "complaint_count": complaint_count,
        },
        "category_avgs": category_avgs,
        "satisfaction_distribution": satisfaction_distribution,
        "heatmap": heatmap,
        "trend": trend,
        "block_analytics": block_analytics,
        "academic": academic,
        "service_health": service_health,
        "best_service": best_service,
        "worst_service": worst_service,
        "worst_block": worst_block,
        "categories": [{"key": k, "en": en, "ar": ar} for k, en, ar in CATS],
    }


def block_detail(block, filters=None):
    """Return positive/negative comments + suggestions for a single block."""
    f = dict(filters or {})
    f["block"] = block
    subs = [s for s in database.get_submissions(f) if s.get("is_resident", 1) == 1]
    positive, negative, suggestions, issues = [], [], [], []
    for s in subs:
        for i in range(1, NUM + 1):
            c = s.get(f"comment_{i}")
            r = s.get(f"rating_{i}")
            if c and c.strip():
                entry = {"category": CATS[i - 1][1], "comment": c.strip(), "rating": r}
                if r is not None and r <= config.LOW_RATING_THRESHOLD:
                    negative.append(entry)
                elif r is not None and r >= 4:
                    positive.append(entry)
        if s.get("suggestions"):
            suggestions.append(s["suggestions"])
        if s.get("main_issues"):
            issues.append(s["main_issues"])
    return {
        "block": block,
        "positive": positive,
        "negative": negative,
        "suggestions": suggestions,
        "issues": issues,
    }


_STOPWORDS = {
    "the", "and", "for", "with", "this", "that", "have", "are", "was", "but",
    "not", "you", "all", "any", "can", "had", "her", "his", "our", "out",
    "very", "too", "is", "in", "to", "of", "a", "it", "we", "no", "so",
    "they", "there", "their", "from", "has", "been", "more", "some", "what",
}


def _keywords(text):
    words = [w.strip(".,!?;:()\"'") for w in text.split()]
    return [w for w in words if len(w) > 3 and w not in _STOPWORDS]
