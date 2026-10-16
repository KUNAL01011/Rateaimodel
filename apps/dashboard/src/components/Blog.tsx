import { useCallback, useEffect, useRef, useState } from "react";
import { marked } from "marked";
import { blogApi, type BlogPost, type BlogInput } from "../lib/api";
import { useToast } from "../hooks";
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
  ToastContainer,
} from "./ui";
import {
  FormCard,
  Field,
  TextArea,
  Toggle,
  Tabs,
  Segmented,
  ImageDrop,
  PageHeading,
} from "./form-kit";

const INK_TEXT = "#16181D";
const MUTED = "#6E6A5E";
const FAINT = "#9B9484";
const LINE = "rgba(26,30,38,.1)";
const LINE_STRONG = "rgba(26,30,38,.2)";
const PAPER_RAISED = "#F1EDE2";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const toLocalInput = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  tags: string;
  category: string;
  authorName: string;
  status: "draft" | "published";
  featured: boolean;
  publishedAt: string; // datetime-local
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string;
  noindex: boolean;
}

const EMPTY: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  tags: "",
  category: "",
  authorName: "RateAI Team",
  status: "draft",
  featured: false,
  publishedAt: "",
  metaTitle: "",
  metaDescription: "",
  ogImageUrl: "",
  noindex: false,
};

const PROSE_CSS = `
.bprose{color:#2A2F3A;font-size:15px;line-height:1.75;}
.bprose>*+*{margin-top:1em;}
.bprose h2{font-family:var(--font-serif);font-size:1.6rem;color:#16181D;margin-top:1.4em;font-weight:500;}
.bprose h3{font-family:var(--font-serif);font-size:1.25rem;color:#16181D;margin-top:1.2em;font-weight:500;}
.bprose a{color:#234873;text-decoration:underline;}
.bprose strong{color:#16181D;}
.bprose ul,.bprose ol{padding-left:1.3em;}
.bprose ul{list-style:disc;}.bprose ol{list-style:decimal;}
.bprose blockquote{border-left:3px solid #B0820C;padding-left:1em;font-style:italic;color:#16181D;}
.bprose code{font-family:var(--font-mono);font-size:.88em;background:#F1EDE2;padding:2px 5px;border-radius:4px;}
.bprose pre{background:#F1EDE2;border:1px solid ${LINE};border-radius:8px;padding:14px;overflow-x:auto;}
.bprose pre code{background:none;padding:0;}
.bprose img{border-radius:8px;border:1px solid ${LINE};max-width:100%;}
.bprose hr{border:none;border-top:1px solid ${LINE};margin:1.5em 0;}
`;

