class Product {
  constructor(id, name, price, categoryId) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.categoryId = categoryId;
  }

  changePrice(newPrice) {
    this.price = newPrice;
  }
}

module.exports = Product;
