/**
 * Working-hours calculator (ported from WorktimeCalculator/Utilities/WorktimeCalculator.cs).
 * No DOM. Safe to load as a classic <script> or require() from Node.
 */
(function (root) {
  "use strict";

  var HOURS_PER_DAY = 8;
  var MS_PER_DAY = 24 * 60 * 60 * 1000;

  function parseIsoDate(iso) {
    var raw = String(iso == null ? "" : iso).trim();
    var match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
    if (!match) return null;
    var y = Number(match[1]);
    var m = Number(match[2]);
    var d = Number(match[3]);
    if (!y || m < 1 || m > 12 || d < 1 || d > 31) return null;
    return Date.UTC(y, m - 1, d);
  }

  function toIsoDate(utcMs) {
    return new Date(utcMs).toISOString().slice(0, 10);
  }

  /** n-th Monday of a month (monthIndex 0–11). */
  function nthMonday(year, monthIndex, n) {
    var firstDow = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
    var offset = (1 - firstDow + 7) % 7;
    return toIsoDate(Date.UTC(year, monthIndex, 1 + offset + (n - 1) * 7));
  }

  /** Easter Sunday (Anonymous Gregorian algorithm), UTC midnight. */
  function easterSundayUtc(year) {
    var a = year % 19;
    var b = Math.floor(year / 100);
    var c = year % 100;
    var d = Math.floor(b / 4);
    var e = b % 4;
    var f = Math.floor((b + 8) / 25);
    var g = Math.floor((b - f + 1) / 3);
    var h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4);
    var k = c % 4;
    var l = (32 + 2 * e + 2 * i - h - k) % 7;
    var m = Math.floor((a + 11 * h + 22 * l) / 451);
    var month = Math.floor((h + l - 7 * m + 114) / 31);
    var day = ((h + l - 7 * m + 114) % 31) + 1;
    return Date.UTC(year, month - 1, day);
  }

  /**
   * Mexican LFT rest days for a calendar year, plus Holy Thursday and Good Friday.
   * Presidential inauguration (1 Oct every six years from 2024) is included when it applies.
   */
  function holidaysForYear(year) {
    var easter = easterSundayUtc(year);
    var list = [
      toIsoDate(Date.UTC(year, 0, 1)),
      nthMonday(year, 1, 1),
      nthMonday(year, 2, 3),
      toIsoDate(easter - 3 * MS_PER_DAY),
      toIsoDate(easter - 2 * MS_PER_DAY),
      toIsoDate(Date.UTC(year, 4, 1)),
      toIsoDate(Date.UTC(year, 8, 16)),
      nthMonday(year, 10, 3),
      toIsoDate(Date.UTC(year, 11, 25)),
    ];
    if (year >= 2024 && (year - 2024) % 6 === 0) {
      list.push(toIsoDate(Date.UTC(year, 9, 1)));
    }
    return list;
  }

  function holidaysForRange(startIso, endIso) {
    var startYear = Number(String(startIso).slice(0, 4));
    var endYear = Number(String(endIso).slice(0, 4));
    if (!startYear || !endYear || startYear > endYear) return [];
    var list = [];
    for (var y = startYear; y <= endYear; y++) {
      list = list.concat(holidaysForYear(y));
    }
    return list;
  }

  function countWorkingDays(startIso, endIso, holidays) {
    var start = parseIsoDate(startIso);
    var end = parseIsoDate(endIso);
    if (start == null || end == null) return null;
    if (start > end) return null;

    var holidaySet = {};
    var list = holidays != null ? holidays : holidaysForRange(startIso, endIso);
    for (var i = 0; i < list.length; i++) holidaySet[list[i]] = true;

    var days = 0;
    for (var t = start; t <= end; t += MS_PER_DAY) {
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
    holidaysForYear: holidaysForYear,
    holidaysForRange: holidaysForRange,
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
