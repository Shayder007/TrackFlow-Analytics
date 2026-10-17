# Roadmap

Este documento registra o que faz parte da versão básica e o que foi
deliberadamente adiado. Deve ser atualizado a cada decisão de corte.

## Escopo da versão básica

- Loja demo: catálogo, detalhe do produto, carrinho, checkout simulado e confirmação
- Tracking dos 8 eventos do plano via dataLayer, com anti-duplicação e `transaction_id` na compra
- Integração com GTM e GA4 (validação por Preview e DebugView, ou limitações documentadas)
- Backend FastAPI: recebimento, validação, armazenamento em SQLite, consulta e métricas básicas
- Módulo de QA com as regras essenciais, cada uma com teste
- Dados de demonstração determinísticos
- Dashboard com os indicadores principais e estados de carregamento, vazio e erro

## Melhorias futuras

- Regras de QA avançadas (divergência entre valor calculado e declarado, refinamento de casos suspeitos)
- Indicadores adicionais no dashboard (produtos mais vistos e adicionados ao carrinho, evolução temporal detalhada)
- Filtros avançados e paginação completa
- Envio de eventos ao backend via tag do GTM
- Testes automatizados do frontend e de navegação (Playwright)
- Docker, PostgreSQL, integração contínua e deploy
- Importação de CSV, alertas de qualidade e relatórios exportáveis

## Decisões de corte

(nenhuma até o momento)