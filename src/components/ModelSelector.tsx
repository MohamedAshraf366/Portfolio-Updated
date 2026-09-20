import React, { useState, useMemo, useCallback } from "react";

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useLocalStorageFreeStatuses() {
  const [map, setMap] = useState<Record<string, "free-available" | "free-unavailable">>(() => {
    try {
      const raw = localStorage.getItem("free-model-user-status");
      return raw ? (JSON.parse(raw) as Record<string, "free-available" | "free-unavailable">) ?? {} : {};
    } catch { return {}; }
  });

  const set = useCallback((id: string, status: "free-available" | "free-unavailable") => {
    setMap((prev) => {
      const next = { ...prev, [id]: status };
      try { localStorage.setItem("free-model-user-status", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setMap({});
    try { localStorage.removeItem("free-model-user-status"); } catch {}
  }, []);

  return { map, set, reset };
}

// ── Types ─────────────────────────────────────────────────────────────────────
export type ModelStatus = "free-available" | "free-unavailable" | "paid" | "paid-balance" | "deprecated";

export interface ModelEntry {
  id: string;
  name: string;
  contextLabel?: string;
  status: ModelStatus;
  cost?: string;
  provider?: string;
  freeName?: string; // custom name override for free models, e.g. "Qwen 2.5 7B"
}

// ── Model data ────────────────────────────────────────────────────────────────
const MODELS: ModelEntry[] = [
  // ── Free — available (verified working, user can toggle) ──────────────────
  { id: "inclusionai/ling-3.0-flash-fin:free", name: "Ling 3.0 Flash Fin", contextLabel: "Med", status: "free-available", provider: "Novita", freeName: "Ling 3.0 Flash Fin:Free" },
  { id: "inclusionai/ling-3.0-flash-sante:free", name: "Ling 3.0 Flash Sante", contextLabel: "Med", status: "free-available", provider: "Novita", freeName: "Ling 3.0 Flash Sante:Free" },
  { id: "inclusionai/ling-3.0-flash-vl:free", name: "Ling 3.0 Flash VL", contextLabel: "Med", status: "free-available", provider: "Novita", freeName: "Ling 3.0 Flash VL:Free" },
  { id: "nex-agi/nex-n2.5-mini:free", name: "Nex-N2.5-Mini", contextLabel: "Med", status: "free-available", provider: "Nex AGI", freeName: "Nex-N2.5-Mini:Free" },
  { id: "dots-studio/dots-3-note-preview:free", name: "Dots3-Note Preview", contextLabel: "Med", status: "free-available", provider: "AtlasCloud", freeName: "Dots3-Note Preview:Free" },

  // ── Free — unavailable right now (GPU pool cycling / rate-limited) ─────────
  { id: "qwen7b", name: "Qwen 2.5 7B", contextLabel: "Med", status: "free-available", provider: "free.ai", freeName: "Qwen 2.5 7B:Free" },
  { id: "deepseek-r1", name: "DeepSeek-R1 7B", contextLabel: "Med", status: "free-unavailable", provider: "free.ai", freeName: "DeepSeek-R1 7B:Free" },
  { id: "mistral", name: "Mistral 7B", contextLabel: "Med", status: "free-unavailable", provider: "free.ai", freeName: "Mistral 7B:Free" },
  { id: "deepseek-r1-7b", name: "DeepSeek R1 7B Distill", contextLabel: "Med", status: "free-unavailable", provider: "free.ai", freeName: "DeepSeek R1 7B Distill:Free" },
  { id: "qwen-coder", name: "Qwen 2.5 Coder 7B", contextLabel: "Med", status: "free-available", provider: "free.ai", freeName: "Qwen 2.5 Coder 7B:Free" },
  { id: "qwen3-coder", name: "Qwen3-Coder 7B", contextLabel: "Med", status: "free-available", provider: "free.ai", freeName: "Qwen3-Coder 7B:Free" },

  // ── Paid — balance required (key valid but account needs funding) ──────────
  { id: "claude-sonnet-4", name: "Claude Sonnet 4", contextLabel: "Med", status: "paid-balance", cost: "See billing", provider: "Anthropic" },
  { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", contextLabel: "Med", status: "paid-balance", cost: "See billing", provider: "Anthropic" },
  { id: "deepseek-chat", name: "DeepSeek Chat", contextLabel: "Med", status: "paid-balance", cost: "See billing", provider: "DeepSeek" },
  { id: "deepseek-flash", name: "DeepSeek Flash", contextLabel: "Med", status: "paid-balance", cost: "See billing", provider: "DeepSeek" },

  // ── Paid — normal paid models ────────────────────────────────────────────────
  { id: "nemotron-3-super-120b-a12b", name: "Nemotron 3 Super 120B A12B", contextLabel: "Med", status: "paid", cost: "$0.00012/token", provider: "NVIDIA" },
  { id: "solar-pro4", name: "Solar Pro4", contextLabel: "Med", status: "paid", cost: "$0.00036/token", provider: "Upstage" },
  { id: "longcat-2.0", name: "LongCat 2.0", contextLabel: "Med", status: "paid", cost: "$0.00012/token", provider: "Meituan" },
  { id: "fugu-ultra", name: "Fugu Ultra", contextLabel: "Med", status: "paid", cost: "$0.00003/token", provider: "Sakana" },
  { id: "hy4", name: "Hy4", contextLabel: "Med", status: "paid", cost: "$0.000002/token", provider: "Tencent" },
  { id: "hy3", name: "Hy3", contextLabel: "Med", status: "paid", cost: "$0.00000033/token", provider: "Tencent" },
  { id: "step-3.7-flash", name: "Step 3.7 Flash", contextLabel: "Med", status: "paid", cost: "$0.000002/token", provider: "Stepfun" },
  { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash", contextLabel: "Med", status: "paid", cost: "$0.00000375/token", provider: "Google" },

  // ── Deprecated ─────────────────────────────────────────────────────────────
  { id: "kimi-k2.5-free", name: "Kimi K2.5 Free", contextLabel: "Med", status: "deprecated" },
];

// ── Badge ─────────────────────────────────────────────────────────────────────
interface BadgeProps {
  status: ModelStatus;
  cost?: string;
  userEditable?: boolean;
  userStatus?: "free-available" | "free-unavailable" | null;
}

const Badge: React.FC<BadgeProps> = ({ status, cost, userEditable, userStatus }) => {
  // User override takes priority for free models
  const effective = userStatus ?? status;

  if (status === "free-available" || status === "free-unavailable") {
    if (effective === "free-available") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/25 shadow-sm">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Free • Can be used
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/25 shadow-sm">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
        Free • Unavailable
      </span>
    );
  }

  if (status === "paid") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/25 shadow-sm">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400" />
        Paid { cost ? `• ${cost}` : "" }
      </span>
    );
  }

  if (status === "paid-balance") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 px-2.5 py-0.5 text-xs font-medium text-purple-400 border border-purple-500/25 shadow-sm">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-400" />
        Paid • Balance required
      </span>
    );
  }

  // deprecated
  if (status === "deprecated") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-400 border border-red-500/25 shadow-sm">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
        Deprecated
      </span>
    );
  }

  return null;
};

