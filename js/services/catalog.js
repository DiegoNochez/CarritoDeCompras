// ---- Datos base ----
const CATALOG_DATA = [
  {
    id: "p1",
    name: "Audífonos Wireless",
    price: 29.99,
    stock: 12,
    category: "tech",
    description: "Sonido nítido, batería 20h, estuche compacto.",
    emoji: "🎧",
    tag: "Nuevo",
    tagStyle: ""
  },
  {
    id: "p2",
    name: "Planta Decorativa",
    price: 14.50,
    stock: 8,
    category: "home",
    description: "Ideal para escritorio, maceta incluida.",
    emoji: "🪴",
    tag: "Top",
    tagStyle: "product__tag--alt"
  },
  {
    id: "p3",
    name: "Chocolate",
    price: 3.25,
    stock: 20,
    category: "food",
    description: "Barra 70% cacao, sabor intenso.",
    emoji: "🍫",
    tag: "Oferta",
    tagStyle: "product__tag--success"
  }
];

// Convierte data plano a objetos Product (POO)
function toProduct(obj) {
  return new Product(
    obj.id,
    obj.name,
    Number(obj.price),
    Number(obj.stock),
    obj.category,
    obj.description,
    obj.emoji,
    obj.tag,
    obj.tagStyle
  );
}

// ---- API pública ----
function getAllProducts() {
  return CATALOG_DATA.map(toProduct);
}

function getProductById(products, id) {
  return products.find(p => p.id === id) || null;
}

function searchProducts(products, query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return [...products];
  return products.filter(p => p.name.toLowerCase().includes(q));
}

function filterByCategory(products, category) {
  if (!category || category === "all") return [...products];
  return products.filter(p => p.category === category);
}

function sortProducts(products, sortKey) {
  const list = [...products];

  switch (sortKey) {
    case "priceAsc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "priceDesc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "nameAsc":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      // featured o ninguno: mantener orden original
      break;
  }
  return list;
}

// Export “global” (si NO usas módulos)
window.CatalogService = {
  getAllProducts,
  getProductById,
  searchProducts,
  filterByCategory,
  sortProducts
};