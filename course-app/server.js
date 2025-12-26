import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let products = [
  { id: 1, name: "Product A", price: 100 },
  { id: 2, name: "Product B", price: 150 }
];

app.get("/products", (req, res) => {
  res.json(products);
});

app.post("/products", (req, res) => {
  const { name, price } = req.body;
  const newProduct = { id: products.length + 1, name, price };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use(express.static("frontend"));

app.listen(3000, () => console.log("✅ Course app running on http://localhost:3000"));