// ── Main selector ─────────────────────────────────────────────────────────────
interface ModelSelectorProps {
  selectedId?: string;
  onSelect?: (model: ModelEntry) => void;
  refresh?: () => void;
  onEdit?: () => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedId,
  onSelect,
  refresh,
  onEdit,
}) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { map, set: setUserStatus, reset: resetUserStatus } = useLocalStorageFreeStatuses();

  // Resolve effective status per model (base + user override)
  const modelsWithStatus = useMemo(() =>
    MODELS.map((m) => ({
      ...m,
      effectiveStatus: (m.status === "free-available" || m.status === "free-unavailable")
        ? (map[m.id] ?? m.status)
        : m.status,
      userEditable: m.status === "free-available" || m.status === "free-unavailable",
      userStatus: map[m.id] ?? null,
    })),
    [map]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return modelsWithStatus;
    return modelsWithStatus.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        (m.provider && m.provider.toLowerCase().includes(q)) ||
        (m.freeName && m.freeName.toLowerCase().includes(q))
    );
  }, [query, modelsWithStatus]);

  const selected = modelsWithStatus.find((m) => m.id === selectedId);

  const handleToggleFreeStatus = useCallback((model: { id: string; effectiveStatus: string; userEditable: boolean }) => {
    if (!model.userEditable) return;
    const next = model.effectiveStatus === "free-available" ? "free-unavailable" : "free-available";
    setUserStatus(model.id, next);
  }, [setUserStatus]);

  return (
    <div className="relative">
      {/* ── Trigger ──────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium
          bg-dark-700/80 border border-dark-600/60 hover:bg-dark-600/80
          text-white placeholder-dark-400"
        style={{ backdropFilter: "blur(6px)" }}
      >
        <span className="truncate">
          {selected
            ? `${selected.freeName ?? selected.name} (${selected.contextLabel ?? selected.provider})`
            : "Select a model"}
        </span>
        <svg className="shrink-0 h-4 w-4 text-dark-400 transition-transform duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ── Dropdown ──────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="absolute right-0 z-50 mt-1 w-full max-w-md rounded-lg border border-dark-600/60 bg-dark-800/95 p-2 shadow-xl"
          style={{ backdropFilter: "blur(12px)" }}
        >
          {/* Search */}
          <div className="mb-2">
            <input
              type="text"
              placeholder="Search models"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full rounded-md bg-dark-700/60 border border-dark-600/40 px-3 py-1.5 text-sm text-white
                placeholder-dark-400 outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/20"
            />
          </div>

          {/* Model list */}
          <ul className="max-h-72 overflow-y-auto rounded-md">
            {filtered.length === 0 && (
              <li className="py-4 text-center text-sm text-dark-400">
                No models match "{query}"
              </li>
            )}
            {filtered.map((model) => {
              const isSelected = model.id === selectedId;
              return (
                <li key={model.id}>
                  <button
                    type="button"
                    onClick={() => { onSelect?.(model); setOpen(false); setQuery(""); }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(56,189,248,0.08)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "")
                    }
                    className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left transition-colors
                      text-sm text-white hover:bg-dark-600/50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Context label */}
                      {model.contextLabel && (
                        <span className="shrink-0 rounded-full bg-dark-600/60 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-dark-400">
                          {model.contextLabel}
                        </span>
                      )}
                      {/* Model name — show freeName for free models (with :Free suffix) */}
                      <span className="truncate font-medium">
                        {model.freeName ?? model.name}
                      </span>
                      <Badge
                        status={model.status}
                        cost={model.cost}
                        userEditable={model.userEditable}
                        userStatus={model.userStatus}
                      />
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {model.provider && (
                        <span className="hidden sm:inline text-[10px] text-dark-500">
                          {model.provider}
                        </span>
                      )}

                      {/* ── Free status toggle (only for free models) ──────────── */}
                      {model.userEditable && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFreeStatus(model);
                          }}
                          title={model.effectiveStatus === "free-available"
                            ? "Mark as unavailable"
                            : "Mark as can be used"}
                          className={`rounded-md p-1 transition-colors ${
                            model.effectiveStatus === "free-available"
                              ? "text-emerald-400 hover:bg-emerald-500/15 hover:text-emerald-300"
                              : "text-amber-400 hover:bg-amber-500/15 hover:text-amber-300"
                          }`}
                        >
                          {model.effectiveStatus === "free-available" ? (
                            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586
                                7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                      )}

                      {/* Selected checkmark */}
                      {isSelected && (
                        <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Bottom actions */}
          <div className="mt-2 flex items-center gap-2 border-t border-dark-600/40 pt-2">
            <button
              type="button"
              onClick={refresh}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-dark-300
                bg-dark-700/50 border border-dark-600/30 hover:bg-dark-600/60 hover:text-white transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.995a.5.5 0 010 1H16.023a.5.5 0 01-.354-.654M12 8a4 4 0 00-4 4v4a4 4 0 108 0V12a4 4 0 00-4-4z" />
              </svg>
              Refresh models
            </button>
            <button
              type="button"
              onClick={() => {
                resetUserStatus();
                setQuery("");
                setOpen(false);
              }}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-dark-300
                bg-dark-700/50 border border-dark-600/30 hover:bg-dark-600/60 hover:text-white transition-colors ml-auto"
            >
              Reset my marks
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-dark-300
                bg-dark-700/50 border border-dark-600/30 hover:bg-dark-600/60 hover:text-white transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.428-1.756 2.924-1.756 3.353 0a1.724 1.724 0 002.579 1.087 1.724 1.724 0 001.087 2.579c0 1.236-.575 2.323-1.522 2.874a1.724 1.724 0 00-2.874 1.522 1.724 1.724 0 00-1.087 2.579 1.724 1.724 0 002.579 1.087c1.236 0 2.323-.575 2.874-1.522a1.724 1.724 0 001.522-2.874 1.724 1.724 0 00-1.522-2.874 1.724 1.724 0 00-2.579-1.087 1.724 1.724 0 00-1.087-2.579c0-1.236.575-2.323 1.522-2.874.938-.553 2.022-.827 3.107-.827h.47a1.724 1.724 0 001.724-1.724 1.724 1.724 0 00-1.724-1.724z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Edit models...
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
