"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  useSubmitReview,
  useAuth,
  useTool,
  USE_CASE_DISPLAY_TO_ENUM,
} from "@/lib/hooks";
import StarRating from "@/components/ui/StarRating";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Shield,
  Star,
  Plus,
  Loader2,
  X,
} from "lucide-react";

// Display labels for the form — mapped to backend enums in useSubmitReview
const USE_CASES = Object.keys(USE_CASE_DISPLAY_TO_ENUM);

const RATING_DIMENSIONS = [
  {
    key: "accuracy",
    label: "Accuracy & Quality",
    desc: "How well it performs the task",
  },
  { key: "speed", label: "Response Speed", desc: "Time to generate output" },
  { key: "costValue", label: "Cost vs Value", desc: "Worth the price?" },
  { key: "easeOfUse", label: "Ease of Use", desc: "Learning curve & UX" },
];

function WriteReviewContent() {
  const params = useSearchParams();
  const router = useRouter();

  // Read both the MongoDB _id (for submit) and slug (for display + back link)
  const toolId = params.get("tool") ?? "";
  const toolSlug = params.get("slug") ?? "";

  // Fetch tool details for the header card
  const { tool } = useTool(toolSlug);

  const { user, signInWithGoogle, loading: authLoading } = useAuth();
  const {
    submitReview,
    loading: submitLoading,
    success,
    error: submitError,
  } = useSubmitReview();

  const [step, setStep] = useState(1);
  const [overallRating, setOverallRating] = useState(0);
  const [dimensions, setDimensions] = useState({
    accuracy: 0,
    speed: 0,
    costValue: 0,
    easeOfUse: 0,
  });
  const [useCase, setUseCase] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pros, setPros] = useState([""]);
  const [cons, setCons] = useState([""]);
  const [recommend, setRecommend] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 3;

  const addPro = () => setPros(p => [...p, ""]);
  const removePro = (i: number) =>
    setPros(p => p.filter((_, idx) => idx !== i));
  const updatePro = (i: number, val: string) =>
    setPros(p => p.map((v, idx) => (idx === i ? val : v)));

  const addCon = () => setCons(c => [...c, ""]);
  const removeCon = (i: number) =>
    setCons(c => c.filter((_, idx) => idx !== i));
  const updateCon = (i: number, val: string) =>
    setCons(c => c.map((v, idx) => (idx === i ? val : v)));

  const validateStep = () => {
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (overallRating === 0)
        errs.overallRating = "Please select an overall rating";
      if (!useCase) errs.useCase = "Please select a use case";
      if (Object.values(dimensions).some(v => v === 0))
        errs.dimensions = "Please rate all dimensions";
    }
    if (step === 2) {
      if (!title.trim()) errs.title = "Review title is required";
      if (body.trim().length < 50)
        errs.body = "Please write at least 50 characters";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(s => Math.min(s + 1, totalSteps));
  };

  const handleSubmit = async () => {
    if (!toolId) {
      setErrors({ submit: "Missing tool ID. Please go back and try again." });
      return;
    }
    try {
      await submitReview({
        toolId,
        rating: overallRating,
        title,
        body,
        pros: pros.filter(Boolean),
        cons: cons.filter(Boolean),
        useCase, // display label — mapped to enum inside useSubmitReview
        ratingBreakdown: dimensions,
        wouldRecommend: recommend,
      });
    } catch {
      // error is surfaced via submitError
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
            style={{ background: "rgba(16,185,129,0.15)" }}
          >
            <CheckCircle size={32} style={{ color: "var(--accent-green)" }} />
          </div>
          <h2
            className="font-display text-3xl mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Review Submitted!
          </h2>
          <p
            className="text-sm mb-8"
            style={{ color: "var(--text-secondary)" }}
          >
            Thank you for contributing to the community. Your review will be
            visible after a brief moderation check.
          </p>
          <div className="flex gap-3 justify-center">
            {toolSlug ? (
              <Link
                href={`/tool/${toolSlug}`}
                className="btn-secondary text-sm px-6 py-2.5"
              >
                Back to Tool
              </Link>
            ) : (
              <button
                onClick={() => router.back()}
                className="btn-secondary text-sm px-6 py-2.5"
              >
                Go Back
              </button>
            )}
            <Link href="/" className="btn-primary text-sm px-6 py-2.5">
              Explore More Tools
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-raised)",
        }}
      >
        <Link
          href={toolSlug ? `/tool/${toolSlug}` : "/"}
          className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
          style={{ color: "var(--text-muted)", textDecoration: "none" }}
        >
          <ArrowLeft size={14} /> Cancel
        </Link>
        <Logo size={26} />
        <div className="w-16" />
      </header>

      <div className="max-w-xl mx-auto px-6 py-12">
        {/* Progress steps */}
        <div className="flex items-center gap-3 mb-10">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background:
                      step > i + 1
                        ? "var(--accent-green)"
                        : step === i + 1
                          ? "var(--primary)"
                          : "var(--bg-card)",
                    color: step >= i + 1 ? "white" : "var(--text-muted)",
                    border:
                      step <= i + 1
                        ? `1px solid ${step === i + 1 ? "var(--primary)" : "var(--border)"}`
                        : "none",
                  }}
                >
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span
                  className="text-xs hidden sm:block"
                  style={{
                    color:
                      step === i + 1
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                  }}
                >
                  {["Ratings", "Your Review", "Confirm"][i]}
                </span>
              </div>
              {i < totalSteps - 1 && (
                <div
                  className="flex-1 h-px"
                  style={{
                    background:
                      step > i + 1 ? "var(--primary)" : "var(--border)",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Tool being reviewed */}
        {tool && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl mb-8"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <img
              src={tool.logo}
              alt={tool.name}
              className="w-10 h-10 rounded-xl object-contain"
              style={{ background: "var(--bg-raised)" }}
              onError={e => {
                (e.target as HTMLImageElement).src =
                  `https://ui-avatars.com/api/?name=${tool.name}&background=1e3a5f&color=fff`;
              }}
            />
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Reviewing: {tool.name}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                by {tool.owner.name}
              </p>
            </div>
          </div>
        )}

        {/* Missing toolId warning */}
        {!toolId && (
          <div
            className="rounded-xl p-4 mb-6"
            style={{
              background: "rgba(244,63,94,0.08)",
              border: "1px solid rgba(244,63,94,0.2)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--accent-red)" }}>
              No tool selected. Please go to a tool page and click "Write
              Review".
            </p>
          </div>
        )}

        {/* Auth gate */}
        {!user && (
          <div
            className="rounded-2xl p-8 text-center mb-8"
            style={{
              background: "rgba(30,58,95,0.06)",
              border: "1px solid rgba(30,58,95,0.2)",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
              style={{
                background: "var(--primary)",
              }}
            >
              <Shield size={20} color="white" />
            </div>
            <h3
              className="font-display text-xl mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Verified Reviews Only
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              Sign in with Google to ensure your review is authentic and trusted
              by the community.
            </p>
            <button
              onClick={signInWithGoogle}
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg font-medium text-sm transition-colors hover:bg-[var(--bg-raised)] mx-auto max-w-xs"
              style={{
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-strong)",
              }}
            >
              {authLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 18 18">
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
              )}
              {authLoading ? "Signing in..." : "Continue with Google"}
            </button>
          </div>
        )}

        {/* Step content */}
        <div
          className="rounded-2xl p-7"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h2
                  className="font-display text-2xl mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  Rate Your Experience
                </h2>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Use-case specific ratings help others find the right tool.
                </p>
              </div>

              {/* Overall rating */}
              <div>
                <label
                  className="block text-sm font-medium mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  Overall Rating *
                </label>
                <div className="flex items-center gap-4">
                  <StarRating
                    value={overallRating}
                    size={32}
                    interactive
                    onChange={setOverallRating}
                  />
                  {overallRating > 0 && (
                    <span
                      className="font-display text-2xl"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {overallRating}/5
                    </span>
                  )}
                </div>
                {errors.overallRating && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--accent-red)" }}
                  >
                    {errors.overallRating}
                  </p>
                )}
              </div>

              {/* Use case */}
              <div>
                <label
                  className="block text-sm font-medium mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  Primary Use Case *
                </label>
                <div className="flex flex-wrap gap-2">
                  {USE_CASES.map(uc => (
                    <button
                      key={uc}
                      onClick={() => setUseCase(uc)}
                      className="text-xs px-3 py-2 rounded-lg transition-all"
                      style={{
                        background:
                          useCase === uc
                            ? "var(--primary)"
                            : "var(--bg-raised)",
                        color:
                          useCase === uc ? "white" : "var(--text-secondary)",
                        border: `1px solid ${useCase === uc ? "var(--primary)" : "var(--border)"}`,
                      }}
                    >
                      {uc}
                    </button>
                  ))}
                </div>
                {errors.useCase && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--accent-red)" }}
                  >
                    {errors.useCase}
                  </p>
                )}
              </div>

              {/* Dimension ratings */}
              <div>
                <label
                  className="block text-sm font-medium mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  Performance Dimensions *
                </label>
                <div className="space-y-4">
                  {RATING_DIMENSIONS.map(dim => (
                    <div
                      key={dim.key}
                      className="flex items-center justify-between p-4 rounded-xl"
                      style={{
                        background: "var(--bg-raised)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {dim.label}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {dim.desc}
                        </p>
                      </div>
                      <StarRating
                        value={dimensions[dim.key as keyof typeof dimensions]}
                        size={20}
                        interactive
                        onChange={v =>
                          setDimensions(d => ({ ...d, [dim.key]: v }))
                        }
                      />
                    </div>
                  ))}
                </div>
                {errors.dimensions && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--accent-red)" }}
                  >
                    {errors.dimensions}
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2
                  className="font-display text-2xl mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  Write Your Review
                </h2>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Be specific — mention actual tasks and outcomes.
                </p>
              </div>

              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Review Title *
                </label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. 'Best model for code generation, weak on creative tasks'"
                  className="input-base"
                />
                {errors.title && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--accent-red)" }}
                  >
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Detailed Review *
                </label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={5}
                  placeholder="Describe your experience. What tasks did you use it for? What worked? What didn't?"
                  className="input-base resize-none"
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.body ? (
                    <p
                      className="text-xs"
                      style={{ color: "var(--accent-red)" }}
                    >
                      {errors.body}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span
                    className="text-xs"
                    style={{
                      color:
                        body.length >= 50
                          ? "var(--accent-green)"
                          : "var(--text-muted)",
                    }}
                  >
                    {body.length}/50 min
                  </span>
                </div>
              </div>

              {/* Pros */}
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "var(--accent-green)" }}
                >
                  Strengths
                </label>
                <div className="space-y-2">
                  {pros.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        style={{ color: "var(--accent-green)", fontSize: 16 }}
                      >
                        +
                      </span>
                      <input
                        value={p}
                        onChange={e => updatePro(i, e.target.value)}
                        placeholder="e.g. Fast response times"
                        className="input-base flex-1"
                      />
                      {pros.length > 1 && (
                        <button
                          onClick={() => removePro(i)}
                          style={{ color: "var(--text-muted)" }}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {pros.length < 5 && (
                  <button
                    onClick={addPro}
                    className="flex items-center gap-1.5 text-xs mt-2 transition-opacity hover:opacity-70"
                    style={{ color: "var(--primary)" }}
                  >
                    <Plus size={12} /> Add strength
                  </button>
                )}
              </div>

              {/* Cons */}
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "var(--accent-red)" }}
                >
                  Limitations
                </label>
                <div className="space-y-2">
                  {cons.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        style={{ color: "var(--accent-red)", fontSize: 16 }}
                      >
                        −
                      </span>
                      <input
                        value={c}
                        onChange={e => updateCon(i, e.target.value)}
                        placeholder="e.g. Expensive at scale"
                        className="input-base flex-1"
                      />
                      {cons.length > 1 && (
                        <button
                          onClick={() => removeCon(i)}
                          style={{ color: "var(--text-muted)" }}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {cons.length < 5 && (
                  <button
                    onClick={addCon}
                    className="flex items-center gap-1.5 text-xs mt-2 transition-opacity hover:opacity-70"
                    style={{ color: "var(--primary)" }}
                  >
                    <Plus size={12} /> Add limitation
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2
                  className="font-display text-2xl mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  Confirm & Submit
                </h2>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Review your submission before publishing.
                </p>
              </div>

              {/* Summary */}
              <div
                className="rounded-xl p-5 space-y-4"
                style={{
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-center justify-between">
                  <StarRating value={overallRating} size={18} />
                  <span className="badge">{useCase}</span>
                </div>
                <div>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {title}
                  </p>
                  <p
                    className="text-xs mt-1 line-clamp-3"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {body}
                  </p>
                </div>
                {(pros.filter(Boolean).length > 0 ||
                  cons.filter(Boolean).length > 0) && (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p
                        className="font-semibold mb-1"
                        style={{ color: "var(--accent-green)" }}
                      >
                        Pros
                      </p>
                      {pros.filter(Boolean).map(p => (
                        <p key={p} style={{ color: "var(--text-secondary)" }}>
                          + {p}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p
                        className="font-semibold mb-1"
                        style={{ color: "var(--accent-red)" }}
                      >
                        Cons
                      </p>
                      {cons.filter(Boolean).map(c => (
                        <p key={c} style={{ color: "var(--text-secondary)" }}>
                          − {c}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recommend toggle */}
              <div
                className="flex items-center justify-between p-5 rounded-xl"
                style={{
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Recommend this tool?
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Would you suggest this to others with similar needs?
                  </p>
                </div>
                <button
                  onClick={() => setRecommend(r => !r)}
                  className="relative w-12 h-6 rounded-full transition-colors"
                  style={{
                    background: recommend
                      ? "var(--primary)"
                      : "var(--border-strong)",
                  }}
                >
                  <span
                    className="absolute top-0.5 transition-transform rounded-full w-5 h-5 bg-white shadow"
                    style={{
                      transform: recommend
                        ? "translateX(26px)"
                        : "translateX(2px)",
                    }}
                  />
                </button>
              </div>

              {/* Verified author */}
              {user && (
                <div
                  className="flex items-center gap-3 p-4 rounded-xl"
                  style={{
                    background: "rgba(16,185,129,0.06)",
                    border: "1px solid rgba(16,185,129,0.15)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "var(--primary-dim)", color: "white" }}
                  >
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p
                      className="text-xs font-medium flex items-center gap-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <Shield
                        size={11}
                        style={{ color: "var(--accent-green)" }}
                      />{" "}
                      Verified: {user.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {user.email}
                    </p>
                  </div>
                </div>
              )}

              {/* API error from submit */}
              {submitError && (
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "rgba(244,63,94,0.08)",
                    border: "1px solid rgba(244,63,94,0.2)",
                  }}
                >
                  <p className="text-sm" style={{ color: "var(--accent-red)" }}>
                    {submitError}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div
            className="flex items-center justify-between mt-8 pt-6"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <button
              onClick={() => (step > 1 ? setStep(s => s - 1) : router.back())}
              className="btn-secondary text-sm px-5 py-2.5 flex items-center gap-1.5"
            >
              <ArrowLeft size={13} /> {step === 1 ? "Cancel" : "Back"}
            </button>

            {step < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!user}
                className="btn-primary text-sm px-6 py-2.5 flex items-center gap-1.5"
                style={{ opacity: !user ? 0.4 : 1 }}
              >
                Continue <ArrowRight size={13} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitLoading || !user || !toolId}
                className="btn-primary text-sm px-8 py-2.5 flex items-center gap-2"
                style={{ opacity: !user || submitLoading || !toolId ? 0.6 : 1 }}
              >
                {submitLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Star size={14} /> Publish Review
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WriteReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2
            size={24}
            className="animate-spin"
            style={{ color: "var(--primary)" }}
          />
        </div>
      }
    >
      <WriteReviewContent />
    </Suspense>
  );
}
