/* ===========================================================================
   Bilingual dictionary (English / Arabic) + language switching with RTL
   =========================================================================== */
const I18N = {
  en: {
    // Brand / common
    brand: "IIUI Hostel Feedback",
    nav_home: "Home",
    nav_survey: "Survey",
    nav_admin: "Admin",
    nav_dashboard: "Dashboard",
    next: "Next",
    back: "Back",
    submit: "Submit Feedback",
    continue: "Continue",
    getStarted: "Get Started",
    learnMore: "Learn More",
    loading: "Loading…",

    // Cover
    cover_eyebrow: "Smart Housing Feedback & Quality Control",
    cover_title_1: "Your Voice Shapes",
    cover_title_2: "Student Living",
    cover_sub: "Help us improve your hostel experience. Share honest feedback in minutes — every response helps administration act where it matters most.",
    cover_note_1: "Private & secure",
    cover_note_2: "One response per student",
    cover_note_3: "Takes ~3 minutes",
    cover_kpi_1: "Service Areas",
    cover_kpi_2: "Minutes",
    cover_kpi_3: "Your Privacy",

    // Role
    role_title: "Welcome — please choose how you'll continue",
    role_sub: "Students share feedback. Administrators view analytics.",
    role_student: "I'm a Student",
    role_student_desc: "Share your feedback about hostel services and facilities.",
    role_admin: "Admin Login",
    role_admin_desc: "Access the private analytics dashboard.",

    // Residency
    res_title: "Where do you live?",
    res_lead: "This helps us route you to the right set of questions.",
    res_yes: "Hostel",
    res_yes_desc: "I currently live in a university hostel.",
    res_no: "Day Scholar",
    res_no_desc: "I don't live in a university hostel.",

    // Verification
    verify_title: "Your Information",
    verify_lead: "Please fill in all the fields below.",
    f_student_id: "Registration Number",
    f_student_id_ph: "e.g. 002136/MSDS/S24",
    f_email: "University Email",
    f_email_ph: "e.g. name@iiu.edu.pk",
    f_full_name: "Full Name",
    f_room: "Room Number",
    f_room_ph: "e.g. A-101",
    f_block: "Block",
    f_block_ph: "Select block",
    f_level: "Academic Level",
    f_level_ph: "Select level",
    level_bachelor: "Bachelor",
    level_master: "Master",
    level_phd: "PhD",
    verify_fill_all: "Please fill in all fields.",
    verify_err_required: "This field is required.",
    verify_err_format: "Please enter a valid Registration Number, e.g. 002136/MSDS/S24.",
    verify_err_email: "Please enter a valid email address.",
    verify_err_nomatch: "Registration Number and Email do not match our records. Please check and try again.",
    verify_err_duplicate: "You have already submitted feedback. Only one submission per student is allowed.",
    verify_checking: "Verifying…",

    // Survey
    survey_title: "Rate your hostel services",
    survey_lead: "Tap a score from 1 (Very Poor) to 5 (Excellent). A score of 1–2 needs a short comment.",
    survey_mandatory_notice: "Please tell us what went wrong — your comment helps us improve this service.",
    survey_comment_ph: "Please tell us what went wrong (required for low scores)…",
    survey_err_missing: "Please rate all services before continuing.",
    survey_err_comment: "A comment is required for any rating of 1 or 2.",
    rate_1: "Very Poor",
    rate_2: "Poor",
    rate_3: "Fair",
    rate_4: "Good",
    rate_5: "Excellent",

    // Feedback
    fb_title: "Tell us more",
    fb_lead: "Optional — choose whether you'd like to comment on each area.",
    fb_main: "Main issues faced",
    fb_sugg: "Suggestions for improvement",
    fb_add: "Additional comments",
    fb_want: "I'd like to comment",
    fb_nothing: "Nothing to add",
    fb_ph: "Write your thoughts here…",


    // Confirmation
    confirm_title: "Thank you for your participation!",
    confirm_msg: "Your feedback is valuable and helps improve student living. Your response has been recorded.",
    confirm_home: "Back to Home",

    // Errors
    submit_error: "Something went wrong while submitting. Please try again.",

    // Admin login
    admin_title: "Admin Login",
    admin_lead: "Authorized personnel only.",
    admin_user: "Username",
    admin_pass: "Password",
    admin_signin: "Sign In",
    admin_err: "Invalid username or password.",

    // Dashboard
    dash_title: "Analytics Dashboard",
    dash_sub: "Live quality-control metrics from real submissions.",
    dash_logout: "Logout",
    dash_import: "Import Roster",
    dash_residents: "residents loaded",
    kpi_total: "Total Responses",
    kpi_sat: "Avg Satisfaction",
    kpi_complaints: "Complaints Flagged",
    filter_block: "Block",
    filter_level: "Academic Level",
    filter_sat: "Satisfaction Range",
    filter_all: "All",
    filter_reset: "Reset Filters",
    chart_category: "Average Rating per Service",
    chart_distribution: "Satisfaction Distribution",
    chart_heatmap: "Blocks × Services Heatmap",
    chart_trend: "Satisfaction Over Time",
    sec_health: "Service Health Scores",
    sec_blocks: "Block Analytics (A–G)",
    sec_academic: "Academic Breakdown",
    th_block: "Block",
    th_responses: "Responses",
    th_satisfaction: "Satisfaction",
    th_complaints: "Complaints",
    th_level: "Level",
    th_count: "Count",
    th_pct: "Percentage",
    export_csv: "Export CSV",
    export_excel: "Export Excel",
    export_pdf: "Export PDF",
    best_service: "Best Service",
    worst_service: "Worst Service",
    worst_block: "Needs Attention",
    block_detail: "Block Detail",
    bd_positive: "Positive Comments",
    bd_negative: "Negative Comments",
    bd_suggestions: "Suggestions",
    bd_issues: "Common Issues",
    bd_none: "No data yet.",
    empty_title: "No submissions yet",
    empty_msg: "The dashboard will fill automatically as students respond.",
    import_success: "Roster imported successfully:",
    import_error: "Import failed:",
    alert_critical: "Critical alert:",
  },

  ar: {
    brand: "تقييم سكن الجامعة الإسلامية",
    nav_home: "الرئيسية",
    nav_survey: "الاستبيان",
    nav_admin: "المسؤول",
    nav_dashboard: "لوحة التحليلات",
    next: "التالي",
    back: "السابق",
    submit: "إرسال التقييم",
    continue: "متابعة",
    getStarted: "ابدأ الآن",
    learnMore: "اعرف المزيد",
    loading: "جارٍ التحميل…",

    cover_eyebrow: "نظام ذكي لتقييم السكن وضبط الجودة",
    cover_title_1: "صوتك يصنع",
    cover_title_2: "حياة طلابية أفضل",
    cover_sub: "ساعدنا في تحسين تجربة السكن. شارك رأيك بصدق في دقائق — كل رد يساعد الإدارة على التحرك حيث يهم.",
    cover_note_1: "خاص وآمن",
    cover_note_2: "رد واحد لكل طالب",
    cover_note_3: "يستغرق ٣ دقائق",
    cover_kpi_1: "مجالات الخدمة",
    cover_kpi_2: "دقائق",
    cover_kpi_3: "خصوصيتك",

    role_title: "مرحباً — اختر طريقة المتابعة",
    role_sub: "الطلاب يشاركون آراءهم. المسؤولون يطّلعون على التحليلات.",
    role_student: "أنا طالبة",
    role_student_desc: "شارك رأيك في خدمات ومرافق السكن الجامعي.",
    role_admin: "دخول المسؤول",
    role_admin_desc: "الوصول إلى لوحة التحليلات الخاصة.",

    res_title: "أين تسكن؟",
    res_lead: "هذا يساعدنا في توجيهك إلى الأسئلة المناسبة.",
    res_yes: "في السكن الجامعي",
    res_yes_desc: "أسكن حالياً في سكن جامعي.",
    res_no: "خارج الحرم",
    res_no_desc: "لا أسكن في سكن جامعي.",

    verify_title: "معلوماتك",
    verify_lead: "يرجى تعبئة جميع الحقول أدناه.",
    f_student_id: "رقم التسجيل",
    f_student_id_ph: "مثال: 002136/MSDS/S24",
    f_email: "البريد الجامعي",
    f_email_ph: "مثال: name@iiu.edu.pk",
    f_full_name: "الاسم الكامل",
    f_room: "رقم الغرفة",
    f_room_ph: "مثال: A-101",
    f_block: "المبنى",
    f_block_ph: "اختر المبنى",
    f_level: "المستوى الأكاديمي",
    f_level_ph: "اختر المستوى",
    level_bachelor: "بكالوريوس",
    level_master: "ماجستير",
    level_phd: "دكتوراه",
    verify_fill_all: "يرجى تعبئة جميع الحقول.",
    verify_err_required: "هذا الحقل مطلوب.",
    verify_err_format: "يرجى إدخال رقم تسجيل صحيح، مثال: 002136/MSDS/S24.",
    verify_err_email: "يرجى إدخال بريد إلكتروني صحيح.",
    verify_err_nomatch: "رقم التسجيل والبريد الإلكتروني لا يتطابقان مع سجلاتنا. يرجى التحقق والمحاولة مرة أخرى.",
    verify_err_duplicate: "لقد قمت بإرسال التقييم مسبقاً. يُسمح برد واحد فقط لكل طالب.",
    verify_checking: "جارٍ التحقق…",

    survey_title: "قيّم خدمات السكن",
    survey_lead: "اختر درجة من ١ (ضعيف جداً) إلى ٥ (ممتاز). الدرجة ١-٢ تتطلب تعليقاً قصيراً.",
    survey_mandatory_notice: "أخبرنا بما حدث — تعليقك يساعدنا على تحسين هذه الخدمة.",
    survey_comment_ph: "أخبرنا بما حدث (مطلوب للدرجات المنخفضة)…",
    survey_err_missing: "يرجى تقييم جميع الخدمات قبل المتابعة.",
    survey_err_comment: "التعليق مطلوب لأي تقييم بدرجة ١ أو ٢.",
    rate_1: "ضعيف جداً",
    rate_2: "ضعيف",
    rate_3: "مقبول",
    rate_4: "جيد",
    rate_5: "ممتاز",

    fb_title: "أخبرنا المزيد",
    fb_lead: "اختياري — اختر ما إذا كنت ترغب في التعليق على كل مجال.",
    fb_main: "أبرز المشكلات التي واجهتها",
    fb_sugg: "اقتراحات للتحسين",
    fb_add: "ملاحظات إضافية",
    fb_want: "أرغب في التعليق",
    fb_nothing: "لا شيء أضيفه",
    fb_ph: "اكتب أفكارك هنا…",


    confirm_title: "شكراً لمشاركتك!",
    confirm_msg: "رأيك قيّم ويساعد في تحسين حياة الطلاب. تم تسجيل ردك.",
    confirm_home: "العودة للرئيسية",

    submit_error: "حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.",

    admin_title: "دخول المسؤول",
    admin_lead: "للموظفين المخوّلين فقط.",
    admin_user: "اسم المستخدم",
    admin_pass: "كلمة المرور",
    admin_signin: "تسجيل الدخول",
    admin_err: "اسم المستخدم أو كلمة المرور غير صحيحة.",

    dash_title: "لوحة التحليلات",
    dash_sub: "مقاييس ضبط الجودة الحية من ردود حقيقية.",
    dash_logout: "تسجيل الخروج",
    dash_import: "استيراد القائمة",
    dash_residents: "مقيم محمّل",
    kpi_total: "إجمالي الردود",
    kpi_sat: "متوسط الرضا",
    kpi_complaints: "الشكاوى المرصودة",
    filter_block: "المبنى",
    filter_level: "المستوى الأكاديمي",
    filter_sat: "نطاق الرضا",
    filter_all: "الكل",
    filter_reset: "إعادة تعيين",
    chart_category: "متوسط التقييم لكل خدمة",
    chart_distribution: "توزيع الرضا",
    chart_heatmap: "خريطة المباني × الخدمات",
    chart_trend: "الرضا عبر الزمن",
    sec_health: "درجات صحة الخدمات",
    sec_blocks: "تحليلات المباني (A–G)",
    sec_academic: "التحليل الأكاديمي",
    th_block: "المبنى",
    th_responses: "الردود",
    th_satisfaction: "الرضا",
    th_complaints: "الشكاوى",
    th_level: "المستوى",
    th_count: "العدد",
    th_pct: "النسبة",
    export_csv: "تصدير CSV",
    export_excel: "تصدير Excel",
    export_pdf: "تصدير PDF",
    best_service: "أفضل خدمة",
    worst_service: "أسوأ خدمة",
    worst_block: "يحتاج انتباهاً",
    block_detail: "تفاصيل المبنى",
    bd_positive: "تعليقات إيجابية",
    bd_negative: "تعليقات سلبية",
    bd_suggestions: "اقتراحات",
    bd_issues: "المشكلات الشائعة",
    bd_none: "لا توجد بيانات بعد.",
    empty_title: "لا توجد ردود بعد",
    empty_msg: "ستمتلئ اللوحة تلقائياً عندما يشارك الطلاب.",
    import_success: "تم استيراد القائمة بنجاح:",
    import_error: "فشل الاستيراد:",
    alert_critical: "تنبيه حرج:",
  },
};

let currentLang = localStorage.getItem("lang") || "en";

function t(key) {
  return (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
  });
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
  document.querySelectorAll(".lang-toggle button").forEach((b) => {
    b.classList.toggle("active", b.dataset.lang === currentLang);
  });
  if (typeof onLangChange === "function") onLangChange();
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  applyTranslations();
}

/* ---------------------------------------------------------------------------
   Navbar: mobile toggle + scroll-aware background
   ------------------------------------------------------------------------- */
function initNavbar() {
  const nav = document.getElementById("siteNav");
  if (!nav) return;
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");

  const closeMenu = () => {
    nav.classList.remove("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  };

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Close the menu after tapping a link (mobile) or the language toggle.
    menu.querySelectorAll("a, .lang-toggle button").forEach((el) => {
      el.addEventListener("click", closeMenu);
    });
    // Close on Escape or when clicking outside the navbar.
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
    document.addEventListener("click", (e) => { if (!nav.contains(e.target)) closeMenu(); });
  }

  // Give the (transparent) navbar a solid background once the page scrolls.
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".lang-toggle button").forEach((b) => {
    b.addEventListener("click", () => setLang(b.dataset.lang));
  });
  initNavbar();
  applyTranslations();
});
