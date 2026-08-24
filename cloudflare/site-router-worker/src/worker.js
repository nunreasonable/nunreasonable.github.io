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
const ORIGIN_HOST = "daeese.me";

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

// Valor do guarda. Com LOOP_GUARD_TOKEN configurado, so as subrequisicoes deste
// Worker batem. Ver `wrangler secret put LOOP_GUARD_TOKEN`.
//
// SEM o segredo cai no literal "1". IMPORTANTE: como este repositorio e PUBLICO,
// nenhum literal no codigo funciona como segredo - "1" (ou qualquer outra
// constante) e forjavel por qualquer um. Por isso a seguranca NAO pode depender
// do guarda ser secreto. Duas defesas que nao dependem disso:
//
//   1. O atalho de passthrough so e honrado quando hostname === ORIGIN_HOST
//      (daeese.me). Nossas subrequisicoes sempre vao para daeese.me/... (ver o
//      fetch la embaixo), NUNCA para um subdominio. Um `x-site-router` forjado
//      chegando num subdominio (dashboard.daeese.me, cujo DNS aponta para o
//      proprio Worker via custom_domain) nao entra mais no atalho - antes ele
//      fazia fetch da mesma URL e voltava ao Worker, um laco de subrequisicao
//      acionavel de fora que derrubava o host.
//   2. Os cabecalhos administrativos (noindex, frame-ancestors, X-Frame-Options)
//      passaram a ser aplicados por CAMINHO alem de por host (isAdminContext).
//      Antes o passthrough em daeese.me servia o dashboard sem eles - agora o
//      conteudo administrativo carrega a protecao em qualquer host.
//
// Recomendado mesmo assim definir LOOP_GUARD_TOKEN: fecha de vez o acesso ao
// conteudo do dashboard pela origem daeese.me.
const GUARD_FALLBACK = "1";

function guardToken(env) {
  return (env && env.LOOP_GUARD_TOKEN) || GUARD_FALLBACK;
}


// Hosts que nao devem aparecer em buscador.
const NOINDEX_HOSTS = new Set(["spreadsheet.daeese.me", "dashboard.daeese.me"]);

// Prefixos de caminho administrativos. As protecoes valem por CAMINHO, e nao so
// por host, porque o mesmo conteudo pode ser servido pela origem daeese.me
// (pelo atalho de passthrough) e nao so pelo subdominio.
const ADMIN_PATH_PREFIXES = [
  "/cornwallcore/administration/dashboard",
  "/cornwallcore/administration/spreadsheetviewer"
];

