// Origens legitimas: o dashboard, que agora mora em dashboard.daeese.me;
// ccore.daeese.me, cuja pagina /status consome GET /api/status; e daeese.me,
// que ainda serve os caminhos antigos ate os 301 propagarem. Em
// desenvolvimento local o dashboard fala direto com http://127.0.0.1:5056 e nao
// passa por este Worker, entao nao ha origem de dev para liberar aqui.
// Mesmo teto do MaxRequestBodyBytes do bot (64 KB).
const MAX_BODY_BYTES = 64 * 1024;

// Nenhuma rota do bot usa URL perto disto: o maior caso real e /api/logs com
// meia duzia de filtros. Serve so para barrar lixo antes do tunel.
const MAX_URL_LENGTH = 2048;

// O bot so roteia estes. PUT/DELETE/PATCH atravessavam o tunel para receber
// 404 do outro lado.
const ALLOWED_METHODS = new Set(["GET", "HEAD", "POST", "OPTIONS"]);

// O unico endpoint publico, lido pela pagina de status a cada 15 s. O bot ja
// guarda a resposta por 10 s; guardar o mesmo tempo na borda faz uma enxurrada
// nele morrer aqui em vez de atravessar o tunel ate a maquina de casa.
const EDGE_CACHED_PATH = "/api/status";
const EDGE_CACHE_SECONDS = 10;

const ALLOWED_ORIGINS = new Set([
  "https://dashboard.daeese.me",
  "https://ccore.daeese.me",
  "https://daeese.me"
]);

function buildCorsHeaders(origin) {
  // Refletir de volta qualquer Origin recebido transforma o proxy num
  // intermediario aberto. So devolvemos a origem quando ela esta na allowlist.
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : "https://daeese.me";

  return {
    "Access-Control-Allow-Origin": allowed,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    // Toda chamada do dashboard leva Authorization e por isso faz preflight.
    // Sem Max-Age o navegador repetia o OPTIONS antes de cada uma, dobrando as
    // invocacoes -- e a cota diaria do plano Free e da conta inteira.
    "Access-Control-Max-Age": "600"
  };
}

function jsonError(status, message, origin, extraHeaders = {}) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...buildCorsHeaders(origin),
      ...extraHeaders
    }
  });
}

// Chave do rate limit: o IP que a borda viu. CF-Connecting-IP e confiavel
// aqui -- a Cloudflare recusa na borda quem tenta manda-lo (INFRA.md, 4b).
//
// IPv6 vai agrupado no /64. Um provedor residencial entrega um /64 inteiro, e
// quem tem um /64 escolhe um endereco novo por requisicao: por endereco
// completo, o contador nunca repetiria chave.
function limiterKey(request) {
  const ip = request.headers.get("CF-Connecting-IP") || "";
  if (!ip.includes(":") || ip.includes(".")) {
    return ip || "unknown";
  }

  const [head, tail] = ip.toLowerCase().split("::");
  const headGroups = head ? head.split(":") : [];
  const tailGroups = tail ? tail.split(":") : [];
  const groups = tail === undefined
    ? headGroups
    : [...headGroups, ...Array(8 - headGroups.length - tailGroups.length).fill("0"), ...tailGroups];

  return `${groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, "")).join(":")}::/64`;
}

// Recusa sequencias de travessia no caminho antes de repassar ao bot. new URL()
// colapsa ".." literais, mas NAO decodifica "%2e%2e" nem "..%2f", entao
// "/api/..%2f..%2finterno" chegava ao bot com a sequencia intacta - e se o bot
// decodificar antes de rotear, e travessia. Mesma defesa do escapesPrefix do
// site-router; barata e ausente so aqui.
function escapesPath(pathname) {
  let decoded = pathname;
  // Duas passadas: %252e -> %2e -> "."
  for (let i = 0; i < 2; i++) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      // Percent-encoding malformado nao tem por que existir num caminho de API.
      return true;
    }
  }

  return decoded.includes("..") || decoded.includes("\\");
}

