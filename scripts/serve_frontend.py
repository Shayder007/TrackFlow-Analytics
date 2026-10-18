"""Servidor local simples para o frontend (apenas para desenvolvimento).

Uso, a partir da raiz do projeto:
    python scripts/serve_frontend.py

Usa somente a biblioteca padrão do Python. Escuta apenas em 127.0.0.1.
"""

import http.server
import mimetypes
from functools import partial
from pathlib import Path

HOST = "127.0.0.1"
PORT = 5500
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"

# Em alguns Windows o registro do sistema associa .js a "text/plain", o que
# impede o navegador de carregar módulos ES. Fixamos os tipos aqui.
MIME_OVERRIDES = {
    ".js": "text/javascript",
    ".mjs": "text/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".html": "text/html",
}

for extension, mime_type in MIME_OVERRIDES.items():
    mimetypes.add_type(mime_type, extension)


class FrontendHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **getattr(http.server.SimpleHTTPRequestHandler, "extensions_map", {}),
        **MIME_OVERRIDES,
    }


def main():
    handler = partial(FrontendHandler, directory=str(FRONTEND_DIR))
    with http.server.ThreadingHTTPServer((HOST, PORT), handler) as server:
        print(f"Frontend em http://{HOST}:{PORT}  (Ctrl+C para parar)")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor encerrado.")


if __name__ == "__main__":
    main()