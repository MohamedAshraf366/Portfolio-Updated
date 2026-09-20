// ── Provider config ────────────────────────────────────────────────────────────
// API keys are read from environment variables (REACT_APP_* — set in .env,
// which is gitignored). No secrets are committed to the repository.
//
//   Dev:   npm run dev   → serves this frontend on :3000 and server.js on :3001
//   Prod:  set REACT_APP_API_BASE_URL to your proxy server URL, or set the
//          keys in your platform's env vars. When REACT_APP_API_BASE_URL is
//          empty the frontend makes direct calls with the REACT_APP_* keys.

function envKey(name: string): string {
  return (process.env[name] ?? "").trim();
}

export const DEV_KEYS = {
  freeai: envKey("REACT_APP_FREE_AI_KEY"),
  openrouter: envKey("REACT_APP_OPENROUTER_KEY"),
  apinex: envKey("REACT_APP_APINEX_KEY"),
  atria: envKey("REACT_APP_ATRIA_KEY"),
} as const;

// ── Backend proxy base URL + feature flag ──────────────────────────────────────
export const API_BASE_URL = envKey("REACT_APP_API_BASE_URL");
export const USE_BACKEND_PROXY = API_BASE_URL !== "" || process.env.REACT_APP_USE_BACKEND_PROXY === "true";

// ── Provider registry (shared by ModelDropdown, ModelTable, FreeModelSelector) ─
export interface Provider {
  id: string;
  label: string;
  baseUrl: string;          // direct API URL (used in dev / when proxy is down)
  key: string;              // REACT_APP_* key — "--unset--" when no key .env
  tier: "free" | "paid" | "other";
  // Special-cased Responses API provider (Atria Dawn) vs chat/completions
  responsesApi?: boolean;
}

function makeKey(key: string): string {
  return key || "--unset--";
}

export const PROVIDERS: Provider[] = [
  {
    id: "free-ai",
    label: "free.ai",
    baseUrl: "https://api.free.ai/v1/chat/",
    key: makeKey(DEV_KEYS.freeai),
    tier: "free",
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    key: makeKey(DEV_KEYS.openrouter),
    tier: "free",
  },
  {
    id: "apinex",
    label: "APInex",
    baseUrl: "https://api.apinex.bond/v1/chat/completions",
    key: makeKey(DEV_KEYS.apinex),
    tier: "free",
  },
  {
    id: "atria-dawn",
    label: "Atria Dawn",
    baseUrl: "https://api.atria-asi.ai/v1/responses",
    key: makeKey(DEV_KEYS.atria),
    tier: "free",
    responsesApi: true,
  },
];

export function isProviderConfigured(provider: Provider): boolean {
  return !!provider.key && provider.key !== "--unset--";
}

// ── Shared seed rows (imported by both ModelDropdown and ModelTable) ───────────
export type RowStatus = "free-can-use" | "free-unavailable" | "paid-blocked" | "other";

export interface ModelRow {
  id: string;
  label: string;
  providerId: string;
  status: RowStatus;
}

