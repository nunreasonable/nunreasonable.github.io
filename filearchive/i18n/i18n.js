/*
 * Seletor de idioma das paginas dos bots (ccore e Sollarety).
 *
 * O ingles continua sendo a fonte da verdade: ele mora no proprio HTML, e o que
 * este modulo carrega e SO o dicionario de portugues. Isso tem duas
 * consequencias boas - a pagina continua legivel e indexavel sem JavaScript
 * nenhum, e uma chave sem traducao simplesmente mostra o texto original em vez
 * de aparecer como `algum.identificador` na cara do visitante.
 *
 * Marcacao esperada:
 *
 *   <p data-i18n="hero.subtitle">The English text.</p>
 *   <img data-i18n-attr="alt:hero.imageAlt" alt="English alt" />
 *   <div data-i18n-switcher></div>
 *
 * O `lang` do <html> acompanha a escolha, entao leitor de tela e corretor
 * ortografico mudam junto - trocar o texto e deixar lang="en" faria o leitor de
 * tela ler portugues com fonemas ingleses.
 */

import translatejs from "../vendor/translate.js";

const STORAGE_KEY = "daeese:lang";
const SUPPORTED = ["en", "pt"];
const DEFAULT_LANG = "en";

/**
 * Idioma inicial: escolha salva > idioma do navegador > ingles.
 *
 * O acesso ao localStorage vai dentro de try/catch porque ele LANCA (nao
 * devolve null) em janela anonima com cookies bloqueados e em alguns modos de
 * privacidade - e uma excecao aqui deixaria a pagina inteira sem tradutor.
 */
function readStoredLang() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return SUPPORTED.includes(stored) ? stored : null;
  } catch {
    return null;
  }
}

function writeStoredLang(lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Preferencia nao persistida e um aborrecimento, nao um erro: a pagina
    // continua funcionando com a escolha valendo so nesta aba.
  }
}

function detectLang() {
  const stored = readStoredLang();
  if (stored) return stored;

  const navigatorLangs = navigator.languages || [navigator.language || ""];
  for (const raw of navigatorLangs) {
    const base = String(raw).toLowerCase().split("-")[0];
    if (SUPPORTED.includes(base)) return base;
  }

  return DEFAULT_LANG;
}

/**
 * Le o ingles direto do DOM e monta o dicionario base.
 *
 * Roda UMA vez, antes de qualquer traducao ser aplicada - depois disso o texto
 * na tela pode ja ser o portugues, e reler dali produziria um "ingles" errado.
 *
 * RESTRICAO: usa el.textContent, entao um elemento com data-i18n que contenha
 * um filho (um <a>, um <strong>) perde esse filho na primeira traducao -
 * applyTranslations sobrescreve com texto puro. Frases com link dentro precisam
 * ser partidas em <span data-i18n> intercalados com a ancora (ver
 * cornwallcore/index.html e a pagina de status). E tambem por isso texto AO VIVO
 * (reescrito por JS a cada tick) NAO deve usar data-i18n: seria sobrescrito.
 */
function captureEnglish(root) {
  const dict = {};

  root.querySelectorAll("[data-i18n]").forEach((el) => {
    dict[el.dataset.i18n] = el.textContent.trim();
  });

  root.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    for (const [attr, key] of parseAttrMap(el.dataset.i18nAttr)) {
      dict[key] = el.getAttribute(attr) || "";
    }
  });

  return dict;
}

/** "alt:hero.img,title:hero.title" -> [["alt","hero.img"], ["title","hero.title"]] */
function parseAttrMap(spec) {
  return String(spec || "")
    .split(",")
    .map((pair) => pair.split(":").map((part) => part.trim()))
    .filter(([attr, key]) => attr && key);
}

function applyTranslations(root, t) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  root.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    for (const [attr, key] of parseAttrMap(el.dataset.i18nAttr)) {
      el.setAttribute(attr, t(key));
    }
  });
}

const LABELS = {
  en: { en: "English", pt: "Português", legend: "Language" },
  pt: { en: "English", pt: "Português", legend: "Idioma" }
};

function renderSwitcher(container, current, onSelect) {
  container.textContent = "";
  container.classList.add("i18n-switcher");

  // role=group + aria-label: sao dois botoes que so fazem sentido juntos, e sem
  // o rotulo o leitor de tela anuncia "English, botao" sem dizer do que se
  // trata.
  container.setAttribute("role", "group");
  container.setAttribute("aria-label", LABELS[current].legend);

  for (const lang of SUPPORTED) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "i18n-switcher__btn";
    button.lang = lang;
    button.textContent = LABELS[current][lang];
    button.dataset.lang = lang;

    // aria-pressed, e nao so uma classe: a cor sozinha nao diz a um leitor de
    // tela qual idioma esta ativo.
    button.setAttribute("aria-pressed", String(lang === current));
    if (lang === current) button.classList.add("is-active");

    button.addEventListener("click", () => onSelect(lang));
    container.appendChild(button);
  }
}

