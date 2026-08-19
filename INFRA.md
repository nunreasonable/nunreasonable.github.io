# Infraestrutura

Itens que **não** dá para corrigir com um commit neste repositório — ficam no painel da Cloudflare
ou na máquina que hospeda o bot. Levantados na auditoria de 19/08/2026; o estado observado está
registrado para dar contexto.

| # | Item | Estado |
|---|---|---|
| 1 | HTTP sem redirect para HTTPS | ⏳ pendente (painel da Cloudflare) |
| 2 | Sem headers de segurança | ⏳ pendente (painel da Cloudflare) |
| 3 | `api.daeese.me` fora do ar | ✅ **resolvido** em 19/08/2026 |
| 4 | CORS do Worker permissivo | ✅ **resolvido** em 19/08/2026 |
| 5 | `robots.txt` gerenciado pela Cloudflare | ℹ️ comportamento conhecido |
| 6 | Planilha legível sem autenticação | ⏳ decisão pendente |

## 1. HTTP não redireciona para HTTPS

Estado observado:

```
$ curl -sI http://daeese.me/        -> HTTP/1.1 200 OK        (serve em texto claro)
$ curl -sI https://nunreasonable.github.io/  -> 301 location: http://daeese.me/
```

O site inteiro responde por HTTP sem redirecionar, e o domínio do GitHub Pages redireciona para a
versão **http** do domínio custom.

Correção: Cloudflare → SSL/TLS → *Edge Certificates* → ligar **Always Use HTTPS**. Depois de
confirmar que tudo carrega em HTTPS, habilitar **HSTS** (começar com `max-age` baixo).

## 2. Nenhum header de segurança

```
$ curl -sI https://daeese.me/ | grep -iE 'strict-transport|content-security|x-frame|x-content-type|referrer'
(vazio)
```

Correção: Cloudflare → Rules → *Transform Rules* → *Modify Response Header*:

| Header | Valor sugerido |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` (só depois do item 1) |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` |

`SAMEORIGIN` é seguro aqui: as páginas de política usam `<iframe>` apontando para o próprio
domínio (`privacypolicy/index.html` → `./pp.html`).

Uma `Content-Security-Policy` exige mais cuidado porque as páginas usam `<style>`/`<script>`
inline. Um ponto de partida realista:

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://docs.google.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src https://fonts.gstatic.com;
img-src 'self' data: https://i.scdn.co https://cdn.discordapp.com https://images.unsplash.com;
connect-src 'self' https://api.lanyard.rest;
frame-ancestors 'self';
```

Publicar primeiro como `Content-Security-Policy-Report-Only` e conferir o console antes de
aplicar de verdade.

## 3. `api.daeese.me` fora do ar — RESOLVIDO (19/08/2026)

Era um **530** da Cloudflare: o tunnel existia na conta e o DNS já apontava para ele, mas nenhum
conector rodava nesta máquina — o `cloudflared` sequer estava instalado. O Worker e o DNS estavam
corretos o tempo todo.

Como está agora:

- `cloudflared` 2026.8.2, instalado pelo repo oficial (`pkg.cloudflare.com/cloudflared`).
- Tunnel **`cornwall-bot-api`** (`7f9dd9b0-cf95-48e8-b4b1-1c7dfdf55a8a`), criado em 17/04/2026 —
  reaproveitado, não recriado, então o registro DNS não precisou ser mexido.
- Configuração em `/etc/cloudflared/config.yml`, credenciais em
  `/etc/cloudflared/cornwall-bot-api.json` (root, 600).
- Serviço de sistema `cloudflared.service`, `enabled` — sobe no boot.

```bash
systemctl status cloudflared
cloudflared tunnel info cornwall-bot-api      # deve listar um conector ativo
sudo systemctl restart cloudflared
```

### Duas coisas que não são óbvias

**O `httpHostHeader` é obrigatório.** O bot roteia por `Host`, e o Worker encaminha com
`Host: api.daeese.me`. Medido no bot local: `Host: 127.0.0.1:5056` → **200**;
`Host: api.daeese.me` → **404**. Sem o `originRequest.httpHostHeader` no ingress, tudo vira 404.

**O IPv6 de saída desta máquina não funciona.** `curl -6` dá timeout em 8s; `curl -4` responde em
0,1s (o README do bot já registrava o mesmo sintoma no NuGet). Sem `edge-ip-version: "4"` o
`cloudflared` tentava edges IPv6 e falhava em toda conexão — com a fixação, o tempo de conexão caiu
de 8s para 2s e as falhas de dial foram de 4 para zero.

## 3b. O bot também virou serviço

O bot rodava como `dotnet run` preso a um terminal: fechar a aba derrubava a API. Um tunnel
persistente com um bot volátil só trocaria o 530 por 502, então ele virou
`~/.config/systemd/user/ccore-bot.service`.

É um serviço **de usuário**, não de sistema, de propósito: o SELinux está `Enforcing` e o binário
mora em `/home` (contexto `user_home_t`). Um serviço de sistema o executaria como `init_t`, uma
transição que a política padrão do Fedora bloqueia. Como contrapartida, o `Linger` precisou ser
ligado (`sudo loginctl enable-linger daeese`) para o serviço sobreviver ao logout.

Aponta para o binário já construído em vez de `dotnet run`, que recompila a cada start, e leva
`DOTNET_SYSTEM_NET_DISABLEIPV6=1` pelo mesmo motivo de IPv6 acima.

```bash
systemctl --user status ccore-bot
systemctl --user restart ccore-bot
journalctl --user -u ccore-bot -f
```

Verificado: `kill -9` no processo e o serviço trouxe o bot de volta sozinho em 11s.

**Atenção ao desenvolver:** o serviço ocupa a porta 5056. Rodar `dotnet run` à mão em paralelo
falha com `HttpListenerException (98): Address already in use`. Pare o serviço antes
(`systemctl --user stop ccore-bot`).

## 4. CORS do Worker reflete qualquer Origin — RESOLVIDO (19/08/2026)

`buildCorsHeaders` devolvia em `Access-Control-Allow-Origin` qualquer `Origin` recebido. Agora usa
allowlist, com `Vary: Origin` para o cache não misturar respostas:

```js
const ALLOWED_ORIGINS = new Set(["https://daeese.me"]);
```

**Correção a uma versão anterior deste documento:** o exemplo aqui incluía `http://127.0.0.1:5056`
na allowlist, o que estava errado — aquilo é a origem da *API*, nunca a de uma *página*. Em
desenvolvimento local o dashboard fala direto com `127.0.0.1:5056` e não passa pelo Worker, então
`https://daeese.me` é a única origem legítima.