export const SEED_ROWS: ModelRow[] = [
  // ── free.ai ─────────────────────────────────────────────────────────────────
  { id: "qwen7b",                 label: "Qwen 7B Med",               providerId: "free-ai",     status: "free-can-use" },
  { id: "deepseek-r1",            label: "DeepSeek R1 Med",           providerId: "free-ai",     status: "free-unavailable" },
  { id: "mistral",                label: "Mistral Med",               providerId: "free-ai",     status: "free-unavailable" },
  { id: "deepseek-r1-7b",         label: "DeepSeek R1 7B Med",        providerId: "free-ai",     status: "free-unavailable" },
  { id: "qwen-coder",             label: "Qwen Coder Med",            providerId: "free-ai",     status: "free-unavailable" },
  { id: "qwen3-8b",               label: "Qwen 3 8B Med",            providerId: "free-ai",     status: "free-unavailable" },
  { id: "qwen3-coder",            label: "Qwen 3 Coder Med",          providerId: "free-ai",     status: "free-unavailable" },
  { id: "sdxl",                   label: "SDXL Med (image)",          providerId: "free-ai",     status: "free-can-use" },

  // ── OpenRouter free tier ─────────────────────────────────────────────────────
  { id: "inclusionai/ling-3.0-flash-fin:free", label: "Ling 3.0 Flash Fin:Free Med",       providerId: "openrouter", status: "free-can-use" },
  { id: "nex-agi/nex-n2.5-mini:free",          label: "NEX N2.5 Mini:Free Med",             providerId: "openrouter", status: "free-can-use" },
  { id: "inclusionai/ling-3.0-flash-sante:free",label: "Ling 3.0 Flash Sante:Free Med",    providerId: "openrouter", status: "free-can-use" },
  { id: "inclusionai/ling-3.0-flash-vl:free",  label: "Ling 3.0 Flash VL:Free Med",         providerId: "openrouter", status: "free-can-use" },
  { id: "dots-studio/dots-3-note-preview:free", label: "Dots 3 Note Preview:Free Med",      providerId: "openrouter", status: "free-can-use" },
  { id: "nex-agi/nex-n2.5-pro:free",           label: "NEX N2.5 Pro:Free Med",              providerId: "openrouter", status: "free-unavailable" },

  // ── APInex free models (all return cost_tokens: 0) ──────────────────────────
  { id: "free/claude-sonnet-4.6",   label: "Claude Sonnet 4.6:Free Med",  providerId: "apinex", status: "free-can-use" },
  { id: "free/deepseek-v4-flash-0731", label: "DeepSeek V4 Flash:Free Med",    providerId: "apinex", status: "free-can-use" },
  { id: "free/gemini-3.8-flash",    label: "Gemini 3.8 Flash:Free Med",    providerId: "apinex", status: "free-can-use" },
  { id: "free/qwen-3.8-max",        label: "Qwen 3.8 Max:Free Med",        providerId: "apinex", status: "free-can-use" },
  { id: "free/gpt-5.6-luna",        label: "GPT-5.6 Luna:Free Med",        providerId: "apinex", status: "free-can-use" },
  { id: "free/kimi-k3",             label: "Kimi K3:Free Med",             providerId: "apinex", status: "free-can-use" },
  { id: "free/mimo-v2.5",           label: "Mimo V2.5:Free Med",           providerId: "apinex", status: "free-can-use" },
  { id: "free/muse-spark-1.3",      label: "Muse Spark 1.3:Free Med",      providerId: "apinex", status: "free-can-use" },
  { id: "free/glm-5.3-flash",       label: "Glm 5.3 Flash:Free Med",       providerId: "apinex", status: "free-can-use" },
  { id: "free/claude-opus-4.6",     label: "Claude Opus 4.6:Free Med",     providerId: "apinex", status: "free-can-use" },
  { id: "free/deepseek-v4-pro-0813",label: "DeepSeek V4 Pro:Free Med",     providerId: "apinex", status: "free-can-use" },
  { id: "free/deepseek-v4.1-flash", label: "DeepSeek V4.1 Flash:Free Med", providerId: "apinex", status: "free-can-use" },
  { id: "free/gemini-3.1-pro",      label: "Gemini 3.1 Pro:Free Med",      providerId: "apinex", status: "free-can-use" },

  // ── APInex paid models (balance = 0, blocked) ───────────────────────────────
  { id: "claude-sonnet-5",       label: "Claude Sonnet 5 Med",    providerId: "apinex", status: "paid-blocked" },
  { id: "claude-opus-5",         label: "Claude Opus 5 Med",       providerId: "apinex", status: "paid-blocked" },
  { id: "claude-fable-5.1",      label: "Claude Fable 5.1 Med",    providerId: "apinex", status: "paid-blocked" },
  { id: "gpt-5.6-terra",         label: "GPT-5.6 Terra Med",       providerId: "apinex", status: "paid-blocked" },
  { id: "gpt-5.6-sol",           label: "GPT-5.6 Sol Med",         providerId: "apinex", status: "paid-blocked" },
  { id: "gpt-6-astra",           label: "GPT-6 Astra Med",         providerId: "apinex", status: "paid-blocked" },
  { id: "glm-5.3",               label: "Glm 5.3 Med",             providerId: "apinex", status: "paid-blocked" },
  { id: "grok-4.6",              label: "Grok 4.6 Med",            providerId: "apinex", status: "paid-blocked" },
  { id: "deepseek-v4-flash",     label: "DeepSeek V4 Flash Med",   providerId: "apinex", status: "paid-blocked" },
  { id: "deepseek-v4-pro",       label: "DeepSeek V4 Pro Med",     providerId: "apinex", status: "paid-blocked" },
  { id: "deepseek-v4.1-flash",   label: "DeepSeek V4.1 Flash Med", providerId: "apinex", status: "paid-blocked" },

  // ── Atria Dawn (free — Responses API) ───────────────────────────────────────
  { id: "Atria-Dawn-Preview",    label: "Atria Dawn Preview Med",  providerId: "atria-dawn", status: "free-can-use" },
];

