# Cloudflare API Proxy Setup

Este guia publica `/api/*` em `https://daeese.me/api/*` e encaminha para o bot local em `http://127.0.0.1:5056`.

## 1. Criar tunnel para o bot local (na maquina do bot)

1. Instale o `cloudflared`.
2. Autentique:

```bash
cloudflared tunnel login
```

3. Crie o tunnel:

```bash
cloudflared tunnel create cornwall-bot-api
```

4. Crie o arquivo de config em `~/.cloudflared/config.yml`:

```yaml
tunnel: cornwall-bot-api
credentials-file: /home/SEU_USUARIO/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: api.daeese.me
    service: http://127.0.0.1:5056
    originRequest:
      httpHostHeader: 127.0.0.1:5056
  - service: http_status:404
```

5. Crie o DNS do tunnel:

```bash
cloudflared tunnel route dns cornwall-bot-api api.daeese.me
```

6. Rode o tunnel:

```bash
cloudflared tunnel run cornwall-bot-api
```

Opcional: instalar como servico para subir com o sistema:

```bash
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

## 2. Deploy do Worker de proxy (no projeto do site)

Pasta do worker: `cloudflare/api-proxy-worker`

1. Entre na pasta:

```bash
cd cloudflare/api-proxy-worker
```

2. Login no wrangler:

```bash
npx wrangler login
```

3. Deploy:

```bash
npx wrangler deploy
```

O `wrangler.toml` ja esta configurado para rota:
- `daeese.me/api/*`

E origem upstream:
- `https://api.daeese.me`

## 3. Validacao

1. Teste health pelo dominio publico:

```bash
curl -i https://daeese.me/api/health
```

Esperado: `200` com JSON `{ "ok": true, ... }`

2. Abra o dashboard e faça login.
3. No DevTools, as chamadas devem ir para `https://daeese.me/api/...`.

## 4. Troubleshooting rapido

- `502 Falha no proxy Cloudflare`: tunnel fora do ar ou `api.daeese.me` nao apontando para tunnel.
- `Failed to fetch` no browser: rota do worker nao aplicada ou erro de DNS/SSL.
- `403 sem permissao`: usuario sem role/permissao no bot.
