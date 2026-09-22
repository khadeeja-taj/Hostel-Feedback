/* ===========================================================================
   Student multi-step flow controller
   =========================================================================== */
const LOW = window.LOW_THRESHOLD || 2;

const state = {
  residency: "yes",         // 'yes' | 'no'
  ratings: {},             // {1: 4, ...}
  comments: {},            // {1: '...'}
};

// Step sequence
function flowSteps() {
  return ["verify", "survey", "feedback", "confirm"];
}

let idx = 0;

const steps = () => document.querySelectorAll(".step");
const btnNext = document.getElementById("btnNext");
const btnBack = document.getElementById("btnBack");
const navActions = document.getElementById("navActions");

function currentStepName() {
  return flowSteps()[idx];
}

function showStep() {
  const name = currentStepName();
  steps().forEach((s) => s.classList.toggle("active", s.dataset.step === name));
  // Always open a step from its top (e.g. survey starts at the first service)
  try { window.scrollTo(0, 0); } catch (_) {}

  // Progress
  const total = flowSteps().length - 1; // exclude confirm from count base
  const pct = Math.round((idx / total) * 100);
  document.getElementById("progressFill").style.width = pct + "%";
  document.getElementById("progressStep").textContent = `${idx + 1} / ${flowSteps().length}`;
  document.getElementById("progressPct").textContent = pct + "%";

  // Nav visibility
  if (name === "confirm") {
    navActions.style.display = "none";
    document.getElementById("progressWrap").style.display = "none";
    return;
  }
  navActions.style.display = "flex";
  btnBack.style.visibility = "visible";

  // Last data step before confirm => Submit
  const isLastData = flowSteps()[idx + 1] === "confirm";
  btnNext.textContent = isLastData ? t("submit") : t("next");
}

// ---- Residency selection --------------------------------------------------
document.querySelectorAll("[data-residency]").forEach((c) => {
  c.addEventListener("click", () => {
    document.querySelectorAll("[data-residency]").forEach((x) => x.classList.remove("selected"));
    c.classList.add("selected");
    state.residency = c.dataset.residency;
    setTimeout(function () { idx++; showStep(); }, 200);
  });
});

// ---- Box choices (block / academic level) ---------------------------------
document.querySelectorAll(".choice-grid").forEach((grid) => {
  const target = document.getElementById(grid.dataset.target);
  grid.querySelectorAll(".choice").forEach((btn) => {
    btn.addEventListener("click", () => {
      grid.querySelectorAll(".choice").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      if (target) target.value = btn.dataset.value;
      grid.closest(".field").classList.remove("invalid");
    });
  });
});

// ---- Ratings (emoji-over-number boxes) ------------------------------------
document.querySelectorAll(".rating-card").forEach((card) => {
  const cat = card.dataset.cat;
  const commentBox = card.querySelector(".comment-box");
  const requiredNotice = card.querySelector(".comment-required-notice");

  card.querySelectorAll(".score-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const val = parseInt(btn.dataset.val);
      state.ratings[cat] = val;
      card.querySelectorAll(".score-btn").forEach((b) => b.classList.remove("selected", "low"));
      btn.classList.add("selected");
      if (val <= LOW) btn.classList.add("low");

      burstEmojis(btn.dataset.emoji, btn);

      // Low score => comment required (auto-expanded). Otherwise the comment
      // stays a compact "Add a comment" button to save space.
      if (val <= LOW) {
        commentBox.classList.add("show", "required");
        requiredNotice.style.display = "block";
      } else {
        commentBox.classList.remove("required");
        commentBox.classList.add("show");
        requiredNotice.style.display = "none";
      }
      card.classList.remove("invalid");
    });
  });
  // "Add a comment" button expands the textarea on demand
  const toggle = card.querySelector(".comment-toggle");
  if (toggle) toggle.addEventListener("click", () => {
    commentBox.classList.add("open");
    const t = card.querySelector("textarea");
    if (t) t.focus();
  });
  const ta = card.querySelector("textarea");
  if (ta) ta.addEventListener("input", () => { state.comments[cat] = ta.value; });
});

// Playful burst of small emojis out of the clicked box
function burstEmojis(emoji, el) {
  if (!emoji) return;
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  for (let i = 0; i < 14; i++) {
    const s = document.createElement("span");
    s.className = "emoji-particle";
    s.textContent = emoji;
    const ang = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 90;
    s.style.left = cx + "px";
    s.style.top = cy + "px";
    s.style.setProperty("--dx", Math.cos(ang) * dist + "px");
    s.style.setProperty("--dy", (Math.sin(ang) * dist - 30) + "px");
    s.style.fontSize = (12 + Math.random() * 14) + "px";
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 950);
  }
}

// ---- Feedback want-to-say toggles ----------------------------------------
document.querySelectorAll(".feedback-field").forEach((field) => {
  const ta = field.querySelector("textarea");
  field.querySelectorAll(".say-toggle button").forEach((btn) => {
    btn.addEventListener("click", () => {
      field.querySelectorAll(".say-toggle button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      if (btn.dataset.say === "yes") {
        ta.style.display = "block";
        ta.focus();
      } else {
        ta.style.display = "none";
        ta.value = "";
      }
    });
  });
});


