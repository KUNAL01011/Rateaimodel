import { useState, useCallback } from "react";
import { submissionsApi, type Submission } from "../lib/api";
import { useAsync, useToast } from "../hooks";
import {
  PageLoader,
  ErrorBanner,
  Badge,
  Button,
  SectionHeader,
  Empty,
  Card,
  Modal,
  Input,
} from "./ui";

function statusVariant(
  status: string
): "warning" | "success" | "danger" | "default" {
  if (status === "pending") return "warning";
  if (status === "approved") return "success";
  if (status === "rejected") return "danger";
  return "default";
}

function SubmissionCard({
  item,
  onApprove,
  onReject,
}: {
  item: Submission;
  onApprove: (item: Submission) => void;
  onReject: (item: Submission) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      style={{
        padding: "16px 20px",
        cursor: "pointer",
        transition: "border-color .15s",
        borderColor: expanded ? "rgba(29,107,243,.3)" : "rgba(255,255,255,.07)",
      }}
      onClick={() => setExpanded(v => !v)}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 12, flex: 1, minWidth: 0 }}>
          {item.logoUrl && (
            <img
              src={item.logoUrl}
              alt=""
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                objectFit: "contain",
                background: "rgba(255,255,255,.04)",
                border: "1px solid rgba(255,255,255,.07)",
                flexShrink: 0,
              }}
              onError={e => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#e2e8f0",
                marginBottom: 2,
              }}
            >
              {item.name}
            </p>
            <p
              style={{
                fontSize: 12,
                color: "#3d5266",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.website}
            </p>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 4,
            flexShrink: 0,
          }}
        >
          <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
          <span style={{ fontSize: 11, color: "#2d3d4a" }}>
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {expanded && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,.05)",
          }}
          onClick={e => e.stopPropagation()}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 14,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 10,
                  color: "#3d5266",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Tagline
              </p>
              <p style={{ fontSize: 12, color: "#9db4c4", lineHeight: 1.5 }}>
                {item.tagline}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: 10,
                  color: "#3d5266",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Submitted by
              </p>
              <p style={{ fontSize: 12, color: "#9db4c4" }}>
                {item.ownerName} · {item.ownerEmail}
              </p>
              {item.submittedById && (
                <p style={{ fontSize: 11, color: "#3d5266", marginTop: 2 }}>
                  @{item.submittedById.username}
                </p>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <p
              style={{
                fontSize: 10,
                color: "#3d5266",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              Description
            </p>
            <p
              style={{
                fontSize: 12,
                color: "#9db4c4",
                lineHeight: 1.6,
                maxHeight: 80,
                overflow: "auto",
              }}
            >
              {item.description}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            <Badge variant="info">{item.toolType}</Badge>
            <Badge variant="purple">{item.pricing}</Badge>
            {item.hasApi && <Badge variant="success">Has API</Badge>}
            {item.isOpenSource && <Badge variant="success">Open Source</Badge>}
            {item.modalities?.map(m => (
              <Badge key={m} variant="default">
                {m}
              </Badge>
            ))}
          </div>

          {item.adminNote && (
            <div
              style={{
                padding: "8px 12px",
                background: "rgba(255,255,255,.02)",
                borderRadius: 8,
                fontSize: 11,
                color: "#4b5c6b",
                marginBottom: 12,
              }}
            >
              Admin note: {item.adminNote}
            </div>
          )}

          {item.status === "pending" && (
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <Button
                variant="success"
                size="sm"
                onClick={() => onApprove(item)}
              >
                ✓ Approve
              </Button>
              <Button variant="danger" size="sm" onClick={() => onReject(item)}>
                ✗ Reject
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export function Submissions({
  onStatsRefresh,
}: {
  onStatsRefresh: () => void;
}) {
  const [filter, setFilter] = useState("pending");
  const [approveTarget, setApproveTarget] = useState<Submission | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Submission | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [slug, setSlug] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const { data, loading, error, refetch } = useAsync(
    () => submissionsApi.getAll(filter),
    [filter]
  );

  const items = data?.data ?? [];

  const handleApprove = useCallback(async () => {
    if (!approveTarget) return;
    setActionLoading(true);
    const finalSlug =
      slug ||
      approveTarget.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    try {
      await submissionsApi.approve(approveTarget._id, finalSlug, adminNote);
      addToast(`✓ "${approveTarget.name}" approved and listed`, "success");
      setApproveTarget(null);
      setAdminNote("");
      setSlug("");
      refetch();
      onStatsRefresh();
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Approval failed", "error");
    } finally {
      setActionLoading(false);
    }
  }, [approveTarget, slug, adminNote, addToast, refetch, onStatsRefresh]);

  const handleReject = useCallback(async () => {
    if (!rejectTarget) return;
    setActionLoading(true);
    try {
      await submissionsApi.reject(rejectTarget._id, adminNote);
      addToast(`Submission rejected`, "info");
      setRejectTarget(null);
      setAdminNote("");
      refetch();
      onStatsRefresh();
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Rejection failed", "error");
    } finally {
      setActionLoading(false);
    }
  }, [rejectTarget, adminNote, addToast, refetch, onStatsRefresh]);

  const FILTERS = ["pending", "approved", "rejected", "all"];

  return (
    <div>
      {/* Toast */}
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {toasts.map(t => (
          <div
            key={t.id}
            onClick={() => removeToast(t.id)}
            style={{
              padding: "11px 18px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              background:
                t.type === "success"
                  ? "#052e16"
                  : t.type === "error"
                    ? "#450a0a"
                    : "#0c1a2e",
              color:
                t.type === "success"
                  ? "#4ade80"
                  : t.type === "error"
                    ? "#f87171"
                    : "#60a5fa",
              border: `1px solid ${t.type === "success" ? "rgba(74,222,128,.2)" : t.type === "error" ? "rgba(248,113,113,.2)" : "rgba(96,165,250,.2)"}`,
            }}
          >
            {t.message}
          </div>
        ))}
      </div>

      <SectionHeader
        title="Tool Submissions"
        actions={
          <div style={{ display: "flex", gap: 6 }}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 7,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  background:
                    filter === f ? "#1d6bf3" : "rgba(255,255,255,.03)",
                  color: filter === f ? "white" : "#5b7083",
                  border: `1px solid ${filter === f ? "#1d6bf3" : "rgba(255,255,255,.07)"}`,
                  fontFamily: "inherit",
                  textTransform: "capitalize",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        }
      />

      {loading && <PageLoader />}
      {error && <ErrorBanner message={error} />}
      {!loading && !error && items.length === 0 && (
        <Empty icon="📭" title={`No ${filter} submissions`} />
      )}

      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map(item => (
            <SubmissionCard
              key={item._id}
              item={item}
              onApprove={setApproveTarget}
              onReject={setRejectTarget}
            />
          ))}
        </div>
      )}

      {/* Approve Modal */}
      <Modal
        open={!!approveTarget}
        onClose={() => {
          setApproveTarget(null);
          setAdminNote("");
          setSlug("");
        }}
        title="✓ Approve Submission"
      >
        <p style={{ fontSize: 13, color: "#5b7083", marginBottom: 20 }}>
          {approveTarget?.name} · {approveTarget?.website}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Tool Slug (URL-safe, auto-generated if empty)"
            value={slug}
            onChange={setSlug}
            placeholder={
              approveTarget?.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") ??
              "tool-slug"
            }
          />

          <div>
            <label
              style={{
                display: "block",
                fontSize: 10,
                fontWeight: 600,
                color: "#3d5266",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 6,
              }}
            >
              Admin Note (optional)
            </label>
            <textarea
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              placeholder="Looks great! Quality tool."
              rows={3}
              style={{
                width: "100%",
                padding: "9px 13px",
                background: "rgba(255,255,255,.03)",
                border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 8,
                color: "#e2e8f0",
                fontSize: 13,
                outline: "none",
                resize: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              paddingTop: 4,
            }}
          >
            <Button
              variant="ghost"
              onClick={() => {
                setApproveTarget(null);
                setAdminNote("");
                setSlug("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              loading={actionLoading}
              onClick={handleApprove}
            >
              Approve & Publish
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        open={!!rejectTarget}
        onClose={() => {
          setRejectTarget(null);
          setAdminNote("");
        }}
        title="✗ Reject Submission"
      >
        <p style={{ fontSize: 13, color: "#5b7083", marginBottom: 20 }}>
          {rejectTarget?.name}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 10,
                fontWeight: 600,
                color: "#3d5266",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 6,
              }}
            >
              Reason for Rejection
            </label>
            <textarea
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              placeholder="Please provide a reason..."
              rows={3}
              style={{
                width: "100%",
                padding: "9px 13px",
                background: "rgba(255,255,255,.03)",
                border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 8,
                color: "#e2e8f0",
                fontSize: 13,
                outline: "none",
                resize: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              paddingTop: 4,
            }}
          >
            <Button
              variant="ghost"
              onClick={() => {
                setRejectTarget(null);
                setAdminNote("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={actionLoading}
              onClick={handleReject}
            >
              Reject Submission
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
