# TrackFlow Analytics

Projeto de portfólio que simula uma loja virtual com rastreamento de eventos
(dataLayer, Google Tag Manager e Google Analytics 4), um backend em Python
(FastAPI) que recebe e valida os eventos, um módulo de qualidade de dados e um
dashboard de análise.

> **Status:** em desenvolvimento (Etapa 2A concluída: home e catálogo da loja demo).

## Tecnologias planejadas

- Frontend: HTML, CSS e JavaScript (sem framework)
- Tracking: dataLayer, Google Tag Manager, Google Analytics 4
- Backend: Python, FastAPI, Pydantic, SQLAlchemy, SQLite
- Testes: Pytest e HTTPX

## Como executar o frontend

Requer Python 3 instalado. Na raiz do projeto:

    python scripts/serve_frontend.py

Depois abra http://127.0.0.1:5500 no navegador. Use sempre esse endereço:
o carrinho fica guardado no navegador por endereço.

## Documentação

- [Tracking plan](docs/tracking-plan.md)
- [Roadmap e melhorias futuras](docs/roadmap.md)

## Aviso

Todos os dados são fictícios e usados apenas para demonstração.