// Verdadeiro quando a resposta e de contexto administrativo, seja pelo host
// (subdominio dedicado) ou pelo caminho (conteudo administrativo servido pela
// origem).
function isAdminContext(hostname, pathname) {
  if (NOINDEX_HOSTS.has(hostname)) {
    return true;
  }

  return ADMIN_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

// Cabecalhos que valem para QUALQUER resposta, inclusive as servidas pelo atalho
// de subrequisicao. Ficavam so no caminho longo e so por host, entao quem
// mandasse o header do guarda recebia o dashboard sem o noindex/anti-frame.
function applyHostHeaders(response, hostname, pathname) {
  response.headers.delete("x-github-request-id");
  response.headers.set("x-served-by", "daeese-site-router");
  if (isAdminContext(hostname, pathname)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");

    // Anti-enquadramento do conteudo administrativo.
    //
    // O dashboard guarda o Bearer token do painel em sessionStorage, e a CSP
    // dele (em meta tag) NAO pode carregar frame-ancestors -- a diretiva so vale
    // como cabecalho. frame-ancestors e o moderno e ganha de X-Frame-Options
    // onde ambos existem; o X-Frame-Options fica para navegador antigo.
    response.headers.set("Content-Security-Policy", "frame-ancestors 'none'");
    response.headers.set("X-Frame-Options", "DENY");
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
//
// css/js entram junto da midia: o seletor de idioma (filearchive/i18n/) e a
// copia versionada do translate.js sao compartilhados pelas paginas dos bots,
// que rodam em ccore.daeese.me. Eles NAO reabrem o buraco que o paragrafo acima
// descreve - o que era perigoso ali era servir DOCUMENTO HTML na origem do
// dashboard, porque um documento pode ler o sessionStorage daquela origem. Uma
// folha de estilo ou um modulo nao viram pagina navegavel, e o conteudo e o do
// proprio repositorio.
const SHARED_MEDIA_EXT = /\.(png|jpe?g|gif|webp|avif|svg|ico|mp4|webm|woff2?|css|m?js)$/i;

function isSharedPath(pathname) {
  return SHARED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    && SHARED_MEDIA_EXT.test(pathname);
}

// Um caminho que, DEPOIS de decodificado, tenta sair do prefixo do subdominio.
//
// O `new URL()` do WHATWG ja decodifica %2e e normaliza os segmentos de ponto,
// entao `/%2e%2e/` colapsa antes de chegar aqui e nao escapa de nada -- medi.
// O que sobrevive ao parser e a barra codificada: `..%2f..%2f` chega intacta e
// so vira separador se o servidor de origem decodificar antes de resolver o
// caminho. O GitHub Pages nao decodifica, entao hoje isso da 404 e nao
// travessia.
//
// A checagem existe mesmo assim porque a alternativa e depender do
// comportamento de um servidor que nao e nosso, para proteger a fronteira entre
// dashboard.daeese.me -- que guarda credencial -- e o resto do site. Recusar e
// mais barato que confiar.
function escapesPrefix(pathname) {
  let decoded = pathname;
  // Duas passadas: %252e decodifica para %2e, que decodifica para ".".
  for (let i = 0; i < 2; i++) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      // Percent-encoding malformado nao tem por que existir aqui.
      return true;
    }
  }

  return decoded.includes("..") || decoded.includes("\\");
}

// Traduz o caminho pedido no subdominio para o caminho real dentro do site.
// Devolve null quando o caminho tenta escapar do prefixo.
export function resolveOriginPath(hostname, pathname) {
  const sitePrefix = SITES[hostname];
  if (sitePrefix === undefined) {
    return pathname;
  }

  if (escapesPrefix(pathname)) {
    return null;
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
    // Atalho de subrequisicao: SO na origem. Nossas subrequisicoes vao sempre
    // para daeese.me/...; um guarda chegando num subdominio nao e nosso e nao
    // pode entrar aqui (senao vira laco de subrequisicao no custom_domain).
    const guard = guardToken(env);
    if (hostname === ORIGIN_HOST && request.headers.get(LOOP_GUARD_HEADER) === guard) {
      const passthrough = await fetch(request);
      return applyHostHeaders(new Response(passthrough.body, passthrough), hostname, url.pathname);
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
    const originPath = resolveOriginPath(hostname, url.pathname);
    if (originPath === null) {
      return applyHostHeaders(new Response("Bad request", { status: 400 }), hostname, url.pathname);
    }

    const originUrl = new URL(ORIGIN);
    originUrl.pathname = originPath;
    originUrl.search = url.search;

    const outgoing = new Request(originUrl.toString(), request);
    // set, nunca append: se o cliente mandou o header, o valor dele morre aqui.
    outgoing.headers.set(LOOP_GUARD_HEADER, guard);

    const upstream = await fetch(outgoing, { redirect: "manual" });

    // A origem e um detalhe de implementacao e nao vaza para o cliente; e o
    // noindex vale para qualquer resposta do host, inclusive as que nao sao
    // HTML e portanto nao teriam como carregar uma meta tag. O pathname aqui e o
    // pedido no subdominio (ex.: "/" em dashboard.daeese.me), que isAdminContext
    // ja cobre por host.
    return applyHostHeaders(new Response(upstream.body, upstream), hostname, url.pathname);
  }
};
