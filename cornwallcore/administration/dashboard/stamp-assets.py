#!/usr/bin/env python3
"""
Carimba o hash do conteudo nas URLs de style.css e app.js dentro do index.html.

Por que isto e necessario: o GitHub Pages serve o HTML com max-age=600 e os
assets com max-age=14400. Ou seja, o navegador pega o HTML novo mas segura o
CSS antigo por ate quatro horas - e HTML novo com CSS velho nao e "um pouco
desatualizado", e uma pagina quebrada, porque as classes novas nao existem na
folha antiga. Foi exatamente o que aconteceu ao introduzir as abas.

Versionando a URL (style.css?v=abc12345), o HTML novo aponta para um recurso
com chave de cache diferente, entao o par HTML+CSS nunca fica descasado. Como o
HTML expira em 10 minutos, a correcao se propaga sozinha nesse prazo, sem
ninguem precisar limpar cache.

Rode isto sempre que editar style.css ou app.js, antes de commitar.
"""

import hashlib
import pathlib
import re
import sys

BASE = pathlib.Path(__file__).resolve().parent
HTML = BASE / "index.html"
ASSETS = ("style.css", "app.js")


def main() -> int:
    html = HTML.read_text(encoding="utf-8")
    original = html
    changed = []

    for asset in ASSETS:
        path = BASE / asset
        if not path.exists():
            print(f"[stamp-assets] {asset} nao existe", file=sys.stderr)
            return 1

        digest = hashlib.sha256(path.read_bytes()).hexdigest()[:8]

        # Casa "style.css" ou "style.css?v=<hash>" dentro de aspas.
        pattern = re.compile(rf'"{re.escape(asset)}(?:\?v=[a-f0-9]+)?"')
        if not pattern.search(html):
            print(f"[stamp-assets] {asset} nao referenciado no index.html", file=sys.stderr)
            return 1

        new_html = pattern.sub(f'"{asset}?v={digest}"', html)
        if new_html != html:
            changed.append(f"{asset} -> {digest}")
        html = new_html

    if html != original:
        HTML.write_text(html, encoding="utf-8")

    print("[stamp-assets] " + (", ".join(changed) if changed else "ja estava atualizado"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
