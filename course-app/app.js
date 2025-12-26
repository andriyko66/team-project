const products = [
  { id: 1, title: "Ноутбук", price: 25000 },
  { id: 2, title: "Смартфон", price: 12000 },
  { id: 3, title: "Навушники", price: 2000 },
  { id: 4, title: "Миша", price: 500 },
  { id: 5, title: "Клавіатура", price: 800 },
  { id: 6, title: "Монітор", price: 7000 },
];

const productList = document.getElementById("product-list");

function renderProducts() {
  productList.innerHTML = "";
  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <h3>${p.title}</h3>
      <p>Ціна: ${p.price} ₴</p>
      <button onclick="buyProduct(${p.id})">Купити</button>
    `;
    productList.appendChild(card);
  });
}

function buyProduct(id) {
  const product = products.find(p => p.id === id);
  alert(`Ви купили: ${product.title} за ${product.price} ₴`);
}

renderProducts();
