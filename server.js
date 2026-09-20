// ── Backend proxy server ────────────────────────────────────────────────────────
//    Holds the real API keys server-side. The frontend (ModelDropdown / ModelTable)
//    calls this server instead of the provider APIs directly, so keys never reach the browser.
//
//    Dev:   node server.js            (runs on port 3001 by default)
//    Prod:  deploy this file to your own server / serverless / Vercel function.
//
//    The frontend uses REACT_APP_API_BASE_URL (in .env) to point at this server.
//    When REACT_APP_API_BASE_URL is empty, the frontend falls back to direct calls
//    using the REACT_APP_*_KEY values from .env (dev-only mode).

const express = require("express");
const fs = require("fs");
const path = require("path");

// ── Tiny .env loader (no external dependency) ──────────────────────────────────
//    Loads KEY=VALUE lines from ./env into process.env (does not override).
(function loadEnvFile() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && !(key in process.env)) process.env[key] = value;
  }
})();

const app = express();
app.use(express.json({ limit: "1mb" }));

// ── CORS (dev: frontend at :3000 talks to this proxy at :3001) ─────────────────
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
app.use(function (_req, res, next) {
  res.header("Access-Control-Allow-Origin", CORS_ORIGIN);
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (_req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ── Keys (server-side ONLY — never sent to the browser) ────────────────────────
const KEY_NAMES = {
  "free-ai": "FREE_AI_KEY",
  "openrouter": "OPENROUTER_KEY",
  "apinex": "APINEX_KEY",
  "atria-dawn": "ATRIA_KEY",
};

// ── Provider base URLs ──────────────────────────────────────────────────────────
const BASE_URLS = {
  "free-ai": "https://api.free.ai/v1/chat/",
  "openrouter": "https://openrouter.ai/api/v1/chat/completions",
  "apinex": "https://api.apinex.bond/v1/chat/completions",
  "atria-dawn": "https://api.atria-asi.ai/v1/responses",
};

const RESPONSES_API = new Set(["atria-dawn"]);

function getProvider(id) {
  const baseUrl = id && BASE_URLS[id];
  if (!baseUrl) return null;
  const key = process.env[KEY_NAMES[id]] || "";
  return { id, baseUrl, key };
}

// ── Health ──────────────────────────────────────────────────────────────────────
app.get("/health", function (_req, res) {
  res.json({ ok: true, timestamp: Date.now() });
});

// ── Proxy: test a model (frontend calls this instead of the provider) ───────────
//    POST /api/proxy?provider=<id>
//    Body: { model: "<model id>" }
//    Returns: { status: "free-can-use" | "free-unavailable" | "paid-blocked" }
app.post("/api/proxy", async function (req, res) {
  const provider = getProvider(req.query.provider);
  if (!provider) return res.status(400).json({ error: "Unknown provider: " + req.query.provider });
  if (!provider.key) return res.status(503).json({ error: "No key configured for " + provider.id });

  const modelId = (req.body && req.body.model) || "unknown";

  const fetchBody = RESPONSES_API.has(provider.id)
    ? { model: modelId, input: [{ role: "user", content: "OK" }] }
    : { model: modelId, messages: [{ role: "user", content: "OK" }], max_tokens: 8, temperature: 0 };

  try {
    const response = await fetch(provider.baseUrl, {
      method: "POST",
      headers: { Authorization: "Bearer " + provider.key, "Content-Type": "application/json" },
      body: JSON.stringify(fetchBody),
    });

    const json = await response.json().catch(function () { return {}; });
    const errCode = json && json.error && json.error.code;

    if (response.status === 429 || errCode === "1113") return res.json({ status: "paid-blocked" });
    if (response.status === 200 && ((json.choices && json.choices.length) || json.output)) {
      return res.json({ status: "free-can-use" });
    }
    return res.json({ status: "free-unavailable" });
  } catch (e) {
    return res.status(502).json({ status: "free-unavailable", error: e && e.message });
  }
});

// ── Proxy: send a real chat message ─────────────────────────────────────────────
//    POST /api/chat?provider=<id>
//    Body: { model: "<model id>", message: "<user text>" }
//    Returns: { ok: true, text: "..." } or { ok: false, error: "..." }
app.post("/api/chat", async function (req, res) {
  const provider = getProvider(req.query.provider);
  if (!provider) return res.status(400).json({ error: "Unknown provider: " + req.query.provider });
  if (!provider.key) return res.status(503).json({ ok: false, error: "No key configured for " + provider.id });

  const modelId = (req.body && req.body.model) || "unknown";
  const userMessage = (req.body && req.body.message) || "Hello";

  const usesResponsesApi = RESPONSES_API.has(provider.id);
  const fetchBody = usesResponsesApi
    ? { model: modelId, input: [{ role: "user", content: userMessage }] }
    : {
        model: modelId,
        messages: [{ role: "user", content: userMessage }],
        max_tokens: 512,
        temperature: provider.id === "openrouter" ? 0.7 : 0,
      };

  try {
    const response = await fetch(provider.baseUrl, {
      method: "POST",
      headers: { Authorization: "Bearer " + provider.key, "Content-Type": "application/json" },
      body: JSON.stringify(fetchBody),
    });

    const json = await response.json().catch(function () { return {}; });

    if (!response.ok) {
      const raw = json && json.error && json.error.message || json && json.error || "HTTP " + response.status;
      return res.status(response.status).json({ ok: false, error: typeof raw === "string" ? raw : JSON.stringify(raw) });
    }

    let text = null;
    if (json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content) {
      text = json.choices[0].message.content;
    } else if (json.output) {
      // Atria Dawn Responses API
      const outMsg = json.output.find(function (o) { return o && o.type === "message"; });
      if (outMsg && outMsg.content && outMsg.content[0] && outMsg.content[0].text) text = outMsg.content[0].text;
    }

    if (!text) return res.status(200).json({ ok: false, error: "Empty response" });
    return res.json({ ok: true, text: text });
  } catch (e) {
    return res.status(502).json({ ok: false, error: e && e.message });
  }
});

// ── Start ───────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
app.listen(PORT, function () {
  console.log("Model proxy server running on http://localhost:" + PORT);
  console.log("  POST /api/proxy?provider=<id>   -> test model (returns status)");
  console.log("  POST /api/chat?provider=<id>    -> send message (returns text)");
  console.log("  GET  /health                     -> ping");
  const loaded = Object.keys(KEY_NAMES).filter(function (k) { return !!process.env[KEY_NAMES[k]]; }).join(", ");
  console.log("Keys loaded: " + (loaded || "(none — set env vars, e.g. in .env)"));
  if (!loaded) {
    console.log("");
    console.log("  No provider keys configured. Frontend model testing will report");
    console.log("  \"free-unavailable\". Add keys to .env (see .env.example) and restart.");
  }
});