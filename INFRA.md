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
| 7 | Workers publicados só à mão | ✅ **resolvido** em 20/08/2026 |
| 8 | `clips.daeese.me` fora do ar | ✅ **resolvido** em 22/08/2026 |
| 9 | Clips sem índice, arquivo do HD invisível | ✅ **resolvido** em 22/08/2026 |
| 10 | Embeds de clip não montavam no Discord | ✅ **resolvido** em 22/08/2026 |

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

## 4c. Os Workers agora sobem sozinhos no boot — RESOLVIDO (20/08/2026)

O conteúdo do site sobe pelo GitHub Pages a cada commit, mas `cloudflare/` não: editar um Worker
e esquecer o `wrangler deploy` deixava a borda rodando código diferente do repositório, sem nada
avisar. Duas vezes já bastou para essa divergência custar tempo de investigação.

Agora existe [`cloudflare/deploy-workers.sh`](cloudflare/deploy-workers.sh), disparado no boot
pelo serviço de usuário `ccore-workers-deploy.service` (`Type=oneshot`, cópia versionada em
`cloudflare/ccore-workers-deploy.service`).

```bash
systemctl --user status ccore-workers-deploy
systemctl --user restart ccore-workers-deploy     # reexecuta (RemainAfterExit=yes)
cloudflare/deploy-workers.sh --force              # publica ignorando o carimbo
```

### Três coisas que não são óbvias

**Ele publica por mudança, não por boot.** Cada `wrangler deploy` cria uma versão nova mesmo com
código idêntico. Publicar a cada reinício encheria a lista de versões de entradas iguais e ela
deixaria de servir para achar a mudança real. O script guarda o `sha256` de `src/` + `wrangler.toml`
em `.wrangler/.deployed-hash` (gitignored) e pula quando bate.

**É serviço de usuário, e por um motivo diferente do `ccore-bot`.** Aqui não é SELinux: as
credenciais do wrangler moram em `~/.config/.wrangler`, e um serviço de sistema rodando como root
simplesmente não as encontraria. O `Linger` já estava ligado por causa do bot.

