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
  ToastContainer,
} from "./ui";

function statusVariant(
  status: string
): "warning" | "success" | "danger" | "default" {
  if (status === "pending") return "warning";
  if (status === "approved") return "success";
  if (status === "rejected") return "danger";
  return "default";
}

// ─── Edit Submission Modal ────────────────────────────────────────────────────
function EditSubmissionModal({
  item,
  open,
  onClose,
  onSaved,
}: {
  item: Submission;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: item.name,
    website: item.website,
    tagline: item.tagline,
    description: item.description,
    toolType: item.toolType,
    pricing: item.pricing,
    pricingDetails: item.pricingDetails ?? "",
    ownerName: item.ownerName,
    ownerEmail: item.ownerEmail,
    hasApi: item.hasApi,
    isOpenSource: item.isOpenSource,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (v: any) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    setErr(null);
    try {
      await submissionsApi.update(item._id, form);
      onSaved();
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const TOOL_TYPE_OPTIONS = [
    "LLM / Language Model",
    "Image Generation",
    "Video Generation",
    "Audio / Music",
    "Code Assistant",
    "AI Agent",
    "Chatbot / Bot",
    "Workflow Automation",
    "Data & Analytics",
    "Multimodal",
    "Other",
  ];
  const PRICING_OPTIONS = [
    "Free",
    "Freemium",
    "Paid (Subscription)",
    "Pay-as-you-go",
    "Enterprise",
    "Open Source",
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`✏️ Edit Submission — ${item.name}`}
      width={600}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          <Input
            label="Tool Name"
            value={form.name}
            onChange={set("name")}
            placeholder="My AI Tool"
          />
          <Input
            label="Website"
            value={form.website}
            onChange={set("website")}
            placeholder="https://..."
          />
        </div>
        <Input
          label="Tagline"
          value={form.tagline}
          onChange={set("tagline")}
          placeholder="One-line description"
        />
        <div>
          <label
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#6E6A5E",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "block",
              marginBottom: 4,
            }}
          >
            Description
          </label>
          <textarea
            value={form.description}
            onChange={e => set("description")(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: "9px 13px",
              background: "rgba(26,30,38,.03)",
              border: "1px solid rgba(26,30,38,.08)",
              borderRadius: 8,
              color: "#16181D",
              fontSize: 13,
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#6E6A5E",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: 4,
              }}
            >
              Tool Type
            </label>
            <select
              value={form.toolType}
              onChange={e => set("toolType")(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 13px",
                background: "rgba(26,30,38,.03)",
                border: "1px solid rgba(26,30,38,.08)",
                borderRadius: 8,
                color: "#16181D",
                fontSize: 13,
                outline: "none",
                fontFamily: "inherit",
              }}
            >
              {TOOL_TYPE_OPTIONS.map(t => (
                <option key={t} value={t} style={{ background: "#FFFFFF" }}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#6E6A5E",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: 4,
              }}
            >
              Pricing
            </label>
            <select
              value={form.pricing}
              onChange={e => set("pricing")(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 13px",
                background: "rgba(26,30,38,.03)",
                border: "1px solid rgba(26,30,38,.08)",
                borderRadius: 8,
                color: "#16181D",
                fontSize: 13,
                outline: "none",
                fontFamily: "inherit",
              }}
            >
              {PRICING_OPTIONS.map(p => (
                <option key={p} value={p} style={{ background: "#FFFFFF" }}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Pricing Details"
          value={form.pricingDetails}
          onChange={set("pricingDetails")}
          placeholder="e.g. Free up to 10k tokens/month"
        />

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          <Input
            label="Owner Name"
            value={form.ownerName}
            onChange={set("ownerName")}
          />
          <Input
            label="Owner Email"
            value={form.ownerEmail}
            onChange={set("ownerEmail")}
          />
        </div>

        <div style={{ display: "flex", gap: 24, padding: "4px 0" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              fontSize: 13,
              color: "#474C57",
            }}
          >
            <div
              onClick={() => set("hasApi")(!form.hasApi)}
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                border: `1.5px solid ${form.hasApi ? "#1E3A5F" : "rgba(26,30,38,.15)"}`,
                background: form.hasApi ? "#1E3A5F" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all .15s",
              }}
            >
              {form.hasApi && (
                <span style={{ color: "white", fontSize: 10 }}>✓</span>
              )}
            </div>
            Has API
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              fontSize: 13,
              color: "#474C57",
            }}
          >
            <div
              onClick={() => set("isOpenSource")(!form.isOpenSource)}
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                border: `1.5px solid ${form.isOpenSource ? "#1E3A5F" : "rgba(26,30,38,.15)"}`,
                background: form.isOpenSource ? "#1E3A5F" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all .15s",
              }}
            >
              {form.isOpenSource && (
                <span style={{ color: "white", fontSize: 10 }}>✓</span>
              )}
            </div>
            Open Source
          </label>
        </div>

        {err && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(239,68,68,.08)",
              border: "1px solid rgba(239,68,68,.2)",
              borderRadius: 8,
              fontSize: 12,
              color: "#B23A2B",
            }}
          >
            {err}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            paddingTop: 8,
            borderTop: "1px solid rgba(26,30,38,.05)",
          }}
        >
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Submission Card ──────────────────────────────────────────────────────────
function SubmissionCard({
  item,
  onApprove,
  onReject,
  onEdit,
  onDelete,
}: {
  item: Submission;
  onApprove: (item: Submission) => void;
  onReject: (item: Submission) => void;
  onEdit: (item: Submission) => void;
  onDelete: (item: Submission) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      style={{
        padding: "16px 20px",
        cursor: "pointer",
        transition: "border-color .15s",
        borderColor: expanded ? "rgba(30,58,95,.3)" : "rgba(26,30,38,.07)",
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
                background: "rgba(26,30,38,.04)",
                border: "1px solid rgba(26,30,38,.07)",
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
                color: "#16181D",
                marginBottom: 2,
              }}
            >
              {item.name}
            </p>
            <p
              style={{
                fontSize: 12,
                color: "#9B9484",
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
          <span style={{ fontSize: 11, color: "#B2AB99" }}>
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {expanded && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid rgba(26,30,38,.05)",
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
                  color: "#9B9484",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Tagline
              </p>
              <p style={{ fontSize: 12, color: "#474C57", lineHeight: 1.5 }}>
                {item.tagline}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: 10,
                  color: "#9B9484",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                Submitted by
              </p>
              <p style={{ fontSize: 12, color: "#474C57" }}>
                {item.ownerName} · {item.ownerEmail}
              </p>
              {item.submittedById && (
                <p style={{ fontSize: 11, color: "#9B9484", marginTop: 2 }}>
                  @{item.submittedById.username}
                </p>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <p
              style={{
                fontSize: 10,
                color: "#9B9484",
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
                color: "#474C57",
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
                background: "rgba(26,30,38,.02)",
                borderRadius: 8,
                fontSize: 11,
                color: "#857F72",
                marginBottom: 12,
              }}
            >
              Admin note: {item.adminNote}
            </div>
          )}

          {/* Action row */}
          <div
            style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}
          >
            {item.status === "pending" && (
              <>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => onApprove(item)}
                >
                  ✓ Approve
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onReject(item)}
                >
                  ✗ Reject
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(item)}
                >
                  ✏️ Edit
                </Button>
              </>
            )}
            {item.status !== "pending" && (
              <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                ✏️ View/Edit
              </Button>
            )}
            <Button variant="danger" size="sm" onClick={() => onDelete(item)}>
              🗑️ Delete
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Main Submissions Component ───────────────────────────────────────────────
export function Submissions({
  onStatsRefresh,
}: {
  onStatsRefresh: () => void;
}) {
  const [filter, setFilter] = useState("pending");
  const [approveTarget, setApproveTarget] = useState<Submission | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Submission | null>(null);
  const [editTarget, setEditTarget] = useState<Submission | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Submission | null>(null);
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
    } catch (e: any) {
      addToast(e?.message ?? "Approval failed", "error");
    } finally {
      setActionLoading(false);
    }
  }, [approveTarget, slug, adminNote, addToast, refetch, onStatsRefresh]);

  const handleReject = useCallback(async () => {
    if (!rejectTarget) return;
    setActionLoading(true);
    try {
      await submissionsApi.reject(rejectTarget._id, adminNote);
      addToast("Submission rejected", "info");
      setRejectTarget(null);
      setAdminNote("");
      refetch();
      onStatsRefresh();
    } catch (e: any) {
      addToast(e?.message ?? "Rejection failed", "error");
    } finally {
      setActionLoading(false);
    }
  }, [rejectTarget, adminNote, addToast, refetch, onStatsRefresh]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await submissionsApi.delete(deleteTarget._id);
      addToast(`Submission deleted`, "success");
      setDeleteTarget(null);
      refetch();
      onStatsRefresh();
    } catch (e: any) {
      addToast(e?.message ?? "Delete failed", "error");
    } finally {
      setActionLoading(false);
    }
  }, [deleteTarget, addToast, refetch, onStatsRefresh]);

  const FILTERS = ["pending", "approved", "rejected", "all"];

  return (
    <div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

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
                    filter === f ? "#1E3A5F" : "rgba(26,30,38,.03)",
                  color: filter === f ? "white" : "#6E6A5E",
                  border: `1px solid ${filter === f ? "#1E3A5F" : "rgba(26,30,38,.07)"}`,
                  fontFamily: "inherit",
                  textTransform: "capitalize" as const,
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
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* ── Edit Submission Modal ── */}
      {editTarget && (
        <EditSubmissionModal
          item={editTarget}
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            addToast("Submission updated", "success");
            refetch();
          }}
        />
      )}

      {/* ── Delete Confirm ── */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="🗑️ Delete Submission"
        width={380}
      >
        <p
          style={{
            fontSize: 13,
            color: "#6E6A5E",
            marginBottom: 20,
            lineHeight: 1.5,
          }}
        >
          Permanently delete the submission for{" "}
          <strong style={{ color: "#16181D" }}>{deleteTarget?.name}</strong>?
          This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={actionLoading}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </Modal>

      {/* ── Approve Modal ── */}
      <Modal
        open={!!approveTarget}
        onClose={() => {
          setApproveTarget(null);
          setAdminNote("");
          setSlug("");
        }}
        title="✓ Approve Submission"
      >
        <p style={{ fontSize: 13, color: "#6E6A5E", marginBottom: 20 }}>
          {approveTarget?.name} · {approveTarget?.website}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Tool Slug (auto-generated if empty)"
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
                color: "#9B9484",
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
              placeholder="Looks great!"
              rows={3}
              style={{
                width: "100%",
                padding: "9px 13px",
                background: "rgba(26,30,38,.03)",
                border: "1px solid rgba(26,30,38,.08)",
                borderRadius: 8,
                color: "#16181D",
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

      {/* ── Reject Modal ── */}
      <Modal
        open={!!rejectTarget}
        onClose={() => {
          setRejectTarget(null);
          setAdminNote("");
        }}
        title="✗ Reject Submission"
      >
        <p style={{ fontSize: 13, color: "#6E6A5E", marginBottom: 20 }}>
          {rejectTarget?.name}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 10,
                fontWeight: 600,
                color: "#9B9484",
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
                background: "rgba(26,30,38,.03)",
                border: "1px solid rgba(26,30,38,.08)",
                borderRadius: 8,
                color: "#16181D",
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
