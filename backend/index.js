import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";

const app = express();
app.use(cors());
app.use(express.json());

/* ===== In-memory stores ===== */
const itemsStore = new Map();     // id -> { id, name, price, description }
const ordersStore = new Map();    // id -> order
const rateLimit = new Map();      // ip -> { count, ts }

/* ===== Populate sample items ===== */
for (let i = 1; i <= 10; i++) {
  const id = "item_" + i;
  itemsStore.set(id, {
    id,
    name: `Товар ${i}`,
    price: (Math.random() * 100).toFixed(2),
    description: `Це опис товару ${i}. Він дуже класний!`
  });
}

/* ===== Rate limit config ===== */
const WINDOW_MS = 10_000;
const MAX_REQ = 10;
const now = () => Date.now();

/* ===== Middleware: X-Request-Id ===== */
app.use((req, res, next) => {
  const rid = req.get("X-Request-Id") || randomUUID();
  req.requestId = rid;
  res.setHeader("X-Request-Id", rid);
  next();
});

/* ===== Middleware: rate limiting ===== */
app.use((req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "local";
  const prev = rateLimit.get(ip) ?? { count: 0, ts: now() };
  const within = now() - prev.ts < WINDOW_MS;
  const state = within ? { count: prev.count + 1, ts: prev.ts } : { count: 1, ts: now() };
  rateLimit.set(ip, state);

  if (state.count > MAX_REQ) {
    res.setHeader("Retry-After", "2");
    return res.status(429).json({ error: "too_many_requests", requestId: req.requestId });
  }
  next();
});

/* ===== Middleware: random failures/delays ===== */
app.use(async (req, res, next) => {
  const r = Math.random();
  if (r < 0.1) await new Promise(r => setTimeout(r, 800 + Math.random() * 500));
  if (r > 0.85) {
    const err = Math.random() < 0.5 ? "unavailable" : "unexpected";
    return res.status(err === "unavailable" ? 503 : 500).json({ error: err, requestId: req.requestId });
  }
  next();
});

/* ===== Health check ===== */
app.get("/health", (_req, res) => res.json({ status: "ok" }));

/* ===== Get all items ===== */
app.get("/items", (_req, res) => {
  res.json(Array.from(itemsStore.values()));
});

/* ===== Get single item ===== */
app.get("/items/:id", (req, res) => {
  const item = itemsStore.get(req.params.id);
  if (!item) return res.status(404).json({ error: "item_not_found", requestId: req.requestId });
  res.json(item);
});

/* ===== Create order ===== */
app.post("/orders", (req, res) => {
  const { itemId, quantity } = req.body;
  if (!itemId || !quantity) return res.status(400).json({ error: "missing_fields", requestId: req.requestId });

  const item = itemsStore.get(itemId);
  if (!item) return res.status(404).json({ error: "item_not_found", requestId: req.requestId });

  const orderId = "order_" + randomUUID().slice(0, 8);
  const order = { id: orderId, item, quantity, total: (item.price * quantity).toFixed(2) };
  ordersStore.set(orderId, order);
  res.status(201).json({ ...order, requestId: req.requestId });
});

/* ===== Get all orders ===== */
app.get("/orders", (_req, res) => res.json(Array.from(ordersStore.values())));

/* ===== Catch-all 404 ===== */
app.use("*", (req, res) => res.status(404).json({ error: "not_found", requestId: req.requestId }));

/* ===== Start server ===== */
app.listen(3000, () => console.log("✅ Server running at http://localhost:3000"));
