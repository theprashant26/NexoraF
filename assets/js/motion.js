/* ==========================================================================
   Motion system (GSAP + ScrollTrigger)

   Every effect degrades safely: if GSAP never loads, `nx-js` is removed from
   <html> so all pre-hidden elements return to their painted state.
   ========================================================================== */

(function () {
  "use strict";

  var NX = (window.NX = window.NX || {});
  var root = document.documentElement;
  var booted = false;

  function prefersReduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* --- Word splitting -----------------------------------------------------
     Walks text nodes so inline markup (<em>) survives, and keeps whitespace as
     real text nodes so selection and screen readers behave.

     Each word becomes an overflow-hidden slot wrapping an inner span. Animating
     the inner span means a rising word is clipped by its own box instead of
     spilling over the line below it — which is why this is per word rather than
     per line: a line wrapper cannot span an <em> without breaking it. */

  function splitWords(el) {
    if (el.dataset.nxSplit !== "done") {
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
      var textNodes = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode);

      textNodes.forEach(function (node) {
        if (!node.nodeValue.trim()) return;
        var fragment = document.createDocumentFragment();
        node.nodeValue.split(/(\s+)/).forEach(function (chunk) {
          if (!chunk) return;
          if (/^\s+$/.test(chunk)) {
            fragment.appendChild(document.createTextNode(chunk));
            return;
          }
          var slot = document.createElement("span");
          slot.className = "nx-word";
          var inner = document.createElement("span");
          inner.className = "nx-word__in";
          inner.textContent = chunk;
          slot.appendChild(inner);
          fragment.appendChild(slot);
        });
        node.parentNode.replaceChild(fragment, node);
      });
      el.dataset.nxSplit = "done";
    }
    return Array.prototype.slice.call(el.querySelectorAll(".nx-word__in"));
  }

  /* --- Fallback ------------------------------------------------------------ */

  function paintEverything() {
    root.classList.remove("nx-js");
    var curtain = document.querySelector("[data-curtain]");
    if (curtain) curtain.hidden = true;
    document.body.classList.remove("nx-locked");
  }

  /* --- Boot ---------------------------------------------------------------- */

  function init() {
    if (booted) return;
    if (!window.gsap || !window.ScrollTrigger) return;

    booted = true;
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    // Mobile address-bar show/hide fires resize constantly; ignoring it keeps
    // pinned sections from tearing themselves down mid-scroll.
    ScrollTrigger.config({ ignoreMobileResize: true });
    gsap.defaults({ ease: "power3.out" });

    var reduced = prefersReduced();

    /* Behaviour that must work regardless of motion preference. */
    initAccordions(gsap, reduced);
    initHeader(gsap, ScrollTrigger);

    if (reduced) {
      root.classList.remove("nx-js");
      dismissCurtain(gsap, true);
      // Scrub-driven decorative bars would otherwise stay at scaleX(0).
      gsap.set("[data-progress-fill], [data-rail-bar]", { scaleX: 1 });
      return;
    }

    initCursor(gsap);
    initMagnetic(gsap);
    initCurtain(gsap);
    initHeroAuras(gsap, ScrollTrigger);
    initSplitHeadings(gsap, ScrollTrigger);
    initReveals(gsap, ScrollTrigger);
    initManifesto(gsap, ScrollTrigger);
    initCounters(gsap, ScrollTrigger);
    initMarquee(gsap, ScrollTrigger);
    initParallax(gsap, ScrollTrigger);
    initStackCards(gsap, ScrollTrigger);
    initRail(gsap, ScrollTrigger);
    initProgressLines(gsap, ScrollTrigger);

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  }

  /* --- Curtain / intro ------------------------------------------------------ */

  function dismissCurtain(gsap, instant) {
    var curtain = document.querySelector("[data-curtain]");
    document.body.classList.remove("nx-locked");
    if (!curtain || curtain.hidden) return;

    if (instant) {
      curtain.hidden = true;
      return;
    }

    gsap.to(curtain, {
      yPercent: -100,
      duration: 0.9,
      ease: "power4.inOut",
      onComplete: function () { curtain.hidden = true; }
    });

    // GSAP runs on requestAnimationFrame, which a background or power-saving
    // tab can throttle to a crawl. This wall-clock backstop makes sure a
    // full-screen curtain is never what is left covering the page.
    window.setTimeout(function () { curtain.hidden = true; }, 2000);
  }

  function initCurtain(gsap) {
    var curtain = document.querySelector("[data-curtain]");
    if (!curtain) {
      playHero(gsap, 0);
      return;
    }

    document.body.classList.add("nx-locked");
    var fill = curtain.querySelector("[data-curtain-fill]");
    var count = curtain.querySelector("[data-curtain-count]");
    var progress = { value: 0 };

    var safety;

    var timeline = gsap.timeline({
      onComplete: function () {
        window.clearTimeout(safety);
        dismissCurtain(gsap, false);
        playHero(gsap, 0.45);
      }
    });

    timeline
      .from(curtain.querySelector(".nx-curtain__word"), { yPercent: 110, duration: 0.7, ease: "power4.out" })
      .to(progress, {
        value: 100,
        duration: 1.1,
        ease: "power2.inOut",
        onUpdate: function () {
          var value = Math.round(progress.value);
          if (fill) gsap.set(fill, { scaleX: value / 100 });
          if (count) count.textContent = String(value).padStart(3, "0");
        }
      }, "-=0.35")
      .to(curtain.querySelector(".nx-curtain__inner"), { opacity: 0, duration: 0.3 });

    // Never let a stalled load — or a throttled animation frame — trap the page
    // behind the curtain. This drops it outright rather than starting another
    // animation that would be throttled just as badly.
    safety = window.setTimeout(function () {
      timeline.kill();
      dismissCurtain(gsap, true);
      playHero(gsap, 0);
    }, 4000);
  }

  /* --- Hero ---------------------------------------------------------------- */

  function playHero(gsap, delay) {
    var hero = document.querySelector("[data-hero]");
    if (!hero || hero.dataset.nxPlayed === "true") return;
    hero.dataset.nxPlayed = "true";

    var title = hero.querySelector("[data-hero-title]");
    var words = title ? splitWords(title) : [];

    var timeline = gsap.timeline({ delay: delay || 0, defaults: { ease: "power3.out" } });

    if (words.length) {
      gsap.set(words, { yPercent: 115, opacity: 0 });
      timeline.to(words, { yPercent: 0, opacity: 1, duration: 1, stagger: 0.045 });
    }

    timeline
      .from(hero.querySelectorAll("[data-hero-fade]"), {
        y: 28,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12
      }, "-=0.6")
      .fromTo(hero.querySelector("[data-hero-media]"),
        { clipPath: "inset(100% 0% 0% 0%)", scale: 1.12 },
        { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.2, ease: "power4.out" },
        "-=0.95")
      .from(hero.querySelectorAll("[data-hero-stat]"), {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08
      }, "-=0.7");

    var cue = hero.querySelector("[data-scroll-cue-line]");
    if (cue) {
      gsap.fromTo(cue, { scaleX: 0.2 }, {
        scaleX: 1,
        duration: 1.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
  }

  function initHeroAuras(gsap, ScrollTrigger) {
    var hero = document.querySelector("[data-hero]");
    if (!hero) return;
    gsap.to(hero.querySelectorAll(".nx-hero__aura"), {
      yPercent: function (index) { return index === 0 ? 24 : -18; },
      ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true }
    });
  }

  /* --- Headings ------------------------------------------------------------- */

  function initSplitHeadings(gsap, ScrollTrigger) {
    document.querySelectorAll("[data-split]").forEach(function (heading) {
      if (heading.closest("[data-hero]")) return;
      var words = splitWords(heading);
      if (!words.length) return;
      gsap.set(words, { yPercent: 105, opacity: 0 });
      gsap.to(words, {
        yPercent: 0,
        opacity: 1,
        duration: 0.85,
        stagger: 0.035,
        scrollTrigger: { trigger: heading, start: "top 85%", once: true }
      });
    });
  }

  /* --- Generic reveals ------------------------------------------------------- */

  function revealBatch(gsap, ScrollTrigger, scope) {
    var targets = Array.prototype.slice.call((scope || document).querySelectorAll("[data-reveal]"))
      .filter(function (el) { return el.dataset.nxRevealed !== "true"; });
    if (!targets.length) return;

    targets.forEach(function (el) { el.dataset.nxRevealed = "true"; });

    ScrollTrigger.batch(targets, {
      start: "top 88%",
      once: true,
      onEnter: function (batch) {
        gsap.fromTo(batch,
          { y: 34, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, overwrite: true }
        );
      }
    });

    // Anything already above the fold when the batch is built.
    ScrollTrigger.refresh();
  }

  function initReveals(gsap, ScrollTrigger) {
    revealBatch(gsap, ScrollTrigger, document);
  }

  /* --- Manifesto word wash ----------------------------------------------------- */

  function initManifesto(gsap, ScrollTrigger) {
    var block = document.querySelector("[data-manifesto]");
    if (!block) return;
    splitWords(block);
    var words = block.querySelectorAll(".nx-word");
    if (!words.length) return;

    gsap.to(words, {
      color: getComputedStyle(document.body).getPropertyValue("color").trim() || "#071A16",
      stagger: 1,
      ease: "none",
      scrollTrigger: {
        trigger: block,
        start: "top 78%",
        end: "bottom 55%",
        scrub: 0.6
      }
    });
  }

  /* --- Counters ------------------------------------------------------------------ */

  function initCounters(gsap, ScrollTrigger) {
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var target = Number(el.getAttribute("data-count"));
      if (!isFinite(target)) return;
      var state = { value: 0 };
      el.textContent = "0";
      gsap.to(state, {
        value: target,
        duration: 1.4,
        ease: "power2.out",
        snap: { value: 1 },
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: function () { el.textContent = String(Math.round(state.value)); }
      });
    });
  }

  /* --- Marquee -------------------------------------------------------------------- */

  function initMarquee(gsap, ScrollTrigger) {
    document.querySelectorAll("[data-marquee]").forEach(function (marquee) {
      var track = marquee.querySelector("[data-marquee-track]");
      if (!track) return;

      // Duplicate the run once so the loop has no visible seam.
      if (track.dataset.nxCloned !== "true") {
        track.innerHTML += track.innerHTML;
        track.dataset.nxCloned = "true";
      }

      var loop = gsap.to(track, {
        xPercent: -50,
        duration: Number(marquee.getAttribute("data-marquee-speed")) || 28,
        ease: "none",
        repeat: -1
      });

      // Scrolling nudges the marquee along, then it settles back to base speed.
      var settle;

      ScrollTrigger.create({
        trigger: marquee,
        start: "top bottom",
        end: "bottom top",
        onUpdate: function (self) {
          var direction = self.direction === -1 ? -1 : 1;
          var boost = 1 + Math.min(Math.abs(self.getVelocity()) / 1200, 2.5);
          gsap.to(loop, { timeScale: direction * boost, duration: 0.3, overwrite: true });

          if (settle) {
            settle.restart(true);
          } else {
            settle = gsap.delayedCall(0.5, function () {
              gsap.to(loop, { timeScale: 1, duration: 1, overwrite: true });
            });
          }
        }
      });
    });
  }

  /* --- Parallax --------------------------------------------------------------------- */

  function initParallax(gsap, ScrollTrigger) {
    document.querySelectorAll("[data-parallax]").forEach(function (el) {
      var strength = Number(el.getAttribute("data-parallax")) || 10;
      var image = el.querySelector("img") || el;
      gsap.fromTo(image,
        { yPercent: -strength, scale: 1.12 },
        {
          yPercent: strength,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true }
        }
      );
    });
  }

  /* --- Sticky division stack ----------------------------------------------------------- */

  function initStackCards(gsap, ScrollTrigger) {
    var cards = gsap.utils.toArray("[data-stack-card]");
    if (cards.length < 2) return;

    var mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", function () {
      cards.forEach(function (card, index) {
        if (index === cards.length - 1) return;
        gsap.to(card, {
          scale: 0.92,
          opacity: 0.45,
          ease: "none",
          scrollTrigger: {
            trigger: cards[index + 1],
            start: "top 80%",
            end: "top 20%",
            scrub: true
          }
        });
      });
    });
  }

  /* --- Horizontal programme rail --------------------------------------------------------- */

  function initRail(gsap, ScrollTrigger) {
    var rail = document.querySelector("[data-rail]");
    if (!rail) return;
    var track = rail.querySelector("[data-rail-track]");
    var bar = rail.querySelector("[data-rail-bar]");
    if (!track) return;

    var mm = gsap.matchMedia();

    mm.add("(min-width: 901px)", function () {
      rail.classList.add("nx-rail--pinned");
      var distance = function () { return Math.max(track.scrollWidth - window.innerWidth + 64, 0); };

      var tween = gsap.to(track, {
        x: function () { return -distance(); },
        ease: "none",
        scrollTrigger: {
          trigger: rail,
          start: "top top",
          end: function () { return "+=" + distance(); },
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: function (self) {
            if (bar) gsap.set(bar, { scaleX: self.progress });
          }
        }
      });

      return function () {
        if (tween.scrollTrigger) tween.scrollTrigger.kill();
        tween.kill();
        gsap.set(track, { x: 0 });
        rail.classList.remove("nx-rail--pinned");
      };
    });
  }

  /* --- Drawn progress lines ------------------------------------------------------------- */

  function initProgressLines(gsap, ScrollTrigger) {
    document.querySelectorAll("[data-progress-fill]").forEach(function (fill) {
      var section = fill.closest("[data-progress]") || fill.parentElement;
      gsap.fromTo(fill, { scaleX: 0 }, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top 70%", end: "bottom 70%", scrub: true }
      });
    });
  }

  /* --- Header ---------------------------------------------------------------------------- */

  function initHeader(gsap, ScrollTrigger) {
    var header = document.querySelector("[data-header]");
    if (!header) return;

    var lastY = window.scrollY;
    var ticking = false;

    function update() {
      ticking = false;
      var y = window.scrollY;
      header.classList.toggle("is-stuck", y > 40);

      var mega = document.querySelector("[data-mega]");
      var drawer = document.querySelector("[data-drawer]");
      var overlayOpen = (mega && !mega.hidden) || (drawer && !drawer.hidden);

      // Retreat on the way down, return the moment the user scrolls back up.
      var goingDown = y > lastY;
      header.classList.toggle("is-hidden", goingDown && y > 320 && !overlayOpen);
      lastY = y;
    }

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    update();
  }

  /* --- Accordions -------------------------------------------------------------------------
     Bound for every motion preference; reduced motion just skips the tween. */

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
            duration: 0.35,
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
              duration: 0.4,
              ease: "power2.out",
              onComplete: function () { gsap.set(panel, { clearProps: "height" }); }
            }
          );
        }
      });
    });
  }

  /* --- Magnetic controls --------------------------------------------------------------------- */

  function initMagnetic(gsap) {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      if (el.dataset.nxMagnetic === "true") return;
      el.dataset.nxMagnetic = "true";

      var strength = Number(el.getAttribute("data-magnetic")) || 0.3;

      el.addEventListener("mousemove", function (event) {
        var box = el.getBoundingClientRect();
        gsap.to(el, {
          x: (event.clientX - box.left - box.width / 2) * strength,
          y: (event.clientY - box.top - box.height / 2) * strength,
          duration: 0.5,
          ease: "power3.out"
        });
      });

      el.addEventListener("mouseleave", function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  /* --- Cursor ------------------------------------------------------------------------------- */

  function initCursor(gsap) {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    var ring = document.createElement("div");
    var dot = document.createElement("div");
    ring.className = "nx-cursor";
    dot.className = "nx-cursor-dot";
    ring.setAttribute("aria-hidden", "true");
    dot.setAttribute("aria-hidden", "true");
    document.body.append(ring, dot);

    var ringX = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
    var ringY = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });
    var dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
    var dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
    var shown = false;

    window.addEventListener("mousemove", function (event) {
      if (!shown) {
        shown = true;
        gsap.to([ring, dot], { opacity: 1, duration: 0.3 });
      }
      ringX(event.clientX); ringY(event.clientY);
      dotX(event.clientX); dotY(event.clientY);
    });

    document.addEventListener("mouseleave", function () {
      shown = false;
      gsap.to([ring, dot], { opacity: 0, duration: 0.2 });
    });

    // Grow over anything clickable, but only tween when the state changes.
    var overInteractive = false;

    document.addEventListener("mouseover", function (event) {
      if (!event.target.closest) return;
      var interactive = Boolean(event.target.closest("a, button, input, select, textarea, [role='button']"));
      if (interactive === overInteractive) return;
      overInteractive = interactive;
      gsap.to(ring, { scale: interactive ? 1.6 : 1, duration: 0.3 });
      gsap.to(dot, { opacity: interactive ? 0 : 1, duration: 0.2 });
    });
  }

  /* --- Public surface ------------------------------------------------------------------------- */

  NX.motion = {
    init: init,
    /** Reveal content that was injected after boot (async programme cards). */
    reveal: function (scope) {
      if (!booted || prefersReduced() || !window.gsap || !window.ScrollTrigger) return;
      revealBatch(window.gsap, window.ScrollTrigger, scope || document);
    },
    /** Re-bind behaviour that lives inside freshly rendered markup. */
    rebind: function () {
      if (!window.gsap) return;
      initAccordions(window.gsap, prefersReduced());
      initMagnetic(window.gsap);
    },
    refresh: function () {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    },
    splitWords: splitWords
  };

  // GSAP arrives via deferred CDN scripts, so try on both ready signals and
  // give up gracefully if it never shows.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.addEventListener("load", function () {
    init();
    if (!booted) paintEverything();
  });

  window.setTimeout(function () { if (!booted) paintEverything(); }, 5000);
}());
