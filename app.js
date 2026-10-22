(function () {
  "use strict";

  var form = document.getElementById("calc-form");
  var startInput = document.getElementById("start-date");
  var endInput = document.getElementById("end-date");
  var workedInput = document.getElementById("worked");
  var colonButton = document.getElementById("insert-colon");
  var vacationInput = document.getElementById("unused-vacation");
  var errorEl = document.getElementById("form-error");
  var daysEl = document.getElementById("working-days");
  var expectedEl = document.getElementById("expected-hours");
  var differenceEl = document.getElementById("hours-difference");
  var dailyEl = document.getElementById("daily-hours");

  function todayIso() {
    var now = new Date();
    var y = now.getFullYear();
    var m = String(now.getMonth() + 1).padStart(2, "0");
    var d = String(now.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function yearStartIso() {
    return new Date().getFullYear() + "-01-01";
  }

  function setDefaults() {
    if (!startInput.value) startInput.value = yearStartIso();
    if (!endInput.value) endInput.value = todayIso();
    if (!workedInput.value) workedInput.value = "0:00";
    if (!vacationInput.value) vacationInput.value = "0";
  }

  function showError(message) {
    errorEl.hidden = !message;
    errorEl.textContent = message || "";
  }

  function render() {
    var vacation = Worktime.parseNonNegativeInt(vacationInput.value);
    var result = Worktime.calculate(
      startInput.value,
      endInput.value,
      workedInput.value,
      undefined,
      vacation == null ? "invalid" : vacation
    );

    if (!result.ok && result.error === "range") {
      showError("La fecha inicial no puede ser posterior a la final.");
      daysEl.textContent = "—";
      expectedEl.textContent = "—";
      differenceEl.textContent = "—";
      differenceEl.classList.remove("is-behind");
      dailyEl.textContent = "—";
      return;
    }

    if (!result.ok && result.error === "hours") {
      showError("Usa el formato h:mm, por ejemplo 160:30. Los minutos van de 0 a 59.");
      daysEl.textContent = result.days != null ? String(result.days) : "—";
      expectedEl.textContent = Worktime.formatHmm(result.expected);
      differenceEl.textContent = "—";
      differenceEl.classList.remove("is-behind");
      dailyEl.textContent = "—";
      return;
    }

    if (vacation == null || (!result.ok && result.error === "vacation")) {
      showError("Usa un número entero de días, sin negativos.");
      daysEl.textContent = result.days != null ? String(result.days) : "—";
      expectedEl.textContent = Worktime.formatHmm(result.expected);
      differenceEl.textContent = "—";
      differenceEl.classList.remove("is-behind");
      dailyEl.textContent = "—";
      return;
    }

    showError("");
    daysEl.textContent = String(result.days);
    expectedEl.textContent = Worktime.formatHmm(result.expected);
    differenceEl.textContent = Worktime.formatHmm(result.difference);
    differenceEl.classList.toggle("is-behind", result.difference < 0);
    dailyEl.textContent = result.daily == null ? "—" : Worktime.formatHmm(result.daily);
  }

  setDefaults();
  render();

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    render();
  });

  var skipSelectOnFocus = false;
  var focusToken = 0;

  function normalizeWorked() {
    var value = Worktime.parseHmm(workedInput.value);
    if (value == null) return;
    var formatted = Worktime.formatHmm(value);
    if (workedInput.value !== formatted) {
      workedInput.value = formatted;
      render();
    }
  }

  function insertColon() {
    var el = workedInput;
    var wasFocused = document.activeElement === el;
    var at = wasFocused && el.selectionEnd != null ? el.selectionEnd : null;
    focusToken++;
    skipSelectOnFocus = true;
    el.focus();
    skipSelectOnFocus = false;

    var value = el.value;
    var sepAt = value.search(/[:.,]/);
    if (sepAt === -1) {
      if (at == null) at = value.length;
      el.value = value.slice(0, at) + ":" + value.slice(at);
      el.setSelectionRange(at + 1, at + 1);
      render();
      return;
    }
    el.setSelectionRange(sepAt + 1, value.length);
  }

  startInput.addEventListener("change", render);
  endInput.addEventListener("change", render);
  workedInput.addEventListener("input", render);
  workedInput.addEventListener("change", render);
  workedInput.addEventListener("blur", normalizeWorked);
  workedInput.addEventListener("focus", function () {
    if (skipSelectOnFocus) return;
    var token = ++focusToken;
    setTimeout(function () {
      if (token !== focusToken) return;
      if (document.activeElement === workedInput) workedInput.select();
    }, 0);
  });
  function keepWorkedFocus(event) {
    event.preventDefault();
  }
  colonButton.addEventListener("pointerdown", keepWorkedFocus);
  colonButton.addEventListener("mousedown", keepWorkedFocus);
  colonButton.addEventListener("click", insertColon);
  vacationInput.addEventListener("input", render);
  vacationInput.addEventListener("change", render);
})();
