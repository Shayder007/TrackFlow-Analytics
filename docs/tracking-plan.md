# Tracking Plan — TrackFlow Analytics

**Versão:** 1.0.0 (rascunho inicial)
**Loja:** demonstrativa, com dados fictícios
**Moeda da loja:** BRL

> Este plano usa os nomes de evento e a estrutura de `items` do GA4 (e-commerce),
> conforme a documentação oficial "Measure ecommerce". Onde o plano é mais
> rígido que o GA4, está marcado como **regra do projeto**.

## 1. Fontes de dados (não são o mesmo sistema)

| Fonte | O que é | Como os dados chegam |
|---|---|---|
| Site (dataLayer) | Eventos gerados pelo frontend | `dataLayer.push` |
| Google Analytics 4 | Eventos enviados pelo GTM/GA4 (se configurado) | Tag GA4 no GTM |
| Backend TrackFlow | Eventos recebidos pela nossa API | `POST /api/events` (coletor próprio) |

Os três são independentes. O GA4 **não** alimenta o backend, e o dashboard
mostra apenas o que o backend recebeu.

## 2. Convenções

- Nomes de evento em `snake_case`, iguais aos do GA4.
- Moeda: `BRL`. Valores permitidos (regra do projeto): `BRL`, `USD`, `EUR`.
- Valores monetários: número com no máximo 2 casas decimais (`79.9`, não `"79,90"`).
- Cálculos monetários em JavaScript devem ser arredondados a centavos para evitar
  erros de ponto flutuante.
- Tolerância ao comparar valor calculado e declarado: `0.01`.
- Timestamps em ISO 8601, UTC.
- Nenhum dado pessoal nos eventos (nome, e-mail, telefone, endereço, CPF etc.).

## 3. Estrutura do payload

### 3.1 Push no dataLayer (vai ao GTM/GA4)

Antes de cada evento, limpar o objeto anterior:

```javascript
dataLayer.push({ ecommerce: null });
dataLayer.push({
  event: "add_to_cart",
  event_id: "6f1c0a9e-3a52-4b1d-9d7e-2f4a8c1b7e10",
  ecommerce: { /* parâmetros do GA4 */ }
});
```

`event_id` é um campo nosso (regra do projeto). Só chega ao GA4 se mapearmos
explicitamente no GTM.

### 3.2 Envelope enviado ao backend (coletor próprio)

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `event_name` | string | sim | Nome do evento |
| `event_id` | string (UUID v4) | sim | Identificador único do evento, usado para idempotência |
| `session_id` | string (UUID v4) | sim | Sessão anônima (gerada no navegador, sem identificar pessoas) |
| `timestamp` | string (ISO 8601 UTC) | sim | Momento do evento no cliente |
| `origin` | string | sim | `frontend` ou `seed` (dados de demonstração gerados por script) |
| `page_path` | string | não | Caminho da página, sem query string |
| `ecommerce` | objeto | depende do evento | Parâmetros do evento, conforme a seção 5 |

## 4. Objeto `item` (usado em todos os eventos)

| Parâmetro | Tipo | Regra |
|---|---|---|
| `item_id` | string | **GA4:** `item_id` ou `item_name` é exigido. **Projeto:** ambos obrigatórios |
| `item_name` | string | idem |
| `price` | number | **Projeto:** obrigatório, `>= 0` |
| `quantity` | integer | **GA4:** assume 1 se ausente. **Projeto:** obrigatório e `>= 1` em eventos de carrinho, checkout e compra; opcional em eventos de lista |
| `item_brand` | string | opcional |
| `item_category` | string | opcional |
| `item_list_id` | string | opcional |
| `item_list_name` | string | opcional |
| `index` | integer | opcional, posição na lista, `>= 0` |

Não enviar outros parâmetros de item que não estejam documentados pelo GA4.

## 5. Eventos

