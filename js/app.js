document.addEventListener("DOMContentLoaded", () => {
  const products = CatalogService.getAllProducts();

  // Load saved stocks first (important, because Cart.add() decreases stock)
  StorageService.loadStocks(products);

  // Load saved cart (rebuilds using cart.add, which decreases stock)
  let cart = StorageService.loadCart(products);

  // ====== DOM refs ======
  const gridEl = document.getElementById("productGrid");
  const cartPanelEl = document.getElementById("cartPanel");

  const cartItemsEl = document.getElementById("cartItems");
  const cartEmptyEl = document.getElementById("cartEmpty");

  const cartCountEl = document.getElementById("cartCount");
  const subtotalEl = document.getElementById("subtotal");
  const shippingEl = document.getElementById("shipping");
  const totalEl = document.getElementById("total");

  const openCartBtn = document.getElementById("openCartBtn");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const clearCartBtn = document.getElementById("clearCartBtn");
  const checkoutBtn = document.getElementById("checkoutBtn");

  const searchInput = document.getElementById("searchInput");
  const categorySelect = document.getElementById("categorySelect");
  const sortSelect = document.getElementById("sortSelect");

  // Modal
  const modalEl = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalCloseBtn = document.getElementById("modalClose");
  const modalOkBtn = document.getElementById("modalOk");

  // ✅ Micro-fix: si productGrid no existe, salimos sin romper toda la página
  if (!gridEl) {
    console.error("Missing #productGrid in HTML. Check your index.html.");
    return;
  }

  // ====== Modal helpers ======
  function openModal(title, html) {
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    if (typeof modalEl.showModal === "function") modalEl.showModal();
  }
  function closeModal() {
    if (typeof modalEl.close === "function") modalEl.close();
  }

  modalCloseBtn?.addEventListener("click", closeModal);
  modalOkBtn?.addEventListener("click", closeModal);

  // ====== State for filters ======
  let activeQuery = "";
  let activeCategory = "all";
  let activeSort = "featured";

  // ====== Persistence helpers ======
  function persistAll() {
    StorageService.saveCart(cart);
    StorageService.saveStocks(products);
  }

  // ====== UI: render products ======
  function renderProducts(list) {
    gridEl.innerHTML = "";

    const html = list.map((p) => {
      const stock = Number(p.stock ?? 0);
      const disabled = stock <= 0 ? "disabled" : "";
      const tagStyle = p.tagStyle ? p.tagStyle : "";

      // ✅ fallback si image no existe o está vacía
      const imgSrc = p.image || "";

      return `
        <article class="card product" data-id="${p.id}" data-category="${p.category}">
          <div class="product__media">
            <div class="product__tag ${tagStyle}">${p.tag ?? ""}</div>

            <img
              class="product__img"
              src="${imgSrc}"
              alt="${p.name}"
              loading="lazy"
              onerror="this.style.display='none'"
            />
          </div>

          <div class="product__body">
            <h3 class="product__name">${p.name}</h3>
            <p class="product__desc">${p.description ?? ""}</p>

            <div class="product__meta">
              <span class="price">$${Number(p.price).toFixed(2)}</span>
              <span class="stock">Stock: <strong id="stock-${p.id}">${stock}</strong></span>
            </div>

            <div class="product__actions">
              <button class="btn btn--secondary" type="button" data-action="details" data-id="${p.id}">
                Detalles
              </button>
              <button class="btn btn--primary" type="button" data-action="add" data-id="${p.id}" ${disabled}>
                ${stock <= 0 ? "Sin stock" : "Agregar"}
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    gridEl.insertAdjacentHTML("beforeend", html);
  }

  // ====== UI: render cart ======
  function renderCart() {
    const items = cart.items || [];
    const count = items.reduce((acc, it) => acc + Number(it.qty ?? 0), 0);

    if (cartCountEl) cartCountEl.textContent = String(count);

    if (!items.length) {
      cartEmptyEl.hidden = false;
      cartItemsEl.hidden = true;

      // FIX: limpiar items al mostrar mensaje de carrito vacío
      cartItemsEl.innerHTML = "";

      subtotalEl.textContent = "$0.00";
      shippingEl.textContent = "$0.00";
      totalEl.textContent = "$0.00";
      return;
    }

    cartEmptyEl.hidden = true;
    cartItemsEl.hidden = false;

    cartItemsEl.innerHTML = items.map((it) => {
      const p = it.product;
      const line = Number(p.price) * Number(it.qty);

      return `
        <li class="cartItem card" style="padding:12px;">
          <div style="display:flex; justify-content:space-between; gap:10px;">
            <div>
              <div style="font-weight:700">${p.name}</div>
              <div style="color:rgba(255,255,255,0.70); font-size:13px;">
                $${Number(p.price).toFixed(2)} x ${it.qty} = <strong>$${line.toFixed(2)}</strong>
              </div>
            </div>

            <button class="btn btn--ghost btn--icon" data-action="remove" data-id="${p.id}" aria-label="Remove">🗑️</button>
          </div>

          <div style="display:flex; align-items:center; justify-content:space-between; margin-top:10px;">
            <div style="display:flex; gap:8px; align-items:center;">
              <button class="btn btn--secondary btn--icon" data-action="dec" data-id="${p.id}">−</button>
              <span style="min-width:22px; text-align:center; font-weight:700;">${it.qty}</span>
              <button class="btn btn--secondary btn--icon" data-action="inc" data-id="${p.id}">+</button>
            </div>

            <span style="color:rgba(110,231,255,0.95); font-weight:800;">$${line.toFixed(2)}</span>
          </div>
        </li>
      `;
    }).join("");

    subtotalEl.textContent = `$${cart.getSubtotal().toFixed(2)}`;
    shippingEl.textContent = `$${cart.getShipping().toFixed(2)}`;
    totalEl.textContent = `$${cart.getTotal().toFixed(2)}`;
  }

  // ====== UI: stock sync (update + disable buttons) ======
  function syncStockUI() {
    products.forEach((p) => {
      const el = document.getElementById(`stock-${p.id}`);
      if (el) el.textContent = String(p.stock);
    });

    applyQueryAndRender();
  }

  // ====== Filtering with Part B helpers ======
  function applyQueryAndRender() {
  let list = CatalogService.searchProducts(products, activeQuery);
  list = CatalogService.filterByCategory(list, activeCategory);

  if (activeSort === "featuredOnly") {
    list = CatalogService.filterFeatured(list, true);
  } else {
    list = CatalogService.sortProducts(list, activeSort);
  }

  renderProducts(list);
}

  // ====== Actions ======
  function addToCart(productId) {
    const p = CatalogService.getProductById(products, productId);
    if (!p) return;

    cart.add(p, 1);

    persistAll();
    renderCart();
    syncStockUI();
  }

  function removeFromCart(productId) {
    cart.remove(productId);

    persistAll();
    renderCart();
    syncStockUI();
  }

  function incQty(productId) {
    const item = cart.findItem(productId);
    if (!item) return;

    cart.updateQty(productId, item.qty + 1);

    persistAll();
    renderCart();
    syncStockUI();
  }

  function decQty(productId) {
    const item = cart.findItem(productId);
    if (!item) return;

    const newQty = item.qty - 1;

    if (newQty <= 0) {
      cart.remove(productId);
    } else {
      cart.updateQty(productId, newQty);
    }

    persistAll();
    renderCart();
    syncStockUI();
  }

  function clearCart() {
    cart.clear();

    persistAll();
    renderCart();
    syncStockUI();
  }

  function checkout() {
    if (!cart.items.length) {
      openModal("Carrito vacío", "<p>Agrega productos antes de finalizar compra.</p>");
      return;
    }

    const subtotal = cart.getSubtotal();
    const shipping = cart.getShipping();
    const total = cart.getTotal();

    openModal(
      "Compra realizada ✅",
      `
        <p>Gracias por tu compra.</p>
        <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
        <p><strong>Shipping:</strong> $${shipping.toFixed(2)}</p>
        <p><strong>Total:</strong> $${total.toFixed(2)}</p>
      `
    );

    cart.clear();
    persistAll();
    renderCart();
    syncStockUI();
  }

  // ====== Events ======
  gridEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === "add") addToCart(id);

    if (action === "details") {
      const p = CatalogService.getProductById(products, id);
      if (!p) return;

      openModal(
        p.name,
        `
          <p>${p.description ?? ""}</p>
          <p><strong>Price:</strong> $${Number(p.price).toFixed(2)}</p>
          <p><strong>Stock:</strong> ${p.stock}</p>
        `
      );
    }
  });

  cartItemsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === "remove") removeFromCart(id);
    if (action === "inc") incQty(id);
    if (action === "dec") decQty(id);
  });

  clearCartBtn?.addEventListener("click", clearCart);
  checkoutBtn?.addEventListener("click", checkout);

  openCartBtn?.addEventListener("click", () => {
    cartPanelEl?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  closeCartBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  searchInput?.addEventListener("input", (e) => {
    activeQuery = e.target.value || "";
    applyQueryAndRender();
  });

  categorySelect?.addEventListener("change", (e) => {
    activeCategory = e.target.value || "all";
    applyQueryAndRender();
  });

  sortSelect?.addEventListener("change", (e) => {
    activeSort = e.target.value || "featured";
    applyQueryAndRender();
  });

  // ====== Init render ======
  applyQueryAndRender();
  renderCart();
  syncStockUI();
});