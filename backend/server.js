import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   REQUEST ID (ОБОВʼЯЗКОВО ПЕРЕД ROUTES)
========================= */
app.use((req, res, next) => {
  const requestId = randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
});

/* =========================
   FRONTEND
========================= */
app.use(express.static(path.join(__dirname, "../frontend")));

/* =========================
   DATA
========================= */
const items = [
  { id: "1", name: "Хліб", description: "Свіжий пшеничний хліб", price: 25 },
  { id: "2", name: "Молоко", description: "Молоко 2.5%", price: 38 },
  { id: "3", name: "Сир", description: "Твердий сир", price: 120 }
];

const orders = [];

/* =========================
   IDEMPOTENCY
========================= */
const idempotencyStore = new Map();

/* =========================
   RATE LIMIT (429)
========================= */
let requestCount = 0;

setInterval(() => {
  requestCount = 0;
}, 10000);

/* =========================
   ROUTES
========================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    requestId: req.requestId
  });
});

app.get("/items", (req, res) => {
  res.json(items);
});

app.get("/orders", (req, res) => {
  res.json(orders);
});

/* =========================
   POST /orders (IDEMPOTENT)
========================= */
app.post("/orders", (req, res) => {
  requestCount++;

  if (requestCount > 10) {
    res.setHeader("Retry-After", "5");
    return res.status(429).json({
      error: "Too many requests",
      requestId: req.requestId
    });
  }

  const idemKey = req.headers["idempotency-key"];
  if (!idemKey) {
    return res.status(400).json({
      error: "Missing Idempotency-Key",
      requestId: req.requestId
    });
  }

  if (idempotencyStore.has(idemKey)) {
    return res.status(200).json({
      ...idempotencyStore.get(idemKey),
      requestId: req.requestId,
      idempotent: true
    });
  }

  const { itemId, quantity } = req.body;

  if (!itemId || !quantity) {
    return res.status(400).json({
      error: "itemId and quantity required",
      requestId: req.requestId
    });
  }

  const item = items.find(i => i.id === itemId);
  if (!item) {
    return res.status(400).json({
      error: "Item not found",
      requestId: req.requestId
    });
  }

  const order = {
    id: randomUUID(),
    item,
    quantity,
    total: item.price * quantity,
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  idempotencyStore.set(idemKey, order);

  res.status(201).json({
    ...order,
    requestId: req.requestId,
    idempotent: false
  });
});

/* =========================
   DELETE /orders/:id
========================= */
app.delete("/orders/:id", (req, res) => {
  const index = orders.findIndex(o => o.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      error: "Order not found",
      requestId: req.requestId
    });
  }

  orders.splice(index, 1);
  res.json({
    message: "Order deleted",
    requestId: req.requestId
  });
});

/* =========================
   404
========================= */
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    requestId: req.requestId
  });
});

/* =========================
   START
========================= */
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
