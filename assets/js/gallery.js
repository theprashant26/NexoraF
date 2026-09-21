/* ==========================================================================
   Gallery filters and lightbox

   Drives both the gallery page grid and the home page masonry — any
   [data-gallery-item] on a page that also carries [data-lightbox].
   ========================================================================== */

(function () {
  "use strict";

  function initGallery() {
    var lightbox = document.querySelector("[data-lightbox]");
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-gallery-item]"));
    if (!lightbox || !items.length) return;

    var image = lightbox.querySelector("[data-lightbox-image]");
    var caption = lightbox.querySelector("[data-lightbox-caption]");
    var closeButton = lightbox.querySelector("[data-lightbox-close]");
    var prevButton = lightbox.querySelector("[data-lightbox-prev]");
    var nextButton = lightbox.querySelector("[data-lightbox-next]");

    var lastFocused = null;
    var activeIndex = 0;
    var touchStartX = 0;

    function reduced() {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function visible() {
      return items.filter(function (item) { return !item.hidden; });
    }

    function show(index) {
      var list = visible();
      if (!list.length) return;
      activeIndex = (index + list.length) % list.length;

      var item = list[activeIndex];
      var src = item.getAttribute("data-gallery-src");
      var alt = item.getAttribute("data-gallery-alt") || "";

      if (image) {
        image.src = src;
        image.alt = alt;
      }
      if (caption) caption.textContent = alt;

      var multiple = list.length > 1;
      if (prevButton) prevButton.hidden = !multiple;
      if (nextButton) nextButton.hidden = !multiple;

      if (window.gsap && !reduced() && image) {
        window.gsap.fromTo(image, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" });
      }
    }

    function open(item) {
      lastFocused = item;
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("nx-locked");
      show(visible().indexOf(item));
      if (closeButton) closeButton.focus();

      if (window.gsap && !reduced()) {
        window.gsap.fromTo(lightbox, { opacity: 0 }, { opacity: 1, duration: 0.25 });
      }
    }

    function dismiss() {
      if (!lightbox.classList.contains("is-open")) return;
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("nx-locked");
      if (lastFocused) lastFocused.focus();
    }

    items.forEach(function (item) {
      item.addEventListener("click", function () { open(item); });
    });

    if (closeButton) closeButton.addEventListener("click", dismiss);
    if (prevButton) prevButton.addEventListener("click", function () { show(activeIndex - 1); });
    if (nextButton) nextButton.addEventListener("click", function () { show(activeIndex + 1); });

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) dismiss();
    });

    lightbox.addEventListener("touchstart", function (event) {
      touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener("touchend", function (event) {
      var distance = event.changedTouches[0].screenX - touchStartX;
      if (Math.abs(distance) < 45) return;
      show(activeIndex + (distance < 0 ? 1 : -1));
    }, { passive: true });

    document.addEventListener("keydown", function (event) {
      if (!lightbox.classList.contains("is-open")) return;
      if (event.key === "Escape") { dismiss(); return; }
      if (event.key === "ArrowRight") { show(activeIndex + 1); return; }
      if (event.key === "ArrowLeft") { show(activeIndex - 1); return; }

      if (event.key === "Tab") {
        var focusable = Array.prototype.slice.call(
          lightbox.querySelectorAll("button:not([hidden])")
        );
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

    /* --- Category filters --------------------------------------------------- */

    var filters = Array.prototype.slice.call(document.querySelectorAll("[data-gallery-filter]"));

    filters.forEach(function (filter) {
      filter.addEventListener("click", function () {
        var category = filter.getAttribute("data-gallery-filter");

        filters.forEach(function (button) {
          var active = button === filter;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-pressed", String(active));
        });

        items.forEach(function (item) {
          var match = category === "all" || item.getAttribute("data-gallery-category") === category;
          item.hidden = !match;
        });

        var shown = visible();
        if (window.gsap && !reduced() && shown.length) {
          window.gsap.fromTo(shown,
            { opacity: 0, y: 18, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.04, ease: "power3.out", overwrite: true });
        }

        if (window.NX && window.NX.motion) window.NX.motion.refresh();
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initGallery);
  else initGallery();
}());
