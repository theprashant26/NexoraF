/* ==========================================================================
   Programme data access

   One memoised fetch of programmes.json, shared by the listing, the detail
   template, and the admissions programme select.
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

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }

  NX.loadProgrammes = loadProgrammes;
  NX.getProgrammeByCode = getProgrammeByCode;
  NX.escapeHtml = escapeHtml;
}());
