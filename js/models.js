class Product {
  constructor(id, name, price, stock, category, description, image, tag, tagStyle) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.stock = stock;
    this.category = category;
    this.description = description;

    this.image = image;
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

  // Cantidad ya reservada en carrito para ese producto
  getQtyInCart(productId) {
    const it = this.findItem(productId);
    return it ? Number(it.qty) : 0;
  }

  // Stock disponible REAL (stock del producto - lo que ya tienes en carrito)
  getAvailable(product) {
    const inCart = this.getQtyInCart(product.id);
    return Number(product.stock) - inCart;
  }

  add(product, qty = 1) {
    qty = Number(qty) || 1;
    if (qty <= 0) return;

    const available = this.getAvailable(product);
    if (available <= 0) {
      alert(product.name + " está agotado");
      return;
    }

    if (qty > available) {
      alert("Solo hay " + available + " unidades disponibles de " + product.name);
      return;
    }

    const existing = this.findItem(product.id);
    if (existing) {
      existing.qty += qty;
    } else {
      this.items.push(new CartItem(product, qty));
    }
  }

  remove(productId) {
    this.items = this.items.filter(i => i.product.id !== productId);
  }

  updateQty(productId, newQty) {
    const item = this.findItem(productId);
    if (!item) return;

    newQty = Number(newQty);
    if (!Number.isFinite(newQty)) return;

    if (newQty <= 0) {
      this.remove(productId);
      return;
    }

    // Validar contra stock total del producto
    if (newQty > Number(item.product.stock)) {
      alert("No hay suficiente stock");
      return;
    }

    item.qty = newQty;
  }

  clear() {
    // ✅ solo vacía carrito (NO devuelve stock, porque nunca lo bajamos aquí)
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