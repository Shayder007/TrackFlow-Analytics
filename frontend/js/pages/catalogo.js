import "../components/cart-badge.js";
import { clear } from "../components/dom.js";
import { createProductCard } from "../components/product-card.js";
import { loadProducts } from "../store/catalog.js";

const listElement = document.getElementById("product-list");
const statusElement = document.getElementById("catalog-status");

function showStatus(text, isError) {
  statusElement.textContent = text;
  statusElement.setAttribute("role", isError ? "alert" : "status");
  statusElement.classList.toggle("message--error", isError);
  statusElement.hidden = false;
  listElement.hidden = true;
}

async function init() {
  try {
    const products = await loadProducts();

    if (products.length === 0) {
      showStatus("Nenhum produto disponível no momento.", false);
      return;
    }

    clear(listElement);
    products.forEach((product, index) => {
      listElement.append(createProductCard(product, index));
    });
    statusElement.hidden = true;
    listElement.hidden = false;
  } catch (error) {
    console.error(error);
    showStatus(
      "Não foi possível carregar os produtos. Confirme que o servidor local está em execução e tente novamente.",
      true
    );
  }
}

init();