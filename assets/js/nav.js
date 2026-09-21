/* ==========================================================================
   Site chrome: header, mega menu, mobile drawer, footer

   Runs as a deferred script, so the DOM is already parsed and the mount
   points exist. Renders synchronously, then hands off to the motion system.
   ========================================================================== */

(function () {
  "use strict";

  var NX = (window.NX = window.NX || {});

  var RECOGNITION = "Unless specifically stated otherwise, certificates and diplomas issued by Nexora Institute " +
    "are institute-level professional training credentials and should not be represented as government, university, " +
    "UGC, AICTE, statutory-board or professional-licensing qualifications without the applicable approval, " +
    "affiliation or recognition.";

  var CAREER_NOTICE = "Completion of a programme does not by itself guarantee employment, appointment or a specific salary.";

  var DIVISION_GROUPS = [
    { title: "Transport & Aviation", items: ["Metro & Rail", "Railway", "Aviation", "Logistics", "Driver Services"] },
    { title: "Service & Hospitality", items: ["Hospitality", "Travel & Tourism", "Retail", "Security"] },
    { title: "Health & Sciences", items: ["Medical", "Pharmaceutical", "Healthcare"] },
    {
      title: "Business & Technical",
      items: ["Banking", "Finance & Accounting", "IT & Technology", "Education", "Electrical",
        "Electrical Engineering", "Civil Engineering", "Manufacturing", "Professional Skill Development"]
    }
  ];

  var PRIMARY_LINKS = [
    { href: "index.html", label: "Home" },
    { href: "about.html", label: "About" },
    { href: "programmes.html", label: "Programmes" },
    { href: "admissions.html", label: "Admissions" },
    { href: "gallery.html", label: "Gallery" },
    { href: "contact.html", label: "Contact" }
  ];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }

  function divisionHref(division) {
    return "programmes.html?search=" + encodeURIComponent(division);
  }

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  /* --- Header ----------------------------------------------------------------- */

  function headerMarkup() {
    var megaColumns = DIVISION_GROUPS.map(function (group) {
      var links = group.items.map(function (item) {
        return '<li><a href="' + divisionHref(item) + '">' + escapeHtml(item) + "</a></li>";
      }).join("");
      return '<div class="nx-mega__col"><p class="nx-mega__title">' + escapeHtml(group.title) + "</p>" +
        '<ul class="nx-mega__list">' + links + "</ul></div>";
    }).join("");

    var navLinks = PRIMARY_LINKS.map(function (link) {
      if (link.label === "Programmes") {
        return '<button class="nx-nav__trigger" type="button" aria-expanded="false" aria-controls="nx-mega" data-mega-trigger>Programmes</button>';
      }
      return '<a class="nx-nav__link" href="' + link.href + '">' + link.label + "</a>";
    }).join("");

    var drawerLinks = PRIMARY_LINKS.map(function (link, index) {
      return '<a href="' + link.href + '"><span>' + pad(index + 1) + "</span>" + link.label + "</a>";
    }).join("");

    return '' +
      '<header class="nx-header" data-header>' +
        '<div class="nx-container nx-header__inner">' +
          '<a class="nx-brand" href="index.html" aria-label="Nexora Institute of Professional Studies, home">' +
            '<img src="assets/brand/nexoralogo.jpeg" width="120" height="120" alt="" loading="eager" decoding="async">' +
            '<span class="nx-brand__words"><strong>NEXORA</strong><small>Institute of Professional Studies</small></span>' +
          "</a>" +
          '<nav class="nx-nav" aria-label="Primary">' + navLinks + "</nav>" +
          '<div class="nx-header__actions">' +
            '<a class="nx-btn nx-btn--sm" href="admissions.html#enquiry">Enquire</a>' +
            '<button class="nx-burger" type="button" aria-expanded="false" aria-controls="nx-drawer" data-drawer-open>' +
              '<span class="nx-visually-hidden">Open menu</span>' +
              '<span class="nx-burger__bars" aria-hidden="true"><span></span><span></span><span></span></span>' +
            "</button>" +
          "</div>" +
        "</div>" +
        '<div class="nx-mega" id="nx-mega" data-mega hidden>' +
          '<div class="nx-container nx-mega__inner">' +
            '<div class="nx-mega__grid">' + megaColumns + "</div>" +
            '<div class="nx-mega__footer">' +
              '<p class="nx-label">21 programmes / 4 learning groups</p>' +
              '<a class="nx-arrow-link" href="programmes.html">View the full index <i class="bi bi-arrow-right" aria-hidden="true"></i></a>' +
            "</div>" +
          "</div>" +
        "</div>" +
      "</header>" +
      '<div class="nx-drawer" id="nx-drawer" data-drawer hidden>' +
        '<div class="nx-drawer__backdrop" data-drawer-close></div>' +
        '<aside class="nx-drawer__panel" role="dialog" aria-modal="true" aria-label="Site menu">' +
          '<button class="nx-drawer__close" type="button" data-drawer-close aria-label="Close menu">&times;</button>' +
          '<nav class="nx-drawer__nav" aria-label="Mobile primary">' + drawerLinks + "</nav>" +
          '<a class="nx-btn nx-drawer__cta" href="admissions.html#enquiry">Send an enquiry</a>' +
          '<p class="nx-drawer__meta">{{PLACEHOLDER: phone}}<br>{{PLACEHOLDER: email}}</p>' +
        "</aside>" +
      "</div>";
  }

  /* --- Footer ------------------------------------------------------------------- */

  function footerMarkup() {
    return '' +
      '<footer class="nx-footer">' +
        '<div class="nx-container">' +
          '<div class="nx-footer__grid">' +
            "<div>" +
              '<a class="nx-brand" href="index.html">' +
                '<img src="assets/brand/nexoralogo.jpeg" width="96" height="96" alt="" loading="lazy" decoding="async">' +
                '<span class="nx-brand__words"><strong>NEXORA</strong><small>Institute of Professional Studies</small></span>' +
              "</a>" +
              '<p class="nx-muted nx-footer__blurb">Industry-oriented professional training across transport, service, health, business, and technical fields.</p>' +
            "</div>" +
            "<div>" +
              '<p class="nx-footer__heading">Explore</p>' +
              '<ul class="nx-footer__links">' +
                '<li><a href="about.html">About</a></li>' +
                '<li><a href="programmes.html">Programmes</a></li>' +
                '<li><a href="admissions.html">Admissions</a></li>' +
                '<li><a href="gallery.html">Gallery</a></li>' +
              "</ul>" +
            "</div>" +
            "<div>" +
              '<p class="nx-footer__heading">Support</p>' +
              '<ul class="nx-footer__links">' +
                '<li><a href="contact.html">Contact</a></li>' +
                '<li><a href="disclaimer.html">Important information</a></li>' +
                '<li><a href="disclaimer.html#privacy">Privacy</a></li>' +
                '<li><a href="disclaimer.html#terms">Terms</a></li>' +
              "</ul>" +
            "</div>" +
            "<div>" +
              '<p class="nx-footer__heading">Contact</p>' +
              '<ul class="nx-footer__links">' +
                "<li>{{PLACEHOLDER: institute address}}</li>" +
                "<li>{{PLACEHOLDER: phone}}</li>" +
                "<li>{{PLACEHOLDER: email}}</li>" +
                "<li>{{PLACEHOLDER: social profiles}}</li>" +
              "</ul>" +
            "</div>" +
          "</div>" +
          '<div class="nx-footer__legal">' +
            "<p>" + escapeHtml(RECOGNITION) + "</p>" +
            "<p>" + escapeHtml(CAREER_NOTICE) + "</p>" +
            '<div class="nx-footer__base">' +
              "<span>&copy; 2026 Nexora Institute of Professional Studies</span>" +
              '<a href="disclaimer.html">Important information</a>' +
            "</div>" +
          "</div>" +
        "</div>" +
      "</footer>";
  }

  /* --- Focus helpers ---------------------------------------------------------------- */

  function focusableWithin(container) {
    return Array.prototype.slice.call(container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(function (el) { return el.offsetParent !== null || el === document.activeElement; });
  }

  function trapTab(event, container) {
    var focusable = focusableWithin(container);
    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* --- Wiring -------------------------------------------------------------------------- */

  function initChrome() {
    document.querySelectorAll("[data-nx-site-header]").forEach(function (mount) {
      mount.outerHTML = headerMarkup();
    });
    document.querySelectorAll("[data-nx-site-footer]").forEach(function (mount) {
      mount.outerHTML = footerMarkup();
    });

    var megaTrigger = document.querySelector("[data-mega-trigger]");
    var mega = document.querySelector("[data-mega]");
    var drawer = document.querySelector("[data-drawer]");
    var drawerOpen = document.querySelector("[data-drawer-open]");
    var lastFocused = null;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function closeMega() {
      if (!mega || mega.hidden) return;
      mega.hidden = true;
      if (megaTrigger) megaTrigger.setAttribute("aria-expanded", "false");
    }

    function openMega() {
      if (!mega) return;
      mega.hidden = false;
      if (megaTrigger) megaTrigger.setAttribute("aria-expanded", "true");

      if (window.gsap && !reduced) {
        window.gsap.fromTo(mega,
          { clipPath: "inset(0 0 100% 0)" },
          { clipPath: "inset(0 0 0% 0)", duration: 0.4, ease: "power3.out" });
        window.gsap.fromTo(mega.querySelectorAll(".nx-mega__col"),
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, delay: 0.1, ease: "power2.out" });
      }
    }

    function closeDrawer() {
      if (!drawer || drawer.hidden) return;
      drawer.hidden = true;
      document.body.classList.remove("nx-locked");
      if (drawerOpen) drawerOpen.setAttribute("aria-expanded", "false");
      if (lastFocused) lastFocused.focus();
    }

    function openDrawer() {
      if (!drawer) return;
      lastFocused = document.activeElement;
      drawer.hidden = false;
      document.body.classList.add("nx-locked");
      if (drawerOpen) drawerOpen.setAttribute("aria-expanded", "true");

      var panel = drawer.querySelector(".nx-drawer__panel");
      if (window.gsap && panel && !reduced) {
        window.gsap.fromTo(panel, { x: "100%" }, { x: "0%", duration: 0.4, ease: "power3.out" });
        window.gsap.fromTo(drawer.querySelectorAll(".nx-drawer__nav a, .nx-drawer__cta"),
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.35, stagger: 0.05, delay: 0.12, ease: "power2.out" });
      }

      var first = focusableWithin(drawer)[0];
      if (first) first.focus();
    }

    if (megaTrigger) {
      megaTrigger.addEventListener("click", function () {
        if (mega && mega.hidden) openMega(); else closeMega();
      });
    }

    if (drawerOpen) drawerOpen.addEventListener("click", openDrawer);
    document.querySelectorAll("[data-drawer-close]").forEach(function (el) {
      el.addEventListener("click", closeDrawer);
    });

    document.addEventListener("click", function (event) {
      if (!mega || mega.hidden) return;
      if (event.target.closest("[data-mega]") || event.target.closest("[data-mega-trigger]")) return;
      closeMega();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMega();
        closeDrawer();
        return;
      }
      if (event.key !== "Tab") return;
      if (drawer && !drawer.hidden) trapTab(event, drawer);
      else if (mega && !mega.hidden) trapTab(event, mega);
    });

    // Mark the current page in both navigations.
    var current = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nx-nav__link, .nx-drawer__nav a").forEach(function (link) {
      var href = link.getAttribute("href") || "";
      if (href.split("?")[0].split("#")[0] === current) link.setAttribute("aria-current", "page");
    });

    if (NX.motion) {
      NX.motion.init();
      NX.motion.rebind();
    }
  }

  NX.initChrome = initChrome;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChrome);
  } else {
    initChrome();
  }
}());
