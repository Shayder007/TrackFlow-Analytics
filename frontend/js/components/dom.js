/**
 * Cria um elemento HTML de forma segura (usa textContent, nunca innerHTML).
 * options: { className, text, attrs }
 */
export function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  const { className, text, attrs } = options;

  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  if (attrs) {
    for (const [name, value] of Object.entries(attrs)) {
      node.setAttribute(name, String(value));
    }
  }
  for (const child of children) node.append(child);
  return node;
}

/** Remove todos os filhos de um elemento. */
export function clear(node) {
  node.replaceChildren();
}