// ── Helper: build the URL + headers for a provider, choosing proxy vs direct ───
export function providerFetchArgs(
  provider: Provider,
  body: string,
  path = "/api/proxy",
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (USE_BACKEND_PROXY && API_BASE_URL) {
    // The proxy endpoint receives the provider id + body, adds the key server-side,
    // and returns the response. This keeps the key off the wire.
    const url = new URL(API_BASE_URL + path);
    url.searchParams.set("provider", provider.id);
    return {
      url: url.toString(),
      headers,
      body,
      direct: false,
    };
  }

  // Dev / fallback: direct call with the key in the header
  headers.Authorization = `Bearer ${provider.key}`;
  return {
    url: provider.baseUrl,
    headers,
    body,
    direct: true,
  };
}

// ── Helper: call a provider's test endpoint (used by both components) ──────────
export async function testProviderModel(
  provider: Provider,
  modelId: string,
): Promise<RowStatus> {
  const payload = provider.responsesApi
    ? { model: modelId, input: [{ role: "user", content: "OK" }] }
    : { model: modelId, messages: [{ role: "user", content: "OK" }], max_tokens: 8, temperature: 0 };

  const args = providerFetchArgs(provider, JSON.stringify(payload));

  try {
    const res = await fetch(args.url, {
      method: "POST",
      headers: args.headers,
      body: args.body,
    });
    const json = await res.json().catch(() => ({}));

    // When using the proxy, the server returns { status: "..." } in the body.
    if (args.direct === false && json && typeof json.status === "string") {
      return json.status as RowStatus;
    }

    const errCode = json?.error?.code;
    if (res.status === 429 || errCode === "1113") return "paid-blocked";
    if (res.status === 200 && (json.choices?.length || json.output)) return "free-can-use";
    return "free-unavailable";
  } catch {
    return "free-unavailable";
  }
}

function extractChatText(json: any): string | null {
  if (json?.choices?.[0]?.message?.content) {
    return json.choices[0].message.content;
  }
  if (json?.output) {
    // Atria Dawn Responses API
    const outMsg = json.output.find((o: any) => o && o.type === "message");
    if (outMsg?.content?.[0]?.text) return outMsg.content[0].text;
  }
  return null;
}

// ── Helper: send a real message through a provider (used by both components) ───
export async function sendProviderMessage(
  provider: Provider,
  modelId: string,
  userMessage: string,
): Promise<{ ok: boolean; text: string | null; error: string | null }> {
  if (!isProviderConfigured(provider)) {
    return { ok: false, text: null, error: `No API key configured for ${provider.label}. Add it to .env` };
  }

  const payload = provider.responsesApi
    ? { model: modelId, input: [{ role: "user", content: userMessage }] }
    : {
        model: modelId,
        messages: [{ role: "user", content: userMessage }],
        max_tokens: 512,
        temperature: provider.id === "openrouter" ? 0.7 : 0,
      };

  const args = providerFetchArgs(provider, JSON.stringify(payload), "/api/chat");

  try {
    const res = await fetch(args.url, { method: "POST", headers: args.headers, body: args.body });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = json?.error?.message || json?.error || `HTTP ${res.status}`;
      return { ok: false, text: null, error: typeof msg === "string" ? msg : JSON.stringify(msg) };
    }

    if (args.direct) {
      // Direct call — parse normal OpenAI-style response
      const text = extractChatText(json);
      if (!text) {
        const msg = json?.error?.message || json?.error || `HTTP ${res.status}`;
        return { ok: false, text: null, error: typeof msg === "string" ? msg : "Empty response" };
      }
      return { ok: true, text, error: null };
    }

    // Proxy call — the server returns { ok, text, error } directly
    if (json?.ok === true && json?.text) {
      return { ok: true, text: json.text, error: null };
    }
    if (json?.error) {
      return { ok: false, text: null, error: String(json.error) };
    }
    return { ok: false, text: null, error: `Proxy error: ${JSON.stringify(json).slice(0, 200)}` };
  } catch (e) {
    return { ok: false, text: null, error: (e as Error).message };
  }
}