Legenda: **GA4** = vem da documentação oficial. **Projeto** = regra nossa.
Severidades provisórias (serão detalhadas em `docs/qa-rules.md`): E = erro, A = aviso, S = suspeito.

### 5.1 `view_item_list`

- **Descrição:** o usuário vê uma lista de produtos (catálogo ou destaques da home).
- **Gatilho:** ao renderizar a lista, uma vez por carregamento de página e por lista.
- **Obrigatórios:** `item_list_id` (string), `item_list_name` (string), `items` (array, `>= 1`).
- **Opcionais:** `currency` (string, o GA4 inclui no exemplo).
- **Regras:**
  - E: `items` vazio ou ausente.
  - E: item sem `item_id`/`item_name` ou com `price` negativo.
  - A: `currency` presente mas fora da lista permitida.
- **Payload válido:**

```json
{
  "currency": "BRL",
  "item_list_id": "catalogo",
  "item_list_name": "Catálogo",
  "items": [
    { "item_id": "SKU-1001", "item_name": "Camiseta Dry Fit", "price": 79.9, "index": 0, "item_list_id": "catalogo", "item_list_name": "Catálogo" },
    { "item_id": "SKU-2003", "item_name": "Garrafa Térmica 750ml", "price": 49.9, "index": 1, "item_list_id": "catalogo", "item_list_name": "Catálogo" }
  ]
}
```

- **Casos de teste:**
  - TC-VIL-01: payload completo é aceito.
  - TC-VIL-02: `items` vazio gera erro.
  - TC-VIL-03: `price` negativo em um item gera erro.
  - TC-VIL-04: `item_list_name` ausente gera erro.
  - TC-VIL-05 (frontend): recarregar a página do catálogo não envia novo evento.

### 5.2 `select_item`

- **Descrição:** o usuário clica em um produto de uma lista.
- **Gatilho:** clique no card do produto, antes de navegar para o detalhe.
- **Obrigatórios:** `items` (array com exatamente 1 item).
- **Opcionais/recomendados:** `item_list_id`, `item_list_name`, `currency`.
- **Regras:**
  - E: `items` não tem exatamente 1 elemento.
  - A: `item_list_id` ou `item_list_name` ausente.
- **Payload válido:**

```json
{
  "currency": "BRL",
  "item_list_id": "catalogo",
  "item_list_name": "Catálogo",
  "items": [
    { "item_id": "SKU-1001", "item_name": "Camiseta Dry Fit", "price": 79.9, "index": 0 }
  ]
}
```

- **Casos de teste:**
  - TC-SEL-01: payload completo é aceito.
  - TC-SEL-02: `items` com 2 elementos gera erro.
  - TC-SEL-03: sem `item_list_id` gera aviso, não erro (campo opcional).
  - TC-SEL-04 (frontend): um clique gera um único evento.

### 5.3 `view_item`

- **Descrição:** o usuário vê a página de detalhe de um produto.
- **Gatilho:** carregamento da página de detalhe, uma vez por carregamento (não dispara em recarga).
- **Obrigatórios:** `currency`, `value` (number `>= 0`), `items` (exatamente 1).
- **Opcionais:** nenhum além dos campos opcionais do item.
- **Regras:**
  - E: `currency` ausente ou fora de `BRL/USD/EUR`.
  - E: `value` ausente, não numérico ou negativo.
  - A: `value` diverge de `price * quantity` do item (tolerância `0.01`); `quantity` ausente conta como 1.
- **Payload válido:**

```json
{
  "currency": "BRL",
  "value": 79.9,
  "items": [
    { "item_id": "SKU-1001", "item_name": "Camiseta Dry Fit", "price": 79.9, "quantity": 1 }
  ]
}
```

- **Casos de teste:**
  - TC-VIT-01: payload completo é aceito.
  - TC-VIT-02: sem `currency` gera erro.
  - TC-VIT-03: `value` como string (`"79.90"`) gera erro de tipo.
  - TC-VIT-04: `value` 80.00 com preço 79.90 gera aviso de divergência.
  - TC-VIT-05 (frontend): recarregar a página do produto não envia novo evento.

