import { getCartCount, onCartChange } from "../store/cart.js";

function updateBadge() {
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = String(getCartCount());
}

updateBadge();
onCartChange(updateBadge);