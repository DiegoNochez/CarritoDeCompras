class Product {
  constructor(id, name, price, stock, category, description, emoji, tag, tagStyle) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.stock = stock;
    this.category = category;
    this.description = description;
    this.emoji = emoji;
    this.tag = tag;
    this.tagStyle = tagStyle;
  }

  isAvailable() {
    return this.stock > 0;
  }

  decreaseStock(qty) {
    if (qty > this.stock) {
      alert("No hay suficiente stock de " + this.name);
      return;
    }
    this.stock -= qty;
  }

  increaseStock(qty) {
    this.stock += qty;
  }
}

class CartItem {
  constructor(product, qty) {
    this.product = product;
    this.qty = qty;
  }

  getSubtotal() {
    return this.product.price * this.qty;
  }
}

class Cart {
  constructor() {
    this.items = [];
  }

  findItem(productId) {
    return this.items.find(item => item.product.id === productId) || null;
  }

  add(product, qty = 1) {
    if (!product.isAvailable()) {
      alert(product.name + " esta agotado");
      return;
    }

    if (qty > product.stock) {
      alert("Solo hay " + product.stock + " unidades de " + product.name);
      return;
    }

    var existing = this.findItem(product.id);

    if (existing) {
      existing.qty += qty;
    } else {
      this.items.push(new CartItem(product, qty));
    }

    product.decreaseStock(qty);
  }

  remove(productId) {
    var item = this.findItem(productId);
    if (!item) return;

    item.product.increaseStock(item.qty);
    this.items = this.items.filter(i => i.product.id !== productId);
  }

  updateQty(productId, newQty) {
    var item = this.findItem(productId);
    if (!item) return;

    var diff = newQty - item.qty;

    if (diff > 0 && diff > item.product.stock) {
      alert("No hay suficiente stock");
      return;
    }

    if (diff > 0) {
      item.product.decreaseStock(diff);
    } else {
      item.product.increaseStock(diff * -1);
    }

    item.qty = newQty;
  }

  clear() {
    this.items.forEach(item => item.product.increaseStock(item.qty));
    this.items = [];
  }

  getSubtotal() {
    return this.items.reduce((total, item) => total + item.getSubtotal(), 0);
  }

  getShipping() {
    return this.getSubtotal() >= 50 ? 0 : 5;
  }

  getTotal() {
    return this.getSubtotal() + this.getShipping();
  }
}