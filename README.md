# nunreasonable.github.io

Site estático servido em **[daeese.me](https://daeese.me)** via GitHub Pages, com a Cloudflare na
frente (proxy + rota `/api/*`).

## O que mora em cada pasta

| Caminho | O que é |
|---|---|
| `index.html` | Página inicial — perfil, links, projetos e o "Now Playing" do Spotify via [Lanyard](https://github.com/Phineas/lanyard). |
| `cornwallcore/` | Showcase do bot **ccore - 'chavinhoCORE'** (12° Regimento de Infantaria "Chaves"). |
| `cornwallcore/termsofservice/`, `cornwallcore/privacypolicy/` | Termos de Serviço e Política de Privacidade vigentes do app no Discord. |
| `cornwallcore/administration/dashboard/` | Painel administrativo do bot. Fala com a API do bot em `/api/*`. **Acesso restrito** — `noindex`. |
| `cornwallcore/administration/spreadsheetviewer/` | Leitor da planilha regimental (Google Sheets via `gviz`). **`noindex`** — veja o aviso abaixo. |
| `gabfirmino/` | "Meias UwU" — página de estudo em HTML/CSS. |
| `cloudflare/` | Worker que publica `daeese.me/api/*` e o guia de setup do tunnel. |
| `filearchive/` | Imagens usadas pelas páginas. |

## Infra

- Proxy da API via Cloudflare Worker + Tunnel: [cloudflare/CLOUDFLARE_API_PROXY_SETUP.md](cloudflare/CLOUDFLARE_API_PROXY_SETUP.md)
- Pendências de configuração fora do repositório (HTTPS, headers de segurança): [INFRA.md](INFRA.md)

## Aviso sobre o spreadsheet viewer

O visualizador lê a planilha regimental direto do Google Sheets, no navegador do visitante. Isso só
funciona porque a planilha está compartilhada como "qualquer pessoa com o link". A página está
marcada com `noindex` e bloqueada no `robots.txt`, mas **quem tiver a URL continua conseguindo ver
os dados**. Se o roster passar a ser considerado sensível, o caminho é restringir o
compartilhamento no Google e servir os dados pelo `/api` autenticado, como o dashboard já faz.

## Desenvolvimento local

```bash
python3 -m http.server 8080
# http://localhost:8080
```

O dashboard detecta `localhost` e usa `http://127.0.0.1:5056` como API por padrão; em produção usa
`/api`.
