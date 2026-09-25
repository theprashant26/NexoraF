/* ==========================================================================
   Fee payment page

   Builds the fee summary and instalment picker from programmes.json, and works
   out what is due.

   Every programme is offered at three levels (3 months, 6 months, 1 year), each
   with its own fee, so a level has to be chosen before an instalment means
   anything. Only the 3-month level has a fixed schedule; the rest are EMI on
   request, so the page says so and sends the student to the Admissions
   Department rather than inventing amounts.

   This page deliberately collects **no card details**. A static site cannot
   take a payment, and a page that accepts card numbers outside a PCI-compliant
   environment would be unsafe even if it could. The flow here is the one real
   implementations use: confirm who is paying and what for, then hand off to a
   hosted gateway checkout, which redirects back to payment-status.html.
   ========================================================================== */

(function () {
  "use strict";

  var NX = (window.NX = window.NX || {});
  var GATEWAY_ENDPOINT = "{{PLACEHOLDER: payment gateway checkout URL}}";
  var GATEWAY_READY = GATEWAY_ENDPOINT.indexOf("{{PLACEHOLDER") === -1;

  function ordinal(n) {
    return ["First", "Second", "Third", "Fourth", "Fifth"][n] || (n + 1) + "th";
  }

  function initPayment() {
    var root = document.querySelector("[data-payment]");
    if (!root || !NX.loadProgrammes) return;

    var rupees = NX.rupees;
    var esc = NX.escapeHtml;

    var select = root.querySelector("[data-payment-programme]");
    var levelSelect = root.querySelector("[data-payment-level]");
    var levelField = root.querySelector("[data-payment-levels-field]");
    var choices = root.querySelector("[data-payment-choices]");
    var choicesField = root.querySelector("[data-payment-choices-field]");
    var noSchedule = root.querySelector("[data-payment-no-schedule]");
    var rows = root.querySelector("[data-payment-rows]");
    var amountOut = root.querySelector("[data-payment-amount]");
    var submit = root.querySelector("[data-payment-submit]");
    var summary = root.querySelector("[data-payment-summary]");

    var programmes = [];
    var current = null;
    var currentTier = null;

    function selected() {
      var picked = choices.querySelector('input[name="instalment"]:checked');
      return picked ? Number(picked.value) : -1;
    }

    function renderAmount() {
      var i = selected();
      var payable = currentTier && Array.isArray(currentTier.instalments);
      var due = payable && i >= 0 ? currentTier.instalments[i] : 0;

      if (amountOut) amountOut.textContent = due ? rupees(due) : "—";
      if (submit) submit.disabled = !due;

      rows.querySelectorAll("[data-instalment-row]").forEach(function (row) {
        row.classList.toggle("is-due", Number(row.getAttribute("data-instalment-row")) === i);
      });
    }

    function renderTier() {
      var list = (currentTier && currentTier.instalments) || [];
      var known = list.length > 0;

      if (choicesField) choicesField.hidden = !currentTier;
      if (noSchedule) noSchedule.hidden = known || !currentTier;
      if (summary) summary.hidden = !currentTier;

      if (!currentTier) {
        choices.innerHTML = "";
        rows.innerHTML = "";
        renderAmount();
        return;
      }

      rows.innerHTML =
        "<div><dt>Programme</dt><dd>" + esc(current.code) + "</dd></div>" +
        "<div><dt>Level</dt><dd>" + esc(currentTier.level) + "</dd></div>" +
        "<div><dt>Duration</dt><dd>" + esc(currentTier.duration) + "</dd></div>" +
        "<div><dt>Total fee</dt><dd>" + rupees(currentTier.fee) + "</dd></div>" +
        list.map(function (amount, i) {
          return '<div data-instalment-row="' + i + '"><dt>' + ordinal(i) +
            " instalment</dt><dd>" + rupees(amount) + "</dd></div>";
        }).join("");

      choices.innerHTML = list.map(function (amount, i) {
        var when = i === 0 ? "Payable at registration" : "Month " + (i + 1);
        return '<label class="nx-choice">' +
          '<input type="radio" name="instalment" value="' + i + '"' + (i === 0 ? " checked" : "") + ">" +
          '<span class="nx-choice__body">' +
            '<span class="nx-choice__label">' + ordinal(i) + " instalment — " + rupees(amount) + "</span>" +
            '<span class="nx-choice__meta">' + when + "</span>" +
          "</span></label>";
      }).join("");

      choices.querySelectorAll('input[name="instalment"]').forEach(function (input) {
        input.addEventListener("change", renderAmount);
      });

      renderAmount();
    }

    function renderProgramme(programme, presetLevel) {
      current = programme;
      currentTier = null;

      if (levelField) levelField.hidden = !programme;

      if (!programme) {
        renderTier();
        return;
      }

      var tiers = programme.tiers || [];
      levelSelect.innerHTML = '<option value="">Choose a level</option>' +
        tiers.map(function (tier) {
          return '<option value="' + esc(tier.id) + '">' +
            esc(tier.level) + " — " + esc(tier.duration) + " — " + rupees(tier.fee) +
            "</option>";
        }).join("");

      // One level means there is no choice to make, so make it for them.
      var pick = presetLevel || (tiers.length === 1 ? tiers[0].id : "");
      if (pick && NX.getTier(programme, pick)) {
        levelSelect.value = pick;
        currentTier = NX.getTier(programme, pick);
      }

      renderTier();
    }

    NX.loadProgrammes().then(function (list) {
      programmes = list;

      select.innerHTML = '<option value="">Choose a programme</option>' +
        programmes.map(function (p) {
          return '<option value="' + esc(p.code) + '">' +
            esc(p.programme) + " (" + esc(p.code) + ")</option>";
        }).join("");

      var params = new URLSearchParams(window.location.search);
      var preset = params.get("code");
      var presetLevel = params.get("level") || "";

      if (preset) {
        select.value = String(preset).toUpperCase();
        renderProgramme(NX.getProgrammeByCode(programmes, preset), presetLevel);
      }

      select.addEventListener("change", function () {
        renderProgramme(NX.getProgrammeByCode(programmes, select.value), "");
      });

      levelSelect.addEventListener("change", function () {
        currentTier = NX.getTier(current, levelSelect.value);
        renderTier();
      });
    }).catch(function () {
      if (summary) summary.hidden = true;
      select.innerHTML = '<option value="">Programme list unavailable</option>';
    });

    /* --- Hand off ---------------------------------------------------------- */

    var form = root.querySelector("[data-payment-form]");
    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var notice = root.querySelector("[data-payment-notice]");
      var i = selected();
      if (!current || !currentTier || i < 0) return;

      if (!GATEWAY_READY) {
        // Nothing to hand off to yet; say so rather than pretending.
        if (notice) {
          notice.hidden = false;
          notice.focus && notice.focus();
        }
        return;
      }

      var params = new URLSearchParams({
        programme: current.code,
        level: currentTier.id,
        instalment: String(i + 1),
        amount: String(currentTier.instalments[i])
      });
      window.location.href = GATEWAY_ENDPOINT +
        (GATEWAY_ENDPOINT.indexOf("?") === -1 ? "?" : "&") + params.toString();
    });
  }

  /* --- Gateway return ------------------------------------------------------
     Gateways redirect back with the outcome in the query string. */

  function initStatus() {
    var root = document.querySelector("[data-payment-status]");
    if (!root) return;

    var params = new URLSearchParams(window.location.search);
    var status = (params.get("status") || "pending").toLowerCase();
    var reference = params.get("ref") || params.get("reference") || "";

    var panels = root.querySelectorAll("[data-status-panel]");
    var matched = false;

    panels.forEach(function (panel) {
      var show = panel.getAttribute("data-status-panel") === status;
      panel.hidden = !show;
      if (show) matched = true;
    });

    if (!matched) {
      var fallback = root.querySelector('[data-status-panel="pending"]');
      if (fallback) fallback.hidden = false;
    }

    root.querySelectorAll("[data-status-ref]").forEach(function (el) {
      if (reference) el.textContent = reference;
      else if (el.closest("[data-status-ref-wrap]")) el.closest("[data-status-ref-wrap]").hidden = true;
    });
  }

  function start() {
    initPayment();
    initStatus();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}());
