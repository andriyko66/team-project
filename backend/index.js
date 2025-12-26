const express = require("express");
const cors = require("cors");
const itemsRoutes = require("./api/items.routes");

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// API для товарів
app.use("/items", itemsRoutes);

// Статичні файли фронтенду
app.use(express.static("../frontend"));

app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
