import { SiteSettings, type ISiteSettings } from "@/models";

/**
 * Site settings are stored as a single document. `get` lazily creates it with
 * sensible defaults on first access so the public site always has values.
 */
export const settingsService = {
  async get(): Promise<ISiteSettings> {
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});
    return settings;
  },

  async update(data: Record<string, any>): Promise<ISiteSettings> {
    const settings = await settingsService.get();
    // Only assign known, provided fields.
    const allowed = [
      "siteName",
      "tagline",
      "defaultTitle",
      "titleTemplate",
      "defaultDescription",
      "keywords",
      "ogImageUrl",
      "canonicalBaseUrl",
      "twitterHandle",
      "pageSeo",
      "googleAnalyticsId",
      "googleSiteVerification",
      "twitterUrl",
      "githubUrl",
      "linkedinUrl",
      "blogEnabled",
      "announcement",
    ];
    for (const key of allowed) {
      if (data[key] !== undefined) (settings as any)[key] = data[key];
    }
    await settings.save();
    return settings;
  },
};
