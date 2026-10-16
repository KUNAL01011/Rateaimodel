import { useState } from "react";
import { useAuth } from "../lib/auth-context";
import { authApi } from "../lib/api";
import { Spinner } from "./ui";
import { LogoMark } from "./Logo";

export function LoginPage() {
  const { refresh, setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // POST /api/v1/auth/login — sets httpOnly accessToken cookie + returns user
      const result = await authApi.login(email, password);
      // Refresh auth context so App sees "authenticated"
      setUser(result.user);
      await refresh();
    } catch (err: any) {
      const msg: string = err?.message ?? "Login failed";
      if (msg.toLowerCase().includes("admin")) {
        setError(
          "Access denied — this account does not have admin privileges."
        );
      } else if (err?.status === 401) {
        setError("Incorrect email or password.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF8F2",
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
          -webkit-box-shadow: 0 0 0 30px #FFFFFF inset !important;
          -webkit-text-fill-color: #16181D !important;
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
          <div style={{ display: "inline-flex", marginBottom: 16 }}>
            <LogoMark size={54} />
          </div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#16181D",
              fontFamily: "'IBM Plex Sans', sans-serif",
              letterSpacing: "-0.03em",
            }}
          >
            RateAI Admin
          </h1>
          <p
            style={{
              fontSize: 12,
              color: "#9B9484",
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
            background: "rgba(26,30,38,.025)",
            border: "1px solid rgba(26,30,38,.08)",
            borderRadius: 16,
            padding: "28px 28px",
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: "#6E6A5E",
              marginBottom: 24,
              lineHeight: 1.6,
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            Sign in with your admin credentials.
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
                  color: "#9B9484",
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
                autoFocus
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "rgba(26,30,38,.03)",
                  border: "1px solid rgba(26,30,38,.08)",
                  borderRadius: 9,
                  color: "#16181D",
                  fontSize: 13,
                  outline: "none",
                  fontFamily: "'IBM Plex Mono', monospace",
                  transition: "border-color .2s",
                }}
                onFocus={e =>
                  (e.target.style.borderColor = "rgba(30,58,95,.5)")
                }
                onBlur={e =>
                  (e.target.style.borderColor = "rgba(26,30,38,.08)")
                }
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#9B9484",
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
                  background: "rgba(26,30,38,.03)",
                  border: "1px solid rgba(26,30,38,.08)",
                  borderRadius: 9,
                  color: "#16181D",
                  fontSize: 13,
                  outline: "none",
                  fontFamily: "'IBM Plex Mono', monospace",
                  transition: "border-color .2s",
                }}
                onFocus={e =>
                  (e.target.style.borderColor = "rgba(30,58,95,.5)")
                }
                onBlur={e =>
                  (e.target.style.borderColor = "rgba(26,30,38,.08)")
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
                  color: "#B23A2B",
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "11px",
                borderRadius: 9,
                background: loading
                  ? "rgba(30,58,95,.5)"
                  : "linear-gradient(135deg, #1E3A5F, #15293F)",
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
                  (e.currentTarget as HTMLElement).style.filter =
                    "brightness(1.1)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.filter = "none";
              }}
            >
              {loading ? (
                <>
                  <Spinner size={14} />
                  Signing in...
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
              borderTop: "1px solid rgba(26,30,38,.05)",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "#9B9484",
                lineHeight: 1.7,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              Admin accounts require{" "}
              <code style={{ color: "#857F72" }}>role: "admin"</code> in the
              database. For Google OAuth users, log in via{" "}
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#1E3A5F", textDecoration: "none" }}
              >
                localhost:3000
              </a>{" "}
              first, then return here.
            </p>
          </div>
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 11,
            color: "#C4BDAB",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          RateAI Admin Panel · Restricted Access
        </p>
      </div>
    </div>
  );
}