// ---- Validation -----------------------------------------------------------
function val(id) { return (document.getElementById(id).value || "").trim(); }

function showAlert(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.add("show");
}
function hideAlert(id) { document.getElementById(id).classList.remove("show"); }

function validateResidency() {
  if (!state.residency) {
    alert(t("res_lead"));
    return false;
  }
  return true;
}

function validateVerifyFields() {
  let ok = true;
  document.querySelectorAll('[data-step="verify"] .field[data-required]').forEach((f) => {
    const input = f.querySelector("input, select");
    if (!input.value.trim()) { f.classList.add("invalid"); ok = false; }
    else f.classList.remove("invalid");
  });
  return ok;
}

async function validateVerify() {
  const required = ["full_name", "block", "academic_level"];
  let ok = true;
  required.forEach(function (id) {
    const el = document.getElementById(id);
    const field = el ? el.closest(".field") : null;
    if (el && !el.value.trim()) { if (field) field.classList.add("invalid"); ok = false; }
    else if (field) field.classList.remove("invalid");
  });
  if (ok) hideAlert("verifyAlert"); else showAlert("verifyAlert", t("verify_fill_all"));
  return ok;
}

function validateSurvey() {
  hideAlert("surveyAlert");
  let ok = true;
  document.querySelectorAll(".rating-card").forEach((card) => {
    const cat = card.dataset.cat;
    card.classList.remove("invalid");
    if (!state.ratings[cat]) { card.classList.add("invalid"); ok = false; }
    else if (state.ratings[cat] <= LOW) {
      const ta = card.querySelector("textarea");
      if (!ta.value.trim()) { card.classList.add("invalid"); ok = false; }
    }
  });
  if (!ok) showAlert("surveyAlert", t("survey_err_missing") + " " + t("survey_err_comment"));
  return ok;
}

// ---- Submit ---------------------------------------------------------------
async function submitAll() {
  const block = val("block");
  const payload = {
    is_resident: block !== "Outside",
    full_name: val("full_name"),
    block: block,
    academic_level: val("academic_level"),
    ratings: state.ratings,
    comments: state.comments,
    main_issues: byId("main_issues"),
    suggestions: byId("suggestions"),
    additional_comments: byId("additional_comments"),
  };

  btnNext.disabled = true;
  btnNext.innerHTML = '<span class="spinner"></span>';
  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.ok) return true;
    alert(t(data.reason === "duplicate" ? "verify_err_duplicate" : "submit_error"));
    return false;
  } catch (e) {
    alert(t("submit_error"));
    return false;
  } finally {
    btnNext.disabled = false;
    btnNext.textContent = t("submit");
  }
}

function byId(id) { const el = document.getElementById(id); return el ? (el.value || "").trim() : ""; }

// ---- Navigation -----------------------------------------------------------
btnNext.addEventListener("click", async () => {
  const name = currentStepName();

  if (name === "residency" && !validateResidency()) return;
  if (name === "verify" && !(await validateVerify())) return;
  if (name === "survey" && !validateSurvey()) return;

  // Last data step before the thank-you screen => send the response
  if (flowSteps()[idx + 1] === "confirm") {
    if (!(await submitAll())) return;
  }

  idx++;
  showStep();
});

btnBack.addEventListener("click", () => {
  if (idx > 0) { idx--; showStep(); }
  else { window.location = "/"; }   // first step → back to home
});

// ---- Localize category titles on lang change ------------------------------
function onLangChange() {
  document.querySelectorAll(".rating-card__title").forEach((el) => {
    el.textContent = currentLang === "ar" ? el.dataset.ar : el.dataset.en;
  });
  showStep();
}

// init
document.addEventListener("DOMContentLoaded", () => { showStep(); onLangChange(); });

// Handle Verify button click
document.getElementById('verifyBtn')?.addEventListener('click', async function() {
  const regNum = document.getElementById('student_id').value.trim();
  const email = document.getElementById('email').value.trim();
  
  if (!regNum || !email) {
    alert('Please enter both Registration Number and Email');
    return;
  }
  
  try {
    const res = await fetch('/api/lookup-resident', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: regNum })
    });
    const data = await res.json();
    
    if (data.ok && data.resident) {
      // Show auto-fill fields
      document.getElementById('autoFillFields').style.display = 'block';
      // Populate fields
      document.getElementById('full_name').value = data.resident.full_name || '';
      document.getElementById('room_number').value = data.resident.room_number || '';
      document.getElementById('block').value = data.resident.block || '';
      document.getElementById('academic_level').value = data.resident.academic_level || '';
      document.getElementById('verifyAlert').classList.remove('show');
    } else {
      document.getElementById('autoFillFields').style.display = 'none';
      const alertEl = document.getElementById('verifyAlert');
      alertEl.textContent = 'Registration number not found in our system. Only registered students can provide feedback.';
      alertEl.classList.add('show');
    }
  } catch (e) {
    console.error('Verification failed:', e);
    alert('Verification failed. Please try again.');
  }
});
