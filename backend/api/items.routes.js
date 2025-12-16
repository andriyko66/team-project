const express = require("express");
const router = express.Router();
const itemsService = require("../service/items.service");

// GET /items
router.get("/", (req, res) => {
  res.json(itemsService.getAll());
});

// POST /items
router.post("/", (req, res) => {
  try {
    const item = itemsService.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({
      error: "ValidationError",
      code: err.message
    });
  }
});

// PUT /items/:id
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const updated = itemsService.update(id, req.body);

  if (!updated) {
    return res.status(404).json({ error: "NotFound" });
  }

  res.json(updated);
});

// DELETE /items/:id
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const removed = itemsService.remove(id);

  if (!removed) {
    return res.status(404).json({ error: "NotFound" });
  }

  res.status(204).send();
});

module.exports = router;
