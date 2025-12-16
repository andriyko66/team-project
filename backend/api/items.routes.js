const express = require("express");
const service = require("../service/items.service");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(service.getAll());
});

router.get("/:id", (req, res) => {
  const item = service.getById(Number(req.params.id));
  if (!item) return res.status(404).end();
  res.json(item);
});

router.post("/", (req, res) => {
  try {
    const item = service.create(req.body);
    res.status(201).json(item);
  } catch {
    res.status(400).json({
      error: "ValidationError",
      code: "NAME_REQUIRED"
    });
  }
});

router.delete("/:id", (req, res) => {
  const ok = service.remove(Number(req.params.id));
  if (!ok) return res.status(404).end();
  res.status(204).end();
});

module.exports = router;
