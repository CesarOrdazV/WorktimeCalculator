(function () {
  "use strict";

  var form = document.getElementById("calc-form");
  var startInput = document.getElementById("start-date");
  var endInput = document.getElementById("end-date");
  var hoursInput = document.getElementById("worked-hours");
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
    if (!hoursInput.value) hoursInput.value = "0:00";
  }

  function showError(message) {
    errorEl.hidden = !message;
    errorEl.textContent = message || "";
  }

  function render() {
    var result = Worktime.calculate(startInput.value, endInput.value, hoursInput.value);

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
      showError("Usa el formato h:mm, por ejemplo 160:30.");
      daysEl.textContent = String(result.days);
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

  startInput.addEventListener("change", render);
  endInput.addEventListener("change", render);
  hoursInput.addEventListener("input", render);
})();
