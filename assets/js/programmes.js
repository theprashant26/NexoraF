/* ==========================================================================
   Programme index and programme detail template

   The listing renders as a ruled contents index — one row per programme —
   rather than a grid of cards.
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

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  // "3 months / 6 months / 1 year" -> "3 / 6 months / 1 year": collapse only the
  // run of like units at the front, so the index column stays short and honest.
  function durations(programme) {
    var tiers = programme.tiers || [];
    if (!tiers.length) return "";

    var parts = tiers.map(function (tier) { return tier.duration; });
    return parts.map(function (part, i) {
      var unit = part.replace(/^[\d.]+\s*/, "");
      var next = parts[i + 1];
      var sameAsNext = next && next.replace(/^[\d.]+\s*/, "") === unit;
      return sameAsNext ? part.replace(/\s*\S+$/, "") : part;
    }).join(" / ");
  }

  // `position` arrives from Array#map, so it is zero-based; the index is
  // numbered from 01.
  function rowMarkup(programme, position) {
    return '<article class="nx-index__row">' +
      '<span class="nx-index__num">' + pad(position + 1) + "</span>" +
      '<span class="nx-index__code">' + esc(programme.code) + "</span>" +
      '<h3 class="nx-index__name">' +
        '<a href="programme.html?code=' + encodeURIComponent(programme.code) + '">' +
          esc(programme.programme) +
        "</a>" +
      "</h3>" +
      '<span class="nx-index__division">' + esc(durations(programme)) + "</span>" +
      '<span class="nx-index__go" aria-hidden="true"><i class="bi bi-arrow-right"></i></span>' +
      "</article>";
  }

  function relatedMarkup(programme) {
    return '<article class="nx-panel" data-reveal>' +
      '<span class="nx-panel__num">' + esc(programme.code) + "</span>" +
      '<h3>' +
        '<a href="programme.html?code=' + encodeURIComponent(programme.code) + '">' +
          esc(programme.programme) +
        "</a>" +
      "</h3>" +
      '<p class="nx-muted">' + esc(programme.keyAreas.slice(0, 2).join(" · ")) + "</p>" +
      "</article>";
  }

  /* --- Listing ------------------------------------------------------------- */

  function initListing() {
    var index = document.getElementById("programme-index");
    if (!index || !NX.loadProgrammes) return;

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
        index.innerHTML = visible.map(rowMarkup).join("");
        index.removeAttribute("data-nx-dealt");
        if (empty) empty.hidden = visible.length > 0;
        if (count) {
          count.textContent = visible.length + (visible.length === 1 ? " programme" : " programmes");
        }
        syncFilters();
        syncUrl();

        if (NX.motion) {
          NX.motion.deal(index);
          NX.motion.refresh();
        }
      }

      var gsap = window.gsap;
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (animate && gsap && !reduce && index.children.length) {
        gsap.to(index.children, {
          opacity: 0,
          x: 14,
          duration: 0.18,
          stagger: 0.012,
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
    // appears in both the breadcrumb and the masthead.
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

      var rupees = NX.rupees;
      var tiers = programme.tiers || [];

      fill("[data-detail-levels]", tiers.map(function (tier) {
        return tier.duration;
      }).join(" · "));

      if (tiers.length) {
        var cheapest = tiers.reduce(function (low, tier) {
          return tier.fee < low.fee ? tier : low;
        });
        fill("[data-detail-fee-from]", rupees(cheapest.fee));
      }

      if (programme.eligibility) fill("[data-detail-eligibility]", programme.eligibility);
      if (programme.learningMode) fill("[data-detail-mode]", programme.learningMode);
      fill("[data-detail-fact-certificate]", programme.certificate);

      // The banner differs per programme, so it is set here rather than in markup.
      var banner = detail.querySelector("[data-detail-banner]");
      if (banner && programme.banner) {
        banner.src = programme.banner;
        banner.alt = programme.bannerAlt || "";
      }

      var ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && programme.banner) {
        ogImage.setAttribute("content", new URL(programme.banner, window.location.href).href);
      }

      var levels = detail.querySelector("[data-detail-tiers]");
      if (levels) {
        levels.innerHTML = tiers.map(function (tier) {
          var schedule = NX.scheduleText(tier);

          return '<article class="nx-level" data-reveal>' +
            '<span class="nx-level__duration">' + esc(tier.duration) + "</span>" +
            "<h3>" + esc(tier.level) + "</h3>" +
            '<p class="nx-level__course">' + esc(tier.course) + "</p>" +
            '<p class="nx-level__fee">' + rupees(tier.fee) + "</p>" +
            '<p class="nx-level__terms">' +
              // Never invent a schedule; where none is published, EMI is
              // arranged case by case with the Admissions Department.
              (schedule
                ? esc(schedule)
                : "EMI available on request.") +
            "</p>" +
            (tier.learningHours
              ? '<p class="nx-level__hours">' + esc(tier.learningHours) + " of learning</p>"
              : "") +
            '<a class="nx-arrow-link" href="apply.html?programme=' +
              encodeURIComponent(programme.code) + "&level=" + encodeURIComponent(tier.id) + '">' +
              'Apply at this level <i class="bi bi-arrow-right" aria-hidden="true"></i></a>' +
            "</article>";
        }).join("");
      }

      var areas = detail.querySelector("[data-detail-areas]");
      if (areas) {
        areas.innerHTML = programme.keyAreas.map(function (area, position) {
          return '<span class="nx-detail-area"><span>' + pad(position + 1) + "</span><span>" + esc(area) + "</span></span>";
        }).join("");
      }

      var related = detail.querySelector("[data-related-programmes]");
      if (related) {
        var siblings = programmes.filter(function (item) {
          return item.group === programme.group && item.code !== programme.code;
        }).slice(0, 3);
        related.innerHTML = siblings.map(relatedMarkup).join("");
      }

      // Not `code` — that name is already the query parameter this callback
      // reads above, and a var here would hoist over it.
      var slug = encodeURIComponent(programme.code);

      var enquiryLink = detail.querySelector("[data-detail-enquiry-link]");
      if (enquiryLink) enquiryLink.href = "admissions.html?programme=" + slug + "#enquiry";

      var applyLink = detail.querySelector("[data-detail-apply-link]");
      if (applyLink) applyLink.href = "apply.html?programme=" + slug;

      var payLink = detail.querySelector("[data-detail-pay-link]");
      if (payLink) payLink.href = "payment.html?code=" + slug;

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
