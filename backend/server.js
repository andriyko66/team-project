import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== Статичні файли (фронтенд) =====
app.use(express.static(path.join(__dirname, "frontend")));

// ===== IN-MEMORY DATA =====
const items = [
  { id: "1", name: "Хліб", description: "Свіжий пшеничний хліб", price: 25 },
  { id: "2", name: "Молоко", description: "Молоко 2.5%", price: 38 },
  { id: "3", name: "Сир", description: "Твердий сир", price: 120 },
];

const orders = [];

// ===== REQUEST ID =====
app.use((req, res, next) => {
  const id = randomUUID();
  req.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
});

// ===== ROUTES =====

// --- Головна сторінка
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// --- Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString(),
    requestId: req.requestId,
  });
});

// --- Get all items
app.get("/items", (req, res) => {
  res.json(items);
});

// --- Get all orders
app.get("/orders", (req, res) => {
  res.json(orders);
});

// --- Create a new order
app.post("/orders", (req, res) => {
  const { itemId, quantity } = req.body;

  if (!itemId || !quantity) {
    return res.status(400).json({ error: "Вкажіть itemId та quantity" });
  }

  const item = items.find(i => i.id === itemId);
  if (!item) {
    return res.status(400).json({ error: "Товар не знайдено" });
  }

  const newOrder = {
    id: randomUUID(),
    item,
    quantity,
    total: item.price * quantity,
    createdAt: new Date().toISOString(),
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// --- Delete an order by ID
app.delete("/orders/:id", (req, res) => {
  const { id } = req.params;
  const index = orders.findIndex(o => o.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Замовлення не знайдено" });
  }

  orders.splice(index, 1);
  res.json({ message: `Замовлення ${id} видалено` });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    path: req.originalUrl,
  });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
