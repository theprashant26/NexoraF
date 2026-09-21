/* ==========================================================================
   Motion system (GSAP + ScrollTrigger)

   The vocabulary here is editorial rather than cinematic: hairlines draw,
   headings wipe open behind a mask, ruled rows deal in from the left, and
   figures count up. There is no preloader, no cursor, no marquee and nothing
   is pinned — the page scrolls at its natural speed throughout.

   Everything degrades: if GSAP never loads, `nx-js` comes off <html> and the
   pre-hidden states stop applying, so nothing can be left invisible.
   ========================================================================== */

(function () {
  "use strict";

  var NX = (window.NX = window.NX || {});
  var root = document.documentElement;
  var booted = false;

  function prefersReduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function paintEverything() {
    root.classList.remove("nx-js");
    document.body.classList.remove("nx-locked");
  }

  /* --- Boot ------------------------------------------------------------- */

  function init() {
    if (booted) return;
    if (!window.gsap || !window.ScrollTrigger) return;

    booted = true;
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    // A mobile address bar showing and hiding fires resize constantly.
    ScrollTrigger.config({ ignoreMobileResize: true });
    gsap.defaults({ ease: "power2.out" });

    var reduced = prefersReduced();

    /* Behaviour that must work at any motion preference. */
    initAccordions(gsap, reduced);
    initHeader();

    if (reduced) {
      root.classList.remove("nx-js");
      return;
    }

    initMasthead(gsap);
    initWipes(gsap, ScrollTrigger);
    initRules(gsap, ScrollTrigger);
    initReveals(gsap, ScrollTrigger);
    initDeals(gsap, ScrollTrigger);
    initFigures(gsap, ScrollTrigger);
    initMediaReveals(gsap, ScrollTrigger);

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  }

  /* --- Masthead ----------------------------------------------------------
     The one scripted entrance on the page, and it is short. */

  function initMasthead(gsap) {
    var mast = document.querySelector("[data-mast]");
    if (!mast) return;

    var timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

    var kicker = mast.querySelector("[data-mast-kicker]");
    var rule = mast.querySelector("[data-mast-rule]");
    var title = mast.querySelector("[data-mast-title]");

    if (kicker) timeline.from(kicker, { opacity: 0, x: -12, duration: 0.5 });
    if (rule) timeline.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.8 }, "-=0.35");

    if (title) {
      timeline.fromTo(title,
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 1, ease: "power4.out" },
        "-=0.55");
    }

    timeline.from(mast.querySelectorAll("[data-mast-fade]"), {
      opacity: 0,
      y: 16,
      duration: 0.6,
      stagger: 0.1
    }, "-=0.5");

    var band = mast.querySelector("[data-mast-band]");
    if (band) {
      timeline.fromTo(band,
        { clipPath: "inset(100% 0 0 0)" },
        { clipPath: "inset(0% 0 0 0)", duration: 0.9, ease: "power3.inOut" },
        "-=0.4");
    }
  }

  /* --- Heading wipes ------------------------------------------------------
     A heading opens left to right behind its own mask. No character or word
     splitting, so text stays selectable and reads normally to assistive tech. */

  function initWipes(gsap, ScrollTrigger) {
    document.querySelectorAll("[data-wipe]").forEach(function (el) {
      if (el.closest("[data-mast]")) return;
      gsap.fromTo(el,
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          duration: 0.9,
          ease: "power4.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true }
        });
    });
  }

  /* --- Hairlines ----------------------------------------------------------- */

  function initRules(gsap, ScrollTrigger) {
    document.querySelectorAll("[data-draw]").forEach(function (el) {
      gsap.fromTo(el,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.85,
          ease: "power3.inOut",
          scrollTrigger: { trigger: el, start: "top 94%", once: true }
        });
    });
  }

  /* --- Generic reveals ------------------------------------------------------ */

  function revealBatch(gsap, ScrollTrigger, scope) {
    var targets = Array.prototype.slice
      .call((scope || document).querySelectorAll("[data-reveal]"))
      .filter(function (el) { return el.dataset.nxRevealed !== "true"; });

    if (!targets.length) return;
    targets.forEach(function (el) { el.dataset.nxRevealed = "true"; });

    ScrollTrigger.batch(targets, {
      start: "top 90%",
      once: true,
      onEnter: function (batch) {
        gsap.fromTo(batch,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.65, stagger: 0.07, overwrite: true });
      }
    });

    ScrollTrigger.refresh();
  }

  function initReveals(gsap, ScrollTrigger) {
    revealBatch(gsap, ScrollTrigger, document);
  }

  /* --- Ruled rows deal in from the left --------------------------------------
     Used by the programme index and any other list of hairline-separated rows. */

  function dealRows(gsap, ScrollTrigger, container) {
    if (!container || container.dataset.nxDealt === "true") return;
    container.dataset.nxDealt = "true";

    var rows = container.children;
    if (!rows.length) return;

    gsap.fromTo(rows,
      { opacity: 0, x: -18 },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.035,
        ease: "power2.out",
        scrollTrigger: { trigger: container, start: "top 88%", once: true }
      });
  }

  function initDeals(gsap, ScrollTrigger) {
    document.querySelectorAll("[data-deal]").forEach(function (container) {
      dealRows(gsap, ScrollTrigger, container);
    });
  }

  /* --- Figures ---------------------------------------------------------------- */

  function initFigures(gsap, ScrollTrigger) {
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var target = Number(el.getAttribute("data-count"));
      if (!isFinite(target)) return;

      var state = { value: 0 };
      el.textContent = "0";

      gsap.to(state, {
        value: target,
        duration: 1.1,
        ease: "power2.out",
        snap: { value: 1 },
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
        onUpdate: function () { el.textContent = String(Math.round(state.value)); }
      });
    });
  }

  /* --- Media ------------------------------------------------------------------- */

  function initMediaReveals(gsap, ScrollTrigger) {
    document.querySelectorAll("[data-media-reveal]").forEach(function (el) {
      gsap.fromTo(el,
        { clipPath: "inset(0 0 100% 0)" },
        {
          clipPath: "inset(0 0 0% 0)",
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true }
        });
    });
  }

  /* --- Header ------------------------------------------------------------------
     A plain scroll listener: the header stays put and only its rule darkens, so
     there is no hide-on-scroll behaviour to get wrong. */

  function initHeader() {
    var header = document.querySelector("[data-header]");
    if (!header) return;

    var ticking = false;

    function update() {
      ticking = false;
      header.classList.toggle("is-stuck", window.scrollY > 8);
    }

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    update();
  }

  /* --- Accordions ---------------------------------------------------------------
     Bound at every motion preference; reduced motion simply skips the tween. */

  function initAccordions(gsap, reduced) {
    document.querySelectorAll("[data-accordion] .nx-accordion__trigger").forEach(function (trigger) {
      if (trigger.dataset.nxBound === "true") return;
      trigger.dataset.nxBound = "true";

      trigger.addEventListener("click", function () {
        var panel = document.getElementById(trigger.getAttribute("aria-controls"));
        if (!panel) return;

        var expanded = trigger.getAttribute("aria-expanded") === "true";
        trigger.setAttribute("aria-expanded", String(!expanded));

        if (reduced || !gsap) {
          panel.hidden = expanded;
          return;
        }

        if (expanded) {
          gsap.to(panel, {
            height: 0,
            opacity: 0,
            duration: 0.3,
            ease: "power2.inOut",
            onComplete: function () {
              panel.hidden = true;
              gsap.set(panel, { clearProps: "height,opacity" });
            }
          });
        } else {
          panel.hidden = false;
          gsap.fromTo(panel,
            { height: 0, opacity: 0 },
            {
              height: "auto",
              opacity: 1,
              duration: 0.35,
              ease: "power2.out",
              onComplete: function () { gsap.set(panel, { clearProps: "height" }); }
            });
        }
      });
    });
  }

  /* --- Public surface -------------------------------------------------------------- */

  NX.motion = {
    init: init,

    /** Animate content injected after boot, such as the async programme index. */
    reveal: function (scope) {
      if (!booted || prefersReduced() || !window.gsap || !window.ScrollTrigger) return;
      revealBatch(window.gsap, window.ScrollTrigger, scope || document);
    },

    /** Deal a freshly rendered set of ruled rows in from the left. */
    deal: function (container) {
      if (!booted || prefersReduced() || !window.gsap || !window.ScrollTrigger) return;
      dealRows(window.gsap, window.ScrollTrigger, container);
    },

    /** Re-bind behaviour that lives inside freshly rendered markup. */
    rebind: function () {
      if (!window.gsap) return;
      initAccordions(window.gsap, prefersReduced());
    },

    refresh: function () {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.addEventListener("load", function () {
    init();
    if (!booted) paintEverything();
  });

  // Last resort: if GSAP never arrives, stop hiding things.
  window.setTimeout(function () { if (!booted) paintEverything(); }, 4000);
}());
