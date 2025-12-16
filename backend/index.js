const express = require("express");
const itemsRoutes = require("./api/items.routes");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.send("ok");
});

app.use("/items", itemsRoutes);

app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
