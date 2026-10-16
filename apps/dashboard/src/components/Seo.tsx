import { useEffect, useState } from "react";
import { settingsApi, type SiteSettings } from "../lib/api";
import { useToast } from "../hooks";
import { PageLoader, ErrorBanner, Button, ToastContainer } from "./ui";
import {
  PageHeading,
  FormCard,
  Field,
  TextArea,
  Toggle,
  Tabs,
  Segmented,
  ImageDrop,
} from "./form-kit";

interface PageSeo {
  path: string;
  label?: string;
  title?: string;
  description?: string;
  keywords?: string[];
  ogImageUrl?: string;
  canonical?: string;
  noindex?: boolean;
}

const PAGES: { path: string; label: string }[] = [
  { path: "/", label: "Home" },
  { path: "/search", label: "Search / Directory" },
  { path: "/categories", label: "Categories" },
  { path: "/leaderboard", label: "Leaderboard" },
  { path: "/blog", label: "Blog" },
  { path: "/submit", label: "Submit a tool" },
];

const INK_TEXT = "#16181D";
const MUTED = "#6E6A5E";
const FAINT = "#9B9484";
const LINE = "rgba(26,30,38,.1)";

function GooglePreview({
  base,
  path,
  title,
  description,
}: {
  base: string;
  path: string;
  title: string;
  description: string;
}) {
  const url = `${base.replace(/^https?:\/\//, "")}${path === "/" ? "" : path}`;
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, padding: 18, background: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
        <span style={{ width: 26, height: 26, borderRadius: "50%", background: "#1E3A5F", color: "#E6B84C", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>★</span>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontSize: 13, color: INK_TEXT }}>RateAI</div>
          <div style={{ fontSize: 12, color: "#4d7a2e" }}>{url}</div>
        </div>
      </div>
      <div style={{ fontSize: 19, color: "#1a0dab", marginBottom: 3, lineHeight: 1.3 }}>
        {title.length > 60 ? title.slice(0, 60) + "…" : title}
      </div>
      <div style={{ fontSize: 13, color: "#4d5156", lineHeight: 1.5 }}>
        {description.length > 160 ? description.slice(0, 160) + "…" : description}
      </div>
    </div>
  );
}

