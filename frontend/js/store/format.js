const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Formata um número como moeda brasileira, por exemplo "R$ 79,90". */
export function formatBRL(value) {
  return brlFormatter.format(value);
}

/** Converte reais para centavos inteiros (evita erros de ponto flutuante). */
export function toCents(value) {
  return Math.round(value * 100);
}

/** Converte centavos inteiros para reais. */
export function fromCents(cents) {
  return cents / 100;
}