/* ==========================================================================
   Programme listing and programme detail template
   ========================================================================== */

(function () {
  "use strict";

  var NX = (window.NX = window.NX || {});
  var esc = NX.escapeHtml;

  var GROUP_ALIASES = {
    transport: "Transport & Aviation",
    aviation: "Transport & Aviation",
    service: "Service & Hospitality",
    hospitality: "Service & Hospitality",
    health: "Health & Sciences",
    sciences: "Health & Sciences",
    business: "Business & Technical",
    technical: "Business & Technical",
    all: "all"
  };

  function normalise(value) {
    return String(value == null ? "" : value).toLowerCase().trim();
  }

  function resolveGroup(value) {
    if (!value) return "all";
    return GROUP_ALIASES[normalise(value)] || value;
  }

  function cardMarkup(programme) {
    return '<article class="nx-card nx-programme-card" data-reveal>' +
      '<div class="nx-media nx-media--4-3">' +
        '<img src="assets/img/placeholders/nx-programme-card-01.svg" width="800" height="600" loading="lazy" ' +
        'decoding="async" alt="' + esc(programme.division) + ' training environment">' +
      "</div>" +
      '<div class="nx-programme-card__body">' +
        '<div class="nx-programme-card__meta">' +
          '<span class="nx-programme-card__code">' + esc(programme.code) + "</span>" +
          '<span class="nx-programme-card__division">' + esc(programme.division) + "</span>" +
        "</div>" +
        '<h3 class="nx-programme-card__title">' +
          '<a href="programme.html?code=' + encodeURIComponent(programme.code) + '">' + esc(programme.programme) + "</a>" +
        "</h3>" +
        '<p class="nx-programme-card__areas">' + esc(programme.keyAreas.slice(0, 3).join(" · ")) + "</p>" +
      "</div>" +
      "</article>";
  }

  function relatedMarkup(programme) {
    return '<article class="nx-card" data-reveal>' +
      '<div class="nx-programme-card__meta">' +
        '<span class="nx-programme-card__code">' + esc(programme.code) + "</span>" +
        '<span class="nx-programme-card__division">' + esc(programme.division) + "</span>" +
      "</div>" +
      '<h3 class="nx-programme-card__title">' +
        '<a href="programme.html?code=' + encodeURIComponent(programme.code) + '">' + esc(programme.programme) + "</a>" +
      "</h3>" +
      '<p class="nx-muted">' + esc(programme.keyAreas.slice(0, 2).join(" · ")) + "</p>" +
      "</article>";
  }

  /* --- Listing ------------------------------------------------------------- */

  function initListing() {
    var grid = document.getElementById("programme-grid");
    if (!grid || !NX.loadProgrammes) return;

    var search = document.getElementById("programme-search");
    var count = document.getElementById("programme-count");
    var empty = document.getElementById("programme-empty");
    var clear = document.getElementById("programme-clear");
    var loading = document.getElementById("programme-loading");
    var notFound = document.getElementById("programme-not-found");
    var filters = Array.prototype.slice.call(document.querySelectorAll("[data-group]"));

    var params = new URLSearchParams(window.location.search);
    var state = {
      programmes: [],
      query: params.get("search") || "",
      group: resolveGroup(params.get("group"))
    };

    if (search) search.value = state.query;
    if (notFound && params.get("error") === "programme-not-found") notFound.hidden = false;

    function syncUrl() {
      var next = new URL(window.location.href);
      if (state.group === "all") next.searchParams.delete("group");
      else next.searchParams.set("group", state.group);
      if (state.query) next.searchParams.set("search", state.query);
      else next.searchParams.delete("search");
      next.searchParams.delete("error");
      window.history.replaceState({}, "", next);
    }

    function matches(programme) {
      var haystack = normalise([
        programme.division,
        programme.code,
        programme.certificate,
        programme.programme,
        programme.group
      ].concat(programme.keyAreas).join(" "));
      var okQuery = !state.query || haystack.indexOf(normalise(state.query)) !== -1;
      var okGroup = state.group === "all" || programme.group === state.group;
      return okQuery && okGroup;
    }

    function syncFilters() {
      filters.forEach(function (filter) {
        var active = filter.getAttribute("data-group") === state.group;
        filter.classList.toggle("is-active", active);
        filter.setAttribute("aria-pressed", String(active));
      });
    }

    function render(animate) {
      var visible = state.programmes.filter(matches);

      function paint() {
        grid.innerHTML = visible.map(cardMarkup).join("");
        if (empty) empty.hidden = visible.length > 0;
        if (count) {
          count.textContent = visible.length + (visible.length === 1 ? " programme" : " programmes");
        }
        syncFilters();
        syncUrl();
        if (NX.motion) {
          NX.motion.reveal(grid);
          NX.motion.refresh();
        }
      }

      var gsap = window.gsap;
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (animate && gsap && !reduce && grid.children.length) {
        gsap.to(grid.children, {
          y: -12,
          opacity: 0,
          duration: 0.2,
          stagger: 0.015,
          ease: "power2.in",
          onComplete: paint
        });
      } else {
        paint();
      }
    }

    filters.forEach(function (filter) {
      filter.addEventListener("click", function () {
        state.group = filter.getAttribute("data-group");
        render(true);
      });
    });

    if (search) {
      var debounce;
      search.addEventListener("input", function () {
        window.clearTimeout(debounce);
        debounce = window.setTimeout(function () {
          state.query = search.value;
          render(false);
        }, 140);
      });
    }

    if (clear) {
      clear.addEventListener("click", function () {
        state.query = "";
        state.group = "all";
        if (search) { search.value = ""; search.focus(); }
        render(true);
      });
    }

    NX.loadProgrammes().then(function (programmes) {
      state.programmes = programmes;
      if (loading) loading.hidden = true;
      render(false);
    }).catch(function () {
      if (loading) loading.hidden = true;
      if (count) count.textContent = "Unavailable";
      if (empty) {
        empty.hidden = false;
        var heading = empty.querySelector("h3");
        var body = empty.querySelector("p");
        if (heading) heading.textContent = "Programme data could not be loaded.";
        if (body) body.textContent = "Serve this site through a web server — opening the files directly blocks the data request.";
        if (clear) clear.hidden = true;
      }
    });
  }

  /* --- Detail --------------------------------------------------------------- */

  function introFor(programme) {
    return "This programme brings together learning areas in " +
      programme.keyAreas.slice(0, 3).join(", ") +
      ". It is built to develop practical knowledge and workplace skills relevant to " +
      programme.division.toLowerCase() + ".";
  }

  function initDetail() {
    var detail = document.querySelector("[data-programme-detail]");
    if (!detail || !NX.loadProgrammes) return;

    var loading = detail.querySelector("[data-detail-loading]");
    var error = detail.querySelector("[data-detail-error]");
    var content = detail.querySelector("[data-detail-content]");
    var code = new URLSearchParams(window.location.search).get("code");

    // Every matching slot is filled, not just the first — the division label
    // appears in both the breadcrumb and the hero.
    function fill(selector, value) {
      detail.querySelectorAll(selector).forEach(function (el) { el.textContent = value; });
    }

    NX.loadProgrammes().then(function (programmes) {
      var programme = NX.getProgrammeByCode(programmes, code);
      if (!programme) {
        window.location.replace("programmes.html?error=programme-not-found");
        return;
      }

      var description = introFor(programme);

      document.title = programme.programme + " | Nexora Institute of Professional Studies";
      var meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", description);

      var canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.href = new URL("programme.html?code=" + encodeURIComponent(programme.code), window.location.href).href;
      }

      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", programme.programme + " | Nexora Institute");
      var ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) ogDescription.setAttribute("content", description);

      var schema = document.createElement("script");
      schema.type = "application/ld+json";
      schema.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Course",
        name: programme.programme,
        description: description,
        provider: {
          "@type": "EducationalOrganization",
          name: "Nexora Institute of Professional Studies"
        },
        educationalCredentialAwarded: programme.certificate,
        about: programme.keyAreas
      });
      document.head.appendChild(schema);

      fill("[data-detail-division]", programme.division);
      fill("[data-detail-group]", programme.group);
      fill("[data-detail-code]", programme.code);
      fill("[data-detail-name]", programme.programme);
      fill("[data-detail-certificate]", programme.certificate);
      fill("[data-detail-intro]", description);
      fill("[data-detail-practice]", "You will practise " + programme.keyAreas.join(", ") + ".");

      var areas = detail.querySelector("[data-detail-areas]");
      if (areas) {
        areas.innerHTML = programme.keyAreas.map(function (area) {
          return '<span class="nx-detail-area"><i class="bi bi-check2" aria-hidden="true"></i>' + esc(area) + "</span>";
        }).join("");
      }

      var related = detail.querySelector("[data-related-programmes]");
      if (related) {
        var siblings = programmes.filter(function (item) {
          return item.group === programme.group && item.code !== programme.code;
        }).slice(0, 3);
        related.innerHTML = siblings.map(relatedMarkup).join("");
      }

      var enquiryLink = detail.querySelector("[data-detail-enquiry-link]");
      if (enquiryLink) {
        enquiryLink.href = "admissions.html?programme=" + encodeURIComponent(programme.code) + "#enquiry";
      }

      if (loading) loading.hidden = true;
      if (content) content.hidden = false;

      if (NX.motion) {
        NX.motion.reveal(detail);
        NX.motion.refresh();
      }
    }).catch(function () {
      if (loading) loading.hidden = true;
      if (error) error.hidden = false;
    });
  }

  function start() {
    initListing();
    initDetail();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}());
