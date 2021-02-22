export default class Item {
  constructor(id, name, price = 10.0) {
    this.id = id;
    this.name = name;
    this.price = price;
  }
}
