import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:8080/api/v1";

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
    ...opts,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? `${res.status}`);
  return json.data;
}

// ── tiny components ────────────────────────────────────────────────────
const Badge = ({ children, color = "gray" }) => {
  const colors = {
    gray: "background:#1e1e2e;color:#9ca3af;border:1px solid #2d2d3f",
    green:
      "background:rgba(16,185,129,.12);color:#34d399;border:1px solid rgba(16,185,129,.25)",
    amber:
      "background:rgba(245,158,11,.12);color:#fbbf24;border:1px solid rgba(245,158,11,.25)",
    red: "background:rgba(239,68,68,.12);color:#f87171;border:1px solid rgba(239,68,68,.25)",
    blue: "background:rgba(99,102,241,.12);color:#818cf8;border:1px solid rgba(99,102,241,.25)",
    purple:
      "background:rgba(167,139,250,.12);color:#c4b5fd;border:1px solid rgba(167,139,250,.25)",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.03em",
        ...Object.fromEntries(
          colors[color]
            .split(";")
            .map(s => {
              const [k, v] = s.split(":");
              return [
                k.trim().replace(/-(.)/g, (_, c) => c.toUpperCase()),
                v?.trim(),
              ];
            })
            .filter(([k]) => k)
        ),
      }}
    >
      {children}
    </span>
  );
};

const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: "#13131f",
      border: "1px solid #1e1e2e",
      borderRadius: 16,
      ...style,
    }}
  >
    {children}
  </div>
);

const Spinner = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
    <div
      style={{
        width: 28,
        height: 28,
        border: "2px solid #2d2d3f",
        borderTopColor: "#818cf8",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}
    />
  </div>
);

