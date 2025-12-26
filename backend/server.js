import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

/* ================== базові налаштування ================== */

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

/* ================== __dirname для ES modules ================== */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================== in-memory дані (лаба) ================== */

// імітація БД товарів
const items = [
  { id: 1, name: "Хліб", price: 25 },
  { id: 2, name: "Молоко", price: 40 },
  { id: 3, name: "Сир", price: 120 }
];

// замовлення
const orders = [];

/* ================== middleware логування ================== */

app.use((req, res, next) => {
  const id = randomUUID().slice(0, 8);
  req.requestId = id;

  console.log(
    `[${new Date().toLocaleTimeString()}]`,
    req.method,
    req.url,
    "id:",
    id
  );

  next();
});

/* ================== API: health ================== */

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString(),
    requestId: req.requestId
  });
});

/* ================== API: items (лаба 2–3) ================== */

app.get("/items", (req, res) => {
  res.json(items);
});

app.post("/items", (req, res) => {
  const { name, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({
      error: "name and price required"
    });
  }

  const newItem = {
    id: items.length + 1,
    name,
    price
  };

  items.push(newItem);

  res.status(201).json(newItem);
});

/* ================== API: orders (додаткова логіка) ================== */

app.post("/orders", (req, res) => {
  const { itemId, quantity } = req.body;

  const item = items.find(i => i.id === itemId);

  if (!item) {
    return res.status(404).json({ error: "item not found" });
  }

  const order = {
    id: "ord_" + randomUUID().slice(0, 6),
    item: item.name,
    quantity,
    total: item.price * quantity,
    createdAt: new Date().toISOString()
  };

  orders.push(order);

  res.status(201).json(order);
});

app.get("/orders", (req, res) => {
  res.json(orders);
});

/* ================== FRONTEND ================== */
/* ❗ БЕЗ '*' — ТІЛЬКИ ЯВНИЙ ШЛЯХ */

app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "frontend", "index.html")
  );
});

/* ================== 404 (безпечний) ================== */

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    path: req.originalUrl
  });
});

/* ================== запуск ================== */

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

