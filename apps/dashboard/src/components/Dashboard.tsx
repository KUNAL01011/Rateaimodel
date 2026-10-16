import { useState, useCallback } from "react";
import { useAuth } from "../lib/auth-context";
import { statsApi } from "../lib/api";
import { useAsync } from "../hooks";
import { Avatar, Spinner } from "./ui";
import { LogoMark } from "./Logo";
import { Overview } from "./Overview";
import { Submissions } from "./Submissions";
import { Tools } from "./Tools";
import { Users } from "./Users";
import { Reviews } from "./Reviews";
import { Blog } from "./Blog";
import { Seo } from "./Seo";
import { Settings } from "./Settings";

// ─── Nav config ───────────────────────────────────────────────────────────────
type Tab =
  | "overview"
  | "submissions"
  | "tools"
  | "users"
  | "reviews"
  | "blog"
  | "seo"
  | "settings";

const TABS: {
  id: Tab;
  icon: string;
  label: string;
  badge?: (stats: ReturnType<typeof useAsync<any>>["data"]) => number | null;
}[] = [
  { id: "overview", icon: "▦", label: "Overview" },
  {
    id: "submissions",
    icon: "📥",
    label: "Submissions",
    badge: s => (s?.pendingSubmissions > 0 ? s.pendingSubmissions : null),
  },
  { id: "tools", icon: "🔧", label: "Tools" },
  { id: "blog", icon: "✍️", label: "Blog" },
  { id: "users", icon: "👥", label: "Users" },
  { id: "reviews", icon: "⭐", label: "Reviews" },
  { id: "seo", icon: "🔍", label: "SEO" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

export function Dashboard() {
  const { user, status, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [loggingOut, setLoggingOut] = useState(false);

  // Stats for sidebar badge
  const statsState = useAsync(() => statsApi.get());
  const stats = statsState.data;

  const refreshStats = useCallback(() => {
    statsState.refetch();
  }, [statsState]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  // Access guard
  if (status === "authenticated" && user?.role !== "admin") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#FAF8F2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#16181D",
              marginBottom: 8,
            }}
          >
            Access Denied
          </h2>
          <p style={{ fontSize: 13, color: "#857F72", marginBottom: 20 }}>
            Your account ({user?.email}) does not have admin privileges.
          </p>
          <button
            onClick={handleLogout}
            style={{
              padding: "9px 20px",
              borderRadius: 8,
              background: "rgba(239,68,68,.1)",
              color: "#B23A2B",
              border: "1px solid rgba(239,68,68,.2)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#FAF8F2",
        fontFamily:
          "'IBM Plex Sans', 'IBM Plex Mono', -apple-system, sans-serif",
        color: "#16181D",
      }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        style={{
          width: 232,
          background: "rgba(26,30,38,.015)",
          borderRight: "1px solid rgba(26,30,38,.06)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Brand */}
        <div
          style={{
            padding: "22px 20px 18px",
            borderBottom: "1px solid rgba(26,30,38,.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <LogoMark size={34} />
            <div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#16181D",
                  letterSpacing: "-0.02em",
                }}
              >
                RateAI
              </p>
              <p
                style={{
                  fontSize: 10,
                  color: "#B2AB99",
                  fontFamily: "monospace",
                }}
              >
                Admin Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "12px 10px", flex: 1 }}>
          {TABS.map(t => {
            const badgeCount = t.badge?.(stats);
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "9px 13px",
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  cursor: "pointer",
                  background: active ? "rgba(30,58,95,.08)" : "transparent",
                  color: active ? "#1E3A5F" : "#857F72",
                  border: `1px solid ${active ? "rgba(30,58,95,.18)" : "transparent"}`,
                  marginBottom: 2,
                  textAlign: "left",
                  transition: "all .15s",
                  fontFamily: "inherit",
                  position: "relative",
                }}
                onMouseEnter={e => {
                  if (!active)
                    (e.currentTarget as HTMLElement).style.color = "#474C57";
                }}
                onMouseLeave={e => {
                  if (!active)
                    (e.currentTarget as HTMLElement).style.color = "#857F72";
                }}
              >
                <span style={{ fontSize: 15, flexShrink: 0 }}>{t.icon}</span>
                <span style={{ flex: 1 }}>{t.label}</span>
                {badgeCount !== null && badgeCount !== undefined && (
                  <span
                    style={{
                      background: "#ef4444",
                      color: "white",
                      borderRadius: 999,
                      padding: "1px 6px",
                      fontSize: 10,
                      fontWeight: 700,
                      lineHeight: 1.6,
                    }}
                  >
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div
          style={{
            padding: "14px 16px",
            borderTop: "1px solid rgba(26,30,38,.05)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar
                src={user.avatarUrl}
                name={user.displayName ?? user.username}
                size={30}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#474C57",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.displayName ?? user.username}
                </p>
                <p
                  style={{
                    fontSize: 10,
                    color: "#B2AB99",
                    fontFamily: "monospace",
                  }}
                >
                  {user.role}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              width: "100%",
              padding: "7px",
              borderRadius: 7,
              background: "rgba(239,68,68,.06)",
              color: loggingOut ? "#B2AB99" : "#B23A2B",
              border: "1px solid rgba(239,68,68,.12)",
              fontSize: 11,
              fontWeight: 600,
              cursor: loggingOut ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all .15s",
            }}
          >
            {loggingOut ? (
              <>
                <Spinner size={11} />
                Signing out...
              </>
            ) : (
              "← Sign Out"
            )}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#0B6353",
                flexShrink: 0,
                boxShadow: "0 0 6px rgba(74,222,128,.5)",
              }}
            />
            <p
              style={{
                fontSize: 10,
                color: "#C4BDAB",
                fontFamily: "monospace",
              }}
            >
              localhost:8080
            </p>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          padding: "32px 40px",
          overflowY: "auto",
          minWidth: 0,
        }}
      >
        {tab === "overview" && <Overview />}
        {tab === "submissions" && <Submissions onStatsRefresh={refreshStats} />}
        {tab === "tools" && <Tools />}
        {tab === "blog" && <Blog />}
        {tab === "users" && <Users />}
        {tab === "reviews" && <Reviews />}
        {tab === "seo" && <Seo />}
        {tab === "settings" && <Settings />}
      </main>
    </div>
  );
}
