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

// ===== Підключення фронтенду =====
app.use(express.static(path.join(__dirname, "../frontend"))); // <-- вказуємо правильний шлях

// ===== IN-MEMORY DATA =====
const items = [
  { id: "1", name: "Хліб", description: "Свіжий пшеничний хліб", price: 25 },
  { id: "2", name: "Молоко", description: "Молоко 2.5%", price: 38 },
  { id: "3", name: "Сир", description: "Твердий сир", price: 120 },
];

const orders = [];

const idempotencyStore = new Map();

// ===== IDEMPOTENT CREATE ORDER =====
app.post("/orders-idempotent", (req, res) => {
  const idemKey = req.header("Idempotency-Key");

  if (!idemKey) {
    return res.status(400).json({
      error: "Idempotency-Key header required",
      requestId: req.requestId
    });
  }

  // якщо вже був такий ключ — повертаємо той самий результат
  if (idempotencyStore.has(idemKey)) {
    const savedResponse = idempotencyStore.get(idemKey);
    return res.status(201).json({
      ...savedResponse,
      requestId: req.requestId,
      idempotent: true
    });
  }

  const { itemId, quantity } = req.body;

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

  // ЗБЕРІГАЄМО результат
  idempotencyStore.set(idemKey, order);

  res.status(201).json({
    ...order,
    requestId: req.requestId,
    idempotent: false
  });
});

// ===== REQUEST ID =====
app.use((req, res, next) => {
  const id = randomUUID();
  req.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
});

// ===== ROUTES =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html")); // <-- тут теж вказуємо правильний шлях
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString(), requestId: req.requestId });
});

app.get("/items", (req, res) => res.json(items));
app.get("/orders", (req, res) => res.json(orders));

app.post("/orders", (req, res) => {
  const { itemId, quantity } = req.body;
  if (!itemId || !quantity) return res.status(400).json({ error: "Вкажіть itemId та quantity" });

  const item = items.find(i => i.id === itemId);
  if (!item) return res.status(400).json({ error: "Товар не знайдено" });

  const newOrder = { id: randomUUID(), item, quantity, total: item.price * quantity, createdAt: new Date().toISOString() };
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

app.delete("/orders/:id", (req, res) => {
  const { id } = req.params;
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) return res.status(404).json({ error: "Замовлення не знайдено" });

  orders.splice(index, 1);
  res.json({ message: `Замовлення ${id} видалено` });
});

app.use((req, res) => res.status(404).json({ error: "Route not found", method: req.method, path: req.originalUrl }));

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
