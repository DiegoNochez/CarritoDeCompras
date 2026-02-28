// js/services/catalog.js

// ---- Datos base ----
const CATALOG_DATA = [
  {
    id: "p1",
    name: "Audífonos Wireless",
    price: 29.99,
    stock: 12,
    category: "tech",
    description: "Sonido nítido, batería 20h, estuche compacto.",
    image: "./img/headphones.avif",
    featured: false,
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
    image: "./img/plant.png",
    featured: true,
    tag: "Top",
    tagStyle: "product__tag--alt"
  },
  {
    id: "p3",
    name: "Chocolate 70%",
    price: 3.25,
    stock: 20,
    category: "food",
    description: "Barra 70% cacao, sabor intenso.",
    image: "./img/chocolate.png",
    featured: false,
    tag: "Oferta",
    tagStyle: "product__tag--success"
  },

  // --- 6 NUEVOS ---
  {
    id: "p4",
    name: "Teclado Mecánico",
    price: 49.99,
    stock: 6,
    category: "tech",
    description: "Switches táctiles, iluminación LED.",
    image: "./img/keyboard.png",
    featured: true,
    tag: "Featured",
    tagStyle: "product__tag--featured"
  },
  {
    id: "p5",
    name: "Mouse Gamer",
    price: 22.99,
    stock: 10,
    category: "tech",
    description: "DPI ajustable, agarre cómodo.",
    image: "./img/mouse.png",
    featured: false,
    tag: "Popular",
    tagStyle: ""
  },
  {
    id: "p6",
    name: "Taza Térmica",
    price: 11.99,
    stock: 15,
    category: "home",
    description: "Mantiene bebidas calientes por horas.",
    image: "./img/taza.png",
    featured: false,
    tag: "Nuevo",
    tagStyle: ""
  },
  {
    id: "p7",
    name: "Lámpara LED",
    price: 18.50,
    stock: 7,
    category: "home",
    description: "Luz cálida/fría, ideal para escritorio.",
    image: "./img/lampara.png",
    featured: true,
    tag: "Featured",
    tagStyle: "product__tag--featured"
  },
  {
    id: "p8",
    name: "Café Premium",
    price: 7.75,
    stock: 25,
    category: "food",
    description: "Blend intenso, aroma fuerte.",
    image: "./img/cafe.png",
    featured: true,
    tag: "Top",
    tagStyle: "product__tag--alt"
  },
  {
    id: "p9",
    name: "Galletas Artesanales",
    price: 4.99,
    stock: 18,
    category: "food",
    description: "Crujientes, sabor mantequilla.",
    image: "./img/cookies.webp",
    featured: false,
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
    obj.image,
    obj.tag,
    obj.tagStyle
  );
}

// ---- API pública ----
function getAllProducts() {
  // ⚠️ OJO: también copiamos featured al objeto Product
  const list = CATALOG_DATA.map((raw) => {
    const p = toProduct(raw);
    p.featured = !!raw.featured; // ✅ añadimos featured al objeto final
    return p;
  });
  return list;
}

function getProductById(products, id) {
  return products.find(p => p.id === id) || null;
}

function searchProducts(products, query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return [...products];

  return products.filter(p =>
    (p.name || "").toLowerCase().includes(q) ||
    (p.description || "").toLowerCase().includes(q)
  );
}

function filterByCategory(products, category) {
  if (!category || category === "all") return [...products];
  return products.filter(p => p.category === category);
}

// ✅ Nuevo: filtrar solo destacados
function filterFeatured(products, onlyFeatured) {
  if (!onlyFeatured) return [...products];
  return products.filter(p => p.featured === true);
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
    case "featured":
    default:
      // “featured” o ninguno: mantener orden original del array
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
  filterFeatured,
  sortProducts
};