(function () {
  "use strict";

  function initMotion() {
    if (document.documentElement.dataset.nxMotionReady === "true") return;
    if (!window.gsap || !window.ScrollTrigger) return;
    document.documentElement.dataset.nxMotionReady = "true";
    var gsap = window.gsap;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var scrollTrigger = window.ScrollTrigger;
    gsap.ticker.lagSmoothing(0);
    if (scrollTrigger) gsap.registerPlugin(scrollTrigger);

    function finalState() {
      gsap.set(".nx-rule", { scaleX: 1 });
      gsap.set(".nx-home-hero__copy, .nx-home-hero__media, .nx-home-hero__stats", { clearProps: "all" });
      gsap.set(".nx-home-train__panel", { opacity: 1, clearProps: "transform" });
      gsap.set(".nx-programmes-grid > *, .nx-home-featured__rail > *", { opacity: 1, clearProps: "transform" });
      document.querySelectorAll(".nx-accordion__panel").forEach(function (panel) {
        if (panel.previousElementSibling && panel.previousElementSibling.getAttribute("aria-expanded") === "true") panel.hidden = false;
      });
    }

    if (reduce) {
      finalState();
      return;
    }

    function animateRules() {
      if (!scrollTrigger) return;
      gsap.utils.toArray(".nx-rule").forEach(function (rule) {
        gsap.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.out", scrollTrigger: { trigger: rule, start: "top 85%", once: true } });
      });
    }

    function animateHeader() {
      var header = document.querySelector("[data-site-header]");
      if (!header || !scrollTrigger) return;
      scrollTrigger.create({ trigger: document.body, start: "80px top", end: "max", onEnter: function () { header.classList.add("is-scrolled"); }, onLeaveBack: function () { header.classList.remove("is-scrolled"); } });
    }

    function animateHomeHero() {
      var hero = document.querySelector(".nx-home-hero");
      if (!hero) return;
      var played = false;
      try { played = sessionStorage.getItem("nx-home-hero-played") === "true"; } catch (error) { played = false; }
      if (played) return;
      var timeline = gsap.timeline({ defaults: { ease: "power2.out" }, onComplete: function () { try { sessionStorage.setItem("nx-home-hero-played", "true"); } catch (error) {} } });
      timeline.from(".nx-site-header", { opacity: 0, duration: 0.4 })
        .from(".nx-home-hero__copy", { opacity: 0, y: 24, duration: 0.7 }, "-=0.15")
        .from(".nx-home-hero__media", { opacity: 0, scale: 1.06, clipPath: "inset(0 0 100% 0)", duration: 0.9 }, "-=0.45")
        .from(".nx-home-hero__stats .nx-stat", { opacity: 0, y: 14, duration: 0.4, stagger: 0.08 }, "-=0.35");
    }

    function animateCounters() {
      if (!scrollTrigger) return;
      document.querySelectorAll(".nx-stat__value").forEach(function (element) {
        var target = Number(element.textContent.trim());
        if (!Number.isFinite(target)) return;
        var state = { value: 0 };
        gsap.to(state, { value: target, duration: 0.9, ease: "power1.out", snap: { value: 1 }, scrollTrigger: { trigger: element, start: "top 88%", once: true }, onUpdate: function () { element.textContent = String(state.value); } });
      });
    }

    function animateTrainingPanels() {
      var section = document.querySelector(".nx-home-train");
      var panels = gsap.utils.toArray(".nx-home-train__panel");
      if (!section || panels.length < 2 || !scrollTrigger) return;
      if (window.matchMedia("(max-width: 767px)").matches) {
        gsap.set(panels, { opacity: 1, clearProps: "opacity" });
        scrollTrigger.getAll().forEach(function (trigger) {
          if (trigger.vars.trigger === section) trigger.kill();
        });
        return;
      }
      gsap.set(panels.slice(1), { opacity: 0.68 });
      var timeline = gsap.timeline({ scrollTrigger: { trigger: section, start: "top top", end: "+=" + (window.innerHeight * 1.2), scrub: true, pin: true, anticipatePin: 1, invalidateOnRefresh: true } });
      panels.forEach(function (panel, index) {
        if (index === 0) return;
        timeline.to(panels[index - 1], { opacity: 0.68, duration: 1 }, index - 1).to(panel, { opacity: 1, duration: 1 }, index - 1);
      });
    }

    function animateProgrammeGrid() {
      if (!scrollTrigger) return;
      var grid = document.querySelector(".nx-programmes-grid");
      if (grid) scrollTrigger.batch(".nx-programmes-grid > *", { start: "top 88%", once: true, onEnter: function (batch) { gsap.from(batch, { opacity: 0, scale: 0.97, duration: 0.25, stagger: 0.02, ease: "power2.out" }); } });
    }

    function initAccordions() {
      document.querySelectorAll("[data-accordion] .nx-accordion__trigger").forEach(function (trigger) {
        if (trigger.dataset.motionBound === "true") return;
        trigger.dataset.motionBound = "true";
        trigger.addEventListener("click", function () {
          var expanded = trigger.getAttribute("aria-expanded") === "true";
          var panel = document.getElementById(trigger.getAttribute("aria-controls"));
          if (!panel) return;
          trigger.setAttribute("aria-expanded", String(!expanded));
          if (reduce) { panel.hidden = expanded; return; }
          if (expanded) gsap.to(panel, { height: 0, opacity: 0, duration: 0.25, ease: "power2.out", onComplete: function () { panel.hidden = true; panel.style.height = ""; } });
          else { panel.hidden = false; gsap.fromTo(panel, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.25, ease: "power2.out" }); }
        });
      });
    }

    animateHomeHero();
    animateHeader();
    animateRules();
    animateCounters();
    animateTrainingPanels();
    animateProgrammeGrid();
    initAccordions();

    var resizeTimer;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () { if (scrollTrigger) { scrollTrigger.getAll().forEach(function (trigger) { trigger.kill(); }); scrollTrigger.refresh(); } }, 180);
    });
  }

  window.NX = window.NX || {};
  window.NX.initMotion = initMotion;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { window.setTimeout(initMotion, 0); });
  else initMotion();
  window.addEventListener("load", function () { window.setTimeout(initMotion, 0); }, { once: true });
}());
