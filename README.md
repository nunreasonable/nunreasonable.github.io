# nunreasonable.github.io

Site estático servido em **[daeese.me](https://daeese.me)** via GitHub Pages, com a Cloudflare na
frente (proxy + rota `/api/*`).

## O que mora em cada pasta

| Caminho | O que é |
|---|---|
| `index.html` | Página inicial — perfil, links, projetos e o "Now Playing" do Spotify via [Lanyard](https://github.com/Phineas/lanyard). |
| `cornwallcore/` | Showcase do bot **ccore - 'chavinhoCORE'** (12° Regimento de Infantaria "Chaves"). |
| `cornwallcore/status/` | Página **pública** de estado do bot: uptime, latência, servidores e membros, lidos de `GET /api/status`. Sem dados da máquina. |
| `cornwallcore/termsofservice/`, `cornwallcore/privacypolicy/` | Termos de Serviço e Política de Privacidade vigentes do app no Discord. |
| `cornwallcore/administration/dashboard/` | Painel administrativo do bot, em abas (Moderação, Auditoria, Comunicações, Alistamento, Logs). Fala com a API do bot em `/api/*`. **Acesso restrito** — `noindex`. |
| `cornwallcore/administration/spreadsheetviewer/` | Leitor da planilha regimental (Google Sheets via `gviz`). **`noindex`** — veja o aviso abaixo. |
| `gabfirmino/` | "Meias UwU" — página de estudo em HTML/CSS. |
| `cloudflare/` | Os dois Workers (proxy da API e roteador de subdomínios), o script de deploy e o guia de setup do tunnel. |
| `filearchive/` | Imagens usadas pelas páginas. |

## Infra

- Proxy da API via Cloudflare Worker + Tunnel: [cloudflare/CLOUDFLARE_API_PROXY_SETUP.md](cloudflare/CLOUDFLARE_API_PROXY_SETUP.md)
- Tunnel, serviço do bot e pendências de configuração fora do repositório: [INFRA.md](INFRA.md)

A API do bot é servida em `daeese.me/api/*` por um Worker da Cloudflare, que encaminha para
`api.daeese.me` através de um tunnel `cloudflared` rodando na máquina do bot. Tanto o tunnel
(`cloudflared.service`) quanto o bot (`ccore-bot.service`, serviço de usuário) sobem no boot.

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
`/api`. A página de status segue o mesmo critério.

Os dois Workers em `cloudflare/` não sobem pelo GitHub Pages. Quem os publica é
[`cloudflare/deploy-workers.sh`](cloudflare/deploy-workers.sh), rodado no boot pelo serviço de
usuário `ccore-workers-deploy.service` — ele compara o hash do fonte com o da última publicação e
só chama o `wrangler deploy` quando algo mudou. Para publicar na hora:

```bash
cloudflare/deploy-workers.sh            # so o que mudou
cloudflare/deploy-workers.sh --force    # tudo, ignorando o carimbo
```

A allowlist de CORS do proxy da API (`cloudflare/api-proxy-worker/src/worker.js`) precisa conter
toda origem que chame `/api/*` — hoje `dashboard.daeese.me`, `ccore.daeese.me` e `daeese.me`.
