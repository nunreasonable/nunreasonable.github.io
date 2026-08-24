// Origens legitimas: o dashboard, que agora mora em dashboard.daeese.me;
// ccore.daeese.me, cuja pagina /status consome GET /api/status; e daeese.me,
// que ainda serve os caminhos antigos ate os 301 propagarem. Em
// desenvolvimento local o dashboard fala direto com http://127.0.0.1:5056 e nao
// passa por este Worker, entao nao ha origem de dev para liberar aqui.
// Mesmo teto do MaxRequestBodyBytes do bot (64 KB).
const MAX_BODY_BYTES = 64 * 1024;

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
    "Access-Control-Allow-Headers": "Authorization, Content-Type"
  };
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

    // Teto de corpo na borda.
    //
    // O bot ja recusa acima de 64 KB, mas so DEPOIS de o corpo atravessar o
    // tunel. Barrar aqui evita gastar o tunel com algo que sera recusado do
    // outro lado. Content-Length ausente (chunked) segue adiante: quem decide
    // nesse caso e a leitura em streaming do bot, que tambem tem o teto.
    const declaredLength = Number(request.headers.get("Content-Length") ?? "0");
    if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
      return new Response(JSON.stringify({ error: "Request body too large." }), {
        status: 413,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          ...buildCorsHeaders(origin)
        }
      });
    }

    // Recusa travessia antes de montar a URL upstream.
    if (escapesPath(new URL(request.url).pathname)) {
      return new Response(JSON.stringify({ error: "Bad request." }), {
        status: 400,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          ...buildCorsHeaders(origin)
        }
      });
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

      const upstreamResponse = await fetch(upstreamUrl, {
        method: request.method,
        headers: outgoingHeaders,
        body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
        redirect: "manual"
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