function SocialPreview({
  base,
  image,
  title,
  description,
}: {
  base: string;
  image?: string;
  title: string;
  description: string;
}) {
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden", background: "#fff", maxWidth: 460 }}>
      <div style={{ aspectRatio: "1.91 / 1", background: "#F1EDE2", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {image ? (
          <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 11, color: FAINT, fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
            1200 × 630
          </span>
        )}
      </div>
      <div style={{ padding: 14, borderTop: `1px solid ${LINE}` }}>
        <div style={{ fontSize: 11, color: FAINT, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
          {base.replace(/^https?:\/\//, "")}
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: INK_TEXT, lineHeight: 1.3 }}>{title}</div>
        <div style={{ fontSize: 13, color: MUTED, marginTop: 3, lineHeight: 1.45 }}>
          {description.length > 110 ? description.slice(0, 110) + "…" : description}
        </div>
      </div>
    </div>
  );
}

export function Seo() {
  const { toasts, addToast, removeToast } = useToast();
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("pages");
  const [activePath, setActivePath] = useState("/");
  const [preview, setPreview] = useState("google");

  useEffect(() => {
    settingsApi
      .get()
      .then(setForm)
      .catch(e => setError(e?.message ?? "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (error) return <ErrorBanner message={error} />;
  if (!form) return null;

  const base = (form.canonicalBaseUrl || "https://rateaimodel.com").replace(/\/$/, "");
  const getPage = (path: string): PageSeo =>
    form.pageSeo.find(p => p.path === path) ?? { path };

  const patchPage = (path: string, patch: Partial<PageSeo>) => {
    setForm(f => {
      if (!f) return f;
      const existing = f.pageSeo.find(p => p.path === path);
      const next = existing
        ? f.pageSeo.map(p => (p.path === path ? { ...p, ...patch } : p))
        : [...f.pageSeo, { path, ...patch }];
      return { ...f, pageSeo: next };
    });
  };

  const set = (k: keyof SiteSettings) => (v: any) =>
    setForm(f => (f ? { ...f, [k]: v } : f));

  const save = async () => {
    setSaving(true);
    try {
      const updated = await settingsApi.update(form);
      setForm(updated);
      addToast("SEO settings saved — live on the site", "success");
    } catch (e: any) {
      addToast(e?.message ?? "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const page = getPage(activePath);
  const label = PAGES.find(p => p.path === activePath)?.label ?? activePath;
  const effTitle = page.title || form.defaultTitle;
  const effDesc = page.description || form.defaultDescription;
  const effImg = page.ogImageUrl || form.ogImageUrl;

  const isConfigured = (path: string) => {
    const p = form.pageSeo.find(x => x.path === path);
    return !!(p && (p.title || p.description || p.ogImageUrl));
  };

  return (
    <div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <PageHeading
          title="SEO"
          desc={`Control how every page of ${base.replace(/^https?:\/\//, "")} appears on Google and social networks.`}
        />
        <Button variant="primary" loading={saving} onClick={save}>
          Save changes
        </Button>
      </div>

      <Tabs
        tabs={[
          { id: "pages", label: "Pages" },
          { id: "defaults", label: "Global defaults" },
          { id: "integrations", label: "Integrations" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "pages" && (
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 22, alignItems: "start" }}>
          {/* Rail */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {PAGES.map(p => {
              const on = activePath === p.path;
              return (
                <button
                  key={p.path}
                  onClick={() => setActivePath(p.path)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: `1px solid ${on ? "rgba(30,58,95,.3)" : LINE}`,
                    background: on ? "#fff" : "transparent",
                    boxShadow: on ? "0 1px 3px rgba(20,24,31,.06)" : "none",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: INK_TEXT }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: FAINT, fontFamily: "var(--font-mono)" }}>{p.path}</div>
                  </div>
                  <span style={{ color: isConfigured(p.path) ? "#0E7C66" : "rgba(26,30,38,.2)", fontSize: 13 }}>
                    {isConfigured(p.path) ? "✓" : "•"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Editor */}
          <FormCard
            title={label}
            actions={
              <Segmented
                options={[
                  { id: "google", label: "Google" },
                  { id: "social", label: "Social card" },
                ]}
                value={preview}
                onChange={setPreview}
              />
            }
          >
            <div style={{ marginBottom: 20 }}>
              {preview === "google" ? (
                <GooglePreview base={base} path={activePath} title={effTitle} description={effDesc} />
              ) : (
                <SocialPreview base={base} image={effImg} title={effTitle} description={effDesc} />
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field
                label="Meta title"
                max={60}
                value={page.title ?? ""}
                onChange={v => patchPage(activePath, { title: v })}
                hint="Recommended 50–60 characters. Leave empty to use the global default."
              />
              <TextArea
                label="Meta description"
                max={160}
                rows={3}
                value={page.description ?? ""}
                onChange={v => patchPage(activePath, { description: v })}
                hint="Recommended 120–160 characters. Shown under the title in search results."
              />
              <Field
                label="Keywords"
                value={(page.keywords ?? []).join(", ")}
                onChange={v => patchPage(activePath, { keywords: v.split(",").map(s => s.trim()).filter(Boolean) })}
                placeholder="comma separated focus phrases"
              />
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: INK_TEXT, display: "block", marginBottom: 7 }}>
                  Social share image
                </label>
                <ImageDrop
                  value={page.ogImageUrl}
                  onChange={v => patchPage(activePath, { ogImageUrl: v })}
                  folder="og"
                  height={180}
                  hint="1200 × 630 px. Falls back to the site default."
                  onError={m => addToast(m, "error")}
                />
              </div>
              <Field
                label="Canonical URL"
                value={page.canonical ?? ""}
                onChange={v => patchPage(activePath, { canonical: v })}
                placeholder={`${base}${activePath === "/" ? "" : activePath}`}
                hint="Only set if this content is published elsewhere first."
              />
              <Toggle
                checked={page.noindex ?? false}
                onChange={v => patchPage(activePath, { noindex: v })}
                label="Hide from search engines"
                desc="Adds noindex and removes the page from the sitemap."
              />
            </div>
          </FormCard>
        </div>
      )}

      {tab === "defaults" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 720 }}>
          <FormCard title="Global defaults" desc="Used on any page without its own SEO override.">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Default title" max={60} value={form.defaultTitle} onChange={set("defaultTitle")} />
              <Field label="Title template" value={form.titleTemplate} onChange={set("titleTemplate")} hint="Use %s for the page name, e.g. “%s · RateAI”." />
              <TextArea label="Default description" max={160} rows={3} value={form.defaultDescription} onChange={set("defaultDescription")} />
              <Field label="Keywords" value={form.keywords.join(", ")} onChange={v => set("keywords")(v.split(",").map(s => s.trim()).filter(Boolean))} />
              <Field label="Canonical base URL" value={form.canonicalBaseUrl ?? ""} onChange={set("canonicalBaseUrl")} placeholder="https://rateaimodel.com" hint="Drives canonical URLs and the sitemap." />
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: INK_TEXT, display: "block", marginBottom: 7 }}>
                  Default social image (OG)
                </label>
                <ImageDrop value={form.ogImageUrl} onChange={set("ogImageUrl")} folder="og" height={180} hint="1200 × 630 px." onError={m => addToast(m, "error")} />
              </div>
            </div>
          </FormCard>
        </div>
      )}

      {tab === "integrations" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 720 }}>
          <FormCard title="Analytics & verification" desc="Paste IDs to enable Google Analytics and Search Console.">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Google Analytics ID" value={form.googleAnalyticsId ?? ""} onChange={set("googleAnalyticsId")} placeholder="G-XXXXXXXXXX" prefix="GA" />
              <Field label="Google site verification" value={form.googleSiteVerification ?? ""} onChange={set("googleSiteVerification")} placeholder="verification token" />
              <Field label="Twitter / X handle" value={form.twitterHandle ?? ""} onChange={set("twitterHandle")} placeholder="@rateai" />
            </div>
          </FormCard>
        </div>
      )}
    </div>
  );
}
