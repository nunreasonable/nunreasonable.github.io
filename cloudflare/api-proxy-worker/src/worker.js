// Origens legitimas: o dashboard, que agora mora em dashboard.daeese.me;
// ccore.daeese.me, cuja pagina /status consome GET /api/status; e daeese.me,
// que ainda serve os caminhos antigos ate os 301 propagarem. Em
// desenvolvimento local o dashboard fala direto com http://127.0.0.1:5056 e nao
// passa por este Worker, entao nao ha origem de dev para liberar aqui.
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

    try {
      const upstreamUrl = toUpstreamUrl(request.url, env.BOT_API_ORIGIN);
      const outgoingHeaders = new Headers(request.headers);

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
      return new Response(JSON.stringify({
        error: "Falha no proxy Cloudflare.",
        details: String(error)
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