const Empty = ({ icon = "📭", text }) => (
  <div style={{ textAlign: "center", padding: "48px 24px", color: "#4b5563" }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
    <p style={{ fontSize: 14 }}>{text}</p>
  </div>
);

// ── Sidebar nav ────────────────────────────────────────────────────────
const TABS = [
  { id: "overview", icon: "▦", label: "Overview" },
  { id: "submissions", icon: "📥", label: "Tool Submissions" },
  { id: "tools", icon: "🔧", label: "Tools" },
  { id: "users", icon: "👥", label: "Users" },
  { id: "reviews", icon: "⭐", label: "Reviews" },
];

// ── Stat card ──────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color = "#818cf8" }) => (
  <Card style={{ padding: "20px 24px" }}>
    <p
      style={{
        fontSize: 12,
        color: "#6b7280",
        marginBottom: 6,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {label}
    </p>
    <p
      style={{
        fontSize: 32,
        fontWeight: 700,
        color,
        fontFamily: "monospace",
        lineHeight: 1,
      }}
    >
      {value ?? "—"}
    </p>
    {sub && (
      <p style={{ fontSize: 12, color: "#4b5563", marginTop: 4 }}>{sub}</p>
    )}
  </Card>
);

// ── Overview ───────────────────────────────────────────────────────────
function Overview({ stats, loading }) {
  if (loading) return <Spinner />;
  if (!stats)
    return (
      <Empty
        icon="⚠️"
        text="Could not load stats. Make sure the backend is running."
      />
    );
  return (
    <div>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#e2e8f0",
          marginBottom: 24,
        }}
      >
        Platform Overview
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <StatCard
          label="Total Users"
          value={stats.totalUsers?.toLocaleString()}
          color="#818cf8"
        />
        <StatCard
          label="Total Tools"
          value={stats.totalTools?.toLocaleString()}
          color="#34d399"
        />
        <StatCard
          label="Total Reviews"
          value={stats.totalReviews?.toLocaleString()}
          color="#fbbf24"
        />
        <StatCard
          label="Pending Reviews"
          value={stats.pendingSubmissions?.toLocaleString()}
          color="#f87171"
          sub="Tool submissions awaiting review"
        />
      </div>
      <h3
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#9ca3af",
          marginBottom: 12,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Users by Role
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
          gap: 12,
        }}
      >
        {Object.entries(stats.roleBreakdown ?? {}).map(([role, count]) => (
          <Card
            key={role}
            style={{
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: "#9ca3af",
                textTransform: "capitalize",
              }}
            >
              {role}
            </span>
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#e2e8f0",
                fontFamily: "monospace",
              }}
            >
              {count}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Submissions ────────────────────────────────────────────────────────
function Submissions({ refresh }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState(null); // { type:"approve"|"reject", id, name }
  const [adminNote, setAdminNote] = useState("");
  const [slug, setSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api(`/users/admin/submissions?status=${filter}&limit=50`)
      .then(res => setItems(res?.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const doAction = async () => {
    if (!action) return;
    setSubmitting(true);
    try {
      const body =
        action.type === "approve"
          ? {
              action: "approve",
              adminNote,
              toolData: {
                slug:
                  slug || action.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              },
            }
          : { action: "reject", adminNote };
      await api(`/users/admin/submissions/${action.id}/review`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      showToast(
        action.type === "approve"
          ? "✅ Tool approved and listed!"
          : "❌ Submission rejected"
      );
      setAction(null);
      setAdminNote("");
      setSlug("");
      setSelected(null);
      load();
      refresh();
    } catch (e) {
      showToast("⚠️ " + e.message, false);
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = { pending: "amber", approved: "green", rejected: "red" };

  return (
    <div>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 999,
            background: toast.ok ? "#065f46" : "#7f1d1d",
            color: "white",
            padding: "12px 20px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 8px 32px rgba(0,0,0,.4)",
          }}
        >
          {toast.msg}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0" }}>
          Tool Submissions
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          {["pending", "approved", "rejected", "all"].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                background: filter === s ? "#4f46e5" : "#1e1e2e",
                color: filter === s ? "white" : "#6b7280",
                border: `1px solid ${filter === s ? "#4f46e5" : "#2d2d3f"}`,
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <Empty icon="📭" text={`No ${filter} submissions`} />
      ) : (
        <div style={{ display: "flex", gap: 16 }}>
          {/* List */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {items.map(item => (
              <Card
                key={item._id}
                style={{
                  padding: "16px 20px",
                  cursor: "pointer",
                  border:
                    selected?._id === item._id
                      ? "1px solid #4f46e5"
                      : "1px solid #1e1e2e",
                  transition: "all .15s",
                }}
                onClick={() => setSelected(item === selected ? null : item)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#e2e8f0",
                        marginBottom: 4,
                      }}
                    >
                      {item.name}
                    </p>
                    <p style={{ fontSize: 12, color: "#6b7280" }}>
                      {item.website}
                    </p>
                    <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                      by{" "}
                      <span style={{ color: "#9ca3af" }}>{item.ownerName}</span>{" "}
                      · {item.ownerEmail}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 6,
                    }}
                  >
                    <Badge color={statusColor[item.status]}>
                      {item.status}
                    </Badge>
                    <span style={{ fontSize: 11, color: "#4b5563" }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {selected?._id === item._id && (
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: "1px solid #1e1e2e",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        color: "#9ca3af",
                        marginBottom: 8,
                        fontWeight: 600,
                      }}
                    >
                      Tagline
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#d1d5db",
                        marginBottom: 12,
                      }}
                    >
                      {item.tagline}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#9ca3af",
                        marginBottom: 8,
                        fontWeight: 600,
                      }}
                    >
                      Description
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#d1d5db",
                        marginBottom: 12,
                        lineHeight: 1.6,
                      }}
                    >
                      {item.description}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        marginBottom: 12,
                      }}
                    >
                      <Badge color="blue">{item.toolType}</Badge>
                      <Badge color="purple">{item.pricing}</Badge>
                      {item.hasApi && <Badge color="green">Has API</Badge>}
                      {item.isOpenSource && (
                        <Badge color="green">Open Source</Badge>
                      )}
                    </div>
                    {item.logoUrl && (
                      <img
                        src={item.logoUrl}
                        alt=""
                        style={{
                          height: 40,
                          borderRadius: 8,
                          marginBottom: 12,
                        }}
                      />
                    )}

                    {item.status === "pending" && (
                      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                        <button
                          onClick={() =>
                            setAction({
                              type: "approve",
                              id: item._id,
                              name: item.name,
                            })
                          }
                          style={{
                            padding: "8px 18px",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                            background: "#065f46",
                            color: "#34d399",
                            border: "1px solid #065f46",
                          }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() =>
                            setAction({
                              type: "reject",
                              id: item._id,
                              name: item.name,
                            })
                          }
                          style={{
                            padding: "8px 18px",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                            background: "#7f1d1d",
                            color: "#f87171",
                            border: "1px solid #7f1d1d",
                          }}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                    {item.adminNote && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: "10px 14px",
                          background: "#0a0a14",
                          borderRadius: 8,
                          fontSize: 12,
                          color: "#6b7280",
                        }}
                      >
                        Admin note: {item.adminNote}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Action modal */}
      {action && (
        <div
          onClick={() => setAction(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.7)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#0d0d1a",
              border: "1px solid #2d2d3f",
              borderRadius: 20,
              padding: 32,
              width: 480,
              maxWidth: "90vw",
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#e2e8f0",
                marginBottom: 6,
              }}
            >
              {action.type === "approve"
                ? "✅ Approve Tool"
                : "❌ Reject Submission"}
            </h3>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
              {action.name}
            </p>

            {action.type === "approve" && (
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "#9ca3af",
                    marginBottom: 6,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Tool Slug (URL-safe)
                </label>
                <input
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder={action.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "#1e1e2e",
                    border: "1px solid #2d2d3f",
                    borderRadius: 10,
                    color: "#e2e8f0",
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "#9ca3af",
                  marginBottom: 6,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Admin Note (optional)
              </label>
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                rows={3}
                placeholder={
                  action.type === "approve"
                    ? "Looks great!"
                    : "Reason for rejection..."
                }
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "#1e1e2e",
                  border: "1px solid #2d2d3f",
                  borderRadius: 10,
                  color: "#e2e8f0",
                  fontSize: 13,
                  outline: "none",
                  resize: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => setAction(null)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  fontSize: 13,
                  cursor: "pointer",
                  background: "transparent",
                  color: "#6b7280",
                  border: "1px solid #2d2d3f",
                }}
              >
                Cancel
              </button>
              <button
                onClick={doAction}
                disabled={submitting}
                style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  background: action.type === "approve" ? "#4f46e5" : "#991b1b",
                  color: "white",
                  border: "none",
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting
                  ? "Processing..."
                  : action.type === "approve"
                    ? "Approve & Publish"
                    : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tools ──────────────────────────────────────────────────────────────
function Tools() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api(
      `/tools?page=${page}&limit=20${q ? `&q=${encodeURIComponent(q)}` : ""}&sort=newest`
    )
      .then(res => {
        setItems(res?.data ?? []);
        setMeta(res?.meta);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [page, q]);

  useEffect(() => {
    load();
  }, [load]);

  const pricingColor = {
    free: "green",
    open_source_free: "green",
    freemium: "amber",
    subscription: "blue",
    pay_per_token: "blue",
    pay_per_use: "blue",
    enterprise: "purple",
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0" }}>
          Tools
        </h2>
        <input
          value={q}
          onChange={e => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Search tools..."
          style={{
            padding: "8px 14px",
            background: "#1e1e2e",
            border: "1px solid #2d2d3f",
            borderRadius: 10,
            color: "#e2e8f0",
            fontSize: 13,
            outline: "none",
            width: 240,
          }}
        />
      </div>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <Empty icon="🔧" text="No tools found" />
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #1e1e2e" }}>
                  {[
                    "Name",
                    "Type",
                    "Pricing",
                    "Rating",
                    "Reviews",
                    "Featured",
                    "Actions",
                  ].map(h => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        color: "#4b5563",
                        fontWeight: 600,
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(t => (
                  <tr
                    key={t._id}
                    style={{
                      borderBottom: "1px solid #0d0d1a",
                      transition: "background .1s",
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.background = "#0d0d1a")
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td
                      style={{
                        padding: "12px",
                        color: "#e2e8f0",
                        fontWeight: 600,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        {t.logoUrl && (
                          <img
                            src={t.logoUrl}
                            alt=""
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 6,
                              objectFit: "contain",
                              background: "#1e1e2e",
                            }}
                          />
                        )}
                        <div>
                          <div>{t.name}</div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "#4b5563",
                              fontWeight: 400,
                            }}
                          >
                            {t.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <Badge color="blue">
                        {t.toolType?.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <Badge color={pricingColor[t.pricingType] ?? "gray"}>
                        {t.pricingType?.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        color: "#fbbf24",
                        fontWeight: 600,
                        fontFamily: "monospace",
                      }}
                    >
                      {t.ratingOverall?.toFixed(1) ?? "—"}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        color: "#9ca3af",
                        fontFamily: "monospace",
                      }}
                    >
                      {t.reviewsCount ?? 0}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <Badge color={t.isFeatured ? "green" : "gray"}>
                        {t.isFeatured ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <a
                        href={t.websiteUrl ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 12,
                          color: "#818cf8",
                          textDecoration: "none",
                        }}
                      >
                        ↗ Visit
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 16,
              }}
            >
              <span style={{ fontSize: 12, color: "#4b5563" }}>
                {meta.total} total tools
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    cursor: "pointer",
                    background: "#1e1e2e",
                    color: page === 1 ? "#2d2d3f" : "#9ca3af",
                    border: "1px solid #2d2d3f",
                  }}
                >
                  ← Prev
                </button>
                <span
                  style={{
                    padding: "6px 12px",
                    fontSize: 12,
                    color: "#6b7280",
                  }}
                >
                  Page {page} / {meta.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={page >= meta.totalPages}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    cursor: "pointer",
                    background: "#1e1e2e",
                    color: page >= meta.totalPages ? "#2d2d3f" : "#9ca3af",
                    border: "1px solid #2d2d3f",
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Users ──────────────────────────────────────────────────────────────
function Users() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [roleModal, setRoleModal] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api(
      `/users/admin?page=${page}&limit=20${q ? `&search=${encodeURIComponent(q)}` : ""}`
    )
      .then(res => {
        setItems(res?.data ?? []);
        setMeta(res?.meta);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [page, q]);

  useEffect(() => {
    load();
  }, [load]);

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const changeRole = async (userId, role) => {
    try {
      await api(`/users/admin/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      showToast(`✅ Role changed to ${role}`);
      setRoleModal(null);
      load();
    } catch (e) {
      showToast("⚠️ " + e.message);
    }
  };

  const roleColor = { user: "gray", owner: "blue", admin: "purple" };

  return (
    <div>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 999,
            background: "#065f46",
            color: "white",
            padding: "12px 20px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {toast}
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0" }}>
          Users
        </h2>
        <input
          value={q}
          onChange={e => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Search name / email..."
          style={{
            padding: "8px 14px",
            background: "#1e1e2e",
            border: "1px solid #2d2d3f",
            borderRadius: 10,
            color: "#e2e8f0",
            fontSize: 13,
            outline: "none",
            width: 240,
          }}
        />
      </div>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <Empty icon="👥" text="No users found" />
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #1e1e2e" }}>
                  {[
                    "User",
                    "Email",
                    "Role",
                    "Reviews",
                    "Helpful Votes",
                    "Joined",
                    "Actions",
                  ].map(h => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        color: "#4b5563",
                        fontWeight: 600,
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(u => (
                  <tr
                    key={u._id}
                    style={{ borderBottom: "1px solid #0d0d1a" }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.background = "#0d0d1a")
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td style={{ padding: "12px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "#4f46e5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 700,
                            color: "white",
                            flexShrink: 0,
                          }}
                        >
                          {(u.displayName ?? u.username ?? "?")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <div style={{ color: "#e2e8f0", fontWeight: 600 }}>
                            {u.displayName ?? u.username}
                          </div>
                          <div style={{ fontSize: 11, color: "#4b5563" }}>
                            @{u.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px", color: "#6b7280" }}>
                      {u.email}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <Badge color={roleColor[u.role] ?? "gray"}>
                        {u.role}
                      </Badge>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        color: "#9ca3af",
                        fontFamily: "monospace",
                      }}
                    >
                      {u.reviewCount ?? 0}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        color: "#9ca3af",
                        fontFamily: "monospace",
                      }}
                    >
                      {u.helpfulVoteCount ?? 0}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        color: "#4b5563",
                        fontSize: 12,
                      }}
                    >
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <button
                        onClick={() => setRoleModal(u)}
                        style={{
                          fontSize: 12,
                          color: "#818cf8",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        Change Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 16,
              }}
            >
              <span style={{ fontSize: 12, color: "#4b5563" }}>
                {meta.total} total users
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    cursor: "pointer",
                    background: "#1e1e2e",
                    color: page === 1 ? "#2d2d3f" : "#9ca3af",
                    border: "1px solid #2d2d3f",
                  }}
                >
                  ← Prev
                </button>
                <span
                  style={{
                    padding: "6px 12px",
                    fontSize: 12,
                    color: "#6b7280",
                  }}
                >
                  Page {page} / {meta.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={page >= meta.totalPages}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    cursor: "pointer",
                    background: "#1e1e2e",
                    color: page >= meta.totalPages ? "#2d2d3f" : "#9ca3af",
                    border: "1px solid #2d2d3f",
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {roleModal && (
        <div
          onClick={() => setRoleModal(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.7)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#0d0d1a",
              border: "1px solid #2d2d3f",
              borderRadius: 20,
              padding: 28,
              width: 340,
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#e2e8f0",
                marginBottom: 4,
              }}
            >
              Change Role
            </h3>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
              {roleModal.displayName ?? roleModal.username}
            </p>
            {["user", "owner", "admin"].map(r => (
              <button
                key={r}
                onClick={() => changeRole(roleModal._id, r)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginBottom: 8,
                  textAlign: "left",
                  background: roleModal.role === r ? "#4f46e5" : "#1e1e2e",
                  color: roleModal.role === r ? "white" : "#9ca3af",
                  border: `1px solid ${roleModal.role === r ? "#4f46e5" : "#2d2d3f"}`,
                }}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
                {roleModal.role === r && " ✓ (current)"}
              </button>
            ))}
            <button
              onClick={() => setRoleModal(null)}
              style={{
                marginTop: 4,
                width: "100%",
                padding: "10px",
                borderRadius: 10,
                fontSize: 13,
                cursor: "pointer",
                background: "transparent",
                color: "#4b5563",
                border: "1px solid #1e1e2e",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reviews ────────────────────────────────────────────────────────────
function Reviews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api(`/reviews?page=${page}&limit=20&sortBy=createdAt&sortOrder=desc`)
      .then(res => {
        setItems(res?.data ?? []);
        setMeta(res?.meta);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const hide = async id => {
    try {
      await api(`/reviews/${id}/hide`, {
        method: "POST",
        body: JSON.stringify({ reason: "Admin moderated" }),
      });
      showToast("✅ Review hidden");
      load();
    } catch (e) {
      showToast("⚠️ " + e.message);
    }
  };

  const unhide = async id => {
    try {
      await api(`/reviews/${id}/unhide`, { method: "POST" });
      showToast("✅ Review restored");
      load();
    } catch (e) {
      showToast("⚠️ " + e.message);
    }
  };

  const stars = n => "★".repeat(n) + "☆".repeat(5 - n);

  return (
    <div>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 999,
            background: "#065f46",
            color: "white",
            padding: "12px 20px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {toast}
        </div>
      )}
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#e2e8f0",
          marginBottom: 20,
        }}
      >
        Reviews
      </h2>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <Empty icon="⭐" text="No reviews yet" />
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map(r => (
              <Card key={r._id} style={{ padding: "16px 20px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          color: "#fbbf24",
                          fontSize: 14,
                          letterSpacing: 2,
                        }}
                      >
                        {stars(r.ratingOverall)}
                      </span>
                      <Badge color="blue">
                        {r.useCase?.replace(/_/g, " ")}
                      </Badge>
                      {r.isHidden && <Badge color="red">Hidden</Badge>}
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#d1d5db",
                        lineHeight: 1.6,
                        marginBottom: 8,
                      }}
                    >
                      {r.reviewText?.slice(0, 180)}
                      {r.reviewText?.length > 180 ? "..." : ""}
                    </p>
                    <div style={{ fontSize: 12, color: "#4b5563" }}>
                      by{" "}
                      <span style={{ color: "#9ca3af" }}>
                        {r.userId?.displayName ?? r.userId?.username ?? "User"}
                      </span>
                      {" · "}
                      <span style={{ color: "#6b7280" }}>
                        {r.toolId?.name ?? "Tool"}
                      </span>
                      {" · "}
                      {new Date(r.createdAt).toLocaleDateString()}
                      {" · "}👍 {r.upvotes ?? 0}
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    {r.isHidden ? (
                      <button
                        onClick={() => unhide(r._id)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 8,
                          fontSize: 12,
                          cursor: "pointer",
                          background: "#065f46",
                          color: "#34d399",
                          border: "1px solid #065f46",
                        }}
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        onClick={() => hide(r._id)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 8,
                          fontSize: 12,
                          cursor: "pointer",
                          background: "#7f1d1d",
                          color: "#f87171",
                          border: "1px solid #7f1d1d",
                        }}
                      >
                        Hide
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {meta && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 16,
              }}
            >
              <span style={{ fontSize: 12, color: "#4b5563" }}>
                {meta.total} total reviews
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    cursor: "pointer",
                    background: "#1e1e2e",
                    color: page === 1 ? "#2d2d3f" : "#9ca3af",
                    border: "1px solid #2d2d3f",
                  }}
                >
                  ← Prev
                </button>
                <span
                  style={{
                    padding: "6px 12px",
                    fontSize: 12,
                    color: "#6b7280",
                  }}
                >
                  Page {page} / {meta.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={page >= meta.totalPages}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    cursor: "pointer",
                    background: "#1e1e2e",
                    color: page >= meta.totalPages ? "#2d2d3f" : "#9ca3af",
                    border: "1px solid #2d2d3f",
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Root App ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  const loadStats = useCallback(() => {
    setStatsLoading(true);
    api("/users/admin/stats")
      .then(setStats)
      .catch(() => setConnectionError(true))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#09090f",
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
        color: "#e2e8f0",
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #09090f; }
        ::-webkit-scrollbar-thumb { background: #2d2d3f; border-radius: 4px; }
        button { font-family: inherit; }
        input, textarea { font-family: inherit; }
      `}</style>

      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          background: "#0d0d1a",
          borderRight: "1px solid #1e1e2e",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <div
          style={{
            padding: "24px 20px 20px",
            borderBottom: "1px solid #1e1e2e",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "linear-gradient(135deg,#4f46e5,#818cf8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              ⚡
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>
                RateAI
              </p>
              <p style={{ fontSize: 11, color: "#4b5563" }}>Admin Dashboard</p>
            </div>
          </div>
        </div>

        <nav style={{ padding: "12px 10px", flex: 1 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: tab === t.id ? 700 : 500,
                cursor: "pointer",
                background:
                  tab === t.id ? "rgba(79,70,229,.15)" : "transparent",
                color: tab === t.id ? "#818cf8" : "#6b7280",
                border: "none",
                marginBottom: 2,
                textAlign: "left",
                transition: "all .15s",
              }}
            >
              <span style={{ fontSize: 16 }}>{t.icon}</span>
              {t.label}
              {t.id === "submissions" && stats?.pendingSubmissions > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "#f87171",
                    color: "white",
                    borderRadius: 999,
                    padding: "1px 7px",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {stats.pendingSubmissions}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: "1px solid #1e1e2e" }}>
          <p style={{ fontSize: 11, color: "#2d2d3f" }}>Connected to</p>
          <p
            style={{
              fontSize: 12,
              color: connectionError ? "#f87171" : "#34d399",
              fontFamily: "monospace",
            }}
          >
            {connectionError ? "● Offline" : "● localhost:8080"}
          </p>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "32px 40px", overflowY: "auto" }}>
        {connectionError && (
          <div
            style={{
              background: "rgba(239,68,68,.08)",
              border: "1px solid rgba(239,68,68,.2)",
              borderRadius: 12,
              padding: "14px 18px",
              marginBottom: 24,
              fontSize: 13,
              color: "#f87171",
            }}
          >
            ⚠️ Cannot connect to backend at{" "}
            <code
              style={{
                fontFamily: "monospace",
                background: "rgba(0,0,0,.3)",
                padding: "1px 6px",
                borderRadius: 4,
              }}
            >
              localhost:8080
            </code>
            . Make sure it's running with{" "}
            <code
              style={{
                fontFamily: "monospace",
                background: "rgba(0,0,0,.3)",
                padding: "1px 6px",
                borderRadius: 4,
              }}
            >
              npm run dev
            </code>{" "}
            and you're logged in as admin.
          </div>
        )}

        {tab === "overview" && (
          <Overview stats={stats} loading={statsLoading} />
        )}
        {tab === "submissions" && <Submissions refresh={loadStats} />}
        {tab === "tools" && <Tools />}
        {tab === "users" && <Users />}
        {tab === "reviews" && <Reviews />}
      </main>
    </div>
  );
}
