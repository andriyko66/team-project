const Item = require("../domain/Item");

let items = [];
let nextId = 1;

function getAll() {
  return items;
}

function getById(id) {
  return items.find(i => i.id === id);
}

function create(data) {
  const item = new Item(nextId++, data.name);
  items.push(item);
  return item;
}

function remove(id) {
  const index = items.findIndex(i => i.id === id);
  if (index === -1) return false;
  items.splice(index, 1);
  return true;
}

module.exports = { getAll, getById, create, remove };
