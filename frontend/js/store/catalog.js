const PRODUCTS_URL = new URL("../../data/products.json", import.meta.url);

let productsPromise = null;

async function fetchProducts() {
  const response = await fetch(PRODUCTS_URL);
  if (!response.ok) {
    throw new Error(`Falha ao carregar produtos (HTTP ${response.status}).`);
  }
  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("O arquivo de produtos tem um formato inválido.");
  }
  return data;
}

/** Retorna a lista de produtos. O arquivo é buscado uma única vez. */
export function loadProducts() {
  if (!productsPromise) {
    productsPromise = fetchProducts().catch((error) => {
      productsPromise = null; // permite tentar de novo depois de uma falha
      throw error;
    });
  }
  return productsPromise;
}

/** Retorna um produto pelo item_id ou null se não existir. */
export async function getProductById(itemId) {
  const products = await loadProducts();
  return products.find((product) => product.item_id === itemId) ?? null;
}