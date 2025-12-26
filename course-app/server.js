import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";

const app = express();
app.use(cors());
app.use(express.json());

const products = [
  { id: 1, title: "Ноутбук", price: 1200, img: "https://via.placeholder.com/150" },
  { id: 2, title: "Смартфон", price: 800, img: "https://via.placeholder.com/150" },
  { id: 3, title: "Навушники", price: 150, img: "https://via.placeholder.com/150" },
  { id: 4, title: "Миша", price: 50, img: "https://via.placeholder.com/150" },
  { id: 5, title: "Клавіатура", price: 100, img: "https://via.placeholder.com/150" }
];

// endpoint для отримання товарів
app.get("/products", (_req, res) => {
  res.json(products);
});

// health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(3000, () => console.log("✅ Server running at http://localhost:3000"));
