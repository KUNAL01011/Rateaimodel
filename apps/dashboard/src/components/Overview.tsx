import { statsApi } from "../lib/api";
import { useAsync } from "../hooks";
import { PageLoader, ErrorBanner } from "./ui";

function StatCard({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
  icon: string;
}) {
  return (
    <div
      style={{
        background: "rgba(26,30,38,.025)",
        border: "1px solid rgba(26,30,38,.07)",
        borderRadius: 12,
        padding: "20px 22px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -10,
          right: -10,
          fontSize: 56,
          opacity: 0.06,
          lineHeight: 1,
        }}
      >
        {icon}
      </div>
      <p
        style={{
          fontSize: 11,
          color: "#857F72",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 8,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 34,
          fontWeight: 700,
          color: accent,
          fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
          lineHeight: 1,
          marginBottom: sub ? 6 : 0,
          letterSpacing: "-0.03em",
        }}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {sub && <p style={{ fontSize: 11, color: "#9B9484" }}>{sub}</p>}
    </div>
  );
}

export function Overview() {
  const { data: stats, loading, error } = useAsync(() => statsApi.get());

  if (loading) return <PageLoader />;
  if (error) return <ErrorBanner message={error} />;
  if (!stats) return null;

  const roleColors: Record<string, string> = {
    admin: "#6D28D9",
    owner: "#E6B84C",
    user: "#0B6353",
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#16181D",
            letterSpacing: "-0.03em",
            marginBottom: 4,
          }}
        >
          Platform Overview
        </h2>
        <p style={{ fontSize: 13, color: "#9B9484" }}>
          Real-time snapshot of RateAI platform metrics
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 14,
          marginBottom: 32,
        }}
      >
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          accent="#E6B84C"
          icon="👥"
        />
        <StatCard
          label="Total Tools"
          value={stats.totalTools}
          accent="#0B6353"
          icon="🔧"
        />
        <StatCard
          label="Total Reviews"
          value={stats.totalReviews}
          accent="#B0820C"
          icon="⭐"
        />
        <StatCard
          label="Pending Submissions"
          value={stats.pendingSubmissions}
          sub="Awaiting admin review"
          accent={stats.pendingSubmissions > 0 ? "#B23A2B" : "#0B6353"}
          icon="📥"
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#9B9484",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 12,
          }}
        >
          Users by Role
        </p>
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          {Object.entries(stats.roleBreakdown ?? {}).map(([role, count]) => (
            <div
              key={role}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 18px",
                background: "rgba(26,30,38,.025)",
                border: "1px solid rgba(26,30,38,.07)",
                borderRadius: 10,
                minWidth: 140,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: roleColors[role] ?? "#857F72",
                  flexShrink: 0,
                }}
              />
              <div>
                <p
                  style={{
                    fontSize: 12,
                    color: "#6E6A5E",
                    textTransform: "capitalize",
                  }}
                >
                  {role}
                </p>
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#16181D",
                    fontFamily: "monospace",
                    lineHeight: 1.1,
                  }}
                >
                  {Number(count).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick ratio bar */}
      <div
        style={{
          background: "rgba(26,30,38,.02)",
          border: "1px solid rgba(26,30,38,.06)",
          borderRadius: 12,
          padding: "18px 20px",
        }}
      >
        <p
          style={{
            fontSize: 11,
            color: "#9B9484",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 12,
          }}
        >
          Reviews per Tool Ratio
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              flex: 1,
              height: 8,
              background: "rgba(26,30,38,.05)",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min(100, (stats.totalReviews / Math.max(stats.totalTools, 1)) * 10)}%`,
                height: "100%",
                background: "linear-gradient(90deg, #1E3A5F, #1E3A5F)",
                borderRadius: 4,
              }}
            />
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#16181D",
              fontFamily: "monospace",
              minWidth: 60,
            }}
          >
            {(stats.totalReviews / Math.max(stats.totalTools, 1)).toFixed(1)}x
          </span>
        </div>
      </div>
    </div>
  );
}
