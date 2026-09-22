/* ==========================================================================
   Masthead slider

   Deliberately independent of GSAP: the crossfade is a CSS opacity transition,
   so the slider keeps working if the animation library never loads. With no
   JavaScript at all the first slide is already marked `is-active` in the
   markup, so the band still shows an image.

   Auto-advance is paired with a real pause control, pauses on hover and on
   keyboard focus, stops while the tab is hidden, and never starts at all under
   prefers-reduced-motion.
   ========================================================================== */

(function () {
  "use strict";

  var INTERVAL = 6000;

  function prefersReduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function setup(root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-slide]"));
    if (slides.length < 2) return;

    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-slider-dot]"));
    var prev = root.querySelector("[data-slider-prev]");
    var next = root.querySelector("[data-slider-next]");
    var pauseBtn = root.querySelector("[data-slider-pause]");
    var counter = root.querySelector("[data-slider-count]");
    var status = root.querySelector("[data-slider-status]");

    var index = 0;
    var timer = null;
    var stoppedByUser = prefersReduced();
    var touchStartX = 0;

    function render(announce) {
      slides.forEach(function (slide, i) {
        var active = i === index;
        slide.classList.toggle("is-active", active);
        if (active) slide.removeAttribute("aria-hidden");
        else slide.setAttribute("aria-hidden", "true");
      });

      dots.forEach(function (dot, i) {
        if (i === index) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });

      if (counter) counter.textContent = pad(index + 1) + " / " + pad(slides.length);

      // Only announce when the move came from the person, not from the timer —
      // an auto-advancing carousel that narrates itself is noise.
      if (announce && status) {
        status.textContent = "Slide " + (index + 1) + " of " + slides.length;
      }
    }

    function go(target, announce) {
      index = (target + slides.length) % slides.length;
      render(announce);
    }

    function stop() {
      window.clearInterval(timer);
      timer = null;
    }

    function start() {
      if (stoppedByUser || prefersReduced()) return;
      stop();
      timer = window.setInterval(function () { go(index + 1, false); }, INTERVAL);
    }

    function syncPauseButton() {
      if (!pauseBtn) return;
      var playing = Boolean(timer);
      pauseBtn.setAttribute("aria-label", playing ? "Pause the slideshow" : "Play the slideshow");
      pauseBtn.innerHTML = playing
        ? '<i class="bi bi-pause-fill" aria-hidden="true"></i>'
        : '<i class="bi bi-play-fill" aria-hidden="true"></i>';
    }

    /* --- Controls ------------------------------------------------------- */

    if (prev) prev.addEventListener("click", function () { go(index - 1, true); restartIfPlaying(); });
    if (next) next.addEventListener("click", function () { go(index + 1, true); restartIfPlaying(); });

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { go(i, true); restartIfPlaying(); });
    });

    function restartIfPlaying() {
      // Give the viewer a fresh full interval after they interact.
      if (timer) start();
    }

    if (pauseBtn) {
      pauseBtn.addEventListener("click", function () {
        if (timer) {
          stoppedByUser = true;
          stop();
        } else {
          stoppedByUser = false;
          start();
        }
        syncPauseButton();
      });
    }

    /* --- Pause on hover and focus ----------------------------------------- */

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", function (event) {
      if (!root.contains(event.relatedTarget)) start();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });

    /* --- Keyboard and touch ------------------------------------------------ */

    root.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") { event.preventDefault(); go(index - 1, true); }
      if (event.key === "ArrowRight") { event.preventDefault(); go(index + 1, true); }
    });

    root.addEventListener("touchstart", function (event) {
      touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });

    root.addEventListener("touchend", function (event) {
      var distance = event.changedTouches[0].screenX - touchStartX;
      if (Math.abs(distance) < 45) return;
      go(index + (distance < 0 ? 1 : -1), true);
    }, { passive: true });

    /* --- Go --------------------------------------------------------------- */

    render(false);

    if (prefersReduced()) {
      // No auto-advance, so the pause control would do nothing.
      if (pauseBtn) pauseBtn.hidden = true;
    } else {
      start();
      syncPauseButton();
    }
  }

  function initSliders() {
    document.querySelectorAll("[data-slider]").forEach(setup);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initSliders);
  else initSliders();
}());
