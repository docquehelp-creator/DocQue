/* ============================================================
   DocQue site script
   >>> EDIT ONLY THESE TWO LINES <<<
   These two values are meant to be public. Real secrets never go in this file.
   ============================================================ */
var GA_ID = "G-GS5MHVNF2K";          // Google Analytics Measurement ID, e.g. "G-ABC123XYZ"  (leave "" until you have it)
var FORM_ENDPOINT = "https://formspree.io/f/mppdzkal";  // Formspree / Web3Forms address, e.g. "https://formspree.io/f/abcdwxyz" (leave "" to use email instead)
var CONTACT_EMAIL = "docquehelp@gmail.com";

(function () {
  var KEY = "docque-consent";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var pageLoaded = Date.now();

  /* ---------- footer year ---------- */
  var yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- analytics: only after the visitor accepts ---------- */
  function loadAnalytics() {
    if (!GA_ID || window.__gaLoaded) return;
    window.__gaLoaded = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", GA_ID);
  }

  /* ---------- cookie banner ---------- */
  function setConsent(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    var b = $(".cb"); if (b) b.remove();
    if (v === "granted") loadAnalytics();
  }
  function showBanner() {
    if ($(".cb")) return;
    var b = document.createElement("div");
    b.className = "cb";
    b.setAttribute("role", "dialog");
    b.setAttribute("aria-label", "Cookie choices");
    b.innerHTML = '<p>We’d like to use analytics cookies to understand how people use this site. The site works the same either way. See our <a href="/privacy">Privacy Policy</a>.</p>' +
      '<div class="btns"><button type="button" class="yes">Accept</button><button type="button" class="no">Decline</button></div>';
    document.body.appendChild(b);
    $(".yes", b).onclick = function () { setConsent("granted"); };
    $(".no", b).onclick = function () { setConsent("denied"); };
    $(".yes", b).focus();
  }
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === "granted") loadAnalytics(); else if (!saved) showBanner();
  document.querySelectorAll("[data-cookie-settings]").forEach(function (el) {
    el.addEventListener("click", showBanner);
  });

  /* ---------- contact form: validation, spam trap, send ---------- */
  var form = $("#contact-form");
  if (form) {
    var status = $("#form-status");
    var fields = {
      name: function (v) { return v.trim().length >= 2 ? "" : "Please enter your name."; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address."; },
      message: function (v) { return v.trim().length >= 10 ? "" : "Please write at least 10 characters."; }
    };
    function check(name) {
      var el = form.elements[name], msg = fields[name](el.value);
      el.setAttribute("aria-invalid", msg ? "true" : "false");
      $("#err-" + name).textContent = msg;
      return !msg;
    }
    Object.keys(fields).forEach(function (n) {
      form.elements[n].addEventListener("blur", function () { check(n); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "fstat"; status.textContent = "";
      var ok = true;
      Object.keys(fields).forEach(function (n) { if (!check(n)) ok = false; });
      if (!ok) { status.className = "fstat bad"; status.textContent = "Please fix the highlighted fields."; return; }

      // spam protection: hidden field + too-fast submissions are quietly dropped
      var bot = form.elements.company.value !== "" || Date.now() - pageLoaded < 3000;
      if (bot) { status.className = "fstat ok"; status.textContent = "Thanks, your message was sent."; form.reset(); return; }

      var d = { name: form.elements.name.value.trim(), email: form.elements.email.value.trim(), role: form.elements.role.value, message: form.elements.message.value.trim() };
      if (!FORM_ENDPOINT) {
        var body = "Name: " + d.name + "\nEmail: " + d.email + "\nI am: " + d.role + "\n\n" + d.message;
        window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent("DocQue enquiry from " + d.name) + "&body=" + encodeURIComponent(body);
        status.className = "fstat ok"; status.textContent = "Opening your email app to send the message…";
        return;
      }
      status.textContent = "Sending…";
      fetch(FORM_ENDPOINT, { method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" }, body: JSON.stringify(d) })
        .then(function (r) {
          if (!r.ok) throw new Error("bad");
          status.className = "fstat ok"; status.textContent = "Thanks, your message was sent. We’ll get back to you soon.";
          form.reset();
        })
        .catch(function () {
          status.className = "fstat bad"; status.textContent = "Something went wrong. Please email us at " + CONTACT_EMAIL + ".";
        });
    });
  }

  /* ---------- scroll reveal ---------- */
  var items = document.querySelectorAll(".rv");
  if (items.length) {
    if (!("IntersectionObserver" in window)) { items.forEach(function (n) { n.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (n) { io.observe(n); });
  }
})();
