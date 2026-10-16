"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** total item count — shown as "x–y of n" when provided */
  totalItems?: number;
  pageSize?: number;
}

/** Build a compact page list with ellipses, e.g. 1 … 4 5 [6] 7 8 … 20 */
function pageList(page: number, total: number): (number | "…")[] {
  if (total <= 7)
    return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

export default function Pagination({
  page,
  totalPages,
  onChange,
  totalItems,
  pageSize,
}: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = pageList(page, totalPages);

  const rangeStart =
    totalItems && pageSize ? (page - 1) * pageSize + 1 : undefined;
  const rangeEnd =
    totalItems && pageSize ? Math.min(page * pageSize, totalItems) : undefined;

  const navBtn =
    "flex items-center justify-center h-9 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
      {rangeStart !== undefined && (
        <p
          className="font-mono text-xs order-2 sm:order-1"
          style={{ color: "var(--text-muted)" }}
        >
          {rangeStart}–{rangeEnd} of {totalItems}
        </p>
      )}

      <nav className="flex items-center gap-1 order-1 sm:order-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className={`${navBtn} w-9`}
          style={{ border: "1px solid var(--border-strong)", color: "var(--text-secondary)" }}
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`e${i}`}
              className="flex items-center justify-center w-9 h-9 font-mono text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`${navBtn} min-w-9 px-2 font-mono text-sm`}
              style={
                p === page
                  ? {
                      background: "var(--primary)",
                      color: "#fff",
                      border: "1px solid var(--primary)",
                    }
                  : {
                      border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                    }
              }
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className={`${navBtn} w-9`}
          style={{ border: "1px solid var(--border-strong)", color: "var(--text-secondary)" }}
        >
          <ChevronRight size={16} />
        </button>
      </nav>

      {/* spacer to balance the range text on desktop */}
      {rangeStart !== undefined && (
        <div className="hidden sm:block order-3" style={{ width: 120 }} />
      )}
    </div>
  );
}
