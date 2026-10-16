import { useState, useRef, useCallback } from "react";
import {
  toolsApi,
  submissionsApi,
  type Tool,
  type BulkImportReport,
  TOOL_TYPE_OPTIONS,
  PRICING_TYPE_OPTIONS,
} from "../lib/api";
import { useAsync, useDebounce, useToast } from "../hooks";
import {
  PageLoader,
  ErrorBanner,
  Badge,
  Button,
  SectionHeader,
  Empty,
  Table,
  Tr,
  Td,
  Pagination,
  Input,
  Spinner,
  ToastContainer,
} from "./ui";

// ─── helpers ─────────────────────────────────────────────────────────────────
const PRICING_VARIANT: Record<
  string,
  "success" | "warning" | "info" | "purple" | "default"
> = {
  free: "success",
  open_source_free: "success",
  freemium: "warning",
  subscription: "info",
  pay_per_token: "info",
  pay_per_use: "info",
  enterprise: "purple",
};
const TYPE_LABELS: Record<string, string> = {
  llm_model: "LLM",
  chat_product: "Chat",
  search_product: "Search",
  coding_tool: "Coding",
  image_model: "Image",
  video_model: "Video",
  audio_model: "Audio",
  embedding_model: "Embed",
  agent_framework: "Agent",
  multimodal_tool: "Multimodal",
  open_source_model: "Open Source",
};

// ─── field helpers ────────────────────────────────────────────────────────────
interface ToolFormState {
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  toolType: string;
  pricingType: string;
  websiteUrl: string;
  apiDocsUrl: string;
  githubUrl: string;
  paperUrl: string;
  logoUrl: string;
  modelFamily: string;
  contextWindowTokens: string;
  maxOutputTokens: string;
  hasApi: boolean;
  isOpenSource: boolean;
  hasFreeTier: boolean;
  isFeatured: boolean;
  verificationStatus: string;
}

const EMPTY_FORM: ToolFormState = {
  slug: "",
  name: "",
  shortDescription: "",
  fullDescription: "",
  toolType: "llm_model",
  pricingType: "freemium",
  websiteUrl: "",
  apiDocsUrl: "",
  githubUrl: "",
  paperUrl: "",
  logoUrl: "",
  modelFamily: "",
  contextWindowTokens: "",
  maxOutputTokens: "",
  hasApi: false,
  isOpenSource: false,
  hasFreeTier: false,
  isFeatured: false,
  verificationStatus: "unverified",
};

function toolToForm(t: Tool): ToolFormState {
  return {
    slug: t.slug,
    name: t.name,
    shortDescription: t.shortDescription,
    fullDescription: t.fullDescription ?? "",
    toolType: t.toolType,
    pricingType: t.pricingType,
    websiteUrl: t.websiteUrl ?? "",
    apiDocsUrl: t.apiDocsUrl ?? "",
    githubUrl: t.githubUrl ?? "",
    paperUrl: t.paperUrl ?? "",
    logoUrl: t.logoUrl ?? "",
    modelFamily: t.modelFamily ?? "",
    contextWindowTokens: t.contextWindowTokens
      ? String(t.contextWindowTokens)
      : "",
    maxOutputTokens: t.maxOutputTokens ? String(t.maxOutputTokens) : "",
    hasApi: t.hasApi,
    isOpenSource: t.isOpenSource,
    hasFreeTier: t.hasFreeTier,
    isFeatured: t.isFeatured,
    verificationStatus: t.verificationStatus,
  };
}

