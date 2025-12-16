const Item = require("../domain/Item");

let items = [];
let nextId = 1;

function getAll() {
  return items;
}

function create(data) {
  if (!data.name) {
    throw new Error("NAME_REQUIRED");
  }

  const item = new Item(nextId++, data.name);
  items.push(item);
  return item;
}

function update(id, data) {
  const item = items.find(i => i.id === id);
  if (!item) {
    return null;
  }

  if (data.name) {
    item.name = data.name;
  }

  return item;
}

function remove(id) {
  const index = items.findIndex(i => i.id === id);
  if (index === -1) {
    return false;
  }

  items.splice(index, 1);
  return true;
}

module.exports = {
  getAll,
  create,
  update,
  remove
};
