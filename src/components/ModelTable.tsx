import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PROVIDERS, SEED_ROWS, testProviderModel, sendProviderMessage, isProviderConfigured, type ModelRow, type RowStatus } from "../lib/provider-api";

// ── localStorage marks ────────────────────────────────────────────────────────
const LS_KEY = "atria-model-selector-user-marks-v1";

function loadMarks(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveMarks(m: Record<string, boolean>) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(m)); } catch {}
}

// ── status helpers ─────────────────────────────────────────────────────────────
function effectiveStatus(row: ModelRow, marks: Record<string, boolean>): RowStatus {
  const userMark = marks[row.id];
  if (userMark === true)  return "free-can-use";
  if (userMark === false) return "free-unavailable";
  return row.status;
}

function isEditable(row: ModelRow): boolean {
  const prov = PROVIDERS.find((p) => p.id === row.providerId);
  return prov ? prov.tier === "free" : false;
}

// ── auto-test (uses shared proxy/direct helper from provider-api) ──────────────
async function testRow(row: ModelRow): Promise<RowStatus> {
  const prov = PROVIDERS.find((p) => p.id === row.providerId);
  if (!prov || !isProviderConfigured(prov)) return "free-unavailable";
  return testProviderModel(prov, row.id);
}

// ── component ─────────────────────────────────────────────────────────────────
export default function ModelTable() {
  const [rows, setRows] = useState<ModelRow[]>(SEED_ROWS);
  const [marks, setMarks] = useState<Record<string, boolean>>(loadMarks);
  const [filter, setFilter] = useState<"all" | "free-can-use" | "free-unavailable" | "paid-blocked" | "other">("all");
  const [search, setSearch] = useState("");
  const [testing, setTesting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ---- send panel state --------------------------------------------------------
  const [prompt, setPrompt] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendReply, setSendReply] = useState<string | null>(null);

  // ---- toggle mark -------------------------------------------------------------
  const toggleMark = useCallback((row: ModelRow) => {
    if (!isEditable(row)) return;
    const current = marks[row.id];
    const next = current === true ? false : true;
    const updated = { ...marks, [row.id]: next };
    setMarks(updated);
    saveMarks(updated);
  }, [marks]);

  // ---- reset marks -------------------------------------------------------------
  const resetMarks = useCallback(() => {
    setMarks({});
    saveMarks({});
  }, []);

  // ---- auto-test all rows on mount + manual refresh ---------------------------
  const runAutoTest = useCallback(async (resetMarksFlag = false) => {
    setTesting(true);
    setRefreshing(true);
    const testCache = new Set<string>();
    const next = [...rows];

    for (let i = 0; i < next.length; i++) {
      const row = next[i];
      if (testCache.has(row.id)) continue;
      testCache.add(row.id);
      const status = await testRow(row);
      if (!marks[row.id] || resetMarksFlag) {
        next[i] = { ...row, status };
      }
    }
    setRows(next);
    setTesting(false);
    setRefreshing(false);
  }, [rows, marks]);

  useEffect(() => { runAutoTest(); }, []);

  // ---- send a real message through the selected model ------------------------
  const selected = rows.find((r) => r.id === selectedId) ?? null;

  const handleSend = useCallback(async () => {
    if (!selected || !prompt.trim() || sending) return;
    setSending(true);
    setSendError(null);
    setSendReply(null);

    const prov = PROVIDERS.find((p) => p.id === selected.providerId);
    if (!prov || !isProviderConfigured(prov)) {
      setSendError(`No API key configured for ${prov?.label ?? selected.providerId}. Add it to .env`);
      setSending(false);
      return;
    }

    if (effectiveStatus(selected, marks) !== "free-can-use") {
      setSendError("Model is not marked as can be used.");
      setSending(false);
      return;
    }

    const result = await sendProviderMessage(prov, selected.id, prompt.trim());
    if (result.ok) {
      setSendReply(result.text);
    } else {
      setSendError(result.error ?? "Unknown error");
    }
    setSending(false);
  }, [selected, prompt, sending, marks]);

  // ---- filtered + grouped rows ------------------------------------------------
  const filtered = useMemo(() => {
    const list = search.trim()
      ? rows.filter((r) => r.label.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()))
      : rows;
    if (filter === "all") return list;
    return list.filter((r) => effectiveStatus(r, marks) === filter);
  }, [rows, filter, search, marks]);

  const grouped = useMemo(() => {
    const map = new Map<string, { key: string; providerLabel: string; status: RowStatus; rows: ModelRow[] }>();
    for (const r of filtered) {
      const status = effectiveStatus(r, marks);
      const prov = PROVIDERS.find((p) => p.id === r.providerId);
      const groupId = `${r.providerId}::${status}`;
      if (!map.has(groupId)) {
        map.set(groupId, {
          key: groupId,
          providerLabel: prov?.label ?? r.providerId,
          status: status,
          rows: [],
        });
      }
      map.get(groupId)!.rows.push(r);
    }
    return Array.from(map.values()).sort((a, b) => {
      // order: free-can-use first, then free-unavailable, then paid-blocked, then other
      const order = { "free-can-use": 0, "free-unavailable": 1, "paid-blocked": 2, "other": 3 } as Record<string, number>;
      return (order[a.status] ?? 9) - (order[b.status] ?? 9);
    });
  }, [filtered, marks]);

  const statusLabel = (s: RowStatus) => {
    if (s === "free-can-use")   return "Free — Can be used";
    if (s === "free-unavailable") return "Free — Can't be used";
    if (s === "paid-blocked")    return "Paid — Can't be used";
    return "Other";
  };
  const statusColor = (s: RowStatus) => {
    if (s === "free-can-use")   return "bg-emerald-500";
    if (s === "free-unavailable") return "bg-amber-500";
    if (s === "paid-blocked")    return "bg-blue-500";
    return "bg-gray-400";
  };
  const statusBg = (s: RowStatus) => {
    if (s === "free-can-use")   return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "free-unavailable") return "bg-amber-50 text-amber-700 border-amber-200";
    if (s === "paid-blocked")    return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  // ---- counts for filters -----------------------------------------------------
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const r of rows) {
      const s = effectiveStatus(r, marks);
      c[s] = (c[s] || 0) + 1;
    }
    return c;
  }, [rows, marks]);

  // ---- render ------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <div className="mx-auto max-w-5xl">
        {/* header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Model Table</h1>
            <p className="mt-1 text-sm text-gray-500">
              Grouped by provider. Click a model to select it, mark free models as Free — Can be used.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {testing && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                <span className="h-2 w-2 animate-pulse rounded-full bg-gray-400" />
                testing…
              </span>
            )}
            {refreshing && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4h4z" />
                </svg>
                refreshing…
              </span>
            )}
          </div>
        </div>

        {/* filter + search bar */}
        <div className="mb-4 flex flex-wrap gap-2">
          {(["all", "free-can-use", "free-unavailable", "paid-blocked", "other"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f === "all" ? "All" : statusLabel(f)}
              <span className="ml-1 text-gray-400">({counts[f] ?? 0})</span>
            </button>
          ))}
        </div>

        {/* search */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by model id or label…"
            className="w-full max-w-xs rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900/10"
          />
        </div>

        {/* table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Model</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">API id</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Mark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grouped.map((group) => (
                <React.Fragment key={group.key}>
                  {/* group header */}
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="px-4 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          {group.providerLabel} · {statusLabel(group.status)}
                        </span>
                        <span className="text-xs text-gray-400">{group.rows.length} model{group.rows.length !== 1 ? "s" : ""}</span>
                      </div>
                    </td>
                  </tr>
                  {/* row items */}
                  {group.rows.map((row) => {
                    const status = effectiveStatus(row, marks);
                    const editable = isEditable(row);
                    const marked = marks[row.id];
                    const prov = PROVIDERS.find((p) => p.id === row.providerId);
                    const isSelected = row.id === selectedId;
                    return (
                      <tr key={row.id} className={`hover:bg-gray-50 ${isSelected ? "bg-gray-100" : ""}`}>
                        <td className="px-4 py-3 text-sm text-gray-900">{prov?.label ?? row.providerId}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          <button
                            type="button"
                            onClick={() => setSelectedId(row.id)}
                            className={`inline-flex items-center gap-2 text-left hover:text-gray-700 ${isSelected ? "text-gray-900" : ""}`}
                            title="Click to select for the send panel below"
                          >
                            {row.label}
                            {isSelected && <span className="rounded-full bg-gray-900 px-1.5 py-0.5 text-[10px] font-bold text-white">✓</span>}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 font-mono">{row.id}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${statusBg(status)}`}>
                            <span className={`h-2 w-2 rounded-full ${statusColor(status)}`} />
                            {statusLabel(status)}
                            {marked && <span className="ml-0.5 text-gray-400">(you)</span>}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {editable ? (
                            <button
                              type="button"
                              onClick={() => toggleMark(row)}
                              className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                                marked
                                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                  : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
                              }`}
                              title={marked ? "Remove mark (Free — Can't be used)" : "Mark as Free — Can be used"}
                            >
                              {marked ? "✓ Can be used" : "+ Mark free"}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
              {grouped.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                    No models match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* footer controls */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => runAutoTest(false)}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-md bg-white border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? "Refreshing…" : "Refresh models"}
            </button>
            <button
              type="button"
              onClick={() => {
                const count = Object.keys(marks).length;
                alert(`${count} model(s) marked by you. Reset clears all marks.`);
              }}
              className="flex items-center gap-1.5 rounded-md bg-white border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Edit marks…
            </button>
          </div>
          {Object.keys(marks).length > 0 && (
            <button
              type="button"
              onClick={resetMarks}
              className="rounded-md bg-white border border-gray-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
            >
              Reset all marks
            </button>
          )}
        </div>

        {/* send panel */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-900">
            {selected ? "Send a test message" : "Send a test message — select a model first"}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {selected
              ? `Sending through ${selected.label} (${selected.id}). Uses the shared proxy helper (backend if available, else direct with env keys).`
              : "Click a model row in the table above to select it. Uses the shared proxy helper (backend if available, else direct)."}
          </p>

          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
              disabled={!selected}
              placeholder="Type a message and press Enter…"
              className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900/10 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !selected || !prompt.trim()}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-40"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </div>

          {sendError && (
            <div className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {sendError}
            </div>
          )}
          {sendReply && (
            <div className="mt-2 rounded-md bg-gray-50 px-3 py-2">
              <p className="text-xs font-medium text-gray-500 mb-1">Reply</p>
              <pre className="whitespace-pre-wrap text-sm text-gray-800">{sendReply}</pre>
            </div>
          )}
        </div>

        {/* status legend */}
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
          <p className="font-medium text-gray-900">Status legend</p>
          <ul className="mt-2 space-y-1">
            <li className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Free — Can be used (auto-tested OK or you marked it)
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              Free — Can't be used (service down; retry later)
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              Paid — Can't be used (balance = 0; top up to use)
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />
              Other (not tested / unknown)
            </li>
          </ul>
          <p className="mt-3 text-xs text-gray-400">
            Free providers (free.ai, OpenRouter, APInex, Atria Dawn) are editable — click
            <span className="font-mono">+ Mark free</span> or
            <span className="font-mono">✓ Can be used</span> on any free row to toggle the mark.
            Your marks are saved to localStorage and shown with <span className="text-gray-400">(you)</span>.
          </p>
        </div>

        {/* key summary */}
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 text-xs text-gray-500">
          <p className="font-medium text-gray-700">Connected providers & keys</p>
          <ul className="mt-2 space-y-1">
            {PROVIDERS.map((p) => (
              <li key={p.id}>
                {p.label} — <span className="font-mono">{isProviderConfigured(p) ? "key configured (via .env)" : "no key set — add to .env"}</span>
              </li>
            ))}
          </ul>
        </div>

        <footer className="mt-6 border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
          Auto-tests all models on load. Click Refresh models to re-test. Your marks persist in localStorage.
        </footer>
      </div>
    </div>
  );
}