/**
 * Liga o seletor na pagina.
 *
 * @param {object} dictionaries - { pt: { chave: "texto" } }. O ingles nao entra:
 *   ele e lido do proprio HTML.
 */
export function setupI18n(dictionaries = {}) {
  const root = document.body;
  const english = captureEnglish(root);

  const tables = { en: english };
  for (const [lang, dict] of Object.entries(dictionaries)) {
    // Espalha o ingles por baixo: chave sem traducao cai no original em vez de
    // sumir da tela.
    tables[lang] = { ...english, ...dict };
  }

  let current = detectLang();
  if (!tables[current]) current = DEFAULT_LANG;

  const switcher = document.querySelector("[data-i18n-switcher]");

  function activate(lang) {
    current = tables[lang] ? lang : DEFAULT_LANG;

    const t = translatejs(tables[current]);
    applyTranslations(root, t);

    // pt-BR e nao pt: e a variante que o conteudo usa, e alguns leitores de
    // tela escolhem a voz por esse valor.
    document.documentElement.lang = current === "pt" ? "pt-BR" : "en";

    // Avisa quem gera texto AO VIVO (ex.: a pagina /status, que reescreve o
    // titulo a cada 15s) para reaplicar no novo idioma. Esse texto nao pode usar
    // data-i18n - o applyTranslations sobrescreveria o valor vivo pelo do
    // dicionario, e o proximo tick o traria de volta, um puxa-empurra sem fim.
    document.dispatchEvent(new CustomEvent("i18n:change", { detail: { lang: current } }));

    // Propaga para iframes filhos same-origin. As paginas de ToS/Privacidade sao
    // uma casca com o texto dentro de um <iframe src="./pp.html">, e o iframe tem
    // seu proprio i18n: trocar o idioma na casca nao o alcancava, entao o
    // cabecalho ficava traduzido e a politica inteira seguia em ingles ate o
    // proximo reload. O iframe le o mesmo localStorage no load; isto cobre a
    // troca AO VIVO. targetOrigin explicito para nao vazar a outra origem.
    for (const frame of document.querySelectorAll("iframe")) {
      try {
        if (frame.contentWindow) {
          frame.contentWindow.postMessage({ type: "daeese:i18n", lang: current }, window.location.origin);
        }
      } catch {
        // iframe de outra origem: sem acesso, e nao e nosso para sincronizar.
      }
    }

    if (switcher) renderSwitcher(switcher, current, select);
  }

  // Recebe a troca vinda da casca (ver o postMessage acima). So aceita a propria
  // origem e um idioma conhecido; nao responde nada, entao nao ha laco.
  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) return;
    const data = event.data;
    if (data && data.type === "daeese:i18n" && tables[data.lang]) {
      activate(data.lang);
    }
  });

  function select(lang) {
    writeStoredLang(lang);
    activate(lang);
  }

  activate(current);
}


/*
 * Auto-arranque a partir da propria tag <script>.
 *
 *   <script type="module" src="../filearchive/i18n/i18n.js"
 *           data-dict="dict/sollarety.js"></script>
 *
 * Assim nenhuma pagina precisa de <script> inline - que e o que quebraria
 * primeiro no dia em que estas paginas ganharem uma CSP com script-src 'self',
 * como o dashboard ja tem.
 *
 * `document.currentScript` NAO serve aqui: em modulo ele e sempre null, por
 * definicao. Dai a busca pela tag.
 *
 * O data-dict e resolvido contra import.meta.url, isto e, relativo a ESTE
 * modulo - os dicionarios moram ao lado dele. Resolver contra a pagina obrigaria
 * cada uma a escrever um `../` diferente, porque elas estao em profundidades
 * diferentes (/fun/, /privacypolicy/, /fun/termsofservice/).
 */
const selfScript = document.querySelector("script[data-dict][src$='i18n.js']");

if (selfScript) {
  const dictUrl = new URL(selfScript.dataset.dict, import.meta.url).href;
  import(dictUrl)
    .then((mod) => setupI18n({ pt: mod.pt || mod.default || {} }))
    .catch((err) => {
      // Falhar aqui deixa a pagina em ingles, que e o estado util: o conteudo
      // ja esta no HTML. Nao ha por que quebrar nada alem do seletor.
      console.warn("[i18n] dicionario nao carregou:", err);
    });
}
