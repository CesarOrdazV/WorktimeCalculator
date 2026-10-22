const test = require("node:test");
const assert = require("node:assert/strict");
const W = require("./worktime.js");

test("Jan 2–3 2025 (Thu–Fri) is 2 working days and subtracts 1 month of vacation (9:20) → 6:40", () => {
  assert.equal(W.countWorkingDays("2025-01-02", "2025-01-03"), 2);
  assert.equal(W.formatHmm(W.expectedHours("2025-01-02", "2025-01-03")), "6:40");
});

test("Jan 1 2025 (holiday) is 0 working days", () => {
  assert.equal(W.countWorkingDays("2025-01-01", "2025-01-01"), 0);
  assert.equal(W.formatHmm(W.expectedHours("2025-01-01", "2025-01-01")), "−9:20");
});

test("Jan 4–5 2025 (weekend) is 0 working days", () => {
  assert.equal(W.countWorkingDays("2025-01-04", "2025-01-05"), 0);
});

test("Jan 1–7 2025 excludes New Year and the weekend (4 days / 22:40 after 1 month vacation)", () => {
  // 1=Wed holiday, 2–3 work, 4–5 weekend, 6–7 work -> 32:00 - 9:20 = 22:40
  assert.equal(W.countWorkingDays("2025-01-01", "2025-01-07"), 4);
  assert.equal(W.formatHmm(W.expectedHours("2025-01-01", "2025-01-07")), "22:40");
});

test("May 1 2025 (Thu holiday) is excluded", () => {
  assert.equal(W.countWorkingDays("2025-04-30", "2025-05-02"), 2);
});

test("Jan 1 2026 (Thu holiday) is 0 working days", () => {
  assert.equal(W.countWorkingDays("2026-01-01", "2026-01-01"), 0);
  assert.equal(W.formatHmm(W.expectedHours("2026-01-01", "2026-01-01")), "−9:20");
});

test("Jan 1–7 2026 excludes New Year and the weekend (4 days / 22:40 after 1 month vacation)", () => {
  // 1=Thu holiday, 2 work, 3–4 weekend, 5–7 work -> 32:00 - 9:20 = 22:40
  assert.equal(W.countWorkingDays("2026-01-01", "2026-01-07"), 4);
  assert.equal(W.formatHmm(W.expectedHours("2026-01-01", "2026-01-07")), "22:40");
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
  assert.equal(W.countCalendarMonths("2025-02-01", "2025-01-01"), null);
  const r = W.calculate("2025-02-01", "2025-01-01", "8:00");
  assert.equal(r.ok, false);
  assert.equal(r.error, "range");
});

test("parse and format h:mm (including multi-digit hours > 24)", () => {
  assert.equal(W.parseHmm("160:30"), 160.5);
  assert.equal(W.parseHmm("1920:45"), 1920.75);
  assert.equal(W.parseHmm("0:05"), 5 / 60);
  assert.equal(W.parseHmm(""), 0);
  assert.equal(W.parseHmm("10:60"), null);
  assert.equal(W.parseHmm("160"), null);
  assert.equal(W.parseHmm("nope"), null);
  assert.equal(W.formatHmm(160.5), "160:30");
  assert.equal(W.formatHmm(1920.75), "1920:45");
  assert.equal(W.formatHmm(-2.5), "−2:30");
});

test("difference and daily average", () => {
  const r = W.calculate("2025-01-02", "2025-01-03", "15:00");
  assert.equal(r.ok, true);
  // 2 working days (16h) minus 1 month vacation (14/12 * 8 = 9.3333...h) = 6.6666...h (6:40)
  assert.equal(W.formatHmm(r.expected), "6:40");
  assert.equal(W.formatHmm(r.difference), "8:20");
  assert.equal(r.daily, 7.5);
  assert.equal(W.formatHmm(r.daily), "7:30");
});

test("zero working days does not divide by zero", () => {
  const r = W.calculate("2025-01-04", "2025-01-05", "8:00");
  assert.equal(r.ok, true);
  assert.equal(r.days, 0);
  assert.equal(r.daily, null);
});

test("each initiated calendar month subtracts 14/12 days (9:20) from expected hours", () => {
  assert.equal(W.countCalendarMonths("2026-01-15", "2026-01-20"), 1);
  assert.equal(W.countCalendarMonths("2026-01-31", "2026-02-01"), 2);
  assert.equal(W.countCalendarMonths("2026-01-01", "2026-03-01"), 3);
  assert.equal(W.countCalendarMonths("2026-01-01", "2026-12-31"), 12);

  // Across two calendar months (Apr 30 – May 4 2026: 2 working days = 16:00, minus 2 months * 9:20 = 18:40 → −2:40)
  const twoMonths = W.calculate("2026-04-30", "2026-05-04", "16:00");
  assert.equal(twoMonths.ok, true);
  assert.equal(twoMonths.days, 2);
  assert.equal(W.formatHmm(twoMonths.expected), "−2:40");

  // Full calendar year 2026: 12 months subtract exactly 14 days * 8h = 112 hours
  const fullYearDays = W.countWorkingDays("2026-01-01", "2026-12-31");
  const fullYearExpected = W.expectedHours("2026-01-01", "2026-12-31");
  assert.equal(fullYearExpected, (fullYearDays - 14) * 8);
});
