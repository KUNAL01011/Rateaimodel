import { ToolAnalyticsDay, ToolOwnership } from "@/models";
import { ApiError } from "@/utils";

function startOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export const analyticsService = {
  /* ── Record a page view (call from tool detail route) ── */
  async recordPageView(toolId: string) {
    const date = startOfDay();
    await ToolAnalyticsDay.findOneAndUpdate(
      { toolId, date },
      { $inc: { pageViews: 1 } },
      { upsert: true, new: true }
    );
  },

  async recordRecommendAppearance(toolId: string) {
    const date = startOfDay();
    await ToolAnalyticsDay.findOneAndUpdate(
      { toolId, date },
      { $inc: { recommAppearances: 1 } },
      { upsert: true, new: true }
    );
  },

  async recordRecommendClick(toolId: string) {
    const date = startOfDay();
    await ToolAnalyticsDay.findOneAndUpdate(
      { toolId, date },
      { $inc: { recommClicks: 1 } },
      { upsert: true, new: true }
    );
  },

  async recordReviewReceived(toolId: string) {
    const date = startOfDay();
    await ToolAnalyticsDay.findOneAndUpdate(
      { toolId, date },
      { $inc: { reviewsReceived: 1 } },
      { upsert: true, new: true }
    );
  },

  /* ── Owner: get analytics for owned tool ── */
  async getToolAnalytics(toolId: string, userId: string, days = 30) {
    // Verify ownership
    const ownership = await ToolOwnership.findOne({ toolId, userId });
    if (!ownership) throw new ApiError(403, "You don't own this tool");

    const since = new Date();
    since.setDate(since.getDate() - days);

    const data = await ToolAnalyticsDay.find({
      toolId,
      date: { $gte: startOfDay(since) },
    }).sort({ date: 1 });

    // Summary totals
    const totals = data.reduce(
      (acc, day) => ({
        pageViews: acc.pageViews + day.pageViews,
        uniqueVisitors: acc.uniqueVisitors + day.uniqueVisitors,
        recommAppearances: acc.recommAppearances + day.recommAppearances,
        recommClicks: acc.recommClicks + day.recommClicks,
        reviewsReceived: acc.reviewsReceived + day.reviewsReceived,
      }),
      { pageViews: 0, uniqueVisitors: 0, recommAppearances: 0, recommClicks: 0, reviewsReceived: 0 }
    );

    return { data, totals, days };
  },

  /* ── Admin: get analytics for any tool ── */
  async getToolAnalyticsAdmin(toolId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return ToolAnalyticsDay.find({
      toolId,
      date: { $gte: startOfDay(since) },
    }).sort({ date: 1 });
  },
};