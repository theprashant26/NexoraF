/* ==========================================================================
   Enquiry and contact forms

   Client-side validation only. Nothing is transmitted until the institute
   supplies a real endpoint — see FORM_ENDPOINT below.
   ========================================================================== */

(function () {
  "use strict";

  var NX = (window.NX = window.NX || {});
  var esc = NX.escapeHtml || function (value) { return String(value); };

  var FORM_ENDPOINT = "{{PLACEHOLDER: form endpoint}}";
  var ENDPOINT_READY = FORM_ENDPOINT.indexOf("{{PLACEHOLDER") === -1;

  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE = /^[+()\d][\d\s\-()]{6,}$/;

  function setFieldError(form, name, visible) {
    var field = form.elements.namedItem(name);
    var message = form.querySelector('[data-error-for="' + name + '"]');
    if (field && field.setAttribute) field.setAttribute("aria-invalid", String(visible));
    if (message) message.hidden = !visible;
  }

  function isValidField(input) {
    if (input.type === "checkbox") return input.checked;

    var value = input.value.trim();
    if (!value) return false;

    if (input.type === "email") return EMAIL.test(value);
    if (input.type === "tel") return PHONE.test(value);

    // data-min-length on a password, data-match on its confirmation field.
    var min = Number(input.getAttribute("data-min-length"));
    if (min && value.length < min) return false;

    var matchName = input.getAttribute("data-match");
    if (matchName) {
      var other = input.form && input.form.elements.namedItem(matchName);
      if (other && other.value !== input.value) return false;
    }

    return true;
  }

  function validate(form) {
    var firstInvalid = null;
    var valid = true;

    Array.prototype.forEach.call(form.querySelectorAll("[required]"), function (input) {
      var ok = isValidField(input);
      setFieldError(form, input.name, !ok);
      if (!ok) {
        valid = false;
        if (!firstInvalid) firstInvalid = input;
      }
    });

    return { valid: valid, firstInvalid: firstInvalid };
  }

  function shake(el) {
    var gsap = window.gsap;
    if (!gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(el, { x: -7 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.35)" });
  }

  /* --- Programme select ------------------------------------------------------ */

  function populateProgrammeSelect() {
    var selects = document.querySelectorAll("[data-programme-select]");
    if (!selects.length || !NX.loadProgrammes) return;

    var params = new URLSearchParams(window.location.search);
    var preset = params.get("programme");
    var presetLevel = params.get("level") || "";

    NX.loadProgrammes().then(function (programmes) {
      var options = programmes.map(function (programme) {
        return '<option value="' + esc(programme.code) + '">' +
          esc(programme.programme) + " (" + esc(programme.code) + ")</option>";
      }).join("");

      selects.forEach(function (select) {
        select.innerHTML = '<option value="">Choose a programme</option>' + options;
        if (preset) select.value = String(preset).toUpperCase();

        // A level list only means something once a programme is chosen, and the
        // fees differ per programme, so it is rebuilt on every change.
        var levels = select.form && select.form.querySelector("[data-level-select]");
        if (!levels) return;

        function fillLevels(wanted) {
          var programme = NX.getProgrammeByCode(programmes, select.value);
          var tiers = (programme && programme.tiers) || [];

          if (!tiers.length) {
            levels.innerHTML = '<option value="">Choose a programme first</option>';
            return;
          }

          levels.innerHTML = '<option value="">Choose a level</option>' +
            tiers.map(function (tier) {
              return '<option value="' + esc(tier.id) + '">' +
                esc(tier.level) + " — " + esc(tier.duration) + " — " +
                NX.rupees(tier.fee) + "</option>";
            }).join("");

          if (wanted && NX.getTier(programme, wanted)) levels.value = wanted;
        }

        fillLevels(presetLevel);
        select.addEventListener("change", function () { fillLevels(""); });
      });
    }).catch(function () {
      selects.forEach(function (select) {
        select.innerHTML = '<option value="">Programme list unavailable</option>';
      });
    });
  }


  /* --- Submission ------------------------------------------------------------- */

  function handleSubmit(form, event) {
    event.preventDefault();

    var success = form.querySelector("[data-form-success]");
    var failure = form.querySelector("[data-form-error]");
    if (success) success.hidden = true;
    if (failure) failure.hidden = true;

    // Bots fill hidden fields; people do not.
    var honeypot = form.elements.namedItem("company");
    if (honeypot && honeypot.value) return;

    var result = validate(form);
    if (!result.valid) {
      shake(form);
      if (result.firstInvalid) result.firstInvalid.focus();
      return;
    }

    if (!ENDPOINT_READY) {
      // No endpoint configured yet: confirm locally and say so plainly.
      if (success) {
        success.hidden = false;
        success.focus && success.focus();
      }
      if (window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches && success) {
        window.gsap.fromTo(success, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });
      }
      return;
    }

    var submit = form.querySelector('[type="submit"]');
    if (submit) submit.disabled = true;

    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form)
    }).then(function (response) {
      if (!response.ok) throw new Error("Submission failed.");
      form.reset();
      if (success) success.hidden = false;
    }).catch(function () {
      if (failure) failure.hidden = false;
    }).then(function () {
      if (submit) submit.disabled = false;
    });
  }

  /* --- Password reveal ------------------------------------------------------
     A visible toggle beats a masked field the person cannot check, especially
     on a phone keyboard. */

  function initPasswordToggles() {
    document.querySelectorAll("[data-password-toggle]").forEach(function (button) {
      if (button.dataset.nxBound === "true") return;
      button.dataset.nxBound = "true";

      var input = document.getElementById(button.getAttribute("aria-controls"));
      if (!input) return;

      button.addEventListener("click", function () {
        var revealed = input.type === "text";
        input.type = revealed ? "password" : "text";
        button.textContent = revealed ? "Show" : "Hide";
        button.setAttribute("aria-pressed", String(!revealed));
        input.focus();
      });
    });
  }

  function initForms() {
    populateProgrammeSelect();
    initPasswordToggles();

    document.querySelectorAll("[data-contact-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) { handleSubmit(form, event); });

      form.querySelectorAll("[required]").forEach(function (input) {
        input.addEventListener("blur", function () {
          setFieldError(form, input.name, !isValidField(input));
        });
        // Clear the error as soon as the field becomes valid again.
        input.addEventListener("input", function () {
          if (input.getAttribute("aria-invalid") === "true" && isValidField(input)) {
            setFieldError(form, input.name, false);
          }
        });
        input.addEventListener("change", function () {
          if (input.type === "checkbox" || input.tagName === "SELECT") {
            setFieldError(form, input.name, !isValidField(input));
          }
        });

        // Typing in the original should clear a stale mismatch on its partner.
        var mirror = form.querySelector('[data-match="' + input.name + '"]');
        if (mirror) {
          input.addEventListener("input", function () {
            if (mirror.value && mirror.getAttribute("aria-invalid") === "true" && isValidField(mirror)) {
              setFieldError(form, mirror.name, false);
            }
          });
        }
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initForms);
  else initForms();
}());
