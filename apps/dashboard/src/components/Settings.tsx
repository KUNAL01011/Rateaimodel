import { useEffect, useRef, useState } from "react";
import { settingsApi, type SiteSettings } from "../lib/api";
import { useToast } from "../hooks";
import { PageLoader, ErrorBanner, ToastContainer } from "./ui";
import { PageHeading, FormCard, Field, TextArea, Toggle } from "./form-kit";

const MUTED = "#6E6A5E";
const FAINT = "#9B9484";
const GREEN = "#0E7C66";

export function Settings() {
  const { toasts, addToast, removeToast } = useToast();
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const dirty = useRef(false);

  useEffect(() => {
    settingsApi
      .get()
      .then(setForm)
      .catch(e => setError(e?.message ?? "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  // Debounced autosave
  useEffect(() => {
    if (!form || !dirty.current) return;
    setStatus("saving");
    const t = setTimeout(async () => {
      try {
        await settingsApi.update(form);
        setStatus("saved");
      } catch (e: any) {
        addToast(e?.message ?? "Save failed", "error");
        setStatus("idle");
      }
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  if (loading) return <PageLoader />;
  if (error) return <ErrorBanner message={error} />;
  if (!form) return null;

  const set = (k: keyof SiteSettings) => (v: any) => {
    dirty.current = true;
    setForm(f => (f ? { ...f, [k]: v } : f));
  };

  return (
    <div style={{ paddingBottom: 56 }}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <PageHeading
        title="Settings"
        desc="Company details and site-wide content. SEO defaults live on the SEO page; changes here save automatically."
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <FormCard title="Brand" desc="Name and positioning used across the site and footer.">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Site name" value={form.siteName} onChange={set("siteName")} />
              <Field label="Tagline" max={200} value={form.tagline} onChange={set("tagline")} />
              <TextArea label="Description" max={1000} rows={3} value={form.defaultDescription} onChange={set("defaultDescription")} hint="Used in the footer and as the fallback meta description." />
            </div>
          </FormCard>

          <FormCard title="Content">
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <Toggle checked={form.blogEnabled} onChange={set("blogEnabled")} label="Blog enabled" desc="Show the blog and its sitemap entries on the public site." />
              <Field label="Announcement banner" value={form.announcement ?? ""} onChange={set("announcement")} placeholder="Shown site-wide when set — leave empty to hide." />
            </div>
          </FormCard>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <FormCard title="Social profiles" desc="Linked from the site footer when filled in.">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="X / Twitter handle" value={form.twitterHandle ?? ""} onChange={set("twitterHandle")} placeholder="@rateai" />
              <Field label="X / Twitter URL" value={form.twitterUrl ?? ""} onChange={set("twitterUrl")} placeholder="https://x.com/…" />
              <Field label="GitHub URL" value={form.githubUrl ?? ""} onChange={set("githubUrl")} placeholder="https://github.com/…" />
              <Field label="LinkedIn URL" value={form.linkedinUrl ?? ""} onChange={set("linkedinUrl")} placeholder="https://linkedin.com/…" />
            </div>
          </FormCard>

          <FormCard title="Ownership">
            <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
              RateAI is owned &amp; operated by{" "}
              <strong style={{ color: "#16181D" }}>Kunamix Digital Solutions</strong>. This credit shows in the public footer.
            </p>
          </FormCard>
        </div>
      </div>

      {/* Autosave footer */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          marginTop: 22,
          padding: "12px 4px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderTop: "1px solid rgba(26,30,38,.08)",
          background: "#FAF8F2",
          fontSize: 13,
          color: status === "saving" ? MUTED : status === "saved" ? GREEN : FAINT,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: status === "saving" ? "#B0820C" : status === "saved" ? GREEN : "rgba(26,30,38,.2)",
          }}
        />
        {status === "saving" ? "Saving…" : status === "saved" ? "All changes saved" : "Edits save automatically"}
      </div>
    </div>
  );
}
