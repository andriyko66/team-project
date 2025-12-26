const productList = document.getElementById("products");
const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const addBtn = document.getElementById("addBtn");

async function loadProducts() {
  const res = await fetch("/products");
  const data = await res.json();
  productList.innerHTML = "";
  data.forEach(p => {
    const li = document.createElement("li");
    li.textContent = `${p.name} - $${p.price}`;
    productList.appendChild(li);
  });
}

addBtn.addEventListener("click", async () => {
  const name = nameInput.value;
  const price = Number(priceInput.value);
  if (!name || !price) return;
  await fetch("/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price })
  });
  nameInput.value = "";
  priceInput.value = "";
  loadProducts();
});

loadProducts();
