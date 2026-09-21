(function () {
  "use strict";

  window.NX = window.NX || {};
  var programmesPromise;

  function loadProgrammes() {
    if (!programmesPromise) {
      programmesPromise = fetch("assets/data/programmes.json").then(function (response) {
        if (!response.ok) throw new Error("Programme data could not be loaded.");
        return response.json();
      });
    }
    return programmesPromise;
  }

  function getProgrammeByCode(programmes, code) {
    var target = String(code || "").toUpperCase();
    return programmes.find(function (programme) { return programme.code === target; }) || null;
  }

  window.NX.loadProgrammes = loadProgrammes;
  window.NX.getProgrammeByCode = getProgrammeByCode;
}());
