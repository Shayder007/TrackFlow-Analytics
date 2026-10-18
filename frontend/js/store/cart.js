const STORAGE_KEY = "trackflow.cart";

export const MAX_QUANTITY_PER_ITEM = 10;
export const CART_CHANGED_EVENT = "trackflow:cart-changed";

function isValidLine(line) {
  return (
    line !== null &&
    typeof line === "object" &&
    typeof line.id === "string" &&
    Number.isInteger(line.quantity) &&
    line.quantity >= 1 &&
    line.quantity <= MAX_QUANTITY_PER_ITEM
  );
}

function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidLine) : [];
  } catch {
    return []; // armazenamento indisponível ou conteúdo corrompido
  }
}

function writeCart(lines) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    return false;
  }
  window.dispatchEvent(new CustomEvent(CART_CHANGED_EVENT));
  return true;
}

/** Retorna as linhas do carrinho: [{ id, quantity }]. */
export function getCartLines() {
  return readCart();
}

/** Retorna a quantidade total de unidades no carrinho. */
export function getCartCount() {
  return readCart().reduce((total, line) => total + line.quantity, 0);
}

/**
 * Adiciona unidades de um produto ao carrinho.
 * Retorna a quantidade realmente adicionada (0 se nada foi adicionado).
 * O limite é MAX_QUANTITY_PER_ITEM unidades por produto.
 */
export function addToCart(itemId, quantity = 1) {
  if (!Number.isInteger(quantity) || quantity < 1) return 0;

  const lines = readCart();
  const line = lines.find((entry) => entry.id === itemId);
  const current = line ? line.quantity : 0;
  const added = Math.min(quantity, MAX_QUANTITY_PER_ITEM - current);
  if (added <= 0) return 0;

  if (line) {
    line.quantity = current + added;
  } else {
    lines.push({ id: itemId, quantity: added });
  }
  return writeCart(lines) ? added : 0;
}

/**
 * Remove a linha inteira de um produto.
 * Retorna a quantidade removida (0 se o produto não estava no carrinho).
 */
export function removeFromCart(itemId) {
  const lines = readCart();
  const line = lines.find((entry) => entry.id === itemId);
  if (!line) return 0;

  const remaining = lines.filter((entry) => entry.id !== itemId);
  return writeCart(remaining) ? line.quantity : 0;
}

/** Esvazia o carrinho. */
export function clearCart() {
  return writeCart([]);
}

/** Executa o callback sempre que o carrinho mudar (nesta aba ou em outra). */
export function onCartChange(callback) {
  window.addEventListener(CART_CHANGED_EVENT, callback);
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY || event.key === null) callback();
  });
}