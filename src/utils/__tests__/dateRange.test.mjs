import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_REVENUE_RANGE,
  REVENUE_RANGES,
  getRangeParams,
} from "../dateRange.js";

// Mốc cố định để test không phụ thuộc ngày chạy. Dùng constructor local
// (year, monthIndex, day) chứ không phải chuỗi ISO: getRangeParams đọc ngày
// bằng getFullYear/getMonth/getDate nên phải dựng mốc theo cùng hệ quy chiếu.
const NOW = new Date(2026, 7, 12); // 12/08/2026

test("hôm nay cho khoảng một ngày", () => {
  const { fromDate, toDate } = getRangeParams("today", NOW);

  assert.equal(fromDate, "2026-08-12");
  assert.equal(toDate, "2026-08-12");
});

// days - 1: khoảng đã bao gồm hôm nay. Lùi đủ 7 ngày sẽ thành 8 ngày dữ liệu.
test("1 tuần là 7 ngày kể cả hôm nay", () => {
  const { fromDate, toDate } = getRangeParams("7d", NOW);

  assert.equal(fromDate, "2026-08-06");
  assert.equal(toDate, "2026-08-12");
});

test("1 tháng là 30 ngày kể cả hôm nay", () => {
  const { fromDate } = getRangeParams("30d", NOW);

  assert.equal(fromDate, "2026-07-14");
});

test("1 quý là 90 ngày kể cả hôm nay", () => {
  const { fromDate } = getRangeParams("90d", NOW);

  assert.equal(fromDate, "2026-05-15");
});

test("1 năm là 365 ngày kể cả hôm nay", () => {
  const { fromDate } = getRangeParams("365d", NOW);

  assert.equal(fromDate, "2025-08-13");
});

// Khoá lạ đến từ state hỏng hoặc URL bị sửa tay — phải ra khoảng dùng được,
// không phải NaN-NaN-NaN.
test("khoá lạ rơi về mốc mặc định", () => {
  const fallback = getRangeParams(DEFAULT_REVENUE_RANGE, NOW);

  assert.deepEqual(getRangeParams("abc", NOW), fallback);
  assert.deepEqual(getRangeParams(undefined, NOW), fallback);
  assert.deepEqual(getRangeParams(null, NOW), fallback);
});

test("mốc mặc định là 1 tháng", () => {
  assert.equal(DEFAULT_REVENUE_RANGE, "30d");
});

// Lùi ngày bắc qua mốc đầu năm phải ra ngày có thật, không phải tháng 0 hay
// ngày âm.
test("bắc qua đầu năm vẫn ra ngày có thật", () => {
  const { fromDate, toDate } = getRangeParams("7d", new Date(2026, 0, 2));

  assert.equal(fromDate, "2025-12-27");
  assert.equal(toDate, "2026-01-02");
});

test("bắc qua đầu tháng vẫn ra ngày có thật", () => {
  const { fromDate } = getRangeParams("7d", new Date(2026, 2, 3));

  assert.equal(fromDate, "2026-02-25", "2026 không nhuận nên tháng 2 có 28 ngày");
});

test("nhãn hiển thị đúng năm mốc theo thứ tự", () => {
  assert.deepEqual(
    Object.entries(REVENUE_RANGES).map(([key, preset]) => [key, preset.label]),
    [
      ["today", "Hôm nay"],
      ["7d", "1 tuần"],
      ["30d", "1 tháng"],
      ["90d", "1 quý"],
      ["365d", "1 năm"],
    ],
  );
});
