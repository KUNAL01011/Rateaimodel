import type { ReactNode, CSSProperties } from "react";
import type { Toast } from "../hooks";

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        border: `2px solid #1e2d3d`,
        borderTopColor: "#4f8ef7",
        borderRadius: "50%",
        animation: "spin 0.65s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}

// ─── Page Loader ──────────────────────────────────────────────────────────────
export function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "72px 0",
        gap: 12,
        color: "#4b5c6b",
        fontSize: 13,
      }}
    >
      <Spinner />
      Loading...
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function Empty({
  icon = "📭",
  title,
  description,
}: {
  icon?: string;
  title: string;
  description?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "64px 24px",
        gap: 8,
        color: "#3d4e5c",
      }}
    >
      <span style={{ fontSize: 36 }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: "#5b7083" }}>
        {title}
      </span>
      {description && (
        <span style={{ fontSize: 12, color: "#3d4e5c" }}>{description}</span>
      )}
    </div>
  );
}

// ─── Error banner ─────────────────────────────────────────────────────────────
export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: "14px 18px",
        background: "rgba(239,68,68,.08)",
        border: "1px solid rgba(239,68,68,.18)",
        borderRadius: 10,
        fontSize: 13,
        color: "#f87171",
        marginBottom: 20,
      }}
    >
      ⚠️ {message}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple";

const BADGE_STYLES: Record<BadgeVariant, CSSProperties> = {
  default: {
    background: "rgba(255,255,255,.04)",
    color: "#6b7f8c",
    border: "1px solid rgba(255,255,255,.07)",
  },
  success: {
    background: "rgba(34,197,94,.1)",
    color: "#4ade80",
    border: "1px solid rgba(34,197,94,.2)",
  },
  warning: {
    background: "rgba(234,179,8,.1)",
    color: "#facc15",
    border: "1px solid rgba(234,179,8,.2)",
  },
  danger: {
    background: "rgba(239,68,68,.1)",
    color: "#f87171",
    border: "1px solid rgba(239,68,68,.2)",
  },
  info: {
    background: "rgba(59,130,246,.1)",
    color: "#60a5fa",
    border: "1px solid rgba(59,130,246,.2)",
  },
  purple: {
    background: "rgba(168,85,247,.1)",
    color: "#c084fc",
    border: "1px solid rgba(168,85,247,.2)",
  },
};

export function Badge({
  children,
  variant = "default",
  style,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 9px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
        ...BADGE_STYLES[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
type BtnVariant = "primary" | "ghost" | "danger" | "success" | "outline";

const BTN_STYLES: Record<BtnVariant, CSSProperties> = {
  primary: {
    background: "#1d6bf3",
    color: "#fff",
    border: "1px solid #1d6bf3",
  },
  ghost: {
    background: "transparent",
    color: "#5b7083",
    border: "1px solid rgba(255,255,255,.07)",
  },
  danger: {
    background: "rgba(239,68,68,.12)",
    color: "#f87171",
    border: "1px solid rgba(239,68,68,.2)",
  },
  success: {
    background: "rgba(34,197,94,.12)",
    color: "#4ade80",
    border: "1px solid rgba(34,197,94,.2)",
  },
  outline: {
    background: "transparent",
    color: "#e2e8f0",
    border: "1px solid rgba(255,255,255,.12)",
  },
};

export function Button({
  children,
  variant = "ghost",
  onClick,
  disabled,
  loading,
  style,
  size = "md",
}: {
  children: ReactNode;
  variant?: BtnVariant;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: CSSProperties;
  size?: "sm" | "md" | "lg";
}) {
  const padding =
    size === "sm" ? "5px 12px" : size === "lg" ? "11px 24px" : "7px 16px";
  const fontSize = size === "sm" ? 11 : size === "lg" ? 14 : 12;

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding,
        borderRadius: 8,
        fontSize,
        fontWeight: 600,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.5 : 1,
        transition: "opacity .15s, filter .15s",
        whiteSpace: "nowrap",
        fontFamily: "inherit",
        ...BTN_STYLES[variant],
        ...style,
      }}
    >
      {loading && <Spinner size={12} />}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  style,
  label,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  style?: CSSProperties;
  label?: string;
  error?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && (
        <label
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#5b7083",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: "9px 13px",
          background: "rgba(255,255,255,.03)",
          border: `1px solid ${error ? "rgba(239,68,68,.4)" : "rgba(255,255,255,.08)"}`,
          borderRadius: 8,
          color: "#e2e8f0",
          fontSize: 13,
          outline: "none",
          fontFamily: "inherit",
          transition: "border-color .15s",
          ...style,
        }}
      />
      {error && <span style={{ fontSize: 11, color: "#f87171" }}>{error}</span>}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({
  children,
  style,
  onClick,
}: {
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,.025)",
        border: "1px solid rgba(255,255,255,.07)",
        borderRadius: 12,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
export function SectionHeader({
  title,
  actions,
}: {
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#e2e8f0",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h2>
      {actions && (
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {actions}
        </div>
      )}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 16,
        paddingTop: 16,
        borderTop: "1px solid rgba(255,255,255,.05)",
      }}
    >
      <span style={{ fontSize: 12, color: "#4b5c6b" }}>
        {total.toLocaleString()} total
      </span>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <Button
          variant="ghost"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          ← Prev
        </Button>
        <span
          style={{
            padding: "4px 10px",
            fontSize: 12,
            color: "#5b7083",
            background: "rgba(255,255,255,.03)",
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,.07)",
          }}
        >
          {page} / {totalPages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next →
        </Button>
      </div>
    </div>
  );
}

