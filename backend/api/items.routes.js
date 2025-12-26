const express = require("express");
const router = express.Router();
const { randomUUID } = require("crypto");

// Початкові товари
let items = [
  { id: "1", name: "Яблуко", price: 15 },
  { id: "2", name: "Банан", price: 20 },
  { id: "3", name: "Морква", price: 10 },
  { id: "4", name: "Молоко", price: 25 },
  { id: "5", name: "Хліб", price: 18 },
];

// GET /items - всі товари
router.get("/", (req, res) => {
  res.json(items);
});

// GET /items/:id - деталі товару
router.get("/:id", (req, res) => {
  const item = items.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Товар не знайдено" });
  res.json(item);
});

// POST /items - додати новий товар
router.post("/", (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) return res.status(400).json({ error: "name і price обов'язкові" });

  const newItem = { id: randomUUID().slice(0, 8), name, price };
  items.push(newItem);
  res.status(201).json(newItem);
});

// DELETE /items/:id - видалити товар
router.delete("/:id", (req, res) => {
  const index = items.findIndex(i => i.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Товар не знайдено" });

  const deleted = items.splice(index, 1)[0];
  res.json(deleted);
});

module.exports = router;
