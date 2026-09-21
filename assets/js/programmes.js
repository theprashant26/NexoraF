(function () {
  "use strict";

  window.NX = window.NX || {};

  function normalise(value) {
    return String(value || "").toLowerCase().trim();
  }

  function groupFromQuery(value) {
    var aliases = {
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
    return aliases[normalise(value)] || value || "all";
  }

  function cardTemplate(programme) {
    return "<article class=\"nx-card nx-programme-card nx-card--elevated\">" +
      "<div class=\"nx-media nx-media--4-3\"><img src=\"assets/img/placeholders/nx-programme-card-01.svg\" width=\"800\" height=\"600\" loading=\"lazy\" alt=\"" + programme.division + " programme image placeholder\"></div>" +
      "<span class=\"nx-programme-card__code\">" + programme.code + "</span>" +
      "<span class=\"nx-programme-card__division\">" + programme.division + "</span>" +
      "<h3 class=\"nx-programme-card__title\"><a class=\"nx-programme-card__link\" href=\"programme.html?code=" + encodeURIComponent(programme.code) + "\">" + programme.programme + "</a></h3>" +
      "<p class=\"nx-muted\">" + programme.keyAreas.slice(0, 3).join(" · ") + "</p>" +
      "</article>";
  }

  function initProgrammeListing() {
    var grid = document.getElementById("programme-grid");
    var search = document.getElementById("programme-search");
    var count = document.getElementById("programme-result-count");
    var empty = document.getElementById("programme-empty");
    var clear = document.getElementById("programme-clear");
    var loading = document.getElementById("programme-loading");
    var errorMessage = document.getElementById("programme-error-message");
    var filters = Array.prototype.slice.call(document.querySelectorAll("[data-group]"));
    if (!grid || !search || !count || !empty || !clear || !loading || !window.NX.loadProgrammes) return;

    var params = new URLSearchParams(window.location.search);
    var state = { programmes: [], query: params.get("search") || "", group: groupFromQuery(params.get("group")) };
    search.value = state.query;
    if (errorMessage && params.get("error") === "programme-not-found") errorMessage.hidden = false;

    function setUrl() {
      var next = new URL(window.location.href);
      if (state.group === "all") next.searchParams.delete("group"); else next.searchParams.set("group", state.group);
      if (state.query) next.searchParams.set("search", state.query); else next.searchParams.delete("search");
      window.history.replaceState({}, "", next);
    }

    function matches(programme) {
      var haystack = normalise([programme.division, programme.code, programme.certificate, programme.programme].concat(programme.keyAreas).join(" "));
      var matchesQuery = !state.query || haystack.indexOf(normalise(state.query)) !== -1;
      var matchesGroup = state.group === "all" || programme.group === state.group;
      return matchesQuery && matchesGroup;
    }

    function updateFilterButtons() {
      filters.forEach(function (filter) {
        var isActive = filter.getAttribute("data-group") === state.group;
        filter.classList.toggle("is-active", isActive);
        filter.setAttribute("aria-pressed", String(isActive));
      });
    }

    function render() {
      var visible = state.programmes.filter(matches);
      grid.classList.remove("is-filtering");
      void grid.offsetWidth;
      grid.classList.add("is-filtering");
      grid.innerHTML = visible.map(cardTemplate).join("");
      empty.hidden = visible.length > 0;
      count.textContent = visible.length + (visible.length === 1 ? " programme" : " programmes") + " shown";
      updateFilterButtons();
      setUrl();
    }

    filters.forEach(function (filter) {
      filter.addEventListener("click", function () {
        state.group = filter.getAttribute("data-group");
        render();
      });
    });

    search.addEventListener("input", function () {
      state.query = search.value;
      render();
    });

    clear.addEventListener("click", function () {
      state.query = "";
      state.group = "all";
      search.value = "";
      render();
      search.focus();
    });

    window.NX.loadProgrammes().then(function (programmes) {
      state.programmes = programmes;
      loading.hidden = true;
      render();
    }).catch(function () {
      loading.hidden = true;
      count.textContent = "Programme data is unavailable.";
      empty.hidden = false;
      empty.querySelector("h3").textContent = "Programme data could not be loaded.";
      empty.querySelector("p").textContent = "Open the site through a local web server or check the data file path.";
      clear.hidden = true;
    });
  }

  function detailIntro(programme) {
    return "This programme brings together learning areas in " + programme.keyAreas.slice(0, 3).join(", ") + ". It is designed to develop practical knowledge and workplace skills relevant to " + programme.division.toLowerCase() + ".";
  }

  function relatedCardTemplate(programme) {
    return "<article class=\"nx-card nx-programme-card nx-card--elevated\"><span class=\"nx-programme-card__code\">" + programme.code + "</span><span class=\"nx-programme-card__division\">" + programme.division + "</span><h3 class=\"nx-programme-card__title\"><a class=\"nx-programme-card__link\" href=\"programme.html?code=" + encodeURIComponent(programme.code) + "\">" + programme.programme + "</a></h3><p class=\"nx-muted\">" + programme.keyAreas.slice(0, 2).join(" · ") + "</p></article>";
  }

  function initProgrammeDetail() {
    var detail = document.querySelector("[data-programme-detail]");
    if (!detail || !window.NX.loadProgrammes) return;
    var loading = detail.querySelector(".nx-detail-loading");
    var error = detail.querySelector(".nx-detail-error");
    var content = detail.querySelector(".nx-detail-content");
    var code = new URLSearchParams(window.location.search).get("code");

    function setText(selector, value) {
      var element = detail.querySelector(selector);
      if (element) element.textContent = value;
    }

    window.NX.loadProgrammes().then(function (programmes) {
      var programme = window.NX.getProgrammeByCode(programmes, code);
      if (!programme) {
        window.location.replace("programmes.html?error=programme-not-found");
        return;
      }

      var description = detailIntro(programme);
      document.title = programme.programme + " | Nexora Institute of Professional Studies";
      var meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", description);
      var canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.href = new URL("programme.html?code=" + encodeURIComponent(programme.code), window.location.href).href;
      var courseSchema = document.createElement("script");
      courseSchema.type = "application/ld+json";
      courseSchema.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "Course", name: programme.programme, description: description, provider: { "@type": "EducationalOrganization", name: "Nexora Institute of Professional Studies" }, educationalCredentialAwarded: programme.certificate, about: programme.keyAreas });
      document.head.appendChild(courseSchema);
      setText("[data-detail-division]", programme.division);
      setText("[data-detail-group]", programme.group);
      setText("[data-detail-code]", programme.code);
      setText("[data-detail-name]", programme.programme);
      setText("[data-detail-certificate]", programme.certificate);
      setText("[data-detail-intro]", description);
      setText("[data-detail-practice]", "You will practise " + programme.keyAreas.join(", ") + ".");

      var areas = detail.querySelector("[data-detail-areas]");
      if (areas) areas.innerHTML = programme.keyAreas.map(function (area) { return "<span class=\"nx-detail-area\"><i class=\"bi bi-check2\" aria-hidden=\"true\"></i>" + area + "</span>"; }).join("");
      var related = detail.querySelector("[data-related-programmes]");
      if (related) related.innerHTML = programmes.filter(function (item) { return item.group === programme.group && item.code !== programme.code; }).slice(0, 3).map(relatedCardTemplate).join("");
      loading.hidden = true;
      content.hidden = false;
    }).catch(function () {
      loading.hidden = true;
      error.hidden = false;
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initProgrammeListing);
  else initProgrammeListing();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initProgrammeDetail);
  else initProgrammeDetail();
}());
