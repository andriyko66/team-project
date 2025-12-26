// server.js
import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== Статичні файли =====
app.use(express.static(path.join(__dirname, "frontend")));

// ===== In-memory stores =====
const idemStore = new Map(); // Idempotency-Key -> response
const rate = new Map(); // IP -> { count, ts }
const products = []; // каталог товарів

// ===== Налаштування rate limit =====
const WINDOW_MS = 10_000;
const MAX_REQ = 8;
const now = () => Date.now();

// ===== X-Request-Id middleware =====
app.use((req, res, next) => {
  const rid = req.get("X-Request-Id") || randomUUID();
  req.requestId = rid;
  res.setHeader("X-Request-Id", rid);
  next();
});

// ===== Rate-limit middleware =====
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

// ===== Random delays & failures =====
app.use(async (req, res, next) => {
  const r = Math.random();
  if (r < 0.15) await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
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

// ===== Генерація демо товарів =====
const categories = ["Електроніка", "Книги", "Іграшки", "Одяг", "Продукти"];
const names = [
  "Смартфон", "Ноутбук", "Гарнітура", "Футболка", "Книга", 
  "М'яч", "Штани", "Чайник", "Пазл", "Іграшковий робот"
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProducts(count = 20) {
  for (let i = 0; i < count; i++) {
    products.push({
      id: "prod_" + randomUUID().slice(0, 8),
      title: names[randomInt(0, names.length - 1)] + " #" + (i + 1),
      category: categories[randomInt(0, categories.length - 1)],
      price: randomInt(50, 2000),
      stock: randomInt(0, 50),
      description: "Це опис продукту для демонстрації. Гарний товар!",
      image: `https://picsum.photos/200?random=${i + 1}`
    });
  }
}

// ===== Ініціалізація продуктів =====
generateProducts(25);

// ===== API =====

// Всі товари
app.get("/products", (_req, res) => {
  res.json({ products });
});

// Фільтр за категорією
app.get("/products/category/:cat", (req, res) => {
  const cat = req.params.cat;
  const filtered = products.filter(p => p.category === cat);
  res.json({ products: filtered });
});

// Отримати товар по id
app.get("/products/:id", (req, res) => {
  const prod = products.find(p => p.id === req.params.id);
  if (!prod) return res.status(404).json({ error: "not_found" });
  res.json(prod);
});

// Idempotent POST замовлення
app.post("/orders", (req, res) => {
  const key = req.get("Idempotency-Key");
  if (!key) return res.status(400).json({ error: "idempotency_key_required" });

  if (idemStore.has(key)) return res.status(201).json({
    ...idemStore.get(key),
    requestId: req.requestId
  });

  const order = {
    id: "ord_" + randomUUID().slice(0, 8),
    items: req.body.items ?? [],
    total: req.body.items?.reduce((sum, it) => sum + it.price, 0) ?? 0,
    createdAt: new Date()
  };

  idemStore.set(key, order);
  res.status(201).json({ ...order, requestId: req.requestId });
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ===== Фронтенд =====
// Для наочності робимо один HTML з JS прямо у frontend/index.html
// frontend/style.css вже має базові стилі

// ===== Сервер =====
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running http://localhost:${PORT}`));

