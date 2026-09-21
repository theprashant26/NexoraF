(function () {
  "use strict";

  window.NX = window.NX || {};
  var FORM_ENDPOINT = "{{PLACEHOLDER: form endpoint}}";

  function showError(form, field, visible) {
    var input = form.elements[field];
    var message = form.querySelector('[data-error-for="' + field + '"]');
    if (input) input.setAttribute("aria-invalid", String(visible));
    if (message) message.hidden = !visible;
  }

  function validate(form) {
    var valid = true;
    Array.prototype.forEach.call(form.querySelectorAll("[required]"), function (input) {
      var value = input.type === "checkbox" ? input.checked : input.value.trim();
      var fieldValid = Boolean(value);
      if (input.type === "email" && fieldValid) fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
      showError(form, input.name, !fieldValid);
      valid = fieldValid && valid;
    });
    return valid;
  }

  function populateProgrammeSelect() {
    var select = document.getElementById("admission-programme");
    if (!select || !window.NX.loadProgrammes) return;
    window.NX.loadProgrammes().then(function (programmes) {
      select.innerHTML = '<option value="">Choose a programme</option>' + programmes.map(function (programme) {
        return '<option value="' + programme.code + '">' + programme.programme + '</option>';
      }).join("");
    }).catch(function () {
      select.innerHTML = '<option value="">Programme list unavailable</option>';
    });
  }

  function initForms() {
    populateProgrammeSelect();
    document.querySelectorAll("[data-contact-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var success = form.querySelector("[data-form-success]");
        if (!validate(form)) return;
        if (success) {
          success.hidden = false;
          success.textContent = "Thanks. Your enquiry is ready for the institute team.";
        }
        form.dataset.endpoint = FORM_ENDPOINT;
      });
      form.querySelectorAll("[required]").forEach(function (input) {
        input.addEventListener("blur", function () { validate(form); });
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initForms);
  else initForms();
}());
