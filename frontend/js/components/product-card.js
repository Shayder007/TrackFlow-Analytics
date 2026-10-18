import { el } from "./dom.js";
import { formatBRL } from "../store/format.js";

/** Endereço da página de detalhe (as páginas ficam todas na pasta pages/). */
export function productHref(itemId) {
  return `produto.html?id=${encodeURIComponent(itemId)}`;
}

/** Cria o card de um produto para a lista do catálogo. */
export function createProductCard(product, position) {
  const link = el(
    "a",
    {
      className: "card__link",
      attrs: {
        href: productHref(product.item_id),
        "data-item-id": product.item_id,
        "data-index": position,
      },
    },
    [
      el("div", {
        className: "card__media",
        text: product.emoji,
        attrs: { "aria-hidden": "true" },
      }),
      el("div", { className: "card__body" }, [
        el("p", { className: "card__category", text: product.item_category }),
        el("h2", { className: "card__title", text: product.item_name }),
        el("p", { className: "card__price", text: formatBRL(product.price) }),
      ]),
    ]
  );

  return el("li", { className: "card" }, [link]);
}