function Editor({
  initial,
  onClose,
  onSaved,
}: {
  initial: BlogPost | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          ...EMPTY,
          title: initial.title,
          slug: initial.slug,
          excerpt: initial.excerpt,
          content: initial.content,
          coverImageUrl: initial.coverImageUrl ?? "",
          tags: initial.tags.join(", "),
          category: initial.category ?? "",
          authorName: initial.authorName,
          status: initial.status,
          featured: initial.featured ?? false,
          publishedAt: toLocalInput(initial.publishedAt),
          metaTitle: initial.metaTitle ?? "",
          metaDescription: initial.metaDescription ?? "",
          ogImageUrl: initial.ogImageUrl ?? "",
          noindex: initial.noindex ?? false,
        }
      : EMPTY
  );
  const [tab, setTab] = useState("content");
  const [mode, setMode] = useState("split");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const ta = useRef<HTMLTextAreaElement>(null);
  const imgInput = useRef<HTMLInputElement>(null);

  const set = (k: keyof FormState) => (v: any) => setForm(f => ({ ...f, [k]: v }));

  const surround = (before: string, after = before) => {
    const el = ta.current;
    if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd;
    const sel = form.content.slice(s, e) || "text";
    const next = form.content.slice(0, s) + before + sel + after + form.content.slice(e);
    setForm(f => ({ ...f, content: next }));
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = s + before.length;
      el.selectionEnd = s + before.length + sel.length;
    });
  };
  const prefixLine = (prefix: string) => {
    const el = ta.current;
    const s = el?.selectionStart ?? form.content.length;
    const before = form.content.slice(0, s);
    const lineStart = before.lastIndexOf("\n") + 1;
    const next = form.content.slice(0, lineStart) + prefix + form.content.slice(lineStart);
    setForm(f => ({ ...f, content: next }));
  };
  const insert = (text: string) => {
    const el = ta.current;
    const s = el?.selectionStart ?? form.content.length;
    setForm(f => ({ ...f, content: f.content.slice(0, s) + text + f.content.slice(s) }));
  };

  const uploadInline = async (file?: File) => {
    if (!file) return;
    try {
      const { uploadApi } = await import("../lib/api");
      const res = await uploadApi.image(file, "blog");
      insert(`\n\n![${file.name.replace(/\.[^.]+$/, "")}](${res.url})\n\n`);
    } catch (e: any) {
      setErr(e?.message ?? "Image upload failed");
    }
  };

  const save = async (publish?: boolean) => {
    if (!form.title.trim()) { setErr("Title is required"); setTab("content"); return; }
    if (!form.content.trim()) { setErr("Write some content first"); setTab("content"); return; }
    setSaving(true);
    setErr(null);
    const status = publish === undefined ? form.status : publish ? "published" : "draft";
    const payload: BlogInput = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      excerpt: form.excerpt || form.content.replace(/[#*_>`-]/g, "").trim().slice(0, 180),
      content: form.content,
      coverImageUrl: form.coverImageUrl || undefined,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      category: form.category || undefined,
      authorName: form.authorName || "RateAI Team",
      status,
      featured: form.featured,
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
      ogImageUrl: form.ogImageUrl || undefined,
      noindex: form.noindex,
      publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
    };
    try {
      if (initial) await blogApi.update(initial._id, payload);
      else await blogApi.create(payload);
      onSaved(initial ? "Post updated" : status === "published" ? "Post published" : "Draft saved");
    } catch (e: any) {
      setErr(e?.message ?? "Save failed");
      setSaving(false);
    }
  };

  const html = marked.parse(form.content || "") as string;
  const words = form.content.trim().split(/\s+/).filter(Boolean).length;
  const readMin = Math.max(1, Math.round(words / 200));

  const TB = ({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title: string }) => (
    <button onClick={onClick} title={title} style={{ minWidth: 30, height: 30, padding: "0 7px", borderRadius: 7, border: `1px solid ${LINE}`, background: "#fff", color: INK_TEXT, cursor: "pointer", fontSize: 13, fontFamily: "var(--font-mono)" }}>
      {children}
    </button>
  );

  return (
    <div>
      <style>{PROSE_CSS}</style>
      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: MUTED, fontSize: 13, cursor: "pointer", marginBottom: 4, padding: 0 }}>
            ← All posts
          </button>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 30, fontWeight: 500, color: INK_TEXT }}>
            {initial ? "Edit post" : "New post"}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="outline" loading={saving} onClick={() => save(false)}>Save draft</Button>
          <Button variant="primary" loading={saving} onClick={() => save(true)}>↗ Publish</Button>
        </div>
      </div>

      {err && (
        <div style={{ padding: "10px 14px", background: "rgba(178,58,43,.08)", border: "1px solid rgba(178,58,43,.25)", borderRadius: 8, fontSize: 13, color: "#B23A2B", marginBottom: 16 }}>
          {err}
        </div>
      )}

      <Tabs tabs={[{ id: "content", label: "Content" }, { id: "seo", label: "SEO & sharing" }]} active={tab} onChange={setTab} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 22, alignItems: "start" }}>
        {/* Main column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {tab === "content" ? (
            <>
              <FormCard>
                <input
                  value={form.title}
                  onChange={e => { set("title")(e.target.value); if (!initial) set("slug")(slugify(e.target.value)); }}
                  placeholder="Post title"
                  style={{ width: "100%", border: "none", outline: "none", fontFamily: "var(--font-serif)", fontSize: 30, fontWeight: 500, color: INK_TEXT, background: "transparent", marginBottom: 10 }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 0, fontSize: 13, color: MUTED, marginBottom: 16 }}>
                  <span style={{ fontFamily: "var(--font-mono)" }}>rateaimodel.com/blog/</span>
                  <input value={form.slug} onChange={e => set("slug")(e.target.value)} placeholder="auto-from-title" style={{ flex: 1, border: "none", outline: "none", background: PAPER_RAISED, padding: "4px 8px", borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 12, color: INK_TEXT }} />
                </div>
                <TextArea label="Excerpt" max={200} rows={2} value={form.excerpt} onChange={set("excerpt")} placeholder="A one or two sentence summary that makes people want to read on." hint="Shown on blog cards. Leave empty to generate one from the article." />
              </FormCard>

              <FormCard>
                {/* Toolbar */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${LINE}` }}>
                  <TB title="Heading 2" onClick={() => prefixLine("## ")}>H2</TB>
                  <TB title="Heading 3" onClick={() => prefixLine("### ")}>H3</TB>
                  <TB title="Bold" onClick={() => surround("**")}>B</TB>
                  <TB title="Italic" onClick={() => surround("*")}><em>I</em></TB>
                  <TB title="Strikethrough" onClick={() => surround("~~")}>S̶</TB>
                  <TB title="Link" onClick={() => surround("[", "](https://)")}>🔗</TB>
                  <TB title="Bullet list" onClick={() => prefixLine("- ")}>•</TB>
                  <TB title="Numbered list" onClick={() => prefixLine("1. ")}>1.</TB>
                  <TB title="Checklist" onClick={() => prefixLine("- [ ] ")}>☑</TB>
                  <TB title="Inline code" onClick={() => surround("`")}>&lt;/&gt;</TB>
                  <TB title="Code block" onClick={() => insert("\n```\n\n```\n")}>▦</TB>
                  <TB title="Quote" onClick={() => prefixLine("> ")}>❝</TB>
                  <TB title="Image" onClick={() => imgInput.current?.click()}>🖼</TB>
                  <TB title="Divider" onClick={() => insert("\n\n---\n\n")}>―</TB>
                  <input ref={imgInput} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { uploadInline(e.target.files?.[0]); e.target.value = ""; }} />
                  <div style={{ marginLeft: "auto" }}>
                    <Segmented options={[{ id: "write", label: "Write" }, { id: "split", label: "Split" }, { id: "preview", label: "Preview" }]} value={mode} onChange={setMode} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: mode === "split" ? "1fr 1fr" : "1fr", gap: 16 }}>
                  {mode !== "preview" && (
                    <textarea
                      ref={ta}
                      value={form.content}
                      onChange={e => set("content")(e.target.value)}
                      onDrop={e => { e.preventDefault(); uploadInline(e.dataTransfer.files?.[0]); }}
                      onDragOver={e => e.preventDefault()}
                      placeholder={"Start writing…\n\nTip: paste straight from Google Docs, Word or Notion — formatting is converted to Markdown. Paste or drop images to upload them."}
                      rows={22}
                      style={{ width: "100%", border: `1px solid ${LINE}`, borderRadius: 8, padding: 14, outline: "none", resize: "vertical", fontFamily: "var(--font-mono)", fontSize: 13.5, lineHeight: 1.7, color: INK_TEXT, background: "#fff" }}
                    />
                  )}
                  {mode !== "write" && (
                    <div style={{ border: `1px solid ${LINE}`, borderRadius: 8, padding: 16, minHeight: 360, background: "#fff", overflow: "auto" }}>
                      {form.content.trim() ? (
                        <div className="bprose" dangerouslySetInnerHTML={{ __html: html }} />
                      ) : (
                        <p style={{ color: FAINT, fontStyle: "italic", fontSize: 14 }}>Nothing to preview yet.</p>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: FAINT, fontFamily: "var(--font-mono)" }}>
                  <span>{words} words · ~{readMin} min read</span>
                  <span>Markdown · images → Cloudinary</span>
                </div>
              </FormCard>
            </>
          ) : (
            <FormCard title="Search & social" desc="Override how this post appears on Google and when shared. Falls back to the title and excerpt.">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Field label="Meta title" max={60} value={form.metaTitle} onChange={set("metaTitle")} placeholder={form.title} />
                <TextArea label="Meta description" max={160} rows={3} value={form.metaDescription} onChange={set("metaDescription")} placeholder={form.excerpt} />
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: INK_TEXT, display: "block", marginBottom: 7 }}>Social share image</label>
                  <ImageDrop value={form.ogImageUrl} onChange={set("ogImageUrl")} folder="blog-og" height={170} hint="1200 × 630 px. Falls back to the cover image." onError={m => setErr(m)} />
                </div>
                <Toggle checked={form.noindex} onChange={set("noindex")} label="Hide from search engines" desc="Adds noindex and removes this post from the sitemap." />
              </div>
            </FormCard>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <FormCard title="Publishing">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: INK_TEXT, display: "block", marginBottom: 7 }}>Status</label>
                <select value={form.status} onChange={e => set("status")(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${LINE_STRONG}`, background: "#fff", color: INK_TEXT, fontSize: 14, fontFamily: "inherit" }}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: INK_TEXT, display: "block", marginBottom: 7 }}>Publish date</label>
                <input type="datetime-local" value={form.publishedAt} onChange={e => set("publishedAt")(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${LINE_STRONG}`, background: "#fff", color: INK_TEXT, fontSize: 13, fontFamily: "inherit" }} />
                <p style={{ fontSize: 12, color: FAINT, marginTop: 5 }}>Set automatically on first publish. Pick a future date to schedule.</p>
              </div>
              <Toggle checked={form.featured} onChange={set("featured")} label="Featured" desc="Pinned to the top of the blog." />
              <div style={{ display: "flex", gap: 20, paddingTop: 4, borderTop: `1px solid ${LINE}` }}>
                <div>
                  <div style={{ fontSize: 10, color: FAINT, textTransform: "uppercase", letterSpacing: "0.06em" }}>Read time</div>
                  <div style={{ fontSize: 14, color: INK_TEXT, fontFamily: "var(--font-mono)", marginTop: 3 }}>{readMin} min</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: FAINT, textTransform: "uppercase", letterSpacing: "0.06em" }}>Views</div>
                  <div style={{ fontSize: 14, color: INK_TEXT, fontFamily: "var(--font-mono)", marginTop: 3 }}>{initial?.views ?? 0}</div>
                </div>
              </div>
            </div>
          </FormCard>

          <FormCard title="Cover image">
            <ImageDrop value={form.coverImageUrl} onChange={set("coverImageUrl")} folder="blog-covers" height={150} hint="1200 × 630 recommended" onError={m => setErr(m)} />
          </FormCard>

          <FormCard title="Organisation">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Category" value={form.category} onChange={set("category")} placeholder="e.g. Guides" />
              <Field label="Tags" value={form.tags} onChange={set("tags")} placeholder="comma separated" hint="Shown as pills on the post." />
              <Field label="Author name" value={form.authorName} onChange={set("authorName")} />
            </div>
          </FormCard>
        </div>
      </div>
    </div>
  );
}

