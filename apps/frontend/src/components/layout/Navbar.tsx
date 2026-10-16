"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/hooks";
import { Logo, LogoMark } from "@/components/ui/Logo";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, signInWithGoogle, signOut, loading } = useAuth();

  const navLinks = [
    { href: "/", label: "Discover" },
    { href: "/categories", label: "Categories" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-16"
        style={{
          background: "rgba(250,248,242,0.82)",
          backdropFilter: "blur(20px) saturate(140%)",
          WebkitBackdropFilter: "blur(20px) saturate(140%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="shrink-0">
            <Logo size={30} />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === link.href ? "active" : ""
                }`}
                style={{
                  color:
                    pathname === link.href
                      ? "var(--primary-bright)"
                      : "var(--text-secondary)",
                  background:
                    pathname === link.href
                      ? "rgba(30,58,95,0.08)"
                      : "transparent",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
            >
              <Search size={14} />
              <span>Search tools...</span>
              <kbd
                className="text-xs px-1.5 py-0.5 rounded font-mono"
                style={{
                  background: "var(--bg-raised)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border)",
                }}
              >
                ⌘K
              </kbd>
            </Link>

            <Link
              href="/submit"
              className="hidden md:flex btn-secondary text-xs px-3 py-2 items-center gap-1.5"
            >
              <span>+ List Your AI</span>
            </Link>

            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{ background: "var(--primary-dim)", color: "white" }}
                  >
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <ChevronDown
                    size={12}
                    style={{ color: "var(--text-muted)" }}
                  />
                </button>
                <div
                  className="absolute right-0 top-10 w-44 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 8px 28px rgba(20,24,31,0.14)",
                  }}
                >
                  <div
                    className="px-4 py-3 border-b"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <p
                      className="text-xs font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {user.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={signOut}
                    className="w-full text-left px-4 py-3 text-xs hover:opacity-80 transition-opacity"
                    style={{ color: "var(--accent-red)" }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="btn-primary text-xs px-4 py-2"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            )}

            <button
              className="md:hidden p-2 rounded-lg"
              style={{ color: "var(--text-secondary)" }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden px-4 pb-4 pt-2 flex flex-col gap-1"
            style={{
              background: "var(--bg)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-medium"
                style={{
                  color:
                    pathname === link.href
                      ? "var(--primary-bright)"
                      : "var(--text-secondary)",
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/submit"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 rounded-lg text-sm font-medium"
              style={{ color: "var(--primary-bright)" }}
            >
              + List Your AI
            </Link>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      {authModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setAuthModalOpen(false)}
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-8 relative"
            onClick={e => e.stopPropagation()}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg transition-opacity hover:opacity-70"
              style={{ color: "var(--text-muted)" }}
            >
              <X size={16} />
            </button>
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <LogoMark size={48} />
              </div>
              <h2
                className="font-display text-2xl mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Welcome to RateAI
              </h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Sign in to write reviews, save tools, and get personalized
                recommendations.
              </p>
            </div>
            <button
              onClick={async () => {
                await signInWithGoogle();
                setAuthModalOpen(false);
              }}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg font-medium text-sm transition-all hover:bg-[var(--bg-raised)]"
              style={{
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-strong)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
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
              {loading ? "Signing in..." : "Continue with Google"}
            </button>
            <p
              className="text-center text-xs mt-4"
              style={{ color: "var(--text-muted)" }}
            >
              By signing in, you agree to our Terms of Service and Privacy
              Policy.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
