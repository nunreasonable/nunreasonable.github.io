function buildCorsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "https://daeese.me",
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

  let path = incoming.pathname;
  if (path.startsWith("/api/")) {
    path = path.substring(4);
  } else if (path === "/api") {
    path = "/";
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