export function Blog() {
  const { toasts, addToast, removeToast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState<"list" | "editor">("list");
  const [editing, setEditing] = useState<BlogPost | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    blogApi.listAdmin(filter).then(r => setPosts(r.data)).catch(e => setError(e?.message ?? "Failed to load")).finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const openEdit = async (post: BlogPost) => {
    try {
      const full = await blogApi.get(post.slug);
      setEditing(full);
      setView("editor");
    } catch (e: any) {
      addToast(e?.message ?? "Could not open post", "error");
    }
  };

  const remove = async (post: BlogPost) => {
    if (!confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    try {
      await blogApi.delete(post._id);
      addToast("Post deleted", "success");
      load();
    } catch (e: any) {
      addToast(e?.message ?? "Delete failed", "error");
    }
  };

  if (view === "editor") {
    return (
      <>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <Editor
          initial={editing}
          onClose={() => { setView("list"); setEditing(null); }}
          onSaved={msg => { addToast(msg, "success"); setView("list"); setEditing(null); load(); }}
        />
      </>
    );
  }

  const FILTERS = ["all", "published", "draft"];

  return (
    <div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <PageHeading title="Blog" desc="Write and publish articles to grow organic traffic. Drafts stay private until published." />
      <SectionHeader
        title=""
        actions={
          <>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 11px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", textTransform: "capitalize", background: filter === f ? "#1E3A5F" : "transparent", color: filter === f ? "#fff" : "#6E6A5E", border: `1px solid ${filter === f ? "#1E3A5F" : "rgba(26,30,38,.14)"}`, fontFamily: "inherit" }}>{f}</button>
            ))}
            <Button variant="primary" size="sm" onClick={() => { setEditing(null); setView("editor"); }}>＋ New post</Button>
          </>
        }
      />

      {loading && <PageLoader />}
      {error && !loading && <ErrorBanner message={error} />}
      {!loading && !error && (posts.length === 0 ? (
        <Empty icon="✍️" title="No posts yet" />
      ) : (
        <Table headers={["Title", "Status", "Views", "Updated", "Actions"]}>
          {posts.map(p => (
            <Tr key={p._id}>
              <Td>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {p.featured && <span title="Featured" style={{ color: "#B0820C" }}>★</span>}
                  <div>
                    <div style={{ fontWeight: 600, color: "#16181D", fontSize: 13 }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: "#9B9484" }}>/blog/{p.slug}</div>
                  </div>
                </div>
              </Td>
              <Td><Badge variant={p.status === "published" ? "success" : "default"}>{p.status}</Badge></Td>
              <Td style={{ fontFamily: "monospace", color: "#6E6A5E" }}>{p.views}</Td>
              <Td style={{ fontSize: 12, color: "#6E6A5E" }}>{new Date(p.updatedAt).toLocaleDateString()}</Td>
              <Td>
                <div style={{ display: "flex", gap: 6 }}>
                  <Button variant="outline" size="sm" onClick={() => openEdit(p)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => remove(p)}>Delete</Button>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      ))}
    </div>
  );
}