### 5.4 `add_to_cart`

- **Descrição:** um produto foi adicionado ao carrinho.
- **Gatilho:** clique em "Adicionar ao carrinho", depois de o carrinho ser atualizado. O botão fica bloqueado por 400 ms para evitar disparos por clique duplo acidental.
- **Obrigatórios:** `currency`, `value`, `items` (exatamente 1, com `quantity >= 1`).
- **Opcionais:** nenhum.
- **Regras:**
  - E: `quantity` ausente, `0`, negativa ou não inteira.
  - E: `price` negativo.
  - E: `currency` ausente ou inválida.
  - A: `value` diverge de `price * quantity` (tolerância `0.01`).
- **Payload válido:**

```json
{
  "currency": "BRL",
  "value": 159.8,
  "items": [
    { "item_id": "SKU-1001", "item_name": "Camiseta Dry Fit", "price": 79.9, "quantity": 2 }
  ]
}
```

- **Casos de teste:**
  - TC-ATC-01: payload completo é aceito.
  - TC-ATC-02: `quantity` 0 gera erro.
  - TC-ATC-03: `quantity` 1.5 gera erro de tipo.
  - TC-ATC-04: `price` -10 gera erro.
  - TC-ATC-05: `value` 100 para 2 x 79.90 gera aviso.
  - TC-ATC-06 (frontend): dois cliques com intervalo menor que 400 ms geram um evento.

### 5.5 `remove_from_cart`

- **Descrição:** um produto foi removido do carrinho.
- **Gatilho:** clique em "Remover" na página do carrinho. Remove a linha inteira, e `quantity` é a quantidade removida.
- **Obrigatórios / regras:** iguais ao `add_to_cart`.
- **Payload válido:**

```json
{
  "currency": "BRL",
  "value": 49.9,
  "items": [
    { "item_id": "SKU-2003", "item_name": "Garrafa Térmica 750ml", "price": 49.9, "quantity": 1 }
  ]
}
```

- **Casos de teste:**
  - TC-RFC-01: payload completo é aceito.
  - TC-RFC-02: `quantity` negativa gera erro.
  - TC-RFC-03 (frontend): remover um item inexistente não dispara evento.

### 5.6 `view_cart`

- **Descrição:** o usuário vê o carrinho.
- **Gatilho:** carregamento da página do carrinho, só se houver pelo menos 1 item (não dispara em recarga).
- **Obrigatórios:** `currency`, `value`, `items` (`>= 1`, cada um com `quantity >= 1`).
- **Regras:**
  - E: `items` vazio.
  - E: `currency` ausente ou inválida.
  - A: `value` diverge da soma de `price * quantity` (tolerância `0.01`).
- **Payload válido:**

```json
{
  "currency": "BRL",
  "value": 209.7,
  "items": [
    { "item_id": "SKU-1001", "item_name": "Camiseta Dry Fit", "price": 79.9, "quantity": 2 },
    { "item_id": "SKU-2003", "item_name": "Garrafa Térmica 750ml", "price": 49.9, "quantity": 1 }
  ]
}
```

- **Casos de teste:**
  - TC-VCT-01: payload completo é aceito.
  - TC-VCT-02: `items` vazio gera erro.
  - TC-VCT-03: soma declarada 200.00 contra 209.70 calculado gera aviso.
  - TC-VCT-04 (frontend): carrinho vazio não dispara `view_cart`.

### 5.7 `begin_checkout`

- **Descrição:** o usuário iniciou o checkout.
- **Gatilho:** carregamento da página de checkout, uma vez por carrinho (guarda em `sessionStorage`; não dispara em recarga).
- **Obrigatórios:** `currency`, `value`, `items` (`>= 1`, `quantity >= 1`).
- **Opcionais:** `coupon` (string).
- **Regras:** iguais ao `view_cart`.
- **Payload válido:**

