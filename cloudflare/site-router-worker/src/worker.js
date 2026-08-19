// Roteador dos subdominios de daeese.me.
//
// O GitHub Pages serve um unico dominio custom por repositorio (o CNAME contem
// daeese.me), entao os subdominios nao podem sair do Pages diretamente. Este
// Worker fica na frente e faz duas coisas:
//
//   1. Nos subdominios, mapeia o caminho para o prefixo correspondente dentro
//      do site e devolve o conteudo de forma transparente (a URL na barra
//      continua sendo o subdominio).
//   2. Em daeese.me/cornwallcore/*, devolve 301 para o subdominio equivalente,
//      para nenhum link antigo quebrar - inclusive os de ToS e Privacidade
//      registrados no Discord Developer Portal.

const ORIGIN = "https://daeese.me";

const SITES = {
  "ccore.daeese.me": "/cornwallcore",
  "spreadsheet.daeese.me": "/cornwallcore/administration/spreadsheetviewer",
  "dashboard.daeese.me": "/cornwallcore/administration/dashboard"
};

// Assets compartilhados vivem na raiz do site e nao podem receber o prefixo do
// subdominio. As paginas os referenciam por caminho relativo ("../filearchive/..."),
// e o relativo e resolvido contra a URL do navegador: a partir da raiz de um
// subdominio, "../" nao sobe nada e o pedido chega aqui como /filearchive/...
const SHARED_PREFIXES = ["/filearchive/"];

// Mais especifico primeiro: /cornwallcore/administration/dashboard tem que ser
// testado antes de /cornwallcore, senao o prefixo curto casa e vence.
const REDIRECTS = [
  ["/cornwallcore/administration/spreadsheetviewer", "https://spreadsheet.daeese.me"],
  ["/cornwallcore/administration/dashboard", "https://dashboard.daeese.me"],
  ["/cornwallcore", "https://ccore.daeese.me"]
];

// Marca as subrequisicoes deste Worker. Se ele buscasse o conteudo em
// daeese.me/cornwallcore/... sem isto, a subrequisicao poderia cair no proprio
// redirect e entrar em laco. A Cloudflare normalmente nao reinvoca o mesmo
// Worker numa subrequisicao, mas nao dependemos desse comportamento.
const LOOP_GUARD_HEADER = "x-site-router";

// Hosts que nao devem aparecer em buscador.
const NOINDEX_HOSTS = new Set(["spreadsheet.daeese.me", "dashboard.daeese.me"]);

function buildRobotsTxt(hostname) {
  // robots.txt e por host.
  //
  // Nos hosts administrativos a rastreagem e LIBERADA de proposito. Um
  // "Disallow: /" impediria o crawler de ler a meta noindex e o cabecalho
  // X-Robots-Tag, e o resultado tipico e a URL ser indexada mesmo assim, sem
  // conteudo. Liberar o rastreio e deixar o noindex falar e o que de fato
  // desindexa. Nenhuma das duas paginas expoe dado no HTML: o dashboard exige
  // autenticacao e o visualizador busca a planilha no navegador.
  if (NOINDEX_HOSTS.has(hostname)) {
    return "User-agent: *\nAllow: /\n";
  }

  return "User-agent: *\nAllow: /\n\nSitemap: https://ccore.daeese.me/sitemap.xml\n";
}

function buildCcoreSitemap() {
  const urls = ["https://ccore.daeese.me/", "https://ccore.daeese.me/termsofservice/", "https://ccore.daeese.me/privacypolicy/"];

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((loc) => `  <url>\n    <loc>${loc}</loc>\n  </url>\n`).join("") +
    "</urlset>\n"
  );
}

function findRedirect(pathname) {
  for (const [prefix, target] of REDIRECTS) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      const rest = pathname.slice(prefix.length);
      return `${target}${rest || "/"}`;
    }
  }

  return null;
}

function isSharedPath(pathname) {
  return SHARED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// Traduz o caminho pedido no subdominio para o caminho real dentro do site.
export function resolveOriginPath(hostname, pathname) {
  const sitePrefix = SITES[hostname];
  if (sitePrefix === undefined) {
    return pathname;
  }

  if (isSharedPath(pathname)) {
    return pathname;
  }

  const normalized = pathname === "/" ? "/" : pathname;
  return `${sitePrefix}${normalized}`;
}

export default {
  async fetch(request) {
    // Subrequisicao nossa: repassa sem redirecionar nem reescrever.
    if (request.headers.get(LOOP_GUARD_HEADER)) {
      return fetch(request);
    }

    const url = new URL(request.url);
    const hostname = url.hostname;

    // 1. Caminhos antigos em daeese.me -> 301 para o subdominio.
    if (!(hostname in SITES)) {
      const target = findRedirect(url.pathname);
      if (target) {
        return Response.redirect(`${target}${url.search}`, 301);
      }

      return fetch(request);
    }

    // 2. Subdominio: respostas sinteticas por host antes de ir a origem.
    if (url.pathname === "/robots.txt") {
      return new Response(buildRobotsTxt(hostname), {
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }

    if (url.pathname === "/sitemap.xml" && hostname === "ccore.daeese.me") {
      return new Response(buildCcoreSitemap(), {
        headers: { "Content-Type": "application/xml; charset=utf-8" }
      });
    }

    // 3. Busca o conteudo real no Pages.
    const originUrl = new URL(ORIGIN);
    originUrl.pathname = resolveOriginPath(hostname, url.pathname);
    originUrl.search = url.search;

    const outgoing = new Request(originUrl.toString(), request);
    outgoing.headers.set(LOOP_GUARD_HEADER, "1");

    const upstream = await fetch(outgoing, { redirect: "manual" });

    const response = new Response(upstream.body, upstream);
    // A origem e um detalhe de implementacao; nao vaza para o cliente.
    response.headers.delete("x-github-request-id");
    response.headers.set("x-served-by", "daeese-site-router");

    // Vale para qualquer resposta do host, inclusive as que nao sao HTML e
    // portanto nao teriam como carregar uma meta tag.
    if (NOINDEX_HOSTS.has(hostname)) {
      response.headers.set("X-Robots-Tag", "noindex, nofollow");
    }

    return response;
  }
};