**Não precisa de token novo.** O `oauth_token` guardado expira em horas, mas o `refresh_token` tem
escopo `offline_access` e o wrangler o renova sozinho — verificado com o access token já vencido:
`npx wrangler whoami` renovou sem interação. Se algum dia o refresh for revogado, o script falha
com uma mensagem pedindo `npx wrangler login`, em vez de travar esperando um prompt que ninguém
vai ver no boot.

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
Allow: /
```

**Correção (22/08/2026):** este trecho descrevia um `Disallow: /cornwallcore/administration/`
que **não existe mais** no arquivo. Ele foi retirado de propósito — `/cornwallcore/*` responde
301 para os subdomínios, e um `Disallow` impediria o buscador de ver o redirecionamento e
transferir a reputação. Os caminhos administrativos hoje moram em `dashboard.daeese.me` e
`spreadsheet.daeese.me`, que têm `robots.txt` próprio servido pelo Worker e recebem
`X-Robots-Tag: noindex` — agora inclusive no atalho de subrequisição, que antes escapava.

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

## 8. `clips.daeese.me` fora do ar — RESOLVIDO (22/08/2026)

Um **1033** (HTTP 530), primo do item 3 e com a mesma pergunta por trás: o DNS aponta o hostname
para um tunnel, mas nenhum conector responde por ele. Aqui eram **três causas empilhadas**, e cada
uma só apareceu depois de resolver a anterior.

**Primeira: o tunnel `clips` nunca era executado.** Existia na conta desde 08/07/2026 com zero
conexões, e o arquivo de credenciais sequer estava nesta máquina — só o do `cornwall-bot-api`.

```
$ cloudflared tunnel list
b8157acc-d34b-4f4a-a046-9010498eccaf  clips             (nenhuma conexao)
7f9dd9b0-cf95-48e8-b4b1-1c7dfdf55a8a  cornwall-bot-api  2xgru17, 1xsjp01
```

O `cert.pem` já autorizava puxar o token do tunnel existente, então não foi preciso recriar nada —
e, como no item 3, o registro DNS não precisou ser tocado:

```bash
cloudflared tunnel token --cred-file ~/.cloudflared/clips.json b8157acc-...
```

Como está agora: configuração em `/etc/cloudflared-clips/config.yml`, credenciais em
`/etc/cloudflared-clips/clips.json` (root, 600), serviço de sistema `cloudflared-clips.service`,
`enabled`. Deliberadamente **separado** do `cloudflared.service` do bot: reiniciar os clips não
derruba a API.

**Segunda: a configuração do ingress não estava onde parecia.** Com o serviço no ar, o 530 virou
502. O log entregou o motivo:

```
INF Updated to new configuration config="{"ingress":[{"hostname":"clips.daeese.me",
    "service":"http://localhost:8767"}...]}" version=2
ERR ... dial tcp [::1]:8767: connect: connection refused
```

Este tunnel é **gerenciado pelo painel** — a API confirma `"source": "cloudflare"`. Qualquer bloco
`ingress` no arquivo local é **ignorado**: o `cloudflared` baixa a configuração remota no boot. O
`config.yml` local ficou com um aviso escrito em cima justamente por isso, porque o arquivo *parece*
estar mandando e não está. Para mudar o destino:

```
PUT /accounts/{account}/cfd_tunnel/{tunnel}/configurations
```

**Terceira: a porta remota estava errada, e `localhost` piorava.** A config apontava para 8767, mas
o servidor público do Vice escuta na 8766 — e `localhost` resolve para `::1` primeiro, enquanto o
Vice faz bind só em IPv4 (`0.0.0.0`). É o mesmo IPv6 quebrado do item 3 aparecendo por outro
caminho. Corrigido para `http://127.0.0.1:8766`, explícito nos dois pontos.

### Duas coisas que não são óbvias

**`port` no Vice não é a porta pública.** Em `~/.config/vice/config.toml`, `port` é a UI de
controle local; o servidor público é `port + 1`. Ajustar `port` para 8767 tentando casar com o
tunnel dava público em **8768** — continuaria errado. O `public_port` agora está **fixado em 8766**,
para o alvo do tunnel parar de depender dessa aritmética.

**O 404 é o sinal de sucesso.** O servidor público do Vice não tem rota para `/`. Depois da
correção, `curl https://clips.daeese.me/` passou de 530 para 404 — e o 404 certo se distingue do
404 do catch-all pelo corpo: `content-length: 14`, `404: Not Found`, idêntico ao que o aiohttp do
Vice responde localmente.

```bash
systemctl status cloudflared-clips
cloudflared tunnel info b8157acc-d34b-4f4a-a046-9010498eccaf   # deve listar conectores
```

## 9. Clips sem índice e arquivo do HD invisível — RESOLVIDO (22/08/2026)

Com o tunnel de pé, sobraram duas limitações do próprio Vice.

**Não havia índice.** O servidor público registra só três rotas (`vice/share.py:638-641`): `/c/`,
`/v/` e `/t/`. Sem `/`, quem não tivesse o link exato de um clip não via nada.

**Só um diretório, varrido uma vez.** Em `vice/share.py:711-715` o índice sai de um `glob` em
`cfg.output.directory`, apenas no `start()`. Não soma pastas, e não percebe arquivo que chegue com
o daemon rodando — o que inviabiliza acompanhar a migração do arquivo antigo para o HD interno.

A resposta foi um serviço à parte, **sem tocar no código do Vice**, que é upstream acompanhado por
git em `~/Vice`. Um fork viraria dor de merge a cada atualização.

Como está agora:

- `clips-gallery`, aiohttp em `~/.local/share/clips-gallery/`, porta 8790, serviço **de usuário**
  (`clips-gallery.service`, `enabled`) — precisa ser de usuário porque lê `~/Videos` e `/mnt/HDD`.
- Duas fontes: `~/Videos/Vice` e `/mnt/HDD/hdusbcontents/Rafael/Vice`.
- Galeria em `/` protegida por senha (SHA-256 em `~/.config/clips-gallery/password`, sessão em
  cookie assinado com HMAC). As rotas de clip seguem **públicas**, senão o robô do Discord não
  consegue montar o embed.

O tunnel passou a rotear **por caminho**, para não quebrar link já compartilhado:

```yaml
- hostname: clips.daeese.me
  path: ^/(c|v|t)/          # Vice, embeds e links antigos
  service: http://127.0.0.1:8766
- hostname: clips.daeese.me  # galeria
  service: http://127.0.0.1:8790
```

### Três coisas que não são óbvias

**`aiohttp` é requisito, não preferência.** O `http.server` da biblioteca padrão não implementa
HTTP Range; sem `206 Partial Content` o player não deixa arrastar a barra. Medido:
`curl -r 0-1023` → `206` com `Content-Range: bytes 0-1023/5113629`.

**A varredura ignora arquivo com menos de 30s.** A migração do HD externo está em andamento, e
indexar uma cópia pela metade daria duração errada e miniatura preta. Somado ao ciclo de 60s, um
clip novo no HD aparece em até 90s — medido em 80s, **sem reiniciar nada**, que é exatamente o que
o Vice não faz.

**Diretório ausente é "vazio por enquanto", nunca erro.** HD desmontado ou pasta ainda não criada
não podem derrubar a galeria. Testado com zero fontes disponíveis: 0 clips, sem exceção. O próprio
Vice já foi mordido por isso — há um comentário em `share.py` sobre contagens de visualização
perdidas quando o diretório de saída demorava a montar.

```bash
systemctl --user status clips-gallery
curl -s localhost:8790/healthz          # {"ok":true,"clips":N,"sources":{...}}
~/.local/share/clips-gallery/set-password
```

A galeria **não passa pelo GitHub Pages** e não tem deploy: o Pages só serve estático, e ela precisa
listar o disco em tempo real. Roda nesta máquina e chega pelo tunnel.

## 10. Embeds de clip não montavam no Discord — RESOLVIDO (22/08/2026)

Link de clip colado no Discord aparecia como texto azul e nada mais — nem card de imagem. Valia
para os dois tipos, `/c/` do Vice e `/g/` da galeria.

O primeiro instinto, depois dos itens 3 e 8, foi procurar rede. Não era: as duas páginas
respondiam `200 text/html` com Open Graph completo, e as mídias respondiam `200 video/mp4` e
`200 image/jpeg`. O problema estava no que as metatags **apontavam**.

**Primeira: `og:video` apontava para o arquivo original.**

```
$ curl -sI https://clips.daeese.me/v/Vice_Clip_4.mp4 | grep content-length
content-length: 1034011154          # 986 MB, 76 s de vídeo a 108 Mbps
```

O Discord só monta player para vídeo externo na casa de 8–30 MB. Acima disso ele não degrada para
card de imagem: descarta o embed inteiro, que é exatamente o sintoma.

**Segunda: o áudio é Opus dentro de MP4.** Vale para todo clip daqui — recentes, replays e os do
HD. O player do Discord e o Safari não decodificam Opus nesse container; precisa ser AAC. Essa
sozinha já impediria o embed de tocar mesmo se o tamanho coubesse.

**Terceira: a página `/g/` não emitia `og:video:width` nem `og:video:height`.** O Discord usa esse
par para dimensionar o player. A página do Vice emitia (`share.py:1051-1052`); a da galeria, não.

A saída foi um **preview** por clip, gerado pelo `clips-gallery`: H.264 + AAC, 720p, `faststart`,
com bitrate calculado para caber em ~7,6 MB. É só ele que vai nas metatags — o player da página e
o botão Baixar continuam servindo o original em `/m/`. Medido no primeiro:

```
$ ffprobe ~/.cache/clips-gallery/previews/replay-...-ece7a4ff.mp4
h264 1280x720 / aac / 60 s / 6.966.273 bytes        (encode levou 14 s)
```

Nada disso tocou o código do Vice, pelo mesmo motivo do item 9: é upstream acompanhado por git em
`~/Vice`, e um fork viraria dor de merge.

### Três coisas que não são óbvias

**`/c/` mudou de dono, `/v/` e `/t/` não.** Como `sharing.base_url` no Vice é
`https://clips.daeese.me`, o botão de compartilhar dele copia `/c/{slug}` — e essa página é
justamente a que apontava para o arquivo de 986 MB. O ingress passou a mandar `/c/` para a
galeria, que reencontra o clip pelo nome do arquivo e serve as metatags certas:

```yaml
- hostname: clips.daeese.me
  path: ^/(v|t)/          # mídia do Vice: embed já cacheado aponta para cá
  service: http://127.0.0.1:8766
- hostname: clips.daeese.me  # galeria, agora incluindo /c/
  service: http://127.0.0.1:8790
```

`/v/` e `/t/` ficaram no Vice de propósito: embed que o Discord já montou aponta para aqueles
caminhos, e movê-los quebraria mensagem antiga. O preço é que agora um `clips-gallery` fora do ar
derruba também os links `/c/` — o serviço tem `Restart=on-failure`.

**A página nunca espera o encode.** O robô do Discord desiste em poucos segundos, e encodar leva
dezenas. Então `ensure_preview` devolve `None` na hora e enfileira; enquanto não fica pronto a
página cai para `og:type=website` com `twitter:card=summary_large_image`, que mostra um card de
imagem grande em vez de nada. Pelo mesmo motivo o `ensure_meta` da página tem `wait_for` de 2 s:
um ffprobe no HD pode passar do tempo do robô, e perder duração é melhor que perder a página.

Só os clips de `~/Videos/Vice` entram na fila sozinhos a cada varredura. Os 141 do arquivo do HD
ficam sob demanda — encodar todos de uma vez faria a cabeça do disco mecânico passear por horas.

**O Discord cacheia embed por URL.** Depois da correção, repostar o mesmo link continua mostrando o
resultado velho. Para testar, use um clip que ainda não foi postado.

```bash
systemctl --user status clips-gallery
curl -s localhost:8790/healthz        # {"ok":true,"clips":N,"previews":M,...}
curl -s -A 'Discordbot/2.0' https://clips.daeese.me/c/Vice_Clip_1 | grep og:video
```

### Anotado, sem decisão

`Vice_Clip_4.mp4` saiu a 108 Mbps com `crf = 23` no `~/.config/vice/config.toml`, sinal de que o
encoder (`encoder = "auto"`) está ignorando o CRF. Não afeta mais o embed, mas deixa o player da
própria página lento pelo tunnel e enche o disco rápido.