```json
{
  "currency": "BRL",
  "value": 209.7,
  "items": [
    { "item_id": "SKU-1001", "item_name": "Camiseta Dry Fit", "price": 79.9, "quantity": 2 },
    { "item_id": "SKU-2003", "item_name": "Garrafa Térmica 750ml", "price": 49.9, "quantity": 1 }
  ]
}
```

- **Casos de teste:**
  - TC-BCO-01: payload completo é aceito.
  - TC-BCO-02: `coupon` ausente é aceito sem aviso (campo opcional).
  - TC-BCO-03: moeda `XYZ` gera erro.
  - TC-BCO-04 (frontend): recarregar o checkout não envia novo `begin_checkout`.

### 5.8 `purchase`

- **Descrição:** uma compra simulada foi concluída.
- **Gatilho:** carregamento da página de confirmação do pedido, apenas se o `transaction_id` ainda não tiver sido registrado como enviado.
- **Obrigatórios:** `transaction_id` (string não vazia), `currency`, `value`, `items` (`>= 1`, `quantity >= 1`).
- **Opcionais:** `tax` (number `>= 0`), `shipping` (number `>= 0`), `coupon` (string).
- **Estratégia de `transaction_id` (regra do projeto):**
  - Gerado no momento em que o pedido simulado é confirmado, no formato `TF-AAAAMMDD-XXXXXX` (6 caracteres alfanuméricos maiúsculos).
  - Guardado em `localStorage` junto com o pedido.
  - A página de confirmação só envia `purchase` se o `transaction_id` ainda não estiver na lista de transações já enviadas. Atualizar a página ou voltar a ela não duplica a compra.
- **Regras:**
  - E: `transaction_id` ausente ou vazio.
  - E: `currency`/`value`/`items` ausentes ou inválidos.
  - E: `tax` ou `shipping` negativos.
  - A: `value` diverge da soma de `price * quantity` (conforme a documentação do GA4, `value` é a soma dos itens, sem imposto e frete).
  - S: outro `purchase` com o mesmo `transaction_id` já recebido, com `event_id` diferente. Se o `event_id` for igual, é reenvio idempotente e não conta como nova compra.
- **Payload válido:**

```json
{
  "transaction_id": "TF-20261017-A3K9ZQ",
  "currency": "BRL",
  "value": 209.7,
  "tax": 0,
  "shipping": 15,
  "items": [
    { "item_id": "SKU-1001", "item_name": "Camiseta Dry Fit", "price": 79.9, "quantity": 2 },
    { "item_id": "SKU-2003", "item_name": "Garrafa Térmica 750ml", "price": 49.9, "quantity": 1 }
  ]
}
```

- **Casos de teste:**
  - TC-PUR-01: payload completo é aceito.
  - TC-PUR-02: sem `transaction_id` gera erro.
  - TC-PUR-03: `transaction_id` vazio gera erro.
  - TC-PUR-04: mesmo `transaction_id` com `event_id` diferente gera status suspeito.
  - TC-PUR-05: mesmo `transaction_id` e mesmo `event_id` é tratado como reenvio, sem nova compra.
  - TC-PUR-06: `shipping` -5 gera erro.
  - TC-PUR-07 (frontend): atualizar a página de confirmação não reenvia `purchase`.

## 6. Privacidade

- Não enviar nome, e-mail, telefone, endereço, CPF, dados de cartão ou qualquer campo digitado em formulários.
- O `session_id` é aleatório, sem relação com identidade, e vive no `sessionStorage`.
- O formulário de checkout da loja é decorativo: nenhum dado digitado entra no dataLayer nem no coletor.

## 7. Limitações conhecidas

- Os parâmetros foram conferidos na página "Measure ecommerce" do GA4; a página "Events reference" ainda deve ser consultada ao implementar a integração com o GA4.
- Não há identificação de usuário: métricas serão por evento e por sessão, nunca "visitantes únicos".
- Cupons e descontos não são implementados na versão básica.