function toUpstreamUrl(requestUrl, upstreamBase) {
  const incoming = new URL(requestUrl);
  const base = (upstreamBase || "").replace(/\/$/, "");

  if (!base) {
    throw new Error("BOT_API_ORIGIN nao configurada.");
  }

  let path = incoming.pathname || "/";
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  // Some Cloudflare route modes can pass the pathname without the matched
  // /api prefix. Normalize so upstream always receives /api/*.
  if (path !== "/api" && !path.startsWith("/api/")) {
    path = `/api${path}`;
  }

  return `${base}${path}${incoming.search}`;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: buildCorsHeaders(origin)
      });
    }

    if (!ALLOWED_METHODS.has(request.method)) {
      return jsonError(405, "Method not allowed.", origin, { "Allow": "GET, HEAD, POST, OPTIONS" });
    }

    if (request.url.length > MAX_URL_LENGTH) {
      return jsonError(414, "URI too long.", origin);
    }

    // Rate limit por IP, antes de qualquer coisa que custe tunel. O OPTIONS
    // fica de fora: e respondido aqui mesmo e nao chega ao bot.
    //
    // O contador e por data center e eventualmente consistente -- serve de teto
    // contra enxurrada, nao de contabilidade exata. E nao salva a cota diaria
    // de Workers: a requisicao barrada ja foi uma invocacao. Quem barra antes
    // da invocacao e a regra de rate limit do WAF (cloudflare/zone-security).
    if (env.API_LIMITER) {
      const { success } = await env.API_LIMITER.limit({ key: limiterKey(request) });
      if (!success) {
        return jsonError(429, "Too many requests. Try again in a minute.", origin, { "Retry-After": "60" });
      }
    }

    // Teto de corpo na borda.
    //
    // O bot ja recusa acima de 64 KB, mas so DEPOIS de o corpo atravessar o
    // tunel. Barrar aqui evita gastar o tunel com algo que sera recusado do
    // outro lado. Content-Length ausente (chunked) segue adiante: quem decide
    // nesse caso e a leitura em streaming do bot, que tambem tem o teto.
    const declaredLength = Number(request.headers.get("Content-Length") ?? "0");
    if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
      return jsonError(413, "Request body too large.", origin);
    }

    // Recusa travessia antes de montar a URL upstream.
    if (escapesPath(new URL(request.url).pathname)) {
      return jsonError(400, "Bad request.", origin);
    }

    try {
      const upstreamUrl = toUpstreamUrl(request.url, env.BOT_API_ORIGIN);
      const outgoingHeaders = new Headers(request.headers);

      // O cliente controla estes dois, e a leitura convencional de
      // X-Forwarded-For -- pegar o primeiro elemento -- pega exatamente o
      // pedaco forjado. Apagar aqui e melhor que confiar em cada consumidor
      // la embaixo lembrar de ignora-los.
      outgoingHeaders.delete("X-Forwarded-For");
      outgoingHeaders.delete("X-Real-IP");
      outgoingHeaders.delete("Forwarded");

      // Prova de que a requisicao passou mesmo por aqui. Sem isto o bot nao
      // tem como saber se o CF-Connecting-IP veio da borda da Cloudflare ou
      // de alguem falando direto com 127.0.0.1:5056 -- e e nesse header que
      // ele apoia o limite de tentativas de login por IP.
      // Sempre sobrescreve: se o cliente mandou o header, o valor dele morre aqui.
      if (env.TUNNEL_SECRET) {
        outgoingHeaders.set("X-Ccore-Tunnel", env.TUNNEL_SECRET);
      } else {
        outgoingHeaders.delete("X-Ccore-Tunnel");
      }

      // Host e header proibido no fetch dos Workers: este set e silenciosamente
      // ignorado. Quem de fato entrega o Host que o bot roteia e o
      // originRequest.httpHostHeader do cloudflared. Mantido so por clareza.
      outgoingHeaders.set("Host", new URL(env.BOT_API_ORIGIN).host);

      // Cache de borda so para a leitura publica: sem query (o ?detail=host exige
      // nivel 2) e sem Authorization. Resposta de erro nao entra no cache, senao
      // um 530 de tunel caido ficaria preso mesmo depois de o bot voltar.
      const incomingUrl = new URL(request.url);
      const edgeCacheable = request.method === "GET"
        && incomingUrl.pathname === EDGE_CACHED_PATH
        && incomingUrl.search === ""
        && !request.headers.has("Authorization");

      const upstreamResponse = await fetch(upstreamUrl, {
        method: request.method,
        headers: outgoingHeaders,
        body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
        redirect: "manual",
        cf: edgeCacheable
          ? { cacheEverything: true, cacheTtlByStatus: { "200-299": EDGE_CACHE_SECONDS, "300-599": 0 } }
          : undefined
      });

      const responseHeaders = new Headers(upstreamResponse.headers);
      const cors = buildCorsHeaders(origin);
      for (const [key, value] of Object.entries(cors)) {
        responseHeaders.set(key, value);
      }

      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: responseHeaders
      });
    } catch (error) {
      const cors = buildCorsHeaders(origin);
      // O detalhe vai para o log do Worker, nao para a resposta: quem chama
      // /api/* nao esta autenticado, e String(error) carrega hostname interno
      // e motivo da falha de graca para quem estiver sondando.
      console.error("falha no proxy:", error);
      // Em ingles: quem consome /api/* inclui ccore.daeese.me/status/, que e
      // uma pagina em ingles. O detalhe do erro fica no log do Worker.
      return new Response(JSON.stringify({
        error: "Cloudflare proxy failure."
      }), {
        status: 502,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          ...cors
        }
      });
    }
  }
};
