import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { PROVIDERS, isProviderConfigured, type Provider } from "../lib/provider-api";

// ── Provider metadata (single source of truth in src/lib/provider-api.ts) ─────
type ProviderMeta = Provider;
export { PROVIDERS, SEED_MODELS, type ModelStatus, type ModelRow, type ProviderMeta };

// ── Model catalog (free models only — Z.AI excluded) ──────────────────────────
type ModelStatus =
  | "free-available"        // green  — Free • Can be used
  | "free-unavailable"      // amber — Free • Unavailable (service down)
  | "unknown"               // gray  — not tested yet

interface ModelRow {
  id: string;
  label: string;
  providerId: string;
  status: ModelStatus;
}

const SEED_MODELS: ModelRow[] = [
  // ── free.ai (self-hosted, free within daily allowance) ─────────────────────
  { id: "qwen7b",                 label: "Qwen 7B",                  providerId: "free-ai", status: "unknown" },
  { id: "deepseek-r1",            label: "DeepSeek R1",              providerId: "free-ai", status: "unknown" },
  { id: "mistral",                label: "Mistral",                  providerId: "free-ai", status: "unknown" },
  { id: "deepseek-r1-7b",         label: "DeepSeek R1 7B",           providerId: "free-ai", status: "unknown" },
  { id: "qwen-coder",             label: "Qwen Coder",               providerId: "free-ai", status: "unknown" },
  { id: "qwen3-8b",               label: "Qwen 3 8B",               providerId: "free-ai", status: "unknown" },
  { id: "qwen3-coder",            label: "Qwen 3 Coder",            providerId: "free-ai", status: "unknown" },

  // ── OpenRouter free tier (key: sk-or-v1-...a09520) ────────────────────────
  { id: "inclusionai/ling-3.0-flash-fin:free", label: "Ling 3.0 Flash Fin:Free",       providerId: "openrouter", status: "unknown" },
  { id: "nex-agi/nex-n2.5-mini:free",          label: "NEX N2.5 Mini:Free",             providerId: "openrouter", status: "unknown" },
  { id: "inclusionai/ling-3.0-flash-sante:free",label: "Ling 3.0 Flash Sante:Free",    providerId: "openrouter", status: "unknown" },
  { id: "inclusionai/ling-3.0-flash-vl:free",   label: "Ling 3.0 Flash VL:Free",        providerId: "openrouter", status: "unknown" },
  { id: "dots-studio/dots-3-note-preview:free", label: "Dots 3 Note Preview:Free",     providerId: "openrouter", status: "unknown" },
  { id: "nex-agi/nex-n2.5-pro:free",           label: "NEX N2.5 Pro:Free",             providerId: "openrouter", status: "unknown" },
];

// ── localStorage helpers ───────────────────────────────────────────────────────
const USER_STATUS_KEY = "zai-model-selector-user-status-v1";

