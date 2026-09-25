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

    // The background sits behind the copy, so it settles in from the start of
    // the timeline rather than arriving after it.
    var background = mast.querySelector("[data-mast-bg]");
    if (background) {
      timeline.fromTo(background,
        { opacity: 0, scale: 1.05 },
        { opacity: 1, scale: 1, duration: 1.4, ease: "power2.out" },
        0);
    }

    // The timeline runs on rAF, which stops in a background tab and crawls on a
    // loaded device. This is the first thing anyone sees, so it gets the same
    // wall-clock backstop as enter(): finish, then hand the styles back to CSS.
    window.setTimeout(function () {
      if (timeline.progress() < 1) timeline.progress(1);
      gsap.set(mast.querySelectorAll(
        "[data-mast-kicker],[data-mast-rule],[data-mast-title],[data-mast-fade],[data-mast-bg]"
      ), { clearProps: "opacity,transform,clipPath" });
    }, 2600);
  }

  /* --- Heading wipes ------------------------------------------------------
     A heading opens left to right behind its own mask. No character or word
     splitting, so text stays selectable and reads normally to assistive tech. */

  function initWipes(gsap, ScrollTrigger) {
    document.querySelectorAll("[data-wipe]").forEach(function (el) {
      if (el.closest("[data-mast]")) return;
      el.setAttribute("data-nx-seen", "");
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
      el.setAttribute("data-nx-seen", "");
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
        // Hand the element over from the CSS guard to GSAP before animating.
        batch.forEach(function (el) { el.setAttribute("data-nx-seen", ""); });

        var tween = gsap.fromTo(batch,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.65, stagger: 0.07, overwrite: true });

        // Same backstop as enter(): a throttled frame loop must never leave
        // content parked at opacity 0.
        window.setTimeout(function () {
          if (tween.progress() < 1) tween.progress(1);
          gsap.set(batch, { clearProps: "opacity,transform" });
        }, 2000);
      }
    });

    ScrollTrigger.refresh();
  }

  /* Anything already on screen must end up visible even if its trigger never
     fires — a late web font reflowing the page, or a throttled frame loop, can
     otherwise leave content parked at opacity 0 with no second chance. */
  function releaseVisible(gsap) {
    var stuck = Array.prototype.filter.call(
      document.querySelectorAll("[data-reveal]:not([data-nx-seen])"),
      function (el) {
        var rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > -1;
      });

    if (!stuck.length) return;
    stuck.forEach(function (el) { el.setAttribute("data-nx-seen", ""); });
    gsap.set(stuck, { clearProps: "opacity,transform" });
  }

  function initReveals(gsap, ScrollTrigger) {
    revealBatch(gsap, ScrollTrigger, document);

    // Re-measure once the display face has actually landed; text set in the
    // fallback font is a different height, and ScrollTrigger measured that one.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }

    window.setTimeout(function () { releaseVisible(gsap); }, 1500);
  }

  /* --- Ruled rows deal in from the left --------------------------------------
     Used by the programme index and any other list of hairline-separated rows. */

  function dealRows(gsap, ScrollTrigger, container) {
    if (!container || container.dataset.nxDealt === "true") return;
    container.dataset.nxDealt = "true";

    var rows = container.children;
    if (!rows.length) return;

    var tween = gsap.fromTo(rows,
      { opacity: 0, x: -18 },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.035,
        ease: "power2.out",
        scrollTrigger: {
          trigger: container,
          start: "top 88%",
          once: true,
          onEnter: function () {
            // A 21-row index has a long stagger; make sure a throttled frame
            // loop cannot leave the tail of it invisible.
            window.setTimeout(function () {
              if (tween.progress() < 1) tween.progress(1);
              gsap.set(rows, { clearProps: "opacity,transform" });
            }, 2500);
          }
        }
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

      var tween = gsap.to(state, {
        value: target,
        duration: 1.1,
        ease: "power2.out",
        snap: { value: 1 },
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
        onUpdate: function () { el.textContent = String(Math.round(state.value)); }
      });

      // A counter stalled by a throttled frame loop states a wrong number, which
      // is worse than not animating. Land on the real figure regardless.
      window.setTimeout(function () {
        if (el.textContent !== String(target)) el.textContent = String(target);
        tween.kill();
      }, 3000);
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

  /* --- Safe entrances --------------------------------------------------------------
     Chrome throttles requestAnimationFrame in background tabs and on low-power
     devices, which can leave a tween parked on its `from` state. Anything that
     animates in from opacity 0 therefore gets a wall-clock backstop: if the
     tween has not finished in time, it is snapped to the end and the inline
     styles are cleared. Used for navigation surfaces, where being stuck
     invisible would be more than cosmetic. */

  function enter(targets, fromVars, toVars, settleMs) {
    var gsap = window.gsap;
    var list = typeof targets === "string" ? document.querySelectorAll(targets) : targets;
    if (!list || (list.length === 0 && !list.nodeType)) return;

    if (!gsap || prefersReduced()) {
      if (gsap) gsap.set(list, { clearProps: "opacity,transform,clipPath" });
      return;
    }

    var tween = gsap.fromTo(list, fromVars, toVars);

    window.setTimeout(function () {
      if (tween.progress() < 1) tween.progress(1);
      gsap.set(list, { clearProps: "opacity,transform,clipPath" });
    }, settleMs || 900);
  }

  /* --- Public surface -------------------------------------------------------------- */

  NX.motion = {
    init: init,
    enter: enter,

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
