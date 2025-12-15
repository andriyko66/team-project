const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const db = new sqlite3.Database("items.db");

// health
app.get("/health", (req, res) => {
  res.status(200).send("ok");
});

// items
app.get("/items", (req, res) => {
  db.all("SELECT * FROM items", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// db init
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT)");
});

// static frontend
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// SPA fallback ❗ ВАЖЛИВО
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(3000, () => {
  console.log("✅ Сервер запущено на http://localhost:3000");
});
