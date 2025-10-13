const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const db = new sqlite3.Database("items.db");


app.use(express.static(path.join(__dirname, "../frontend")));


db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT)");
  db.run("DELETE FROM items");
  db.run("INSERT INTO items (name) VALUES ('Apple')");
  db.run("INSERT INTO items (name) VALUES ('Banana')");
  db.run("INSERT INTO items (name) VALUES ('Orange')");
});


app.get("/items", (req, res) => {
  db.all("SELECT * FROM items", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


app.listen(3000, () => console.log("✅ Сервер запущено на http://localhost:3000"));
