(function () {
  "use strict";

  function initGallery() {
    var grid = document.querySelector("[data-gallery-grid]");
    var lightbox = document.querySelector("[data-lightbox]");
    if (!grid || !lightbox) return;
    var items = Array.prototype.slice.call(grid.querySelectorAll("[data-gallery-category]"));
    var image = lightbox.querySelector("[data-lightbox-image]");
    var caption = lightbox.querySelector("[data-lightbox-caption]");
    var close = lightbox.querySelector("[data-lightbox-close]");
    var lastFocused = null;
    var activeIndex = 0;
    var touchStartX = 0;

    function visibleItems() { return items.filter(function (item) { return !item.hidden; }); }
    function showItem(index) {
      var visible = visibleItems();
      if (!visible.length) return;
      activeIndex = (index + visible.length) % visible.length;
      var item = visible[activeIndex];
      image.src = item.getAttribute("data-gallery-src");
      image.loading = "lazy";
      image.alt = item.getAttribute("data-gallery-alt");
      caption.textContent = item.getAttribute("data-gallery-alt");
    }
    function open(item) {
      lastFocused = item;
      lightbox.setAttribute("aria-hidden", "false");
      lightbox.style.display = "grid";
      showItem(visibleItems().indexOf(item));
      close.focus();
    }
    function dismiss() {
      lightbox.setAttribute("aria-hidden", "true");
      lightbox.style.display = "none";
      if (lastFocused) lastFocused.focus();
    }

    items.forEach(function (item) { item.addEventListener("click", function () { open(item); }); });
    close.addEventListener("click", dismiss);
    lightbox.addEventListener("click", function (event) { if (event.target === lightbox) dismiss(); });
    lightbox.addEventListener("touchstart", function (event) { touchStartX = event.changedTouches[0].screenX; }, { passive: true });
    lightbox.addEventListener("touchend", function (event) {
      var distance = event.changedTouches[0].screenX - touchStartX;
      if (Math.abs(distance) < 40) return;
      showItem(activeIndex + (distance < 0 ? 1 : -1));
    }, { passive: true });
    document.addEventListener("keydown", function (event) {
      if (lightbox.getAttribute("aria-hidden") === "true") return;
      if (event.key === "Escape") dismiss();
      if (event.key === "ArrowRight") showItem(activeIndex + 1);
      if (event.key === "ArrowLeft") showItem(activeIndex - 1);
      if (event.key === "Tab") {
        event.preventDefault();
        close.focus();
      }
    });

    document.querySelectorAll("[data-gallery-filter]").forEach(function (filter) {
      filter.addEventListener("click", function () {
        var category = filter.getAttribute("data-gallery-filter");
        document.querySelectorAll("[data-gallery-filter]").forEach(function (button) {
          var active = button === filter;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-pressed", String(active));
        });
        items.forEach(function (item) { item.hidden = category !== "all" && item.getAttribute("data-gallery-category") !== category; });
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initGallery);
  else initGallery();
}());
