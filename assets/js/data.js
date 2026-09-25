/* ==========================================================================
   Programme data access

   One memoised fetch of programmes.json, shared by the listing, the detail
   template, the admissions select, the admission form, and the payment page.

   Every programme is offered at three levels — 3 months, 6 months and 1 year —
   each with its own fee. The tier helpers below are the single place that knows
   how to find one and how to describe its payment schedule.
   ========================================================================== */

(function () {
  "use strict";

  var NX = (window.NX = window.NX || {});
  var request;

  function loadProgrammes() {
    if (!request) {
      request = fetch("assets/data/programmes.json").then(function (response) {
        if (!response.ok) throw new Error("Programme data could not be loaded.");
        return response.json();
      });
    }
    return request;
  }

  function getProgrammeByCode(programmes, code) {
    var target = String(code || "").trim().toUpperCase();
    if (!target) return null;
    for (var i = 0; i < programmes.length; i += 1) {
      if (programmes[i].code === target) return programmes[i];
    }
    return null;
  }

  function getTier(programme, tierId) {
    var tiers = (programme && programme.tiers) || [];
    for (var i = 0; i < tiers.length; i += 1) {
      if (tiers[i].id === tierId) return tiers[i];
    }
    return null;
  }

  // Indian digit grouping: 135500 reads as 1,35,500.
  function rupees(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN");
  }

  // "₹15,000 at registration, then 2 × ₹15,000", collapsing to a count only
  // when the later instalments are equal. Returns "" when the institute has not
  // published a schedule for this tier — we never invent one.
  function scheduleText(tier) {
    if (!tier || !Array.isArray(tier.instalments) || !tier.instalments.length) return "";

    var text = rupees(tier.instalments[0]) + " at registration";
    var rest = tier.instalments.slice(1);
    if (!rest.length) return text;

    var uniform = rest.every(function (amount) { return amount === rest[0]; });
    return text + (uniform
      ? ", then " + rest.length + " × " + rupees(rest[0])
      : ", then " + rest.map(rupees).join(" and "));
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }

  NX.loadProgrammes = loadProgrammes;
  NX.getProgrammeByCode = getProgrammeByCode;
  NX.getTier = getTier;
  NX.rupees = rupees;
  NX.scheduleText = scheduleText;
  NX.escapeHtml = escapeHtml;
}());
