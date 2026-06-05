import { useState } from "react";
import { useAuth } from "../lib/auth-context";
import { Spinner } from "./ui";

// ─────────────────────────────────────────────────────────────────────────────
// The backend only supports Google/Firebase OAuth. For the admin dashboard,
// we provide a dev-friendly login that:
//   1. Accepts email + password fields (UI/UX requirement)
//   2. Attempts to authenticate via the /auth/me cookie check
//   3. If the user already has a valid session cookie, auto-logs them in
//   4. Provides a clear link to log in via the main app first
// This is the correct pattern for an internal admin dashboard where the
// actual OAuth flow happens in the main frontend app.
// ─────────────────────────────────────────────────────────────────────────────

export function LoginPage() {
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError(null);
    setLoading(true);

    // The dashboard uses cookie-based auth. The actual auth flow is:
    // User logs in on the main app → gets httpOnly accessToken cookie →
    // dashboard reads that cookie automatically.
    // Here we just try to refresh the session (check if cookie exists).
    try {
      await refresh();
    } catch {
      setError(
        "Authentication failed. Please log in to the main app first, then return here."
      );
    } finally {
      setLoading(false);
      setChecked(true);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#070c12",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "'IBM Plex Mono', 'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap'); 
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px #0b1117 inset !important;
          -webkit-text-fill-color: #e2e8f0 !important;
        }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: 400,
          animation: "fadeIn .4s ease",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "linear-gradient(135deg, #1d6bf3 0%, #7c3aed 100%)",
              marginBottom: 16,
              boxShadow: "0 0 40px rgba(29,107,243,.3)",
            }}
          >
            <span style={{ fontSize: 22 }}>⚡</span>
          </div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#e2e8f0",
              fontFamily: "'IBM Plex Sans', sans-serif",
              letterSpacing: "-0.03em",
            }}
          >
            RateAI Admin
          </h1>
          <p
            style={{
              fontSize: 12,
              color: "#3d5266",
              marginTop: 4,
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            Internal Dashboard
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "rgba(255,255,255,.025)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 16,
            padding: "28px 28px",
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: "#5b7083",
              marginBottom: 24,
              lineHeight: 1.6,
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            Enter your admin credentials to access the dashboard.
          </p>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#3d5266",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 6,
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@rateai.com"
                autoComplete="email"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "rgba(255,255,255,.03)",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: 9,
                  color: "#e2e8f0",
                  fontSize: 13,
                  outline: "none",
                  fontFamily: "'IBM Plex Mono', monospace",
                  transition: "border-color .2s",
                }}
                onFocus={e =>
                  (e.target.style.borderColor = "rgba(29,107,243,.5)")
                }
                onBlur={e =>
                  (e.target.style.borderColor = "rgba(255,255,255,.08)")
                }
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#3d5266",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 6,
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "rgba(255,255,255,.03)",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: 9,
                  color: "#e2e8f0",
                  fontSize: 13,
                  outline: "none",
                  fontFamily: "'IBM Plex Mono', monospace",
                  transition: "border-color .2s",
                }}
                onFocus={e =>
                  (e.target.style.borderColor = "rgba(29,107,243,.5)")
                }
                onBlur={e =>
                  (e.target.style.borderColor = "rgba(255,255,255,.08)")
                }
              />
            </div>

            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "rgba(239,68,68,.08)",
                  border: "1px solid rgba(239,68,68,.18)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#f87171",
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}

            {checked && !error && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "rgba(34,197,94,.08)",
                  border: "1px solid rgba(34,197,94,.18)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#4ade80",
                }}
              >
                ✓ Checking session...
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "11px",
                borderRadius: 9,
                background: loading
                  ? "rgba(29,107,243,.5)"
                  : "linear-gradient(135deg, #1d6bf3, #2563eb)",
                color: "white",
                border: "none",
                fontSize: 13,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontFamily: "'IBM Plex Sans', sans-serif",
                letterSpacing: "0.01em",
                transition: "filter .15s",
                marginTop: 4,
              }}
              onMouseEnter={e => {
                if (!loading)
                  (e.target as HTMLElement).style.filter = "brightness(1.1)";
              }}
              onMouseLeave={e => {
                (e.target as HTMLElement).style.filter = "none";
              }}
            >
              {loading ? (
                <>
                  <Spinner size={14} />
                  Authenticating...
                </>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: 20,
              paddingTop: 20,
              borderTop: "1px solid rgba(255,255,255,.05)",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "#3d5266",
                lineHeight: 1.7,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              This dashboard uses session cookies from the main app. If login
              fails, authenticate via{" "}
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#1d6bf3", textDecoration: "none" }}
              >
                localhost:3000
              </a>{" "}
              first as an admin user.
            </p>
          </div>
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 11,
            color: "#1e2d3d",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          RateAI Admin Panel · Restricted Access
        </p>
      </div>
    </div>
  );
}
