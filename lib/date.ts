import i18next from "../locales/i18n";
import { siteInfo } from '../site.config';


// format date to "2021-01-01 00:00"
export function dateToYMDMM(d: Date): string {
  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: siteInfo.timeZone ?? 'Asia/Shanghai'
  })

  const parts = dateFormatter.formatToParts(d);
  const lookup = Object.fromEntries(parts.map(p => [p.type, p.value]));
  // node.js will return "24" for midnight "00". convert to ECMA-402 standard "00"
  const hour = lookup.hour === "24" ? "00" : lookup.hour;
  return `${lookup.year}-${lookup.month}-${lookup.day} ${hour}:${lookup.minute}`;
}

// todo test cases "2021-01-01 00:00"
// "year-month-day" is required
export function parseDate(str: string | Date): Date {
  if (str instanceof Date) {
    return str
  }
  let date = new Date(str)
  if (date.toString() !== "Invalid Date") {
    return date
  } else {
    const newstr = str.slice(0, 11) + "23:59:59" // fallback
    let date = new Date(newstr)
    if (date.toString() !== "Invalid Date") {
      return date
    } else {
      console.error(`[date.ts] error: unable to parse date string "${newstr}"\n\tset date to -1`)
      return new Date(-1)
    }
  }
}


export function dateI18n(d: Date, mode: "dateYMD" | "dateNatural" = "dateNatural"): string {
  const t = i18next.t
  const lang = i18next.resolvedLanguage

  function getEngOrdinalSuffix(day: number) {
    // From https://community.shopify.com/c/Shopify-Design/Ordinal-Number-in-javascript-1st-2nd-3rd-4th/m-p/72156
    const s = ["th", "st", "nd", "rd"],
      v = day % 100;
    return (s[(v - 20) % 10] || s[v] || s[0]);
  }

  if (mode !== "dateNatural" || lang !== 'en') {
    return t(mode, {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      hour: d.getHours(),
      minute: d.getMinutes()
    })
  } else {
    return t(mode, {
      year: d.getFullYear(),
      month: new Intl.DateTimeFormat("en-US", { month: "short" }).format(d),
      day: d.getDate(),
      daySuffix: getEngOrdinalSuffix(d.getDate()),
      hour: d.getHours(),
      minute: d.getMinutes(),
    })
  }
}