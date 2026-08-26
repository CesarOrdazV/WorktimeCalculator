const test = require("node:test");
const assert = require("node:assert/strict");
const W = require("./worktime.js");

test("Jan 2–3 2025 (Thu–Fri) is 2 working days / 16:00", () => {
  assert.equal(W.countWorkingDays("2025-01-02", "2025-01-03"), 2);
  assert.equal(W.formatHmm(W.expectedHours("2025-01-02", "2025-01-03")), "16:00");
});

test("Jan 1 2025 (holiday) is 0 working days", () => {
  assert.equal(W.countWorkingDays("2025-01-01", "2025-01-01"), 0);
  assert.equal(W.formatHmm(W.expectedHours("2025-01-01", "2025-01-01")), "0:00");
});

test("Jan 4–5 2025 (weekend) is 0 working days", () => {
  assert.equal(W.countWorkingDays("2025-01-04", "2025-01-05"), 0);
});

test("Jan 1–7 2025 excludes New Year and the weekend (4 days / 32:00)", () => {
  // 1=Wed holiday, 2–3 work, 4–5 weekend, 6–7 work
  assert.equal(W.countWorkingDays("2025-01-01", "2025-01-07"), 4);
  assert.equal(W.formatHmm(W.expectedHours("2025-01-01", "2025-01-07")), "32:00");
});

test("May 1 2025 (Thu holiday) is excluded", () => {
  assert.equal(W.countWorkingDays("2025-04-30", "2025-05-02"), 2);
});

test("Jan 1 2026 (Thu holiday) is 0 working days", () => {
  assert.equal(W.countWorkingDays("2026-01-01", "2026-01-01"), 0);
  assert.equal(W.formatHmm(W.expectedHours("2026-01-01", "2026-01-01")), "0:00");
});

test("Jan 1–7 2026 excludes New Year and the weekend (4 days / 32:00)", () => {
  // 1=Thu holiday, 2 work, 3–4 weekend, 5–7 work
  assert.equal(W.countWorkingDays("2026-01-01", "2026-01-07"), 4);
  assert.equal(W.formatHmm(W.expectedHours("2026-01-01", "2026-01-07")), "32:00");
});

test("Feb 2 2026 (Mon holiday) is excluded", () => {
  assert.equal(W.countWorkingDays("2026-02-02", "2026-02-02"), 0);
  assert.equal(W.countWorkingDays("2026-02-02", "2026-02-03"), 1);
});

test("Mar 16 2026 (Mon holiday) is excluded", () => {
  assert.equal(W.countWorkingDays("2026-03-16", "2026-03-16"), 0);
});

test("Apr 2–3 2026 (Holy Thursday and Good Friday) are excluded", () => {
  assert.equal(W.countWorkingDays("2026-04-01", "2026-04-03"), 1);
});

test("May 1 2026 (Fri holiday) is excluded", () => {
  assert.equal(W.countWorkingDays("2026-04-30", "2026-05-04"), 2);
});

test("Nov 16 2026 (Mon holiday) is excluded", () => {
  assert.equal(W.countWorkingDays("2026-11-16", "2026-11-16"), 0);
});

test("start after end is invalid", () => {
  assert.equal(W.countWorkingDays("2025-02-01", "2025-01-01"), null);
  const r = W.calculate("2025-02-01", "2025-01-01", "8:00");
  assert.equal(r.ok, false);
  assert.equal(r.error, "range");
});

test("hours and minutes fields reject minutes over 59", () => {
  assert.equal(W.parseDurationParts("160", "30").hmm, "160:30");
  assert.equal(W.parseDurationParts("", "").totalHours, 0);
  assert.equal(W.parseDurationParts("8", "").totalHours, 8);
  assert.equal(W.parseDurationParts("0", "45").totalHours, 0.75);
  assert.equal(W.parseDurationParts("10", "60"), null);
  assert.equal(W.parseDurationParts("1.5", "0"), null);
});

test("parse and format h:mm", () => {
  assert.equal(W.parseHmm("160:30"), 160.5);
  assert.equal(W.parseHmm(""), 0);
  assert.equal(W.parseHmm("nope"), null);
  assert.equal(W.formatHmm(160.5), "160:30");
  assert.equal(W.formatHmm(-2.5), "−2:30");
});

test("difference and daily average", () => {
  const r = W.calculate("2025-01-02", "2025-01-03", "15:00");
  assert.equal(r.ok, true);
  assert.equal(r.expected, 16);
  assert.equal(r.difference, -1);
  assert.equal(r.daily, 7.5);
  assert.equal(W.formatHmm(r.daily), "7:30");
});

test("zero working days does not divide by zero", () => {
  const r = W.calculate("2025-01-04", "2025-01-05", "8:00");
  assert.equal(r.ok, true);
  assert.equal(r.days, 0);
  assert.equal(r.daily, null);
});
