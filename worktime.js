/**
 * Working-hours calculator (ported from WorktimeCalculator/Utilities/WorktimeCalculator.cs).
 * No DOM. Safe to load as a classic <script> or require() from Node.
 */
(function (root) {
  "use strict";

  var HOURS_PER_DAY = 8;

  // Full calendar dates from the MAUI holydays list (year included).
  var HOLIDAYS = [
    "2025-01-01",
    "2025-02-03",
    "2025-03-17",
    "2025-04-17",
    "2025-04-18",
    "2025-05-01",
    "2025-09-16",
    "2025-11-18",
    "2025-12-25",
  ];

  function parseIsoDate(iso) {
    var parts = String(iso).split("-");
    if (parts.length !== 3) return null;
    var y = Number(parts[0]);
    var m = Number(parts[1]);
    var d = Number(parts[2]);
    if (!y || m < 1 || m > 12 || d < 1 || d > 31) return null;
    return Date.UTC(y, m - 1, d);
  }

  function toIsoDate(utcMs) {
    return new Date(utcMs).toISOString().slice(0, 10);
  }

  function countWorkingDays(startIso, endIso, holidays) {
    var start = parseIsoDate(startIso);
    var end = parseIsoDate(endIso);
    if (start == null || end == null) return null;
    if (start > end) return null;

    var holidaySet = {};
    var list = holidays || HOLIDAYS;
    for (var i = 0; i < list.length; i++) holidaySet[list[i]] = true;

    var days = 0;
    for (var t = start; t <= end; t += 24 * 60 * 60 * 1000) {
      var iso = toIsoDate(t);
      var dow = new Date(t).getUTCDay(); // 0 Sun … 6 Sat
      if (dow === 0 || dow === 6 || holidaySet[iso]) continue;
      days++;
    }
    return days;
  }

  function expectedHours(startIso, endIso, holidays, hoursPerDay) {
    var days = countWorkingDays(startIso, endIso, holidays);
    if (days == null) return null;
    var perDay = hoursPerDay == null ? HOURS_PER_DAY : hoursPerDay;
    return days * perDay;
  }

  /** Hours + minutes fields (Android numeric keypad). Empty → 0. Minutes must be 0–59. */
  function parseDurationParts(hoursRaw, minutesRaw) {
    function asInt(raw) {
      var s = String(raw == null ? "" : raw).trim();
      if (s === "") return 0;
      if (!/^\d+$/.test(s)) return null;
      return Number(s);
    }
    var hours = asInt(hoursRaw);
    var minutes = asInt(minutesRaw);
    if (hours == null || minutes == null || minutes > 59) return null;
    return {
      hours: hours,
      minutes: minutes,
      totalHours: hours + minutes / 60,
      hmm: hours + ":" + String(minutes).padStart(2, "0"),
    };
  }

  function parseHmm(text) {
    var raw = String(text == null ? "" : text).trim();
    if (raw === "") return 0;
    var m = /^(\d+):([0-5]?\d)$/.exec(raw);
    if (!m) return null;
    return Number(m[1]) + Number(m[2]) / 60;
  }

  function formatHmm(totalHours) {
    if (totalHours == null || !isFinite(totalHours)) return "—";
    var sign = totalHours < 0 ? "−" : "";
    var totalMinutes = Math.round(Math.abs(totalHours) * 60);
    var h = Math.floor(totalMinutes / 60);
    var min = totalMinutes % 60;
    return sign + h + ":" + String(min).padStart(2, "0");
  }

  function calculate(startIso, endIso, workedText, holidays) {
    var days = countWorkingDays(startIso, endIso, holidays);
    var worked = parseHmm(workedText);

    if (days == null) {
      return { ok: false, error: "range", days: 0, expected: null, worked: worked, difference: null, daily: null };
    }
    if (worked == null) {
      return { ok: false, error: "hours", days: days, expected: days * HOURS_PER_DAY, worked: null, difference: null, daily: null };
    }

    var expected = days * HOURS_PER_DAY;
    var difference = worked - expected;
    var daily = days === 0 ? null : worked / days;
    return { ok: true, error: null, days: days, expected: expected, worked: worked, difference: difference, daily: daily };
  }

  var api = {
    HOURS_PER_DAY: HOURS_PER_DAY,
    HOLIDAYS: HOLIDAYS,
    parseIsoDate: parseIsoDate,
    countWorkingDays: countWorkingDays,
    expectedHours: expectedHours,
    parseHmm: parseHmm,
    parseDurationParts: parseDurationParts,
    formatHmm: formatHmm,
    calculate: calculate,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.Worktime = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
