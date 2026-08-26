(function () {
  "use strict";

  var form = document.getElementById("calc-form");
  var startInput = document.getElementById("start-date");
  var endInput = document.getElementById("end-date");
  var hoursInput = document.getElementById("worked-h");
  var minutesInput = document.getElementById("worked-m");
  var errorEl = document.getElementById("form-error");
  var daysEl = document.getElementById("working-days");
  var expectedEl = document.getElementById("expected-hours");
  var differenceEl = document.getElementById("hours-difference");
  var dailyEl = document.getElementById("daily-hours");
  var holidayNoteEl = document.getElementById("holiday-note");

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
    if (!hoursInput.value) hoursInput.value = "0";
    if (!minutesInput.value) minutesInput.value = "0";
  }

  var MONTHS_SHORT = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];

  function holidayLabel(iso) {
    var parts = iso.split("-");
    var d = Number(parts[2]);
    var month = MONTHS_SHORT[Number(parts[1]) - 1];
    return d + " " + month;
  }

  function updateHolidayNote(startIso, endIso) {
    if (!holidayNoteEl || !Worktime.holidaysForRange) return;
    var startYear = Number(String(startIso).slice(0, 4));
    var endYear = Number(String(endIso).slice(0, 4));
    if (!startYear) {
      holidayNoteEl.textContent = "Los festivos se calculan para el año del rango.";
      return;
    }
    var year = startYear;
    var list = Worktime.holidaysForYear(year);
    var labels = [];
    for (var i = 0; i < list.length; i++) labels.push(holidayLabel(list[i]));
    var extra =
      endYear && endYear !== startYear
        ? " El rango cruza de " + startYear + " a " + endYear + "."
        : "";
    holidayNoteEl.textContent =
      "Festivos " + year + ": " + labels.join(", ") + "." + extra;
  }

  function showError(message) {
    errorEl.hidden = !message;
    errorEl.textContent = message || "";
  }

  function render() {
    updateHolidayNote(startInput.value, endInput.value);
    var parts = Worktime.parseDurationParts(hoursInput.value, minutesInput.value);
    var result = Worktime.calculate(
      startInput.value,
      endInput.value,
      parts ? parts.hmm : "invalid"
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

    if (!parts || (!result.ok && result.error === "hours")) {
      showError("Usa horas enteras y minutos de 0 a 59.");
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

  startInput.addEventListener("change", render);
  startInput.addEventListener("input", render);
  endInput.addEventListener("change", render);
  endInput.addEventListener("input", render);
  hoursInput.addEventListener("input", render);
  hoursInput.addEventListener("change", render);
  minutesInput.addEventListener("input", render);
  minutesInput.addEventListener("change", render);
})();
