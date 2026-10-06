// Testes do site-router-worker com `node --test`.
//
// Roda com o fetch nativo do Node (Request/Response/URL globais, sem precisar
// de Miniflare) e substitui o fetch global por um dublê antes de cada bloco
// que chama o handler default, para nunca sair para a rede de verdade.
//
// Uso: node --test cloudflare/site-router-worker/test/worker.test.mjs

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import worker, { resolveOriginPath } from "../src/worker.js";

// --- resolveOriginPath -------------------------------------------------

describe("resolveOriginPath", () => {
  test("ccore.daeese.me mapeia para /cornwallcore", () => {
    assert.equal(resolveOriginPath("ccore.daeese.me", "/"), "/cornwallcore/");
    assert.equal(resolveOriginPath("ccore.daeese.me", "/status"), "/cornwallcore/status");
  });

  test("apps.daeese.me mapeia para /apps, cobrindo illogicalwindows e sollarety", () => {
    assert.equal(resolveOriginPath("apps.daeese.me", "/illogicalwindows"), "/apps/illogicalwindows");
    assert.equal(resolveOriginPath("apps.daeese.me", "/sollarety"), "/apps/sollarety");
    assert.equal(resolveOriginPath("apps.daeese.me", "/sollarety/invite"), "/apps/sollarety/invite");
  });

  test("dashboard e spreadsheet mapeiam para dentro de administration", () => {
    assert.equal(
      resolveOriginPath("dashboard.daeese.me", "/"),
      "/cornwallcore/administration/dashboard/"
    );
    assert.equal(
      resolveOriginPath("spreadsheet.daeese.me", "/"),
      "/cornwallcore/administration/spreadsheetviewer/"
    );
  });

  test("assets compartilhados em /filearchive/ nao recebem o prefixo do subdominio", () => {
    assert.equal(
      resolveOriginPath("ccore.daeese.me", "/filearchive/i18n/i18n.js"),
      "/filearchive/i18n/i18n.js"
    );
    assert.equal(
      resolveOriginPath("apps.daeese.me", "/filearchive/icons/ccore-256.webp"),
      "/filearchive/icons/ccore-256.webp"
    );
  });

  test("host fora de SITES devolve o pathname sem alteracao", () => {
    assert.equal(resolveOriginPath("daeese.me", "/cornwallcore/status"), "/cornwallcore/status");
  });

  test("travessia de caminho (.. literal ou decodificado) devolve null", () => {
    assert.equal(resolveOriginPath("ccore.daeese.me", "/../secret"), null);
    assert.equal(resolveOriginPath("ccore.daeese.me", "/%2e%2e/secret"), null);
    assert.equal(resolveOriginPath("ccore.daeese.me", "/%252e%252e/secret"), null);
    assert.equal(resolveOriginPath("ccore.daeese.me", "/..%2f..%2fsecret"), null);
    assert.equal(resolveOriginPath("ccore.daeese.me", "/a\\b"), null);
  });
});

// --- fetch handler ------------------------------------------------------

