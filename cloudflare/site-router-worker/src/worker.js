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

// Valor do guarda. O nome do header sozinho era adivinhavel, e mandar
// `x-site-router: 1` de fora pulava o bloco inteiro de reescrita -- incluindo
// o X-Robots-Tag dos hosts administrativos. Com segredo, so as subrequisicoes
// deste Worker batem. Ver `wrangler secret put LOOP_GUARD_TOKEN`.
function guardToken(env) {
  return (env && env.LOOP_GUARD_TOKEN) || "1";
}


// Hosts que nao devem aparecer em buscador.
const NOINDEX_HOSTS = new Set(["spreadsheet.daeese.me", "dashboard.daeese.me"]);

// Cabecalhos que valem para QUALQUER resposta do host, inclusive as servidas
// pelo atalho de subrequisicao. Ficavam so no caminho longo, entao quem
// mandasse o header do guarda recebia dashboard.daeese.me sem o noindex.
function applyHostHeaders(response, hostname) {
  response.headers.delete("x-github-request-id");
  response.headers.set("x-served-by", "daeese-site-router");
  if (NOINDEX_HOSTS.has(hostname)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

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
  const urls = [
    "https://ccore.daeese.me/",
    "https://ccore.daeese.me/status/",
    "https://ccore.daeese.me/termsofservice/",
    "https://ccore.daeese.me/privacypolicy/",
    // Sollarety, o bot de moderacao/diversao: aplicacao separada do ccore,
    // hospedada no mesmo site.
    "https://ccore.daeese.me/fun/",
    "https://ccore.daeese.me/fun/termsofservice/",
    "https://ccore.daeese.me/fun/privacypolicy/",
    "https://ccore.daeese.me/fun/invite/"
  ];

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

// Só mídia. Os .src.html do filearchive são fontes de render das imagens
// (og-banner, widgets), nunca páginas para servir -- e deixá-los passar punha
// documento HTML na MESMA ORIGEM do dashboard, que guarda o Bearer token em
// sessionStorage. Não há injeção neles hoje; a questão é não manter superfície
// HTML de graça ao lado de um armazenamento de credencial.
const SHARED_MEDIA_EXT = /\.(png|jpe?g|gif|webp|avif|svg|ico|mp4|webm|woff2?)$/i;

function isSharedPath(pathname) {
  return SHARED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    && SHARED_MEDIA_EXT.test(pathname);
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
  async fetch(request, env) {
    const url = new URL(request.url);
    const hostname = url.hostname;

    // Subrequisicao nossa: repassa sem redirecionar nem reescrever -- mas
    // ainda com os cabecalhos do host, que sao garantia de seguranca e nao
    // detalhe do caminho longo.
    if (request.headers.get(LOOP_GUARD_HEADER) === guardToken(env)) {
      const passthrough = await fetch(request);
      return applyHostHeaders(new Response(passthrough.body, passthrough), hostname);
    }

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
    // set, nunca append: se o cliente mandou o header, o valor dele morre aqui.
    outgoing.headers.set(LOOP_GUARD_HEADER, guardToken(env));

    const upstream = await fetch(outgoing, { redirect: "manual" });

    // A origem e um detalhe de implementacao e nao vaza para o cliente; e o
    // noindex vale para qualquer resposta do host, inclusive as que nao sao
    // HTML e portanto nao teriam como carregar uma meta tag.
    return applyHostHeaders(new Response(upstream.body, upstream), hostname);
  }
};
