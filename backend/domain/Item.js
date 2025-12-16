class Item {
  constructor(id, name) {
    if (!name) {
      throw new Error("NAME_REQUIRED");
    }
    this.id = id;
    this.name = name;
  }
}

module.exports = Item;
