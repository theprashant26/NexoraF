(function () {
  "use strict";

  window.NX = window.NX || {};

  var recognitionStatement = "Unless specifically stated otherwise, certificates and diplomas issued by Nexora Institute are institute-level professional training credentials and should not be represented as government, university, UGC, AICTE, statutory-board or professional-licensing qualifications without the applicable approval, affiliation or recognition.";
  var programmeGroups = [
    {
      title: "Transport & Aviation",
      items: ["Metro & Rail", "Railway", "Aviation", "Logistics", "Driver Services"]
    },
    {
      title: "Service & Hospitality",
      items: ["Hospitality", "Travel & Tourism", "Retail", "Security"]
    },
    {
      title: "Health & Sciences",
      items: ["Medical", "Pharmaceutical", "Healthcare"]
    },
    {
      title: "Business & Technical",
      items: ["Banking", "Finance & Accounting", "IT & Technology", "Education", "Electrical", "Electrical Engineering", "Civil Engineering", "Manufacturing", "Professional Skill Development"]
    }
  ];

  function linkForDivision(division) {
    return "programmes.html?search=" + encodeURIComponent(division);
  }

  function renderHeader(mount) {
    mount.innerHTML = "" +
      "<header class=\"nx-site-header\" data-site-header>" +
        "<div class=\"nx-container nx-site-header__inner\">" +
          "<a class=\"nx-brand\" href=\"index.html\" aria-label=\"Nexora Institute of Professional Studies home\">" +
            "<img src=\"assets/brand/nexoralogo.jpeg\" width=\"120\" height=\"120\" alt=\"Nexora Institute of Professional Studies logo\">" +
            "<span class=\"nx-brand__words\"><strong>NEXORA</strong><small>Institute of Professional Studies</small></span>" +
          "</a>" +
          "<nav class=\"nx-site-nav\" aria-label=\"Primary navigation\">" +
            "<a href=\"index.html\">Home</a>" +
            "<a href=\"about.html\">About</a>" +
            "<div class=\"nx-menu\" data-menu>" +
              "<button class=\"nx-site-nav__trigger\" type=\"button\" aria-expanded=\"false\" aria-controls=\"nx-programmes-menu\">Programmes <span aria-hidden=\"true\">+</span></button>" +
              "<div class=\"nx-mega-menu\" id=\"nx-programmes-menu\" hidden>" +
                "<div class=\"nx-mega-menu__grid\">" + programmeGroups.map(function (group) {
                  return "<div><h2>" + group.title + "</h2><ul>" + group.items.map(function (item) {
                    return "<li><a href=\"" + linkForDivision(item) + "\">" + item + "</a></li>";
                  }).join("") + "</ul></div>";
                }).join("") + "</div>" +
                "<a class=\"nx-mega-menu__all\" href=\"programmes.html\">View all 21 programmes</a>" +
              "</div>" +
            "</div>" +
            "<a href=\"admissions.html\">Admissions</a>" +
            "<a href=\"gallery.html\">Gallery</a>" +
            "<a href=\"contact.html\">Contact</a>" +
          "</nav>" +
          "<a class=\"nx-btn nx-btn--primary nx-site-header__apply\" href=\"admissions.html#enquiry\">Apply now</a>" +
          "<button class=\"nx-menu-toggle\" type=\"button\" aria-expanded=\"false\" aria-controls=\"nx-mobile-drawer\"><span class=\"nx-visually-hidden\">Open menu</span><span aria-hidden=\"true\">☰</span></button>" +
        "</div>" +
      "</header>" +
      "<div class=\"nx-mobile-drawer\" id=\"nx-mobile-drawer\" hidden>" +
        "<div class=\"nx-mobile-drawer__backdrop\" data-drawer-close></div>" +
        "<aside class=\"nx-mobile-drawer__panel\" aria-label=\"Mobile navigation\">" +
          "<button class=\"nx-mobile-drawer__close\" type=\"button\" data-drawer-close aria-label=\"Close menu\">&times;</button>" +
          "<nav class=\"nx-mobile-nav\" aria-label=\"Mobile primary navigation\">" +
            "<a href=\"index.html\">Home</a><a href=\"about.html\">About</a><a href=\"programmes.html\">Programmes</a><a href=\"admissions.html\">Admissions</a><a href=\"gallery.html\">Gallery</a><a href=\"contact.html\">Contact</a>" +
            "<a class=\"nx-btn nx-btn--primary\" href=\"admissions.html#enquiry\">Apply now</a>" +
          "</nav>" +
        "</aside>" +
      "</div>";
  }

  function renderFooter(mount) {
    mount.innerHTML = "" +
      "<footer class=\"nx-site-footer nx-surface-pine\">" +
        "<div class=\"nx-container\">" +
          "<div class=\"nx-site-footer__top\">" +
            "<div class=\"nx-site-footer__brand\"><a class=\"nx-brand nx-brand--footer\" href=\"index.html\"><img src=\"assets/brand/nexoralogo.jpeg\" width=\"96\" height=\"96\" alt=\"Nexora Institute of Professional Studies logo\"><span class=\"nx-brand__words\"><strong>NEXORA</strong><small>Institute of Professional Studies</small></span></a><p>Industry-oriented professional training across multiple sectors.</p></div>" +
            "<div><h2 class=\"nx-site-footer__heading\">Explore</h2><ul class=\"nx-site-footer__links\"><li><a href=\"about.html\">About</a></li><li><a href=\"programmes.html\">Programmes</a></li><li><a href=\"admissions.html\">Admissions</a></li><li><a href=\"gallery.html\">Gallery</a></li></ul></div>" +
            "<div><h2 class=\"nx-site-footer__heading\">Support</h2><ul class=\"nx-site-footer__links\"><li><a href=\"contact.html\">Contact</a></li><li><a href=\"disclaimer.html\">Disclaimer</a></li><li><a href=\"#privacy\">Privacy</a></li><li><a href=\"#social\">Social channels</a></li></ul></div>" +
            "<div><h2 class=\"nx-site-footer__heading\">Contact</h2><p class=\"nx-site-footer__muted\">{{PLACEHOLDER: institute address}}<br>{{PLACEHOLDER: phone}}<br>{{PLACEHOLDER: email}}</p></div>" +
          "</div>" +
          "<div class=\"nx-site-footer__compliance\"><p>" + recognitionStatement + "</p><p>Copyright &copy; 2026 Nexora Institute of Professional Studies.</p></div>" +
        "</div>" +
      "</footer>";
  }

  function getFocusable(container) {
    return Array.prototype.slice.call(container.querySelectorAll("a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex=\"-1\"])"));
  }

  function initNavigation() {
    var headerMounts = document.querySelectorAll("[data-nx-site-header]");
    var footerMounts = document.querySelectorAll("[data-nx-site-footer]");
    Array.prototype.forEach.call(headerMounts, renderHeader);
    Array.prototype.forEach.call(footerMounts, renderFooter);

    var header = document.querySelector("[data-site-header]");
    var menu = document.querySelector("[data-menu]");
    var menuTrigger = menu && menu.querySelector(".nx-site-nav__trigger");
    var megaMenu = document.getElementById("nx-programmes-menu");
    var drawer = document.getElementById("nx-mobile-drawer");
    var drawerToggle = document.querySelector(".nx-menu-toggle");
    var lastFocused = null;

    function closeMegaMenu() {
      if (!menuTrigger || !megaMenu) return;
      menuTrigger.setAttribute("aria-expanded", "false");
      megaMenu.hidden = true;
    }

    function openMegaMenu() {
      if (!menuTrigger || !megaMenu) return;
      menuTrigger.setAttribute("aria-expanded", "true");
      megaMenu.hidden = false;
      var firstLink = megaMenu.querySelector("a");
      if (firstLink) firstLink.focus();
    }

    function closeDrawer() {
      if (!drawer || drawer.hidden) return;
      drawer.hidden = true;
      document.body.classList.remove("nx-drawer-open");
      if (drawerToggle) drawerToggle.setAttribute("aria-expanded", "false");
      if (lastFocused) lastFocused.focus();
    }

    function openDrawer() {
      if (!drawer) return;
      lastFocused = document.activeElement;
      drawer.hidden = false;
      document.body.classList.add("nx-drawer-open");
      if (drawerToggle) drawerToggle.setAttribute("aria-expanded", "true");
      var firstFocusable = getFocusable(drawer)[0];
      if (firstFocusable) firstFocusable.focus();
    }

    if (menuTrigger) {
      menuTrigger.addEventListener("click", function () {
        var isOpen = menuTrigger.getAttribute("aria-expanded") === "true";
        if (isOpen) closeMegaMenu(); else openMegaMenu();
      });
    }

    if (drawerToggle) drawerToggle.addEventListener("click", openDrawer);
    document.querySelectorAll("[data-drawer-close]").forEach(function (element) {
      element.addEventListener("click", closeDrawer);
    });

    document.addEventListener("click", function (event) {
      if (menu && !menu.contains(event.target)) closeMegaMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMegaMenu();
        closeDrawer();
      }

      var activeSurface = drawer && !drawer.hidden ? drawer : (megaMenu && !megaMenu.hidden ? megaMenu : null);
      if (event.key === "Tab" && activeSurface) {
        var focusable = getFocusable(activeSurface);
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
    });

    var currentPage = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nx-site-nav a").forEach(function (link) {
      if (link.getAttribute("href").split("?")[0] === currentPage) link.setAttribute("aria-current", "page");
    });

    function updateHeaderState() {
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 80);
    }

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });
    window.setTimeout(function () { if (window.NX.initMotion) window.NX.initMotion(); }, 0);
  }

  function ensureMotionScripts() {
    if (document.querySelector('script[src*="assets/js/motion.js"]')) return;
    var scripts = [
      "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js",
      "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js",
      "assets/js/motion.js"
    ];
    var loadNext = function (index) {
      if (index >= scripts.length) return;
      var script = document.createElement("script");
      script.src = scripts[index];
      script.onload = function () { loadNext(index + 1); };
      document.head.appendChild(script);
    };
    loadNext(0);
  }

  function ensureSeoScript() {
    if (document.querySelector('script[src$="assets/js/seo.js"]')) return;
    var script = document.createElement("script");
    script.src = "assets/js/seo.js";
    document.head.appendChild(script);
  }

  window.NX.initNavigation = initNavigation;
  ensureMotionScripts();
  ensureSeoScript();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initNavigation);
  else initNavigation();
}());
