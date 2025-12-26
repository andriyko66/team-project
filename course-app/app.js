const productsContainer = document.getElementById("products-container");
const categoryFilter = document.getElementById("category-filter");
const sortPrice = document.getElementById("sort-price");
const cartCount = document.getElementById("cart-count");

let allProducts = [];
let cart = [];

async function fetchProducts() {
  try {
    const res = await fetch("/products");
    const data = await res.json();
    allProducts = data.products;
    renderProducts(allProducts);
  } catch (err) {
    console.error("Помилка при завантаженні продуктів", err);
  }
}

function renderProducts(products) {
  productsContainer.innerHTML = "";
  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.title}">
      <div class="info">
        <h3>${p.title}</h3>
        <p>Категорія: ${p.category}</p>
        <p>Ціна: $${p.price}</p>
        <p>На складі: ${p.stock}</p>
        <button>Додати в кошик</button>
      </div>
    `;
    const btn = card.querySelector("button");
    btn.addEventListener("click", () => addToCart(p));
    productsContainer.appendChild(card);
  });
}

function addToCart(product) {
  if (product.stock <= 0) {
    alert("На жаль, товар закінчився.");
    return;
  }
  cart.push(product);
  cartCount.textContent = cart.length;
  alert(`${product.title} додано в кошик!`);
}

// ===== Фільтри =====
categoryFilter.addEventListener("change", () => {
  let filtered = allProducts;
  const cat = categoryFilter.value;
  if (cat !== "all") filtered = filtered.filter(p => p.category === cat);
  renderProducts(filtered);
});

sortPrice.addEventListener("change", () => {
  const order = sortPrice.value;
  let sorted = [...allProducts];
  if (order === "asc") sorted.sort((a, b) => a.price - b.price);
  if (order === "desc") sorted.sort((a, b) => b.price - a.price);
  renderProducts(sorted);
});

// ===== Ініціалізація =====
fetchProducts();
