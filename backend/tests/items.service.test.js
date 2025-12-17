const itemsService = require("../service/items.service");

describe("Items Service", () => {

  test("успішно створює товар", () => {
    const item = itemsService.create({ name: "Apple" });

    expect(item).toHaveProperty("id");
    expect(item.name).toBe("Apple");
  });

  test("помилка якщо name відсутній", () => {
    expect(() => {
      itemsService.create({});
    }).toThrow("NAME_REQUIRED");
  });

});
