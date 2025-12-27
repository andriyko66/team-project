import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";

const app = express();
const PORT = 3000;

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   IN-MEMORY DATA
========================= */
const items = [
  {
    id: "1",
    name: "Хліб",
    description: "Свіжий пшеничний хліб",
    price: 25
  },
  {
    id: "2",
    name: "Молоко",
    description: "Молоко 2.5%",
    price: 38
  },
  {
    id: "3",
    name: "Сир",
    description: "Твердий сир",
    price: 120
  }
];

const orders = [];

/* =========================
   REQUEST ID
========================= */
app.use((req, res, next) => {
  const id = randomUUID();
  req.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
});

/* =========================
   ROUTES
========================= */

// --- Health
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString(),
    requestId: req.requestId
  });
});

// --- Get items
app.get("/items", (req, res) => {
  res.json(items);
});

// --- Get orders
app.get("/orders", (req, res) => {
  res.json(orders);
});

// --- Create order
app.post("/orders", (req, res) => {
  const { itemId, quantity } = req.body;

  const item = items.find(i => i.id === itemId);

  if (!item) {
    return res.status(400).json({
      error: "Item not found"
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

  res.status(201).json(order);
});

// ----- Видалення замовлення
app.delete("/orders/:id", (req, res) => {
  const id = req.params.id;
  if (!idemStore.has(id)) { // idemStore зараз у тебе зберігає замовлення по ключу
    return res.status(404).json({ message: "Замовлення не знайдено" });
  }
  idemStore.delete(id);
  res.json({ message: `Замовлення ${id} видалено` });
});

/* =========================
   404 HANDLER (ВАЖЛИВО!)
========================= */
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    path: req.originalUrl
  });
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`✅ Server running http://localhost:${PORT}`);
});
