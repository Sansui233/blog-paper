import { siteInfo } from "site.config";

/**
 * 获取站点配置的时区偏移量（分钟）
 * Asia/Shanghai = +480 (UTC+8)
 */
function getSiteTimezoneOffset(): number {
  const tz = siteInfo.timeZone ?? "Asia/Shanghai";
  // 使用一个固定日期来计算时区偏移
  const date = new Date("2020-01-01T12:00:00Z");
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    hour12: false,
  });
  const localHour = parseInt(formatter.format(date), 10);
  // UTC 12:00 在目标时区的小时数，差值即为偏移
  return (localHour - 12) * 60;
}

/**
 * 解析日期字符串为 Date 对象
 * 对于无时区的字符串，按 siteInfo.timeZone 解析
 * @param str 日期字符串或 Date 对象,
 * 日期格式：
 *   - 2025-12-29T22:10:00.000Z
 *   - 2026-01-06 05:24:47
 */
export function parseDate(str: string | Date): Date {
  if (str instanceof Date) {
    return str;
  }

  // 检测是否已有时区信息 (Z, +XX:XX, -XX:XX)
  const hasTimezone = /Z|[+-]\d{2}:\d{2}$/.test(str);

  if (hasTimezone) {
    const date = new Date(str);
    if (date.toString() !== "Invalid Date") {
      return date;
    }
  }

  // 无时区信息，按站点时区解析
  // 格式: "2021-01-01 00:00" 或 "2021-01-01"
  const normalized = str.replace(" ", "T");
  const date = new Date(normalized);

  if (date.toString() !== "Invalid Date") {
    // 调整时区：浏览器按本地时区解析，需要修正为站点时区
    const localOffset = date.getTimezoneOffset(); // 本地时区偏移（分钟，西为正）
    const siteOffset = getSiteTimezoneOffset(); // 站点时区偏移（分钟，东为正）
    // 修正公式：UTC = local + localOffset, 站点时间 = UTC + siteOffset
    // 所以：站点时间 = local + localOffset + siteOffset
    // 但我们输入的是站点时间，要得到正确的 UTC：UTC = 输入 - siteOffset
    const corrected = new Date(
      date.getTime() - siteOffset * 60 * 1000 - localOffset * 60 * 1000,
    );
    return corrected;
  }

  // fallback: 尝试只取日期部分
  const dateOnly = str.slice(0, 10) + "T23:59:59";
  const fallbackDate = new Date(dateOnly);
  if (fallbackDate.toString() !== "Invalid Date") {
    const localOffset = fallbackDate.getTimezoneOffset();
    const siteOffset = getSiteTimezoneOffset();
    return new Date(
      fallbackDate.getTime() - siteOffset * 60 * 1000 - localOffset * 60 * 1000,
    );
  }

  console.error(
    `[date.ts] error: unable to parse date string "${str}"\n\tset date to -1`,
  );
  return new Date(-1);
}

/**
 * 格式化日期为 "2021-01-01 00:00" 格式（用户本地时区）
 */
export function dateToYMDHM(d: Date): string {
  const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = dateFormatter.formatToParts(d);
  const lookup = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  // node.js will return "24" for midnight "00". convert to ECMA-402 standard "00"
  const hour = lookup.hour === "24" ? "00" : lookup.hour;
  return `${lookup.year}-${lookup.month}-${lookup.day} ${hour}:${lookup.minute}`;
}
