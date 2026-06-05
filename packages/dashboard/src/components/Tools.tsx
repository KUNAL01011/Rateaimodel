import { useState } from "react";
import { toolsApi, type Tool } from "../lib/api";
import { useAsync, useDebounce, useToast } from "../hooks";
import {
  PageLoader,
  ErrorBanner,
  Badge,
  Button,
  SectionHeader,
  Empty,
  Table,
  Tr,
  Td,
  Pagination,
  Input,
  ToastContainer,
} from "./ui";

const PRICING_VARIANT: Record<
  string,
  "success" | "warning" | "info" | "purple" | "default"
> = {
  free: "success",
  open_source_free: "success",
  freemium: "warning",
  subscription: "info",
  pay_per_token: "info",
  pay_per_use: "info",
  enterprise: "purple",
};

const TYPE_LABELS: Record<string, string> = {
  llm_model: "LLM",
  chat_product: "Chat",
  search_product: "Search",
  coding_tool: "Coding",
  image_model: "Image",
  video_model: "Video",
  audio_model: "Audio",
  embedding_model: "Embed",
  agent_framework: "Agent",
  multimodal_tool: "Multimodal",
  open_source_model: "Open Source",
};

export function Tools() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<string>("newest");
  const debouncedQ = useDebounce(q, 350);
  const { toasts, addToast, removeToast } = useToast();

  const { data, loading, error, refetch } = useAsync(
    () =>
      toolsApi.getAll({
        page,
        limit: 20,
        sort,
        ...(debouncedQ ? { q: debouncedQ } : {}),
      }),
    [page, debouncedQ, sort]
  );

  const handleDelete = async (tool: Tool) => {
    if (!confirm(`Delete "${tool.name}"? This cannot be undone.`)) return;
    try {
      await toolsApi.delete(tool.slug);
      addToast(`Deleted "${tool.name}"`, "success");
      refetch();
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Delete failed", "error");
    }
  };

  const handleToggleFeatured = async (tool: Tool) => {
    try {
      await toolsApi.toggleFeatured(tool.slug, !tool.isFeatured);
      addToast(
        `${!tool.isFeatured ? "Featured" : "Unfeatured"} "${tool.name}"`,
        "success"
      );
      refetch();
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Update failed", "error");
    }
  };

  const items = data?.data ?? [];
  const meta = data?.meta;

  const SORT_OPTIONS = [
    { value: "newest", label: "Newest" },
    { value: "rating", label: "Rating" },
    { value: "reviews_count", label: "Reviews" },
    { value: "name", label: "Name" },
  ];

  return (
    <div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <SectionHeader
        title="Tools"
        actions={
          <>
            {SORT_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => {
                  setSort(o.value);
                  setPage(1);
                }}
                style={{
                  padding: "5px 11px",
                  borderRadius: 7,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  background:
                    sort === o.value ? "#1d6bf3" : "rgba(255,255,255,.03)",
                  color: sort === o.value ? "white" : "#5b7083",
                  border: `1px solid ${sort === o.value ? "#1d6bf3" : "rgba(255,255,255,.07)"}`,
                  fontFamily: "inherit",
                }}
              >
                {o.label}
              </button>
            ))}
            <Input
              value={q}
              onChange={v => {
                setQ(v);
                setPage(1);
              }}
              placeholder="Search tools..."
              style={{ width: 200 }}
            />
          </>
        }
      />

      {loading && <PageLoader />}
      {error && <ErrorBanner message={error} />}

      {!loading && !error && (
        <>
          {items.length === 0 ? (
            <Empty icon="🔧" title="No tools found" />
          ) : (
            <Table
              headers={[
                "Tool",
                "Type",
                "Pricing",
                "Rating",
                "Reviews",
                "Featured",
                "Status",
                "Actions",
              ]}
            >
              {items.map(t => (
                <Tr key={t._id}>
                  <Td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      {t.logoUrl ? (
                        <img
                          src={t.logoUrl}
                          alt=""
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 7,
                            objectFit: "contain",
                            background: "rgba(255,255,255,.04)",
                            border: "1px solid rgba(255,255,255,.06)",
                            flexShrink: 0,
                          }}
                          onError={e => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 7,
                            background:
                              "linear-gradient(135deg,#1d3a5a,#2d1b4e)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            flexShrink: 0,
                          }}
                        >
                          🔧
                        </div>
                      )}
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#e2e8f0",
                            fontSize: 13,
                          }}
                        >
                          {t.name}
                        </div>
                        <div style={{ fontSize: 11, color: "#2d3d4a" }}>
                          /{t.slug}
                        </div>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <Badge variant="info">
                      {TYPE_LABELS[t.toolType] ?? t.toolType}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge
                      variant={PRICING_VARIANT[t.pricingType] ?? "default"}
                    >
                      {t.pricingType?.replace(/_/g, " ")}
                    </Badge>
                  </Td>
                  <Td
                    style={{
                      color: "#facc15",
                      fontWeight: 700,
                      fontFamily: "monospace",
                    }}
                  >
                    {t.ratingOverall?.toFixed(1) ?? "—"}
                  </Td>
                  <Td style={{ fontFamily: "monospace", color: "#5b7083" }}>
                    {t.reviewsCount.toLocaleString()}
                  </Td>
                  <Td>
                    <button
                      onClick={() => handleToggleFeatured(t)}
                      title={
                        t.isFeatured ? "Click to unfeature" : "Click to feature"
                      }
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <Badge variant={t.isFeatured ? "success" : "default"}>
                        {t.isFeatured ? "⭐ Yes" : "No"}
                      </Badge>
                    </button>
                  </Td>
                  <Td>
                    <Badge
                      variant={
                        t.verificationStatus === "verified"
                          ? "success"
                          : t.verificationStatus === "claimed"
                            ? "warning"
                            : "default"
                      }
                    >
                      {t.verificationStatus}
                    </Badge>
                  </Td>
                  <Td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {t.websiteUrl && (
                        <a
                          href={t.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: 11,
                            color: "#1d6bf3",
                            textDecoration: "none",
                            padding: "3px 8px",
                            background: "rgba(29,107,243,.1)",
                            borderRadius: 5,
                            border: "1px solid rgba(29,107,243,.2)",
                          }}
                        >
                          ↗
                        </a>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(t)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Table>
          )}

          {meta && (
            <Pagination
              page={page}
              totalPages={meta.totalPages}
              total={meta.total}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
