import Link from "next/link";
import { GitBranch } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--bg-raised)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <div className="mb-4">
              <Logo size={30} />
            </div>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "var(--text-muted)" }}
            >
              The intelligent discovery and review platform for AI tools,
              models, agents, and bots.
            </p>
            <div className="flex gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg transition-colors hover:opacity-80"
                style={{
                  background: "var(--bg-card)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700 }}>𝕏</span>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg transition-colors hover:opacity-80"
                style={{
                  background: "var(--bg-card)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                <GitBranch size={14} />
              </a>
            </div>
            <p
              className="text-xs mt-6"
              style={{ color: "var(--text-muted)" }}
            >
              Owned &amp; operated by{" "}
              <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                Kunamix Digital Solutions
              </span>
            </p>
          </div>

          {[
            {
              heading: "Explore",
              links: [
                { href: "/categories", label: "All Categories" },
                { href: "/leaderboard", label: "Leaderboard" },
                { href: "/search", label: "Search Tools" },
                { href: "/blog", label: "Blog" },
              ],
            },
            {
              heading: "Categories",
              links: [
                {
                  href: "/categories/language-models",
                  label: "Language Models",
                },
                {
                  href: "/categories/image-generation",
                  label: "Image Generation",
                },
                { href: "/categories/coding-tools", label: "Coding Tools" },
                { href: "/categories/ai-agents", label: "AI Agents" },
              ],
            },
            {
              heading: "Platform",
              links: [
                { href: "/submit", label: "List Your AI" },
                { href: "/write-review", label: "Write a Review" },
                { href: "/api-docs", label: "API" },
                { href: "/about", label: "About RateAI" },
              ],
            },
          ].map(col => (
            <div key={col.heading}>
              <h4
                className="text-xs font-semibold tracking-widest uppercase mb-4"
                style={{ color: "var(--text-muted)" }}
              >
                {col.heading}
              </h4>
              <ul className="space-y-3">
                {col.links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:opacity-80"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col sm:flex-row justify-between items-center pt-8 gap-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            © 2025 RateAI · Owned by Kunamix Digital Solutions. All rights
            reserved.
          </p>
          <div className="flex gap-6">
            {["Terms", "Privacy", "Contact"].map(item => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-xs transition-opacity hover:opacity-80"
                style={{ color: "var(--text-muted)" }}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
