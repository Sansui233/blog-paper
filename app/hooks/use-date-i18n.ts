import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { dateToYMDHM } from "lib/date";

/**
 * Hook for internationalized date formatting
 * Uses useTranslation internally to subscribe to language changes
 */
export function useDateI18n() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;

  /**
   * Get English ordinal suffix (1st, 2nd, 3rd, 4th...)
   */
  const getEngOrdinalSuffix = useCallback((day: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = day % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  }, []);

  /**
   * Format date with i18n
   * @param d Date object
   * @param mode 'dateNatural' = "Jan 6th, 2026", 'dateYMD' = "2026-01-06"
   */
  const dateI18n = useCallback(
    (d: Date, mode: "dateYMD" | "dateNatural" = "dateNatural"): string => {
      if (mode !== "dateNatural" || lang !== "en") {
        return t(`ui.${mode}`, {
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          day: d.getDate(),
          hour: d.getHours(),
          minute: d.getMinutes(),
        });
      } else {
        return t(`ui.${mode}`, {
          year: d.getFullYear(),
          month: new Intl.DateTimeFormat("en-US", { month: "short" }).format(d),
          day: d.getDate(),
          daySuffix: getEngOrdinalSuffix(d.getDate()),
          hour: d.getHours(),
          minute: d.getMinutes(),
        });
      }
    },
    [t, lang, getEngOrdinalSuffix],
  );

  /**
   * Format relative time (x minutes ago)
   */
  const dateRelative = useCallback(
    (d: Date): string => {
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return t("ui.timeJustNow");
      if (minutes < 60) return t("ui.timeMinutesAgo", { count: minutes });
      if (hours < 24) return t("ui.timeHoursAgo", { count: hours });
      if (days < 7) return t("ui.timeDaysAgo", { count: days });

      // Over 7 days, show actual date
      return dateToYMDHM(d);
    },
    [t],
  );

  /**
   * Parse Memo ID and return display string
   * If parsing fails, returns the ID itself
   */
  const parseMemoIdDisplay = useCallback(
    (id: string, parseDate: (str: string) => Date): string => {
      const parsed = parseDate(id);
      if (parsed.getTime() === -1) {
        return id;
      }
      return dateRelative(parsed);
    },
    [dateRelative],
  );

  return { dateI18n, dateRelative, parseMemoIdDisplay };
}

export default useDateI18n;
