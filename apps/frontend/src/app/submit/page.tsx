"use client";
import { useState } from "react";
import { useListTool, useAuth } from "@/lib/hooks";
import {
  Shield,
  CheckCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";

const TOOL_TYPES = [
  "LLM / Language Model",
  "Image Generation",
  "Video Generation",
  "Audio / Music",
  "Code Assistant",
  "AI Agent",
  "Chatbot / Bot",
  "Workflow Automation",
  "Data & Analytics",
  "Multimodal",
  "Other",
];
const PRICING_MODELS = [
  "Free",
  "Freemium",
  "Paid (Subscription)",
  "Pay-as-you-go",
  "Enterprise",
  "Open Source",
];

export default function SubmitPage() {
  const { user, signInWithGoogle, loading: authLoading } = useAuth();
  const { submitTool, loading, success } = useListTool();

  const [form, setForm] = useState({
    name: "",
    website: "",
    tagline: "",
    description: "",
    toolType: "",
    pricing: "",
    pricingDetails: "",
    hasApi: false,
    isOpenSource: false,
    ownerName: "",
    ownerWebsite: "",
    ownerEmail: "",
    contextWindow: "",
    modalities: [] as string[],
  });

  const update = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const toggleModality = (m: string) => {
    setForm(f => ({
      ...f,
      modalities: f.modalities.includes(m)
        ? f.modalities.filter(x => x !== m)
        : [...f.modalities, m],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitTool(form);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
            style={{ background: "rgba(16,185,129,0.15)" }}
          >
            <CheckCircle size={32} style={{ color: "var(--accent-green)" }} />
          </div>
          <h2
            className="font-display text-3xl mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Submission Received!
          </h2>
          <p
            className="text-sm mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            <strong style={{ color: "var(--text-primary)" }}>
              {form.name}
            </strong>{" "}
            has been submitted for review.
          </p>
          <p
            className="text-sm mb-8"
            style={{ color: "var(--text-secondary)" }}
          >
            Our team will verify and publish your tool within 1-3 business days.
            You'll be notified at <strong>{user?.email}</strong>.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="btn-secondary text-sm px-6 py-2.5">
              ← Back to Home
            </Link>
            <Link
              href="/categories"
              className="btn-primary text-sm px-6 py-2.5"
            >
              Browse Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <section
        className="px-6 py-16 relative overflow-hidden"
        style={{
          background: "var(--bg-raised)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-3xl mx-auto relative">
          <div className="flex items-center gap-2.5 mb-5">
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: "var(--accent)",
                display: "inline-block",
              }}
            />
            <span className="eyebrow">For builders · Free to list</span>
          </div>
          <h1
            className="font-display text-4xl md:text-5xl mb-4"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            Get Your AI Discovered
          </h1>
          <p
            className="text-lg mb-8 max-w-xl"
            style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}
          >
            List your model, agent, or app where developers and creators come to
            compare AI tools. Listing is free — reach people actively searching
            for tools like yours.
          </p>
          <div className="flex flex-wrap gap-6">
            {[
              { val: "Free", label: "To list" },
              { val: "1–3 days", label: "Review time" },
              { val: "Verified", label: "Reviews only" },
            ].map(s => (
              <div key={s.label}>
                <p
                  className="font-display text-2xl font-bold"
                  style={{ color: "var(--primary-bright)" }}
                >
                  {s.val}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Auth gate */}
        {!user && (
          <div
            className="rounded-2xl p-8 mb-8 text-center"
            style={{
              background: "rgba(30,58,95,0.06)",
              border: "1px solid rgba(30,58,95,0.2)",
            }}
          >
            <Shield
              size={24}
              className="mx-auto mb-3"
              style={{ color: "var(--primary)" }}
            />
            <h3
              className="font-display text-xl mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Sign in to submit
            </h3>
            <p
              className="text-sm mb-5"
              style={{ color: "var(--text-secondary)" }}
            >
              We verify ownership via Google login to prevent spam and ensure
              quality listings.
            </p>
            <button
              onClick={signInWithGoogle}
              disabled={authLoading}
              className="mx-auto flex items-center justify-center gap-3 py-3 px-8 rounded-lg font-medium text-sm transition-colors hover:bg-[var(--bg-raised)]"
              style={{
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-strong)",
              }}
            >
              {authLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 18 18">
                  <path
                    fill="#4285F4"
                    d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                  />
                  <path
                    fill="#34A853"
                    d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
                  />
                  <path
                    fill="#EA4335"
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
                  />
                </svg>
              )}
              {authLoading ? "Signing in..." : "Continue with Google"}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Tool info */}
          <section className="card p-7">
            <div className="flex items-baseline gap-3 mb-6">
              <span
                className="font-mono"
                style={{ fontSize: 13, color: "var(--text-muted)" }}
              >
                01
              </span>
              <h2
                className="font-display text-xl"
                style={{ color: "var(--text-primary)" }}
              >
                Tool Information
              </h2>
            </div>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Tool Name *
                  </label>
                  <input
                    value={form.name}
                    onChange={e => update("name", e.target.value)}
                    required
                    placeholder="e.g. SuperCoder AI"
                    className="input-base"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Website URL *
                  </label>
                  <input
                    value={form.website}
                    onChange={e => update("website", e.target.value)}
                    required
                    type="url"
                    placeholder="https://yourtool.ai"
                    className="input-base"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Tagline *
                </label>
                <input
                  value={form.tagline}
                  onChange={e => update("tagline", e.target.value)}
                  required
                  maxLength={100}
                  placeholder="One punchy sentence that captures what your tool does"
                  className="input-base"
                />
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  {form.tagline.length}/100
                </p>
              </div>

              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Full Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={e => update("description", e.target.value)}
                  required
                  rows={4}
                  placeholder="Describe what your tool does, who it's for, and what makes it unique. Aim for 100-300 words."
                  className="input-base resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Tool Type *
                  </label>
                  <select
                    value={form.toolType}
                    onChange={e => update("toolType", e.target.value)}
                    required
                    className="input-base appearance-none"
                  >
                    <option value="">Select type...</option>
                    {TOOL_TYPES.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Pricing Model *
                  </label>
                  <select
                    value={form.pricing}
                    onChange={e => update("pricing", e.target.value)}
                    required
                    className="input-base appearance-none"
                  >
                    <option value="">Select pricing...</option>
                    {PRICING_MODELS.map(p => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Pricing Details
                </label>
                <input
                  value={form.pricingDetails}
                  onChange={e => update("pricingDetails", e.target.value)}
                  placeholder="e.g. Free up to 10 requests/day · Pro $20/mo for unlimited"
                  className="input-base"
                />
              </div>

              {/* Modalities */}
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  Supported Modalities
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Text", "Image", "Audio", "Video", "Code", "3D"].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleModality(m)}
                      className="px-4 py-2 rounded-lg text-xs transition-all"
                      style={{
                        background: form.modalities.includes(m)
                          ? "var(--primary)"
                          : "var(--bg-raised)",
                        color: form.modalities.includes(m)
                          ? "white"
                          : "var(--text-secondary)",
                        border: `1px solid ${form.modalities.includes(m) ? "var(--primary)" : "var(--border)"}`,
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-col sm:flex-row gap-4">
                {[
                  {
                    key: "hasApi",
                    label: "Has Public API",
                    desc: "Developers can integrate via API",
                  },
                  {
                    key: "isOpenSource",
                    label: "Open Source",
                    desc: "Source code is publicly available",
                  },
                ].map(toggle => (
                  <div
                    key={toggle.key}
                    className="flex-1 flex items-center justify-between p-4 rounded-xl"
                    style={{
                      background: "var(--bg-raised)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {toggle.label}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {toggle.desc}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        update(
                          toggle.key,
                          !form[toggle.key as keyof typeof form]
                        )
                      }
                      className="relative w-11 h-6 rounded-full transition-colors shrink-0"
                      style={{
                        background: form[toggle.key as keyof typeof form]
                          ? "var(--primary)"
                          : "var(--border-strong)",
                      }}
                    >
                      <span
                        className="absolute top-0.5 transition-transform rounded-full w-5 h-5 bg-white shadow"
                        style={{
                          transform: form[toggle.key as keyof typeof form]
                            ? "translateX(26px)"
                            : "translateX(2px)",
                        }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Owner info */}
          <section className="card p-7">
            <div className="flex items-baseline gap-3 mb-2">
              <span
                className="font-mono"
                style={{ fontSize: 13, color: "var(--text-muted)" }}
              >
                02
              </span>
              <h2
                className="font-display text-xl"
                style={{ color: "var(--text-primary)" }}
              >
                Provider Information
              </h2>
            </div>
            <p
              className="text-sm mb-6 ml-7"
              style={{ color: "var(--text-secondary)" }}
            >
              Tell us about the company or individual who built this tool.
            </p>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Company / Creator Name *
                  </label>
                  <input
                    value={form.ownerName}
                    onChange={e => update("ownerName", e.target.value)}
                    required
                    placeholder="Acme AI Inc."
                    className="input-base"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Contact Email *
                  </label>
                  <input
                    value={form.ownerEmail}
                    onChange={e => update("ownerEmail", e.target.value)}
                    required
                    type="email"
                    placeholder="hello@yourtool.ai"
                    className="input-base"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="flex items-center justify-between pt-2">
            <p
              className="text-xs max-w-xs"
              style={{ color: "var(--text-muted)" }}
            >
              By submitting, you confirm you have the right to list this tool
              and agree to our Terms of Service.
            </p>
            <button
              type="submit"
              disabled={loading || !user}
              className="btn-primary px-8 py-3 text-sm flex items-center gap-2"
              style={{ opacity: !user || loading ? 0.5 : 1 }}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  Submit for Review <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
