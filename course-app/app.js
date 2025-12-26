const productList = document.getElementById("product-list");

async function loadProducts() {
  try {
    const res = await fetch("http://localhost:3000/products");
    const products = await res.json();

    products.forEach(product => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img src="${product.img}" alt="${product.title}" />
        <h3>${product.title}</h3>
        <p>Ціна: $${product.price}</p>
        <button>Купити</button>
      `;

      card.querySelector("button").addEventListener("click", () => {
        alert(`Товар "${product.title}" додано до кошика!`);
      });

      productList.appendChild(card);
    });

  } catch (err) {
    console.error("Помилка завантаження товарів", err);
  }
}

loadProducts();
