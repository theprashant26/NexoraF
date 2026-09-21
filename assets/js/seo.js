(function () {
  "use strict";

  function setMeta(attribute, value, content) {
    var selector = "meta[" + attribute + '=\"' + value + '\"]';
    var meta = document.head.querySelector(selector);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute(attribute, value);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  }

  function initSeoFallback() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    var title = document.title;
    var description = document.querySelector('meta[name="description"]');
    var canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = new URL(path, window.location.href).href;
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description ? description.content : title);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", canonical.href);
    setMeta("property", "og:image", new URL("assets/img/placeholders/nx-og-share-01.svg", window.location.href).href);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description ? description.content : title);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initSeoFallback);
  else initSeoFallback();
}());
