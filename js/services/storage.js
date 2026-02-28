const STORAGE_KEYS = {
  CART: "cdc_cart_v1",
  STOCKS: "cdc_stocks_v1"
};

// Guardar carrito: [{id, qty}]
function saveCart(cart) {
  const payload = (cart.items || []).map(item => ({
    id: item.product.id,
    qty: item.qty
  }));
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(payload));
}

// Cargar carrito y reconstruir (IMPORTANTE: respeta el stock)
function loadCart(products) {
  const raw = localStorage.getItem(STORAGE_KEYS.CART);
  const cart = new Cart();

  if (!raw) return cart;

  let data;
  try {
    data = JSON.parse(raw);
    if (!Array.isArray(data)) return cart;
  } catch (e) {
    return cart;
  }

  // Para reconstruir sin “doble descuento” de stock:
  // 1) Restauramos stocks primero (si se guardaron)
  // 2) Luego agregamos al carrito usando cart.add() (que baja stock)

  // Si tú NO quieres guardar stocks, igual funciona, pero el stock
  // se recalcula bajándolo de productos base.

  data.forEach(row => {
    const p = products.find(x => x.id === row.id);
    if (!p) return;
    const qty = Number(row.qty) || 1;
    cart.add(p, qty); // baja stock automáticamente
  });

  return cart;
}

// Guardar stocks actuales (para que al recargar se mantenga consistente)
function saveStocks(products) {
  const map = {};
  products.forEach(p => { map[p.id] = p.stock; });
  localStorage.setItem(STORAGE_KEYS.STOCKS, JSON.stringify(map));
}

// Cargar stocks guardados y aplicarlos a los productos (antes de loadCart)
function loadStocks(products) {
  const raw = localStorage.getItem(STORAGE_KEYS.STOCKS);
  if (!raw) return;

  let map;
  try { map = JSON.parse(raw); } catch (e) { return; }
  if (!map || typeof map !== "object") return;

  products.forEach(p => {
    if (map[p.id] !== undefined) p.stock = Number(map[p.id]);
  });
}

// Limpiar storage
function clearStorage() {
  localStorage.removeItem(STORAGE_KEYS.CART);
  localStorage.removeItem(STORAGE_KEYS.STOCKS);
}

// Export “global”
window.StorageService = {
  saveCart,
  loadCart,
  saveStocks,
  loadStocks,
  clearStorage
};