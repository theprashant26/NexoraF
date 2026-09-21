/* ==========================================================================
   SEO fallback

   Fills in canonical / Open Graph tags on pages that do not declare them.
   It never overwrites a tag the page already ships, and it stays out of the
   programme detail template, which builds its own per-programme metadata.
   ========================================================================== */

(function () {
  "use strict";

  function ensureMeta(attribute, key, content) {
    var existing = document.head.querySelector("meta[" + attribute + '="' + key + '"]');
    if (existing) return;
    var meta = document.createElement("meta");
    meta.setAttribute(attribute, key);
    meta.setAttribute("content", content);
    document.head.appendChild(meta);
  }

  function initSeoFallback() {
    // The detail page owns its canonical and OG tags; leave them alone.
    if (document.querySelector("[data-programme-detail]")) return;

    var page = window.location.pathname.split("/").pop() || "index.html";
    var title = document.title;
    var descriptionMeta = document.querySelector('meta[name="description"]');
    var description = descriptionMeta ? descriptionMeta.getAttribute("content") : title;

    var canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      canonical.href = new URL(page, window.location.href).href;
      document.head.appendChild(canonical);
    }

    var shareImage = new URL("assets/img/placeholders/nx-og-share-01.svg", window.location.href).href;

    ensureMeta("property", "og:title", title);
    ensureMeta("property", "og:description", description);
    ensureMeta("property", "og:type", "website");
    ensureMeta("property", "og:url", canonical.href);
    ensureMeta("property", "og:image", shareImage);
    ensureMeta("property", "og:site_name", "Nexora Institute of Professional Studies");
    ensureMeta("name", "twitter:card", "summary_large_image");
    ensureMeta("name", "twitter:title", title);
    ensureMeta("name", "twitter:description", description);
    ensureMeta("name", "twitter:image", shareImage);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initSeoFallback);
  else initSeoFallback();
}());