// ─── Toast container ──────────────────────────────────────────────────────────
export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: number) => void;
}) {
  if (!toasts.length) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => onRemove(t.id)}
          style={{
            padding: "11px 18px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 8px 32px rgba(0,0,0,.4)",
            background:
              t.type === "success"
                ? "#052e16"
                : t.type === "error"
                  ? "#450a0a"
                  : "#0c1a2e",
            color:
              t.type === "success"
                ? "#4ade80"
                : t.type === "error"
                  ? "#f87171"
                  : "#60a5fa",
            border: `1px solid ${
              t.type === "success"
                ? "rgba(74,222,128,.2)"
                : t.type === "error"
                  ? "rgba(248,113,113,.2)"
                  : "rgba(96,165,250,.2)"
            }`,
            animation: "slideIn 0.2s ease",
          }}
        >
          {t.type === "success" ? "✓" : t.type === "error" ? "✗" : "ℹ"}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
export function Table({
  headers,
  children,
  emptyState,
}: {
  headers: string[];
  children: ReactNode;
  emptyState?: ReactNode;
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 13,
        }}
      >
        <thead>
          <tr>
            {headers.map(h => (
              <th
                key={h}
                style={{
                  padding: "10px 14px",
                  textAlign: "left",
                  color: "#4b5c6b",
                  fontWeight: 600,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: "1px solid rgba(255,255,255,.05)",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {emptyState}
    </div>
  );
}

export function Tr({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      style={{
        borderBottom: "1px solid rgba(255,255,255,.03)",
        cursor: onClick ? "pointer" : "default",
        transition: "background .1s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background =
          "rgba(255,255,255,.02)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      {children}
    </tr>
  );
}

export function Td({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <td
      style={{
        padding: "11px 14px",
        color: "#c9d9e4",
        verticalAlign: "middle",
        ...style,
      }}
    >
      {children}
    </td>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  children,
  width = 480,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: number;
}) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.72)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#0b1117",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 16,
          padding: 28,
          width: Math.min(width, window.innerWidth - 40),
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#e2e8f0",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#4b5c6b",
              fontSize: 18,
              cursor: "pointer",
              padding: "0 4px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({
  src,
  name,
  size = 32,
}: {
  src?: string;
  name?: string;
  size?: number;
}) {
  const initials = (name ?? "?")
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
        onError={e => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #1d6bf3, #7c3aed)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35,
        fontWeight: 700,
        color: "white",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}