function loadUserStatuses(): Record<string, "free-available" | "free-unavailable"> {
  try {
    const raw = localStorage.getItem(USER_STATUS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveUserStatuses(map: Record<string, "free-available" | "free-unavailable">) {
  try {
    localStorage.setItem(USER_STATUS_KEY, JSON.stringify(map));
  } catch { /* quota exceeded — ignore */ }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function FreeModelSelector() {
  const [models, setModels] = useState<ModelRow[]>(SEED_MODELS);
  const [userStatus, setUserStatus] = useState<Record<string, "free-available" | "free-unavailable">>(loadUserStatuses);
  const [selected, setSelected] = useState<ModelRow | null>(null);
  const [testing, setTesting] = useState(false);

  const effectiveStatus = useCallback(
    (row: ModelRow) => {
      const override = userStatus[row.id];
      if (override) return override;
      return row.status;
    },
    [userStatus],
  );

  const handleToggle = useCallback((row: ModelRow) => {
    const next: "free-available" | "free-unavailable" =
      userStatus[row.id] === "free-available" ? "free-unavailable" : "free-available";
    const updated = { ...userStatus, [row.id]: next };
    setUserStatus(updated);
    saveUserStatuses(updated);
  }, [userStatus]);

  const handleReset = useCallback(() => {
    setUserStatus({});
    saveUserStatuses({});
  }, []);

  const runAutoTest = useCallback(async () => {
    setTesting(true);
    const tested = new Set<string>();
    const nextModels = [...models];

    for (let i = 0; i < nextModels.length; i++) {
      const row = nextModels[i];
      if (tested.has(row.id)) continue;
      tested.add(row.id);

      const provider = PROVIDERS.find((p) => p.id === row.providerId);
      if (!provider || !isProviderConfigured(provider)) {
        row.status = "free-unavailable";
        continue;
      }

      let status: ModelStatus = "unknown";
      try {
        const body: Record<string, unknown> = {
          model: row.id,
          messages: [{ role: "user", content: "OK" }],
          max_tokens: 8,
          temperature: 0,
        };

        const headers: Record<string, string> = {
          Authorization: `Bearer ${provider.key}`,
          "Content-Type": "application/json",
        };

        const res = await fetch(provider.baseUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });

        const json = ((await res.json().catch(() => ({}))) as {
          error?: { code?: unknown };
          choices?: unknown[];
        }) || {};

        const errorCode = json?.error?.code;
        if (res.status === 429 || errorCode === 1113 || errorCode === "1113") {
          status = "free-unavailable"; // paid/blocked
        } else if (res.status === 200 && json.choices?.length) {
          status = "free-available";
        } else if (res.status >= 500) {
          status = "free-unavailable";
        } else {
          status = "free-unavailable";
        }
      } catch {
        status = "free-unavailable";
      }

      if (!userStatus[row.id]) {
        nextModels[i] = { ...row, status };
      }
    }

    setModels(nextModels);
    setTesting(false);
  }, [models, userStatus]);

  useEffect(() => { runAutoTest(); }, [runAutoTest]);

  // ── Send panel ──────────────────────────────────────────────────────────────
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const sendingRef = useRef(false);

  const handleSend = useCallback(async () => {
    if (!selected || !prompt.trim() || sendingRef.current) return;
    sendingRef.current = true;
    setSendError(null);
    setReply(null);

    const provider = PROVIDERS.find((p) => p.id === selected.providerId);
    if (!provider || !isProviderConfigured(provider)) {
      setSendError(`No API key configured for ${provider?.label ?? selected.providerId}. Add it to .env`);
      sendingRef.current = false;
      return;
    }

    const status = effectiveStatus(selected);
    if (status !== "free-available") {
      setSendError("Model unavailable.");
      sendingRef.current = false;
      return;
    }

    try {
      const body: Record<string, unknown> = {
        model: selected.id,
        messages: [{ role: "user", content: prompt.trim() }],
        max_tokens: 512,
      };
      if (provider.id === "openrouter") body.temperature = 0.7;

      const res = await fetch(provider.baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${provider.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const json = (await res.json().catch(() => ({}))) as {
        error?: { message?: string } | string;
        choices?: { message?: { content?: string } }[];
        message?: { content?: string };
      };
      const err = json?.error;
      const errMsg = typeof err === "string" ? err : err?.message;
      if (!res.ok) throw new Error(errMsg || `HTTP ${res.status}`);

      const content = json?.choices?.[0]?.message?.content ?? json?.message?.content ?? null;
      if (!content) throw new Error("Empty response");
      setReply(content);
    } catch (e) {
      setSendError((e as Error).message);
    } finally {
      sendingRef.current = false;
    }
  }, [selected, prompt, effectiveStatus]);

  // ── Badge ───────────────────────────────────────────────────────────────────
  const Badge = ({ row }: { row: ModelRow }) => {
    const status = effectiveStatus(row);

    const badge =
      status === "free-available" ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/25 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-sm" />
          Free • Can be used
          {userStatus[row.id] ? <span className="ml-0.5 text-[10px] text-emerald-500/70">(you)</span> : null}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/25 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 shadow-sm" />
          Free • Unavailable
          {userStatus[row.id] ? <span className="ml-0.5 text-[10px] text-amber-500/70">(you)</span> : null}
        </span>
      );

    const toggleBtn = (
      <button
        type="button"
        onClick={() => handleToggle(row)}
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-all ${
          userStatus[row.id] === "free-available"
            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
        }`}
        title={userStatus[row.id] === "free-available" ? "Mark as unavailable" : "Mark as can be used"}
      >
        {userStatus[row.id] === "free-available" ? (
          <>
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-sm" />
            marked usable
          </>
        ) : (
          <>
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 shadow-sm" />
            mark usable
          </>
        )}
      </button>
    );

    return <div className="flex flex-wrap items-center gap-2">{badge}{toggleBtn}</div>;
  };

  // ── Provider section ────────────────────────────────────────────────────────
  const ProviderSection = ({
    providerId,
    title,
    rows,
  }: {
    providerId: string;
    title: string;
    rows: ModelRow[];
  }) => {
    return (
      <section className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="mt-1 text-[12px] text-gray-500">
          Auto-tested on load. Toggle each model to mark it usable or not.
        </p>

        <div className="mt-3 space-y-2">
          {rows.map((row) => {
            const status = effectiveStatus(row);
            const color =
              status === "free-available"
                ? "border-emerald-500/20"
                : "border-amber-500/20";

            return (
              <button
                key={row.id}
                type="button"
                onClick={() => setSelected(row)}
                className={`flex w-full items-start gap-3 rounded-lg border ${color} bg-white/[0.015] px-3 py-2.5 text-left transition-all hover:bg-white/[0.04] ${
                  selected?.id === row.id ? "ring-1 ring-white/20" : ""
                }`}
              >
                <span
                  className={`mt-1.5 flex h-2.5 w-2.5 shrink-0 rounded-full bg-current shadow-sm ${
                    status === "free-available" ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-white">{row.label}</span>
                    <span className="shrink-0 text-[11px] text-gray-500">{row.id}</span>
                  </div>
                  <Badge row={row} />
                </div>
              </button>
            );
          })}
        </div>
      </section>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const map = new Map<string, ModelRow[]>();
    for (const m of models) {
      const key = m.providerId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return map;
  }, [models]);

  return (
    <div className="min-h-[480px] rounded-2xl border border-white/10 bg-gray-900 p-4 text-white">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Free Model Selector</h1>
          <p className="mt-0.5 text-[12px] text-gray-500">
            Auto-tests each model on load. Manual marks saved to localStorage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {testing && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-500/15 px-2.5 py-1 text-[11px] font-medium text-gray-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-gray-400" />
              testing…
            </span>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-gray-400 transition-all hover:bg-white/10"
          >
            Reset my marks
          </button>
        </div>
      </div>

      {Array.from(grouped.entries()).map(([providerId, rows]) => {
        const provider = PROVIDERS.find((p) => p.id === providerId);
        return (
          <ProviderSection
            key={providerId}
            providerId={providerId}
            title={provider?.label ?? providerId}
            rows={rows}
          />
        );
      })}

      {selected ? (
        <section className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">{selected.label}</h3>
              <p className="mt-0.5 text-[12px] text-gray-500">
                {selected.id} · {PROVIDERS.find((p) => p.id === selected.providerId)?.label}
              </p>
            </div>
          </div>

          {sendError ? (
            <div className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{sendError}</div>
          ) : reply ? (
            <div className="mt-3 rounded-lg bg-white/5 p-3 text-sm text-gray-200">
              <div className="text-[11px] text-gray-500 mb-1">Reply</div>
              <pre className="whitespace-pre-wrap">{reply}</pre>
            </div>
          ) : (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                placeholder="Send a test message…"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-white/20"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!prompt.trim()}
                className="rounded-lg bg-brand-primary/20 px-3 py-2 text-sm font-medium text-white transition-all hover:bg-brand-primary/30 disabled:opacity-40"
              >
                Send
              </button>
            </div>
          )}
        </section>
      ) : (
        <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
          <p className="text-sm text-gray-500">Select a model to test it live.</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-gray-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-sm" />
          Free • Can be used
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 shadow-sm" />
          Free • Unavailable
        </span>
      </div>
    </div>
  );
}
