import { useState } from "react";
import { usersApi, type AdminUser } from "../lib/api";
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
  Modal,
  Avatar,
  ToastContainer,
} from "./ui";

type RoleFilter = "all" | "user" | "owner" | "admin";

const ROLE_VARIANT: Record<string, "default" | "info" | "purple"> = {
  user: "default",
  owner: "info",
  admin: "purple",
};

export function Users() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [roleModal, setRoleModal] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const debouncedQ = useDebounce(q, 350);
  const { toasts, addToast, removeToast } = useToast();

  const { data, loading, error, refetch } = useAsync(
    () =>
      usersApi.getAll({
        page,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
        ...(debouncedQ ? { search: debouncedQ } : {}),
        ...(roleFilter !== "all" ? { role: roleFilter } : {}),
      }),
    [page, debouncedQ, roleFilter]
  );

  const items = data?.data ?? [];
  const meta = data?.meta;

  const handleChangeRole = async (role: string) => {
    if (!roleModal) return;
    setRoleLoading(true);
    try {
      await usersApi.changeRole(roleModal._id, role);
      addToast(
        `Role updated to "${role}" for ${roleModal.displayName ?? roleModal.username}`,
        "success"
      );
      setRoleModal(null);
      refetch();
    } catch (e) {
      addToast(
        e instanceof Error ? e.message : "Failed to change role",
        "error"
      );
    } finally {
      setRoleLoading(false);
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (
      !confirm(
        `Delete user "${user.displayName ?? user.username}"?\nThis will also remove their reviews and saved tools.`
      )
    )
      return;
    setDeleting(user._id);
    try {
      await usersApi.delete(user._id);
      addToast(`User deleted`, "success");
      refetch();
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Delete failed", "error");
    } finally {
      setDeleting(null);
    }
  };

  const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "user", label: "Users" },
    { value: "owner", label: "Owners" },
    { value: "admin", label: "Admins" },
  ];

  return (
    <div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <SectionHeader
        title="Users"
        actions={
          <>
            {ROLE_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => {
                  setRoleFilter(f.value);
                  setPage(1);
                }}
                style={{
                  padding: "5px 11px",
                  borderRadius: 7,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  background:
                    roleFilter === f.value
                      ? "#1d6bf3"
                      : "rgba(255,255,255,.03)",
                  color: roleFilter === f.value ? "white" : "#5b7083",
                  border: `1px solid ${roleFilter === f.value ? "#1d6bf3" : "rgba(255,255,255,.07)"}`,
                  fontFamily: "inherit",
                }}
              >
                {f.label}
              </button>
            ))}
            <Input
              value={q}
              onChange={v => {
                setQ(v);
                setPage(1);
              }}
              placeholder="Search users..."
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
            <Empty icon="👥" title="No users found" />
          ) : (
            <Table
              headers={[
                "User",
                "Email",
                "Role",
                "Reviews",
                "Helpful Votes",
                "API User",
                "Joined",
                "Actions",
              ]}
            >
              {items.map(u => (
                <Tr key={u._id}>
                  <Td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Avatar
                        src={u.avatarUrl}
                        name={u.displayName ?? u.username}
                        size={32}
                      />
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#e2e8f0",
                            fontSize: 13,
                          }}
                        >
                          {u.displayName ?? u.username}
                        </div>
                        <div style={{ fontSize: 11, color: "#2d3d4a" }}>
                          @{u.username}
                        </div>
                      </div>
                    </div>
                  </Td>
                  <Td style={{ color: "#4b5c6b", fontSize: 12 }}>{u.email}</Td>
                  <Td>
                    <Badge variant={ROLE_VARIANT[u.role] ?? "default"}>
                      {u.role}
                    </Badge>
                  </Td>
                  <Td style={{ fontFamily: "monospace", color: "#5b7083" }}>
                    {u.reviewCount}
                  </Td>
                  <Td style={{ fontFamily: "monospace", color: "#5b7083" }}>
                    {u.helpfulVoteCount}
                  </Td>
                  <Td>
                    <Badge variant={u.isApiUser ? "info" : "default"}>
                      {u.isApiUser ? "Yes" : "No"}
                    </Badge>
                  </Td>
                  <Td style={{ fontSize: 12, color: "#2d3d4a" }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </Td>
                  <Td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRoleModal(u)}
                      >
                        Role
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={deleting === u._id}
                        onClick={() => handleDelete(u)}
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

      {/* Role Change Modal */}
      <Modal
        open={!!roleModal}
        onClose={() => setRoleModal(null)}
        title="Change User Role"
        width={360}
      >
        <p style={{ fontSize: 13, color: "#5b7083", marginBottom: 20 }}>
          {roleModal?.displayName ?? roleModal?.username} ·{" "}
          <span style={{ color: "#3d5266" }}>{roleModal?.email}</span>
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(["user", "owner", "admin"] as const).map(r => (
            <button
              key={r}
              disabled={roleLoading}
              onClick={() => handleChangeRole(r)}
              style={{
                padding: "12px 16px",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 600,
                cursor: roleLoading ? "not-allowed" : "pointer",
                textAlign: "left",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontFamily: "inherit",
                background:
                  roleModal?.role === r
                    ? "rgba(29,107,243,.15)"
                    : "rgba(255,255,255,.03)",
                color: roleModal?.role === r ? "#60a5fa" : "#9db4c4",
                border: `1px solid ${roleModal?.role === r ? "rgba(29,107,243,.3)" : "rgba(255,255,255,.07)"}`,
                transition: "all .15s",
              }}
            >
              <span style={{ textTransform: "capitalize" }}>{r}</span>
              {roleModal?.role === r && (
                <span
                  style={{
                    fontSize: 11,
                    color: "#1d6bf3",
                    background: "rgba(29,107,243,.15)",
                    padding: "2px 8px",
                    borderRadius: 4,
                  }}
                >
                  current
                </span>
              )}
            </button>
          ))}
        </div>

        <div
          style={{
            marginTop: 16,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button variant="ghost" onClick={() => setRoleModal(null)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
