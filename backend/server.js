import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

/* ===== In-memory stores ===== */
const idemStore = new Map();     // Idempotency-Key -> response
const rate = new Map();          // ip -> { count, ts }

/* ===== Rate limit config ===== */
const WINDOW_MS = 10_000;
const MAX_REQ = 8;
const now = () => Date.now();

/* ===== X-Request-Id middleware ===== */
app.use((req, res, next) => {
  const rid = req.get("X-Request-Id") || randomUUID();
  req.requestId = rid;
  res.setHeader("X-Request-Id", rid);
  next();
});

/* ===== Rate-limit + Retry-After ===== */
app.use((req, res, next) => {
  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "local";

  const prev = rate.get(ip) ?? { count: 0, ts: now() };
  const within = now() - prev.ts < WINDOW_MS;

  const state = within
    ? { count: prev.count + 1, ts: prev.ts }
    : { count: 1, ts: now() };

  rate.set(ip, state);

  if (state.count > MAX_REQ) {
    res.setHeader("Retry-After", "2");
    return res.status(429).json({
      error: "too_many_requests",
      code: null,
      details: null,
      requestId: req.requestId
    });
  }
  next();
});

/* ===== Random delays & failures (for retries demo) ===== */
app.use(async (req, res, next) => {
  const r = Math.random();

  if (r < 0.15) {
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
  }

  if (r > 0.8) {
    const err = Math.random() < 0.5 ? "unavailable" : "unexpected";
    const code = err === "unavailable" ? 503 : 500;

    return res.status(code).json({
      error: err,
      code,
      details: null,
      requestId: req.requestId
    });
  }
  next();
});

/* ===== Idempotent POST ===== */
app.post("/orders", (req, res) => {
  const key = req.get("Idempotency-Key");

  if (!key) {
    return res.status(400).json({
      error: "idempotency_key_required",
      code: null,
      details: null,
      requestId: req.requestId
    });
  }

  if (idemStore.has(key)) {
    return res.status(201).json({
      ...idemStore.get(key),
      requestId: req.requestId
    });
  }

  const order = {
    id: "ord_" + randomUUID().slice(0, 8),
    title: req.body?.title ?? "Untitled"
  };

  idemStore.set(key, order);

  res.status(201).json({
    ...order,
    requestId: req.requestId
  });
});

/* ===== Health ===== */
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

/* ===== Static frontend ===== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../frontend")));
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

/* ===== Start server ===== */
app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