// ─── Logo Upload Zone ─────────────────────────────────────────────────────────
function LogoUploadZone({
  file,
  preview,
  onFile,
  currentUrl,
}: {
  file: File | null;
  preview: string | null;
  onFile: (f: File | null) => void;
  currentUrl?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) onFile(f);
  };

  const displaySrc = preview || currentUrl;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#6E6A5E",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Logo
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${drag ? "rgba(30,58,95,.6)" : "rgba(26,30,38,.1)"}`,
          borderRadius: 10,
          padding: "18px 14px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          cursor: "pointer",
          transition: "all .15s",
          background: drag ? "rgba(30,58,95,.05)" : "rgba(26,30,38,.02)",
        }}
      >
        {displaySrc ? (
          <img
            src={displaySrc}
            alt="logo preview"
            style={{
              width: 52,
              height: 52,
              borderRadius: 8,
              objectFit: "contain",
              background: "rgba(26,30,38,.05)",
              border: "1px solid rgba(26,30,38,.08)",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 8,
              background: "rgba(26,30,38,.04)",
              border: "1px solid rgba(26,30,38,.07)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            🖼️
          </div>
        )}
        <div>
          <p style={{ fontSize: 13, color: "#474C57", fontWeight: 600 }}>
            {file ? file.name : "Drop image or click to browse"}
          </p>
          <p style={{ fontSize: 11, color: "#9B9484", marginTop: 2 }}>
            PNG, JPG, WebP, SVG · max 2MB · uploads to Cloudinary
          </p>
          {file && (
            <button
              onClick={e => {
                e.stopPropagation();
                onFile(null);
              }}
              style={{
                marginTop: 4,
                fontSize: 11,
                color: "#B23A2B",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              ✕ Remove
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Field Row ────────────────────────────────────────────────────────────────
function FieldRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {children}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#6E6A5E",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          padding: "9px 13px",
          background: "rgba(26,30,38,.03)",
          border: "1px solid rgba(26,30,38,.08)",
          borderRadius: 8,
          color: "#16181D",
          fontSize: 13,
          outline: "none",
          fontFamily: "inherit",
        }}
      >
        {options.map(o => (
          <option
            key={o.value}
            value={o.value}
            style={{ background: "#FFFFFF" }}
          >
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        fontSize: 13,
        color: "#474C57",
      }}
    >
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          border: `1.5px solid ${checked ? "#1E3A5F" : "rgba(26,30,38,.15)"}`,
          background: checked ? "#1E3A5F" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          transition: "all .15s",
        }}
      >
        {checked && (
          <span style={{ color: "white", fontSize: 10, lineHeight: 1 }}>✓</span>
        )}
      </div>
      {label}
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#6E6A5E",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        style={{
          padding: "9px 13px",
          background: "rgba(26,30,38,.03)",
          border: "1px solid rgba(26,30,38,.08)",
          borderRadius: 8,
          color: "#16181D",
          fontSize: 13,
          outline: "none",
          resize: "vertical",
          fontFamily: "inherit",
          boxSizing: "border-box",
          width: "100%",
        }}
      />
    </div>
  );
}

// ─── Tool Form Modal ──────────────────────────────────────────────────────────
function ToolFormModal({
  open,
  onClose,
  initial,
  mode,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Tool;
  mode: "create" | "edit";
  onSaved: (msg: string) => void;
}) {
  const [form, setForm] = useState<ToolFormState>(
    initial ? toolToForm(initial) : EMPTY_FORM
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = (k: keyof ToolFormState) => (v: any) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleLogoFile = (f: File | null) => {
    setLogoFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = e => setLogoPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setLogoPreview(null);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setErr("Name is required");
      return;
    }
    if (!form.slug.trim() && mode === "create") {
      setErr("Slug is required");
      return;
    }
    if (!form.shortDescription.trim()) {
      setErr("Short description is required");
      return;
    }

    setSaving(true);
    setErr(null);

    try {
      const payload: Record<string, any> = {
        ...form,
        contextWindowTokens: form.contextWindowTokens
          ? Number(form.contextWindowTokens)
          : undefined,
        maxOutputTokens: form.maxOutputTokens
          ? Number(form.maxOutputTokens)
          : undefined,
      };
      // Remove empty strings
      Object.keys(payload).forEach(k => {
        if (payload[k] === "") delete payload[k];
      });

      if (mode === "create") {
        if (logoFile) {
          // Submit via /tools/submit (multipart) then auto-approve
          const subData = {
            name: form.name,
            website: form.websiteUrl || "https://example.com",
            tagline: form.shortDescription.slice(0, 100),
            description: form.fullDescription || form.shortDescription,
            toolType: form.toolType,
            pricing: form.pricingType,
            hasApi: form.hasApi,
            isOpenSource: form.isOpenSource,
            ownerName: "Admin",
            ownerEmail: "admin@rateai.com",
          };
          const sub = await toolsApi.createWithLogo(subData, logoFile);
          // Auto-approve the submission with full slug/name
          await submissionsApi.approve(
            sub.id,
            form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            "Auto-approved by admin"
          );
          onSaved("Tool created & approved via submission");
        } else {
          await toolsApi.createJson(payload);
          onSaved("Tool created");
        }
      } else {
        // Edit: if new logo file, update logoUrl separately via URL field after upload
        // For now update JSON fields; logo URL can be pasted manually
        await toolsApi.update(initial!.slug, payload);
        onSaved("Tool updated");
      }
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.8)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(26,30,38,.1)",
          borderRadius: 16,
          padding: 28,
          width: "min(780px, 95vw)",
          maxHeight: "92vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "#16181D",
              letterSpacing: "-0.02em",
            }}
          >
            {mode === "create"
              ? "➕ Add New Tool"
              : `✏️ Edit — ${initial?.name}`}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#857F72",
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {/* Logo */}
        <LogoUploadZone
          file={logoFile}
          preview={logoPreview}
          onFile={handleLogoFile}
          currentUrl={form.logoUrl}
        />
        {mode === "edit" && (
          <Input
            label="Logo URL (paste Cloudinary URL or leave blank)"
            value={form.logoUrl}
            onChange={set("logoUrl")}
            placeholder="https://res.cloudinary.com/..."
          />
        )}

        {/* Basic */}
        <FieldRow>
          <Input
            label="Tool Name *"
            value={form.name}
            onChange={v => {
              set("name")(v);
              if (mode === "create")
                set("slug")(
                  v
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "")
                );
            }}
            placeholder="e.g. Claude 3.5 Sonnet"
          />
          <Input
            label="Slug *"
            value={form.slug}
            onChange={set("slug")}
            placeholder="claude-3-5-sonnet"
          />
        </FieldRow>

        <Input
          label="Short Description * (max 160 chars)"
          value={form.shortDescription}
          onChange={set("shortDescription")}
          placeholder="One-line pitch"
        />

        <TextAreaField
          label="Full Description"
          value={form.fullDescription}
          onChange={set("fullDescription")}
          rows={4}
          placeholder="Detailed description..."
        />

        {/* Type & Pricing */}
        <FieldRow>
          <SelectField
            label="Tool Type *"
            value={form.toolType}
            onChange={set("toolType")}
            options={TOOL_TYPE_OPTIONS}
          />
          <SelectField
            label="Pricing Type *"
            value={form.pricingType}
            onChange={set("pricingType")}
            options={PRICING_TYPE_OPTIONS}
          />
        </FieldRow>

        {/* Links */}
        <FieldRow>
          <Input
            label="Website URL"
            value={form.websiteUrl}
            onChange={set("websiteUrl")}
            placeholder="https://..."
          />
          <Input
            label="API Docs URL"
            value={form.apiDocsUrl}
            onChange={set("apiDocsUrl")}
            placeholder="https://docs...."
          />
        </FieldRow>
        <FieldRow>
          <Input
            label="GitHub URL"
            value={form.githubUrl}
            onChange={set("githubUrl")}
            placeholder="https://github.com/..."
          />
          <Input
            label="Paper URL"
            value={form.paperUrl}
            onChange={set("paperUrl")}
            placeholder="https://arxiv.org/..."
          />
        </FieldRow>

        {/* LLM specifics */}
        <FieldRow>
          <Input
            label="Model Family"
            value={form.modelFamily}
            onChange={set("modelFamily")}
            placeholder="e.g. GPT-4"
          />
          <SelectField
            label="Verification Status"
            value={form.verificationStatus}
            onChange={set("verificationStatus")}
            options={[
              { value: "unverified", label: "Unverified" },
              { value: "claimed", label: "Claimed" },
              { value: "verified", label: "Verified" },
            ]}
          />
        </FieldRow>
        <FieldRow>
          <Input
            label="Context Window (tokens)"
            value={form.contextWindowTokens}
            onChange={set("contextWindowTokens")}
            placeholder="128000"
          />
          <Input
            label="Max Output Tokens"
            value={form.maxOutputTokens}
            onChange={set("maxOutputTokens")}
            placeholder="8192"
          />
        </FieldRow>

        {/* Flags */}
        <div
          style={{
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            padding: "8px 0",
          }}
        >
          <CheckField
            label="Has API"
            checked={form.hasApi}
            onChange={set("hasApi")}
          />
          <CheckField
            label="Open Source"
            checked={form.isOpenSource}
            onChange={set("isOpenSource")}
          />
          <CheckField
            label="Has Free Tier"
            checked={form.hasFreeTier}
            onChange={set("hasFreeTier")}
          />
          <CheckField
            label="Featured"
            checked={form.isFeatured}
            onChange={set("isFeatured")}
          />
        </div>

        {err && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(239,68,68,.08)",
              border: "1px solid rgba(239,68,68,.2)",
              borderRadius: 8,
              fontSize: 12,
              color: "#B23A2B",
            }}
          >
            {err}
          </div>
        )}

        {mode === "create" && logoFile && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(30,58,95,.06)",
              border: "1px solid rgba(30,58,95,.15)",
              borderRadius: 8,
              fontSize: 12,
              color: "#E6B84C",
              lineHeight: 1.5,
            }}
          >
            ℹ️ Logo will be uploaded to Cloudinary via the tool submission flow,
            then auto-approved.
          </div>
        )}

        {/* Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            paddingTop: 4,
            borderTop: "1px solid rgba(26,30,38,.05)",
          }}
        >
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>
            {mode === "create" ? "Create Tool" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────
function DeleteConfirmModal({
  open,
  name,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  name: string;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.75)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(239,68,68,.2)",
          borderRadius: 14,
          padding: 28,
          width: "min(400px, 95vw)",
        }}
      >
        <p style={{ fontSize: 32, textAlign: "center", marginBottom: 14 }}>
          🗑️
        </p>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#16181D",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Delete "{name}"?
        </h3>
        <p
          style={{
            fontSize: 13,
            color: "#6E6A5E",
            textAlign: "center",
            marginBottom: 24,
            lineHeight: 1.5,
          }}
        >
          This will permanently remove the tool and all associated data. This
          cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" loading={loading} onClick={onConfirm}>
            Delete Forever
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Bulk Import ──────────────────────────────────────────────────────────────
// Column headers the importer understands — mirrors the AI Tools spreadsheet.
const CSV_HEADERS = [
  "Slug",
  "Name",
  "Short Description",
  "Tool Type",
  "Provider",
  "Pricing Type",
  "Has Free Tier",
  "Has API",
  "Open Source",
  "Self-Hostable",
  "Function Calling",
  "Streaming",
  "Fine-Tuning",
  "Multimodal",
  "Context Window (K tokens)",
  "Max Output Tokens",
  "Model Family",
  "Parameter Count",
  "Training Cutoff",
  "Modalities (Input)",
  "Modalities (Output)",
  "Use Cases",
  "Website",
  "GitHub / HuggingFace",
  "Price Input ($/M tokens)",
  "Price Output ($/M tokens)",
  "Pro Monthly (USD)",
  "Pricing Notes",
  "Launch Date",
  "Deprecated",
  "Featured",
  "Verification",
];

const EXAMPLE_ROW = [
  "gpt-4o",
  "GPT-4o",
  "OpenAI flagship multimodal model",
  "llm",
  "OpenAI",
  "paid",
  "Yes",
  "Yes",
  "No",
  "No",
  "Yes",
  "Yes",
  "Yes",
  "Yes",
  "128",
  "16384",
  "GPT-4",
  "Unknown",
  "2024-04",
  "Text, Image, Audio",
  "Text",
  "Coding, Writing, Analysis",
  "https://openai.com",
  "",
  "5.00",
  "15.00",
  "20",
  "",
  "2024-05",
  "No",
  "Yes",
  "verified",
];

const csvCell = (v: string) =>
  /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;

function downloadTemplate() {
  const csv =
    CSV_HEADERS.map(csvCell).join(",") +
    "\n" +
    EXAMPLE_ROW.map(csvCell).join(",") +
    "\n";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ai-tools-import-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/** Minimal RFC-4180-ish CSV parser (handles quotes, embedded commas/newlines). */
function parseCsv(input: string): Record<string, string>[] {
  let text = input;
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // strip BOM
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\r") {
      // ignore — handled by \n
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  if (!rows.length) return [];

  const headers = rows[0].map(h => h.trim());
  const out: Record<string, string>[] = [];
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    if (cells.length === 1 && cells[0].trim() === "") continue; // skip blank line
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = (cells[idx] ?? "").trim();
    });
    out.push(obj);
  }
  return out;
}

function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        padding: "12px 14px",
        background: "rgba(26,30,38,.02)",
        border: "1px solid rgba(26,30,38,.07)",
        borderRadius: 10,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "monospace" }}>
        {value}
      </div>
      <div
        style={{
          fontSize: 10,
          color: "#6E6A5E",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginTop: 2,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function BulkImportModal({
  open,
  onClose,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  onDone: (msg: string) => void;
}) {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [report, setReport] = useState<BulkImportReport | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setRows([]);
    setFileName(null);
    setErr(null);
    setReport(null);
    setImporting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setErr(null);
    setReport(null);
    try {
      const text = await file.text();
      const parsed = parseCsv(text);
      if (!parsed.length) {
        setErr("No data rows found in that file.");
        setRows([]);
        return;
      }
      if (!("Name" in parsed[0]) && !("Slug" in parsed[0])) {
        setErr(
          "This CSV doesn't look right — it needs a header row with at least a 'Name' column. Download the template below."
        );
        setRows([]);
        return;
      }
      setRows(parsed);
      setFileName(file.name);
    } catch {
      setErr("Could not read that file.");
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setErr(null);
    try {
      const result = await toolsApi.bulkImport(rows);
      setReport(result);
      if (result.failed === 0)
        onDone(
          `Imported ${result.created} new, updated ${result.updated} tools`
        );
    } catch (e: any) {
      setErr(e?.message ?? "Import failed");
    } finally {
      setImporting(false);
    }
  };

  if (!open) return null;

  const failedRows = report?.results.filter(r => r.status === "failed") ?? [];

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.8)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(26,30,38,.1)",
          borderRadius: 16,
          padding: 28,
          width: "min(640px, 95vw)",
          maxHeight: "92vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "#16181D",
              letterSpacing: "-0.02em",
            }}
          >
            ⬆ Bulk Import Tools
          </h3>
          <button
            onClick={handleClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#857F72",
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {/* ── Report view ── */}
        {report ? (
          <>
            <div style={{ display: "flex", gap: 10 }}>
              <StatPill label="Created" value={report.created} color="#0B6353" />
              <StatPill label="Updated" value={report.updated} color="#E6B84C" />
              <StatPill label="Failed" value={report.failed} color="#B23A2B" />
            </div>
            {failedRows.length > 0 && (
              <div
                style={{
                  border: "1px solid rgba(239,68,68,.2)",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "8px 12px",
                    background: "rgba(239,68,68,.08)",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#B23A2B",
                  }}
                >
                  {failedRows.length} row{failedRows.length > 1 ? "s" : ""} skipped
                </div>
                <div style={{ maxHeight: 220, overflowY: "auto" }}>
                  {failedRows.map(r => (
                    <div
                      key={r.row}
                      style={{
                        padding: "8px 12px",
                        borderTop: "1px solid rgba(26,30,38,.05)",
                        fontSize: 12,
                        color: "#474C57",
                      }}
                    >
                      <span style={{ color: "#6E6A5E", fontFamily: "monospace" }}>
                        Row {r.row}
                      </span>{" "}
                      <strong style={{ color: "#2A2F3A" }}>
                        {r.name || r.slug || "—"}
                      </strong>
                      <div style={{ color: "#B23A2B", marginTop: 2 }}>
                        {r.error}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Button variant="ghost" onClick={reset}>
                Import Another
              </Button>
              <Button variant="primary" onClick={handleClose}>
                Done
              </Button>
            </div>
          </>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "#6E6A5E", lineHeight: 1.6 }}>
              Upload a CSV of tools. Rows are matched by <strong>slug</strong> —
              existing tools are updated (blank cells are ignored), new ones are
              created. Unknown use-case or modality labels are skipped
              automatically.
            </p>

            <div
              onClick={() => inputRef.current?.click()}
              style={{
                border: "2px dashed rgba(26,30,38,.12)",
                borderRadius: 12,
                padding: "26px 16px",
                textAlign: "center",
                cursor: "pointer",
                background: "rgba(26,30,38,.02)",
              }}
            >
              <div style={{ fontSize: 26, marginBottom: 6 }}>📄</div>
              <p style={{ fontSize: 13, color: "#474C57", fontWeight: 600 }}>
                {fileName ?? "Click to choose a .csv file"}
              </p>
              {rows.length > 0 && (
                <p style={{ fontSize: 12, color: "#0B6353", marginTop: 4 }}>
                  ✓ {rows.length} row{rows.length > 1 ? "s" : ""} parsed
                </p>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: "none" }}
              onChange={e => {
                handleFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />

            <button
              onClick={downloadTemplate}
              style={{
                alignSelf: "flex-start",
                background: "none",
                border: "none",
                color: "#1E3A5F",
                fontSize: 12,
                cursor: "pointer",
                padding: 0,
                fontFamily: "inherit",
              }}
            >
              ↓ Download CSV template
            </button>

            {err && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "rgba(239,68,68,.08)",
                  border: "1px solid rgba(239,68,68,.2)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#B23A2B",
                }}
              >
                {err}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                paddingTop: 4,
                borderTop: "1px solid rgba(26,30,38,.05)",
              }}
            >
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={rows.length === 0 || importing}
                onClick={handleImport}
              >
                {importing ? (
                  <span
                    style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                  >
                    <Spinner size={14} /> Importing…
                  </span>
                ) : (
                  `Import ${rows.length || ""} ${rows.length === 1 ? "Tool" : "Tools"}`
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Tools Component ─────────────────────────────────────────────────────
export function Tools() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const debouncedQ = useDebounce(q, 350);
  const { toasts, addToast, removeToast } = useToast();

  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editTarget, setEditTarget] = useState<Tool | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tool | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, loading, error, refetch } = useAsync(
    () =>
      toolsApi.getAll({
        page,
        limit: 20,
        sort,
        ...(debouncedQ ? { q: debouncedQ } : {}),
      }),
    [page, debouncedQ, sort]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await toolsApi.delete(deleteTarget.slug);
      addToast(`Deleted "${deleteTarget.name}"`, "success");
      setDeleteTarget(null);
      refetch();
    } catch (e: any) {
      addToast(e?.message ?? "Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, addToast, refetch]);

  const handleToggleFeatured = async (tool: Tool) => {
    try {
      await toolsApi.toggleFeatured(tool.slug, !tool.isFeatured);
      addToast(
        `${!tool.isFeatured ? "Featured" : "Unfeatured"} "${tool.name}"`,
        "success"
      );
      refetch();
    } catch (e: any) {
      addToast(e?.message ?? "Update failed", "error");
    }
  };

  const items = data?.data ?? [];
  const meta = data?.meta;

  const SORT_OPTIONS = [
    { value: "newest", label: "Newest" },
    { value: "rating", label: "Rating" },
    { value: "reviews_count", label: "Reviews" },
    { value: "name", label: "Name" },
  ];

  return (
    <div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <SectionHeader
        title="Tools"
        actions={
          <>
            {SORT_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => {
                  setSort(o.value);
                  setPage(1);
                }}
                style={{
                  padding: "5px 11px",
                  borderRadius: 7,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  background:
                    sort === o.value ? "#1E3A5F" : "rgba(26,30,38,.03)",
                  color: sort === o.value ? "white" : "#6E6A5E",
                  border: `1px solid ${sort === o.value ? "#1E3A5F" : "rgba(26,30,38,.07)"}`,
                  fontFamily: "inherit",
                }}
              >
                {o.label}
              </button>
            ))}
            <Input
              value={q}
              onChange={v => {
                setQ(v);
                setPage(1);
              }}
              placeholder="Search..."
              style={{ width: 180 }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImport(true)}
            >
              ⬆ Bulk Import
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreate(true)}
            >
              ➕ Add Tool
            </Button>
          </>
        }
      />

      {loading && <PageLoader />}
      {error && <ErrorBanner message={error} />}

      {!loading && !error && (
        <>
          {items.length === 0 ? (
            <Empty icon="🔧" title="No tools found" />
          ) : (
            <Table
              headers={[
                "Tool",
                "Type",
                "Pricing",
                "Rating",
                "Reviews",
                "Featured",
                "Status",
                "Actions",
              ]}
            >
              {items.map(t => (
                <Tr key={t._id}>
                  <Td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      {t.logoUrl ? (
                        <img
                          src={t.logoUrl}
                          alt=""
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 7,
                            objectFit: "contain",
                            background: "rgba(26,30,38,.04)",
                            border: "1px solid rgba(26,30,38,.06)",
                            flexShrink: 0,
                          }}
                          onError={e => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 7,
                            background:
                              "linear-gradient(135deg,#1d3a5a,#2d1b4e)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            flexShrink: 0,
                          }}
                        >
                          🔧
                        </div>
                      )}
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#16181D",
                            fontSize: 13,
                          }}
                        >
                          {t.name}
                        </div>
                        <div style={{ fontSize: 11, color: "#B2AB99" }}>
                          /{t.slug}
                        </div>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <Badge variant="info">
                      {TYPE_LABELS[t.toolType] ?? t.toolType}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge
                      variant={PRICING_VARIANT[t.pricingType] ?? "default"}
                    >
                      {t.pricingType?.replace(/_/g, " ")}
                    </Badge>
                  </Td>
                  <Td
                    style={{
                      color: "#B0820C",
                      fontWeight: 700,
                      fontFamily: "monospace",
                    }}
                  >
                    {t.ratingOverall?.toFixed(1) ?? "—"}
                  </Td>
                  <Td style={{ fontFamily: "monospace", color: "#6E6A5E" }}>
                    {t.reviewsCount.toLocaleString()}
                  </Td>
                  <Td>
                    <button
                      onClick={() => handleToggleFeatured(t)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <Badge variant={t.isFeatured ? "success" : "default"}>
                        {t.isFeatured ? "⭐ Yes" : "No"}
                      </Badge>
                    </button>
                  </Td>
                  <Td>
                    <Badge
                      variant={
                        t.verificationStatus === "verified"
                          ? "success"
                          : t.verificationStatus === "claimed"
                            ? "warning"
                            : "default"
                      }
                    >
                      {t.verificationStatus}
                    </Badge>
                  </Td>
                  <Td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {t.websiteUrl && (
                        <a
                          href={t.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: 11,
                            color: "#1E3A5F",
                            textDecoration: "none",
                            padding: "3px 8px",
                            background: "rgba(30,58,95,.1)",
                            borderRadius: 5,
                            border: "1px solid rgba(30,58,95,.2)",
                          }}
                        >
                          ↗
                        </a>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditTarget(t)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteTarget(t)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Table>
          )}
          {meta && (
            <Pagination
              page={page}
              totalPages={meta.totalPages}
              total={meta.total}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* Create Modal */}
      <ToolFormModal
        open={showCreate}
        mode="create"
        onClose={() => setShowCreate(false)}
        onSaved={msg => {
          addToast(msg, "success");
          refetch();
        }}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onDone={msg => {
          addToast(msg, "success");
          refetch();
        }}
      />

      {/* Edit Modal */}
      {editTarget && (
        <ToolFormModal
          open={!!editTarget}
          mode="edit"
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={msg => {
            addToast(msg, "success");
            setEditTarget(null);
            refetch();
          }}
        />
      )}

      {/* Delete Confirm */}
      <DeleteConfirmModal
        open={!!deleteTarget}
        name={deleteTarget?.name ?? ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
