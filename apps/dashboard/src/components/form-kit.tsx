import { useRef, useState, type ReactNode } from "react";
import { uploadApi } from "../lib/api";

/* Light editorial form primitives shared by SEO / Blog / Settings. */

export const INK = "#1E3A5F";
export const GOLD = "#B0820C";
const CARD = "#FFFFFF";
const PAPER_RAISED = "#F1EDE2";
const INK_TEXT = "#16181D";
const MUTED = "#6E6A5E";
const FAINT = "#9B9484";
const LINE = "rgba(26,30,38,.1)";
const LINE_STRONG = "rgba(26,30,38,.2)";

const fieldBase: React.CSSProperties = {
  width: "100%",
  padding: "10px 13px",
  background: CARD,
  border: `1px solid ${LINE_STRONG}`,
  borderRadius: 8,
  color: INK_TEXT,
  fontSize: 14,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 500,
  color: INK_TEXT,
  marginBottom: 7,
};

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: FAINT,
      }}
    >
      {children}
    </span>
  );
}

export function PageHeading({
  title,
  desc,
}: {
  title: string;
  desc?: string;
}) {
  return (
    <div style={{ marginBottom: 26 }}>
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 34,
          fontWeight: 500,
          color: INK_TEXT,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h1>
      {desc && (
        <p style={{ fontSize: 14, color: MUTED, marginTop: 6, maxWidth: 620 }}>
          {desc}
        </p>
      )}
    </div>
  );
}

export function FormCard({
  title,
  desc,
  icon,
  actions,
  children,
}: {
  title?: string;
  desc?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      style={{
        background: CARD,
        border: `1px solid ${LINE}`,
        borderRadius: 14,
        padding: 24,
      }}
    >
      {(title || actions) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: desc ? 4 : 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            {icon && <span style={{ color: FAINT }}>{icon}</span>}
            <h3 style={{ fontSize: 16, fontWeight: 600, color: INK_TEXT }}>
              {title}
            </h3>
          </div>
          {actions}
        </div>
      )}
      {desc && (
        <p style={{ fontSize: 13, color: MUTED, marginBottom: 18 }}>{desc}</p>
      )}
      {children}
    </section>
  );
}

function Counter({ value, max }: { value: number; max: number }) {
  const over = value > max;
  const near = !over && value > max * 0.9;
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        color: over ? "#B23A2B" : near ? GOLD : FAINT,
      }}
    >
      {value} / {max}
    </span>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  max,
  hint,
  type = "text",
  prefix,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  max?: number;
  hint?: string;
  type?: string;
  prefix?: string;
}) {
  return (
    <div>
      {(label || max) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          {label && <label style={labelStyle}>{label}</label>}
          {max && <Counter value={value.length} max={max} />}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "stretch" }}>
        {prefix && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0 10px",
              background: PAPER_RAISED,
              border: `1px solid ${LINE_STRONG}`,
              borderRight: "none",
              borderRadius: "8px 0 0 8px",
              fontSize: 13,
              color: MUTED,
              fontFamily: "var(--font-mono)",
            }}
          >
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            ...fieldBase,
            borderRadius: prefix ? "0 8px 8px 0" : 8,
          }}
          onFocus={e => (e.target.style.borderColor = INK)}
          onBlur={e => (e.target.style.borderColor = LINE_STRONG)}
        />
      </div>
      {hint && <p style={{ fontSize: 12, color: FAINT, marginTop: 5 }}>{hint}</p>}
    </div>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  max,
  hint,
  placeholder,
  mono,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  max?: number;
  hint?: string;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div>
      {(label || max) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          {label && <label style={labelStyle}>{label}</label>}
          {max && <Counter value={value.length} max={max} />}
        </div>
      )}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        style={{
          ...fieldBase,
          resize: "vertical",
          lineHeight: 1.6,
          fontFamily: mono ? "var(--font-mono)" : "inherit",
        }}
        onFocus={e => (e.target.style.borderColor = INK)}
        onBlur={e => (e.target.style.borderColor = LINE_STRONG)}
      />
      {hint && <p style={{ fontSize: 12, color: FAINT, marginTop: 5 }}>{hint}</p>}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  desc?: string;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, cursor: "pointer" }}>
      {(label || desc) && (
        <div>
          {label && <p style={{ fontSize: 14, color: INK_TEXT, fontWeight: 500 }}>{label}</p>}
          {desc && <p style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{desc}</p>}
        </div>
      )}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          position: "relative",
          width: 42,
          height: 22,
          borderRadius: 999,
          border: "none",
          cursor: "pointer",
          background: checked ? INK : LINE_STRONG,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 22 : 2,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#fff",
            transition: "left .15s",
            boxShadow: "0 1px 2px rgba(0,0,0,.2)",
          }}
        />
      </button>
    </label>
  );
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; icon?: ReactNode }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 6, borderBottom: `1px solid ${LINE}`, marginBottom: 24 }}>
      {tabs.map(t => {
        const on = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 4px",
              marginRight: 16,
              background: "none",
              border: "none",
              borderBottom: `2px solid ${on ? INK : "transparent"}`,
              color: on ? INK_TEXT : MUTED,
              fontSize: 14,
              fontWeight: on ? 600 : 500,
              cursor: "pointer",
              fontFamily: "inherit",
              marginBottom: -1,
            }}
          >
            {t.icon}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function Segmented({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: ReactNode }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        background: PAPER_RAISED,
        border: `1px solid ${LINE}`,
        borderRadius: 9,
        padding: 3,
        gap: 2,
      }}
    >
      {options.map(o => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 13px",
              borderRadius: 7,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "inherit",
              background: on ? INK : "transparent",
              color: on ? "#fff" : MUTED,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function ImageDrop({
  value,
  onChange,
  folder,
  hint,
  height = 150,
  onError,
}: {
  value?: string;
  onChange: (url: string) => void;
  folder: string;
  hint?: string;
  height?: number;
  onError?: (msg: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  const upload = async (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    setBusy(true);
    try {
      const res = await uploadApi.image(file, folder);
      onChange(res.url);
    } catch (e: any) {
      onError?.(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  if (value) {
    return (
      <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: `1px solid ${LINE}` }}>
        <img src={value} alt="" style={{ width: "100%", height, objectFit: "cover", display: "block" }} />
        <button
          onClick={() => onChange("")}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            padding: "4px 10px",
            borderRadius: 7,
            border: "none",
            background: "rgba(0,0,0,.6)",
            color: "#fff",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        onClick={() => ref.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files?.[0]); }}
        style={{
          height,
          borderRadius: 10,
          border: `1.5px dashed ${drag ? INK : LINE_STRONG}`,
          background: drag ? "rgba(30,58,95,.04)" : PAPER_RAISED,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          cursor: "pointer",
          textAlign: "center",
          padding: 12,
        }}
      >
        <span style={{ fontSize: 18, color: GOLD }}>⬆</span>
        <p style={{ fontSize: 13, color: MUTED }}>
          {busy ? "Uploading…" : <>Drop an image or <span style={{ color: INK, fontWeight: 500 }}>browse</span></>}
        </p>
        {hint && <p style={{ fontSize: 11, color: FAINT }}>{hint}</p>}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => { upload(e.target.files?.[0]); e.target.value = ""; }} />
    </>
  );
}