describe("worker fetch handler", () => {
  let realFetch;
  let calls;

  before(() => {
    realFetch = globalThis.fetch;
  });

  after(() => {
    globalThis.fetch = realFetch;
  });

  function installFetchStub() {
    calls = [];
    globalThis.fetch = async (input, init) => {
      const req = input instanceof Request ? input : new Request(input, init);
      calls.push({ url: req.url, headers: req.headers });
      return new Response(`origin:${new URL(req.url).pathname}`, {
        status: 200,
        headers: { "x-github-request-id": "abc123", "content-type": "text/plain" }
      });
    };
  }

  test("metodo nao permitido devolve 405 antes de qualquer fetch", async () => {
    installFetchStub();
    const res = await worker.fetch(new Request("https://ccore.daeese.me/", { method: "POST" }), {});
    assert.equal(res.status, 405);
    assert.equal(calls.length, 0);
  });

  test("daeese.me/cornwallcore/* -> 301 para ccore.daeese.me, caminho mais especifico primeiro", async () => {
    installFetchStub();

    const res1 = await worker.fetch(new Request("https://daeese.me/cornwallcore/status"), {});
    assert.equal(res1.status, 301);
    assert.equal(res1.headers.get("location"), "https://ccore.daeese.me/status");

    // /cornwallcore/administration/dashboard tem que vencer o prefixo curto
    // /cornwallcore, senao cairia em ccore.daeese.me/administration/dashboard.
    const res2 = await worker.fetch(
      new Request("https://daeese.me/cornwallcore/administration/dashboard/panel"),
      {}
    );
    assert.equal(res2.status, 301);
    assert.equal(res2.headers.get("location"), "https://dashboard.daeese.me/panel");

    // Pathname SEM resto (bate exatamente o prefixo): o redirect aponta para a
    // raiz do subdominio, com a barra que a propria URL exige.
    const res3 = await worker.fetch(
      new Request("https://daeese.me/cornwallcore/administration/spreadsheetviewer?x=1"),
      {}
    );
    assert.equal(res3.status, 301);
    assert.equal(res3.headers.get("location"), "https://spreadsheet.daeese.me/?x=1");
  });

  test("daeese.me/apps/* -> 301 para apps.daeese.me", async () => {
    installFetchStub();
    const res = await worker.fetch(new Request("https://daeese.me/apps/illogicalwindows"), {});
    assert.equal(res.status, 301);
    assert.equal(res.headers.get("location"), "https://apps.daeese.me/illogicalwindows");
  });

  test("daeese.me em caminho sem redirect cadastrado vai direto a origem (passthrough)", async () => {
    installFetchStub();
    const res = await worker.fetch(new Request("https://daeese.me/index.html"), {});
    assert.equal(res.status, 200);
    assert.equal(calls.length, 1);
  });

  test("ccore.daeese.me/fun (endereco antigo do Sollarety) -> 301 definitivo para apps.daeese.me/sollarety", async () => {
    installFetchStub();

    const res1 = await worker.fetch(new Request("https://ccore.daeese.me/fun"), {});
    assert.equal(res1.status, 301);
    // Pathname bate "/fun" exatamente (sem resto): vai pra raiz do Sollarety.
    assert.equal(res1.headers.get("location"), "https://apps.daeese.me/sollarety/");

    const res2 = await worker.fetch(new Request("https://ccore.daeese.me/fun/invite?code=abc"), {});
    assert.equal(res2.status, 301);
    assert.equal(res2.headers.get("location"), "https://apps.daeese.me/sollarety/invite?code=abc");

    // Nenhum fetch de origem deveria ter rodado: o 301 tem que vencer antes.
    assert.equal(calls.length, 0);
  });

  test("raiz de apps.daeese.me sem pagina propria -> 302 para a secao do portfolio", async () => {
    installFetchStub();
    const res = await worker.fetch(new Request("https://apps.daeese.me/"), {});
    assert.equal(res.status, 302);
    assert.equal(res.headers.get("location"), "https://daeese.me/#work");
    assert.equal(calls.length, 0);
  });

  test("apps.daeese.me/sollarety busca /apps/sollarety na origem", async () => {
    installFetchStub();
    const res = await worker.fetch(new Request("https://apps.daeese.me/sollarety"), {});
    assert.equal(res.status, 200);
    assert.equal(calls.length, 1);
    assert.equal(new URL(calls[0].url).pathname, "/apps/sollarety");
    assert.equal(new URL(calls[0].url).hostname, "daeese.me");
  });

  test("apps.daeese.me/illogicalwindows busca /apps/illogicalwindows na origem", async () => {
    installFetchStub();
    const res = await worker.fetch(new Request("https://apps.daeese.me/illogicalwindows/"), {});
    assert.equal(res.status, 200);
    assert.equal(new URL(calls[0].url).pathname, "/apps/illogicalwindows/");
  });

  test("subrequisicao marca o guarda e nao disputa com redirects ao buscar a origem", async () => {
    installFetchStub();
    await worker.fetch(new Request("https://apps.daeese.me/sollarety"), {});
    assert.equal(calls[0].headers.get("x-site-router"), "1");
  });

  test("caminho que tenta escapar do prefixo devolve 400, sem chamar fetch", async () => {
    installFetchStub();
    const res = await worker.fetch(new Request("https://ccore.daeese.me/..%2f..%2fsecret"), {});
    assert.equal(res.status, 400);
    assert.equal(calls.length, 0);
  });

  test("robots.txt sintetico por host: admin libera rastreio, os demais apontam pro sitemap do proprio host", async () => {
    installFetchStub();

    const resDash = await worker.fetch(new Request("https://dashboard.daeese.me/robots.txt"), {});
    const bodyDash = await resDash.text();
    assert.match(bodyDash, /Allow: \//);
    assert.doesNotMatch(bodyDash, /Sitemap:/);

    const resCcore = await worker.fetch(new Request("https://ccore.daeese.me/robots.txt"), {});
    const bodyCcore = await resCcore.text();
    assert.match(bodyCcore, /Sitemap: https:\/\/ccore\.daeese\.me\/sitemap\.xml/);

    const resApps = await worker.fetch(new Request("https://apps.daeese.me/robots.txt"), {});
    const bodyApps = await resApps.text();
    assert.match(bodyApps, /Sitemap: https:\/\/apps\.daeese\.me\/sitemap\.xml/);

    assert.equal(calls.length, 0);
  });

  test("sitemap.xml do ccore nao lista mais o Sollarety", async () => {
    installFetchStub();
    const res = await worker.fetch(new Request("https://ccore.daeese.me/sitemap.xml"), {});
    const body = await res.text();
    assert.doesNotMatch(body, /sollarety/i);
    assert.match(body, /ccore\.daeese\.me\/status\//);
  });

  test("sitemap.xml do apps lista illogicalwindows e as paginas do Sollarety", async () => {
    installFetchStub();
    const res = await worker.fetch(new Request("https://apps.daeese.me/sitemap.xml"), {});
    const body = await res.text();
    assert.match(body, /apps\.daeese\.me\/illogicalwindows\//);
    assert.match(body, /apps\.daeese\.me\/sollarety\//);
    assert.match(body, /apps\.daeese\.me\/sollarety\/invite\//);
  });

  test("contexto administrativo carrega noindex e anti-enquadramento, por host e por caminho", async () => {
    installFetchStub();

    const resHost = await worker.fetch(new Request("https://dashboard.daeese.me/"), {});
    assert.equal(resHost.headers.get("X-Robots-Tag"), "noindex, nofollow");
    assert.equal(resHost.headers.get("Content-Security-Policy"), "frame-ancestors 'none'");
    assert.equal(resHost.headers.get("X-Frame-Options"), "DENY");

    // Mesmo conteudo, mas servido pela origem via passthrough: o caminho sozinho
    // tem que bastar para aplicar a protecao (isAdminContext tambem olha path).
    globalThis.fetch = async (input) => {
      const req = input instanceof Request ? input : new Request(input);
      calls.push({ url: req.url, headers: req.headers });
      return new Response("ok", { status: 200 });
    };
    const guardedReq = new Request("https://daeese.me/cornwallcore/administration/dashboard/x", {
      headers: { "x-site-router": "1" }
    });
    const resPath = await worker.fetch(guardedReq, {});
    assert.equal(resPath.headers.get("X-Robots-Tag"), "noindex, nofollow");
  });

  test("host normal nao carrega cabecalhos administrativos", async () => {
    installFetchStub();
    const res = await worker.fetch(new Request("https://apps.daeese.me/sollarety"), {});
    assert.equal(res.headers.get("X-Robots-Tag"), null);
  });

  test("x-github-request-id nunca vaza, qualquer host", async () => {
    installFetchStub();
    const res = await worker.fetch(new Request("https://apps.daeese.me/sollarety"), {});
    assert.equal(res.headers.get("x-github-request-id"), null);
    assert.equal(res.headers.get("x-served-by"), "daeese-site-router");
  });

  test("301 de barra final da origem volta reescrito para o subdominio", async () => {
    globalThis.fetch = async () =>
      new Response(null, { status: 301, headers: { location: "https://daeese.me/apps/illogicalwindows/" } });
    const res = await worker.fetch(new Request("https://apps.daeese.me/illogicalwindows"), {});
    assert.equal(res.status, 301);
    assert.equal(res.headers.get("location"), "https://apps.daeese.me/illogicalwindows/");

    globalThis.fetch = async () =>
      new Response(null, { status: 301, headers: { location: "https://daeese.me/cornwallcore/status/?a=1" } });
    const res2 = await worker.fetch(new Request("https://ccore.daeese.me/status?a=1"), {});
    assert.equal(res2.headers.get("location"), "https://ccore.daeese.me/status/?a=1");
  });

  test("Location fora do prefixo do host nao e reescrito", async () => {
    globalThis.fetch = async () =>
      new Response(null, { status: 302, headers: { location: "https://example.com/x" } });
    const res = await worker.fetch(new Request("https://apps.daeese.me/sollarety/x"), {});
    assert.equal(res.headers.get("location"), "https://example.com/x");
  });
});
