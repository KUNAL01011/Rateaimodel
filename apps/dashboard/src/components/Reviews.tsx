import { useState } from "react";
import { reviewsApi, type Review } from "../lib/api";
import { useAsync, useToast } from "../hooks";
import {
  PageLoader,
  ErrorBanner,
  Badge,
  Button,
  SectionHeader,
  Empty,
  Pagination,
  Card,
  ToastContainer,
} from "./ui";

function Stars({ n }: { n: number }) {
  return (
    <span style={{ letterSpacing: 1, fontSize: 12 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < n ? "#B0820C" : "#C4BDAB" }}>
          ★
        </span>
      ))}
    </span>
  );
}

const USE_CASE_LABEL: Record<string, string> = {
  coding_general: "Coding",
  code_review: "Code Review",
  debugging: "Debugging",
  academic_research: "Research",
  summarization: "Summarization",
  translation: "Translation",
  image_generation: "Image Gen",
  text_to_speech: "TTS",
  music_generation: "Music Gen",
  data_analysis: "Data Analysis",
  customer_support_bot: "Support Bot",
  brainstorming: "Brainstorming",
  copywriting: "Copywriting",
  agentic_workflows: "Agents",
};

export function Reviews() {
  const [page, setPage] = useState(1);
  const [showHidden, setShowHidden] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  const { data, loading, error, refetch } = useAsync(
    () =>
      reviewsApi.getAll({
        page,
        limit: 15,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    [page]
  );

  // Note: The getAll API filters isHidden: false by default in reviewService
  // We show all fetched reviews and allow toggling
  const allItems = data?.data ?? [];
  const items = showHidden ? allItems : allItems.filter(r => !r.isHidden);
  const meta = data?.meta;

  const handleHide = async (review: Review) => {
    setActionLoading(review._id);
    try {
      await reviewsApi.hide(review._id, "Admin moderated");
      addToast("Review hidden", "info");
      refetch();
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Action failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnhide = async (review: Review) => {
    setActionLoading(review._id);
    try {
      await reviewsApi.unhide(review._id);
      addToast("Review restored", "success");
      refetch();
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Action failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <SectionHeader
        title="Reviews"
        actions={
          <button
            onClick={() => setShowHidden(v => !v)}
            style={{
              padding: "5px 12px",
              borderRadius: 7,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              background: showHidden ? "#1E3A5F" : "rgba(26,30,38,.03)",
              color: showHidden ? "white" : "#6E6A5E",
              border: `1px solid ${showHidden ? "#1E3A5F" : "rgba(26,30,38,.07)"}`,
              fontFamily: "inherit",
            }}
          >
            {showHidden ? "Showing All" : "Show Hidden"}
          </button>
        }
      />

      {loading && <PageLoader />}
      {error && <ErrorBanner message={error} />}

      {!loading && !error && (
        <>
          {items.length === 0 ? (
            <Empty icon="⭐" title="No reviews found" />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {items.map(r => (
                <Card
                  key={r._id}
                  style={{
                    padding: "16px 20px",
                    opacity: r.isHidden ? 0.55 : 1,
                    borderColor: r.isHidden
                      ? "rgba(239,68,68,.15)"
                      : "rgba(26,30,38,.07)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 16,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Header row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <Stars n={r.ratingOverall} />
                        <Badge variant="info">
                          {USE_CASE_LABEL[r.useCase] ??
                            r.useCase?.replace(/_/g, " ")}
                        </Badge>
                        {r.isHidden && <Badge variant="danger">Hidden</Badge>}
                        {r.wouldRecommend && (
                          <Badge variant="success">Recommends</Badge>
                        )}
                      </div>

                      {/* Review text */}
                      <p
                        style={{
                          fontSize: 13,
                          color: "#474C57",
                          lineHeight: 1.6,
                          marginBottom: 8,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {r.reviewText}
                      </p>

                      {/* Pros/cons row */}
                      {(r.pros || r.cons) && (
                        <div
                          style={{
                            display: "flex",
                            gap: 16,
                            marginBottom: 8,
                          }}
                        >
                          {r.pros && (
                            <p style={{ fontSize: 11, color: "#0B6353" }}>
                              + {r.pros.slice(0, 60)}
                              {r.pros.length > 60 ? "…" : ""}
                            </p>
                          )}
                          {r.cons && (
                            <p style={{ fontSize: 11, color: "#B23A2B" }}>
                              – {r.cons.slice(0, 60)}
                              {r.cons.length > 60 ? "…" : ""}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Meta row */}
                      <div
                        style={{
                          fontSize: 11,
                          color: "#B2AB99",
                          display: "flex",
                          gap: 12,
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        <span>
                          by{" "}
                          <span style={{ color: "#857F72" }}>
                            {r.userId?.displayName ??
                              r.userId?.username ??
                              "Deleted User"}
                          </span>
                        </span>
                        {r.toolId && (
                          <span>
                            on{" "}
                            <span style={{ color: "#857F72" }}>
                              {r.toolId.name}
                            </span>
                          </span>
                        )}
                        <span>
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          👍{" "}
                          <span style={{ color: "#857F72" }}>{r.upvotes}</span>{" "}
                          👎{" "}
                          <span style={{ color: "#857F72" }}>
                            {r.downvotes}
                          </span>
                        </span>
                        {r.hideReason && (
                          <span style={{ color: "#B23A2B" }}>
                            Reason: {r.hideReason}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ flexShrink: 0 }}>
                      {r.isHidden ? (
                        <Button
                          variant="success"
                          size="sm"
                          loading={actionLoading === r._id}
                          onClick={() => handleUnhide(r)}
                        >
                          Restore
                        </Button>
                      ) : (
                        <Button
                          variant="danger"
                          size="sm"
                          loading={actionLoading === r._id}
                          onClick={() => handleHide(r)}
                        >
                          Hide
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
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
