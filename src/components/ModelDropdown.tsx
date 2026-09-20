import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  PROVIDERS,
  SEED_ROWS,
  sendProviderMessage,
  isProviderConfigured,
  type ModelRow,
  type RowStatus,
  type Provider,
} from "../lib/provider-api";

// ── Re-export shared config (kept for compatibility with ModelTable) ────────────
export { PROVIDERS, SEED_ROWS, type RowStatus, type ModelRow, type Provider };

// ── localStorage ───────────────────────────────────────────────────────────────
const LS_KEY = "atria-model-selector-user-marks-v1";

function loadMarks(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveMarks(m: Record<string, boolean>) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(m)); } catch {}
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function ModelDropdown() {
  const [rows, setRows] = useState<ModelRow[]>(SEED_ROWS);
  const [marks, setMarks] = useState<Record<string, boolean>>(loadMarks);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [testing, setTesting] = useState(false);
  const [selected, setSelected] = useState<ModelRow | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ---- resolve effective status ------------------------------------------------
  const effectiveStatus = useCallback(
    (row: ModelRow) => {
      const userMark = marks[row.id];
      if (userMark === true)  return "free-can-use";
      if (userMark === false) return "free-unavailable";
      return row.status;
    },
    [marks],
  );

  // ---- only free-tier rows are editable ---------------------------------------
  const isEditable = useCallback(
    (row: ModelRow) => {
      const prov = PROVIDERS.find((p) => p.id === row.providerId);
      return prov ? prov.tier === "free" : false;
    },
    [],
  );

  // ---- toggle mark (the "mark as can be used / remove mark" action) ----------
  const toggleMark = useCallback((row: ModelRow) => {
    if (!isEditable(row)) return;
    const current = marks[row.id];
    const next = current === true ? false : true;
    const updated = { ...marks, [row.id]: next };
    setMarks(updated);
    saveMarks(updated);
  }, [marks, isEditable]);

  // ---- reset all marks ---------------------------------------------------------
  const resetMarks = useCallback(() => {
    setMarks({});
    saveMarks({});
  }, []);

  // ---- auto-test rows on mount ------------------------------------------------
  const runAutoTest = useCallback(async () => {
    setTesting(true);
    const testCache = new Set<string>();
    const next = [...rows];

    for (let i = 0; i < next.length; i++) {
      const row = next[i];
      if (testCache.has(row.id)) continue;
      testCache.add(row.id);

      const prov = PROVIDERS.find((p) => p.id === row.providerId);
      if (!prov || !isProviderConfigured(prov)) {
        row.status = "free-unavailable";
        continue;
      }

      let status: RowStatus = "free-unavailable";
      try {
        const body = JSON.stringify({
          model: row.id,
          messages: [{ role: "user", content: "OK" }],
          max_tokens: 8,
          temperature: 0,
        });
        const res = await fetch(prov.baseUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${prov.key}`,
            "Content-Type": "application/json",
          },
          body,
        });
        const json = await res.json().catch(() => ({}));

        const errCode = json?.error?.code;
        if (res.status === 429 || errCode === "1113") {
          status = "paid-blocked";
        } else if (res.status === 200 && (json.choices?.length || json.output)) {
          status = "free-can-use";
        } else {
          status = "free-unavailable";
        }
      } catch {
        status = "free-unavailable";
      }

      if (!marks[row.id]) {
        next[i] = { ...row, status };
      }
    }

    setRows(next);
    setTesting(false);
  }, [rows, marks]);

  useEffect(() => { runAutoTest(); }, [runAutoTest]);

  // ---- send a test message with the selected model ----------------------------
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const sendingRef = useRef(false);

  const send = useCallback(async () => {
    if (!selected || !prompt.trim() || sendingRef.current) return;
    sendingRef.current = true;
    setErr(null);
    setReply(null);

    const prov = PROVIDERS.find((p) => p.id === selected.providerId);
    if (!prov || !isProviderConfigured(prov)) {
      setErr(`No API key configured for ${prov?.label ?? selected.providerId}. Add it to .env`);
      sendingRef.current = false;
      return;
    }

    const status = effectiveStatus(selected);
    if (status !== "free-can-use") {
      setErr("Model not marked as can be used.");
      sendingRef.current = false;
      return;
    }

    // Use shared proxy/direct helper — handles Atria Dawn Responses API automatically
    const result = await sendProviderMessage(prov, selected.id, prompt.trim());
    if (result.ok) {
      setReply(result.text);
    } else {
      setErr(result.error ?? "Unknown error");
    }
    sendingRef.current = false;
  }, [selected, prompt, effectiveStatus]);

  // ---- filtered / grouped rows for dropdown -----------------------------------
  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter(
      (r) => r.id.toLowerCase().includes(q) || r.label.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, ModelRow[]>();
    for (const r of filtered) {
      const key = `${r.providerId}::${r.status}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return map;
  }, [filtered]);

  // ---- group label -------------------------------------------------------------
  const groupLabel = (key: string) => {
    const [providerId, status] = key.split("::");
    const prov = PROVIDERS.find((p) => p.id === providerId);
    const name = prov?.label ?? providerId;

    if (status === "free-can-use")   return `${name} · Free — Can be used`;
    if (status === "free-unavailable") return `${name} · Free — Can't be used`;
    if (status === "paid-blocked")    return `${name} · Paid — Can't be used`;
    return `${name} · Other`;
  };

  // ---- render a single row in the dropdown ------------------------------------
  const renderRow = (row: ModelRow) => {
    const status = effectiveStatus(row);
    const editable = isEditable(row);
    const marked = marks[row.id];

    const statusPill = (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium">
        {status === "free-can-use" && (
          <>
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Free — Can be used
            {marked && <span className="text-gray-400">(you)</span>}
          </>
        )}
        {status === "free-unavailable" && (
          <>
            <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500" />
            Free — Can't be used
            {marked && <span className="text-gray-400">(you)</span>}
          </>
        )}
        {status === "paid-blocked" && (
          <>
            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500" />
            Paid — Can't be used
          </>
        )}
        {status === "other" && (
          <>
            <span className="flex h-1.5 w-1.5 rounded-full bg-gray-400" />
            Other
          </>
        )}
      </span>
    );

    const editBtn = editable ? (
      <button
        type="button"
        onClick={() => toggleMark(row)}
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
          marked
            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
            : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
        }`}
        title={marked ? "Remove mark (Free - Can't be used)" : "Mark as Free - Can be used"}
      >
        {marked ? "✓ Can be used" : "+ Mark free"}
      </button>
    ) : null;

    return (
      <div
        key={row.id}
        className="group flex w-full items-start gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50 cursor-pointer"
        onClick={() => { setSelected(row); setOpen(false); }}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-gray-900">{row.label}</span>
            <span className="shrink-0 text-[11px] text-gray-400">{row.id}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            {statusPill}
            {editBtn}
          </div>
        </div>
        {selected?.id === row.id && (
          <span className="shrink-0 rounded-full bg-gray-900 px-1.5 py-0.5 text-[11px] font-medium text-white">
            ✓
          </span>
        )}
      </div>
    );
  };

  // ---- render the dropdown card ------------------------------------------------
  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── trigger ──────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-left shadow-sm transition-colors hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
      >
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-gray-900">
            {selected ? selected.label : "Select a model"}
          </div>
          <div className="text-[11px] text-gray-400">
            {selected ? `${selected.id} · ${PROVIDERS.find((p) => p.id === selected.providerId)?.label}` : "Click to choose"}
          </div>
        </div>
        <svg className="shrink-0 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ── dropdown panel ────────────────────────────────────────────────────── */}
      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex max-h-[70vh] flex-col">
            {/* search */}
            <div className="shrink-0 border-b border-gray-100 px-3 py-2">
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search models"
                  className="h-9 w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white focus:ring-1 focus:ring-gray-900/10"
                  autoFocus
                />
              </div>
            </div>

            {/* model groups */}
            <div className="flex-1 overflow-y-auto">
              {grouped.size === 0 ? (
                <div className="flex items-center justify-center py-8 text-sm text-gray-400">
                  No models match "{search}"
                </div>
              ) : (
                Array.from(grouped.entries()).map(([key, groupRows]) => (
                  <div key={key} className="border-b border-gray-50 px-3 py-2">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        {groupLabel(key)}
                      </span>
                      <span className="text-[10px] text-gray-400">{groupRows.length}</span>
                    </div>
                    <div className="space-y-0.5">
                      {groupRows.map((r) => renderRow(r))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* footer — refresh / edit / reset */}
            <div className="shrink-0 border-t border-gray-100 bg-gray-50 px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    setMessage("Refreshing…");
                    await runAutoTest();
                    setMessage("Refreshed " + rows.length + " models");
                    setTimeout(() => setMessage(null), 2500);
                  }}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh models
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const count = Object.keys(marks).length;
                    setMessage(`${count} model(s) marked by you · Reset clears all`);
                    setTimeout(() => setMessage(null), 3000);
                  }}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Edit models…
                </button>
              </div>
              {Object.keys(marks).length > 0 && (
                <button
                  type="button"
                  onClick={resetMarks}
                  className="rounded-md px-2 py-1 text-xs text-red-500 hover:bg-red-50"
                >
                  Reset marks
                </button>
              )}
            </div>

            {/* message toast */}
            {message && (
              <div className="shrink-0 border-t border-gray-100 bg-gray-50 px-3 py-1.5 text-xs text-gray-500">
                {message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* backdrop to close on outside click */}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />}

      {/* ── send test panel ───────────────────────────────────────────────────── */}
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm font-medium text-gray-900">
          {selected ? "Send a test message" : "Select a model to test it live"}
        </p>
        {selected && (
          <p className="mt-0.5 text-[11px] text-gray-400">
            {selected.label} · {PROVIDERS.find((p) => p.id === selected.providerId)?.label}
          </p>
        )}

        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            placeholder={selected ? "Type a message and press Enter…" : "Select a model from the list first"}
            disabled={!selected}
            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900/10 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={send}
            disabled={!selected || !prompt.trim() || sendingRef.current}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-40"
          >
            {sendingRef.current ? "Sending…" : "Send"}
          </button>
        </div>

        {err && (
          <div className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>
        )}
        {reply && (
          <div className="mt-2 rounded-md bg-gray-50 px-3 py-2">
            <p className="text-xs font-medium text-gray-500 mb-1">Reply</p>
            <pre className="whitespace-pre-wrap text-sm text-gray-800">{reply}</pre>
          </div>
        )}
      </div>
    </div>
  );
}