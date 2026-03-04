import db from "../db";

export interface UrlAnalytics {
    totalClicks: number;
    clicksLast24h: number;
}

export function getUrlAnalytics(shortCode: string): UrlAnalytics {
    const totalRow = db
        .prepare(
            `
      SELECT COUNT(*) as count
      FROM clicks
      WHERE short_code = ?
      `
        )
        .get(shortCode) as { count: number };

    const last24hRow = db
        .prepare(
            `
      SELECT COUNT(*) as count
      FROM clicks
      WHERE short_code = ?
      AND clicked_at >= datetime('now', '-1 day')
      `
        )
        .get(shortCode) as { count: number };

    return {
        totalClicks: totalRow.count,
        clicksLast24h: last24hRow.count,
    };
}