Deployado com `npx wrangler deploy` (versão `accee14a-c5dc-4251-aebb-53140d55776b`). Verificação:

```bash
curl -si -X OPTIONS https://daeese.me/api/health -H 'Origin: https://evil.test' | grep -i allow-origin
# access-control-allow-origin: https://daeese.me   <- nao reflete a origem hostil
```

## 4b. O IP do cliente só chega ao bot via `CF-Connecting-IP`

Consequência de tudo passar por Worker + tunnel: o bot escuta em `127.0.0.1` e o
`cloudflared` conecta do próprio loopback, então `RemoteEndPoint` é **sempre**
`127.0.0.1`. Qualquer lógica por cliente que dependa dele trata o mundo inteiro
como um único visitante — foi assim que o rate limit de login do dashboard
acabou sendo global (corrigido em `cornwall-discord-application`, commit
`fd5209e`).

O que de fato chega ao bot, capturado em 19/08/2026:

| Header | Valor | Confiável? |
|---|---|---|
| `CF-Connecting-IP` | IP real do cliente | ✅ a Cloudflare recusa na borda, com `403 error code: 1000`, qualquer requisição que traga esse header do cliente |
| `X-Forwarded-For` | `<valor forjado>,<ip real>` | ❌ o valor do cliente fica **na frente** da cadeia |
| `X-Real-IP` | ausente | — |

A armadilha é que a leitura convencional de `X-Forwarded-For` é pegar o primeiro
elemento, e é exatamente ele que o atacante controla. Qualquer código novo que
precise do IP do cliente deve usar `CF-Connecting-IP` e mais nada.

## 5. A Cloudflare injeta o próprio bloco no `robots.txt`

O `robots.txt` servido em produção **não** é apenas o arquivo deste repositório. A Cloudflare
prepend um bloco gerenciado (content signals + `Disallow` para crawlers de IA) e o conteúdo do
repositório aparece depois dele:

```
# BEGIN Cloudflare Managed content
User-agent: *
Content-Signal: search=yes,ai-train=no,use=reference
Allow: /
...
# END Cloudflare Managed Content

# https://daeese.me/robots.txt
User-agent: *
Disallow: /cornwallcore/administration/
```

Isso funciona — o Google combina grupos com o mesmo `User-agent`, então o `Disallow` é respeitado —
mas o resultado tem dois blocos `User-agent: *`, um com `Allow: /` e outro com o `Disallow`. Se
algum dia o bloqueio de `/cornwallcore/administration/` parecer estar sendo ignorado, é aqui que se
deve olhar primeiro. De todo modo, a garantia real de não-indexação é a meta `noindex` nas próprias
páginas, que não depende da Cloudflare.

O bloco gerenciado é configurável em Cloudflare → *AI Crawl Control* / *Manage robots.txt*.

## 6. Planilha regimental legível sem autenticação

```
$ curl -s '.../gviz/tq?gid=827170318&tqx=out:json'   -> 200 com USERNAME, DISCORD USER, RANK, KILLS
```

O `noindex` + `robots.txt` já aplicados impedem indexação, mas não acesso direto. A proteção real é
restringir o compartilhamento da planilha no Google Drive e expor os dados por um endpoint
autenticado do bot. Decisão pendente do dono do regimento.
