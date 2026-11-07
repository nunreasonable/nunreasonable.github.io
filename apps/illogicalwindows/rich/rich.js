/*
 * Modo completo da vitrine do II for Windows.
 *
 * A pagina sem este modulo e o modo leve (a pagina de sempre). Ele so e
 * importado quando o lite.js nao marcou html[data-lite], e start()/destroy()
 * ligam e desligam tudo sem recarregar: o botao "Efeitos" do cabecalho e a
 * deteccao automatica do lite.js podem trocar de modo a qualquer momento.
 *
 * Partes:
 *  - o mini ii jogavel (desktop.js) e os papeis de parede/cores (palette.js);
 *  - a apresentacao por cenas (showcase.js), ligada a rolagem;
 *  - a corrida de inicializacao (mesma VM lenta, versoes diferentes);
 *  - o explorador de recursos (imagens de um recurso so);
 *  - pergunta de publico, "Testar no demo", linha do tempo das versoes e
 *    entradas suaves das secoes.
 * Tudo que fica em loop para fora da tela ou com a aba escondida.
 */

import { setupShowcase } from "./showcase.js?v=20261107-3";

import { createDesktop } from "./desktop.js?v=20261107-2";
import { PRESETS, wallpaperUrl, drawThumb, presetTones, demoScheme, pageScheme, PAGE_KEYS, tonesFromFile } from "./palette.js?v=20261013-1";

const html = document.documentElement;
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const darkQuery = matchMedia("(prefers-color-scheme: dark)");
const WALL_KEY = "iw:wall:green";

let cleanups = [];
let desktop = null;

function on(el, type, fn, o) {
	el.addEventListener(type, fn, o);
	cleanups.push(() => el.removeEventListener(type, fn, o));
}

function readWall() {
	try {
		return localStorage.getItem(WALL_KEY);
	} catch (e) {
		return null;
	}
}

function saveWall(id) {
	try {
		localStorage.setItem(WALL_KEY, id);
	} catch (e) {
		// Sem armazenamento, a escolha vale so nesta visita.
	}
}

// --- Papel de parede e cores ---------------------------------------------

function setupPalette(area) {
	const stage = area.querySelector(".demo");
	const walls = document.querySelectorAll(".demo-wall");
	const swatches = area.querySelector(".demo-swatches");
	const fileInput = area.querySelector(".demo-upload input");
	let tones = presetTones("moss");
	let demoDark = true;
	let current = "moss";
	let userUrl = null;

	function applyTones() {
		const d = demoScheme(tones, demoDark);
		for (const k in d) {
			stage.style.setProperty(k, d[k]);
		}
		stage.classList.toggle("is-light", !demoDark);
		if (current === "moss" && !userUrl) {
			PAGE_KEYS.forEach((k) => html.style.removeProperty(k));
			return;
		}
		const p = pageScheme(tones, true);
		for (const k in p) html.style.setProperty(k, p[k]);
	}

	function setWallUrl(url) {
		walls.forEach((el) => (el.style.backgroundImage = `url("${url}")`));
	}

	async function choose(id, fromUser) {
		const preset = PRESETS.find((p) => p.id === id) || PRESETS[0];
		current = preset.id;
		if (userUrl) {
			URL.revokeObjectURL(userUrl);
			userUrl = null;
		}
		tones = presetTones(preset.id);
		swatches.querySelectorAll("[data-wall]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.wall === preset.id)));
		const url = await wallpaperUrl(preset);
		if (current !== preset.id) return;
		setWallUrl(url);
		applyTones();
		if (fromUser) {
			saveWall(preset.id);
			desktop && desktop.discover("wall", "coach.wall");
		}
	}

	async function useFile(file) {
		if (!file || !/^image\//.test(file.type)) return;
		stage.classList.add("is-busy");
		try {
			const res = await tonesFromFile(file);
			if (userUrl) URL.revokeObjectURL(userUrl);
			userUrl = res.url;
			current = "user";
			tones = res.tones;
			swatches.querySelectorAll("[data-wall]").forEach((b) => b.setAttribute("aria-checked", "false"));
			setWallUrl(res.url);
			applyTones();
			desktop && desktop.discover("wall", "coach.own");
		} catch (err) {
			desktop && desktop.discover("wall", "coach.ownFail");
		} finally {
			stage.classList.remove("is-busy");
		}
	}

	swatches.querySelectorAll("[data-wall]").forEach((b) => {
		const preset = PRESETS.find((p) => p.id === b.dataset.wall);
		const c = b.querySelector("canvas");
		if (preset && c) drawThumb(preset, c);
	});
	on(swatches, "click", (e) => {
		const b = e.target.closest("[data-wall]");
		if (b) choose(b.dataset.wall, true);
	});
	on(swatches, "keydown", (e) => {
		if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
		const list = [...swatches.querySelectorAll("[data-wall]")];
		const i = list.indexOf(document.activeElement);
		if (i < 0) return;
		e.preventDefault();
		const next = list[(i + (e.key === "ArrowRight" ? 1 : list.length - 1)) % list.length];
		next.focus();
		choose(next.dataset.wall, true);
	});
	on(fileInput, "change", () => {
		useFile(fileInput.files && fileInput.files[0]);
		fileInput.value = "";
	});

	// Soltar uma imagem em cima do desktop tambem vale.
	on(stage, "dragover", (e) => {
		if (![...(e.dataTransfer?.items || [])].some((i) => i.kind === "file")) return;
		e.preventDefault();
		stage.classList.add("is-drop");
	});
	on(stage, "dragleave", (e) => {
		if (!stage.contains(e.relatedTarget)) stage.classList.remove("is-drop");
	});
	on(stage, "drop", (e) => {
		e.preventDefault();
		stage.classList.remove("is-drop");
		useFile(e.dataTransfer.files && e.dataTransfer.files[0]);
	});
	on(darkQuery, "change", applyTones);

	const saved = readWall();
	choose(PRESETS.some((p) => p.id === saved) ? saved : "moss", false);

	return {
		setDark(dark) {
			demoDark = dark;
			applyTones();
		},
		cycle() {
			const i = PRESETS.findIndex((p) => p.id === current);
			choose(PRESETS[(i + 1) % PRESETS.length].id, true);
		},
		destroy() {
			PAGE_KEYS.forEach((k) => html.style.removeProperty(k));
			if (userUrl) URL.revokeObjectURL(userUrl);
		}
	};
}

// --- Corrida de inicializacao ---------------------------------------------

function setupRace() {
    const race = document.getElementById("race");
    if (!race) return;
    const lanes = [...race.querySelectorAll(".race-lane")].map((element) => ({
        element, goal: Number(element.dataset.seconds), label: element.querySelector(".race-time"), text: ""
    }));
    const SPEED = 6;
    let raf = 0;
    let elapsed = 0;
    let last = 0;
    let visible = false;
    let started = false;
    let finished = false;
    function paint(simulated) {
        let running = false;
        lanes.forEach((lane) => {
            const p = Math.min(1, simulated / lane.goal);
            if (!lane.element.classList.contains("is-done")) {
                lane.element.style.setProperty("--race", p.toFixed(4));
            }
            const text = `${Math.min(simulated, lane.goal).toFixed(1)} s`;
            if (text !== lane.text) { lane.label.textContent = text; lane.text = text; }
            lane.element.classList.toggle("is-done", p >= 1);
            if (p < 1) running = true;
        });
        finished = !running;
        race.classList.toggle("is-finished", finished);
    }
    function frame(now) {
        raf = 0;
        if (!visible || document.hidden) { last = 0; return; }
        if (last) elapsed += now - last;
        last = now;
        paint(elapsed / 1000 * SPEED);
        if (!finished) raf = requestAnimationFrame(frame);
    }
    function syncVisibility() {
        if (!visible || document.hidden) {
            cancelAnimationFrame(raf); raf = 0; last = 0;
        } else if (started && !finished && !raf) {
            raf = requestAnimationFrame(frame);
        }
    }
    function run() {
        cancelAnimationFrame(raf); raf = 0;
        elapsed = 0; last = 0; started = true; finished = false;
        lanes.forEach((lane) => lane.element.classList.remove("is-done"));
        paint(reduce.matches ? Infinity : 0);
        syncVisibility();
    }
    const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !started) run();
        else syncVisibility();
    }, {threshold: .5});
    io.observe(race);
    on(document, "visibilitychange", syncVisibility);
    on(race.querySelector(".race-replay"), "click", run);
    cleanups.push(() => { io.disconnect(); cancelAnimationFrame(raf); });
}

// --- Explorador de recursos --------------------------------------------------

function setupExplorer() {
	const box = document.getElementById("explore");
	if (!box) return;
	const tabs = [...box.querySelectorAll('[role="tab"]')];
	const panels = [...box.querySelectorAll('[role="tabpanel"]')];
	const list = box.querySelector('[role="tablist"]');
	const frame = box.querySelector(".explore-frame");
	const STEP = 5200;
	let index = 0;
	let timer = 0;
	let paused = false;
	let visible = false;
	// Tempo que falta na aba atual: pausar e voltar continua de onde parou,
	// junto com a barra de progresso (animation-play-state no CSS).
	let left = STEP;
	let since = 0;

	// Um indicador so, que desliza ate a aba escolhida (so transform).
	const ind = document.createElement("span");
	ind.className = "ex-ind";
	ind.setAttribute("aria-hidden", "true");
	list.prepend(ind);
	list.classList.add("is-paused");
	function place() {
		const t = tabs[index];
		ind.style.width = t.offsetWidth + "px";
		ind.style.height = t.offsetHeight + "px";
		ind.style.transform = `translate(${t.offsetLeft}px, ${t.offsetTop}px)`;
	}
	const ro = new ResizeObserver(place);
	ro.observe(list);
	tabs.forEach((t) => ro.observe(t));

	function select(i, focus) {
		index = (i + tabs.length) % tabs.length;
		clearTimeout(timer);
		timer = 0;
		left = STEP;
		tabs.forEach((t, j) => {
			t.setAttribute("aria-selected", String(j === index));
			t.tabIndex = j === index ? 0 : -1;
		});
		panels.forEach((p, j) => {
			const img = p.querySelector("img[data-src]");
			if (j === index && img) {
				img.src = img.dataset.src;
				img.removeAttribute("data-src");
			}
			p.classList.toggle("is-on", j === index);
			p.setAttribute("aria-hidden", String(j !== index));
		});
		if (focus) tabs[index].focus();
		place();
		// Mesma aba de novo (clique nela): a barra tambem volta ao comeco.
		if (list.getAnimations) list.getAnimations({ subtree: true }).forEach((a) => a.animationName === "ex-progress" && (a.currentTime = 0));
		// Pre-carrega a proxima imagem.
		const next = panels[(index + 1) % panels.length].querySelector("img[data-src]");
		if (next) {
			next.src = next.dataset.src;
			next.removeAttribute("data-src");
		}
	}

	function schedule() {
		if (timer) {
			clearTimeout(timer);
			timer = 0;
			left = Math.max(0, left - (performance.now() - since));
		}
		const run = visible && !paused && !reduce.matches && !document.hidden;
		list.classList.toggle("is-paused", !run);
		if (!run) return;
		since = performance.now();
		timer = setTimeout(() => {
			timer = 0;
			select(index + 1, false);
			schedule();
		}, left);
	}

	tabs.forEach((t, i) => on(t, "click", () => {
		select(i, false);
		paused = true;
		schedule();
	}));
	on(list, "keydown", (e) => {
		const k = e.key;
		if (k !== "ArrowDown" && k !== "ArrowUp" && k !== "ArrowRight" && k !== "ArrowLeft") return;
		e.preventDefault();
		paused = true;
		select(index + (k === "ArrowDown" || k === "ArrowRight" ? 1 : -1), true);
		schedule();
	});
	on(box, "pointerenter", () => {
		paused = true;
		schedule();
	});
	// Teclado tambem pausa: antes so o ponteiro pausava, e a aba trocava
	// sozinha debaixo de quem navegava com Tab.
	on(box, "focusin", () => {
		paused = true;
		schedule();
	});
	on(box, "focusout", (e) => {
		if (box.contains(e.relatedTarget)) return;
		paused = false;
		schedule();
	});
	on(box, "pointerleave", () => {
		paused = false;
		schedule();
	});

	// Inclina a moldura na direcao do ponteiro (so transform).
	let raf = 0;
	let px = 0;
	let py = 0;
	on(frame, "pointermove", (e) => {
		if (reduce.matches || e.pointerType !== "mouse") return;
		const r = frame.getBoundingClientRect();
		px = (e.clientX - r.left) / r.width - 0.5;
		py = (e.clientY - r.top) / r.height - 0.5;
		if (!raf)
			raf = requestAnimationFrame(() => {
				raf = 0;
				frame.style.transform = `perspective(1200px) rotateY(${px * 6}deg) rotateX(${-py * 5}deg)`;
			});
	});
	on(frame, "pointerleave", () => {
		frame.style.transform = "";
	});

	const io = new IntersectionObserver((entries) => {
		visible = entries[0].isIntersecting;
		schedule();
	});
	io.observe(box);
	on(document, "visibilitychange", schedule);
	select(0, false);
	cleanups.push(() => {
		io.disconnect();
		ro.disconnect();
		clearTimeout(timer);
		cancelAnimationFrame(raf);
		frame.style.transform = "";
		ind.remove();
		list.classList.remove("is-paused");
	});
}

// --- Linha do tempo das versoes ------------------------------------------

function setupReleases() {
	const list = document.querySelector(".releases");
	if (!list) return;
	const fill = document.createElement("span");
	fill.className = "rel-fill";
	fill.setAttribute("aria-hidden", "true");
	list.prepend(fill);
	const items = [...list.children].filter((el) => el.tagName === "LI");
	let raf = 0;
	let active = false;

	function update() {
		raf = 0;
		const r = list.getBoundingClientRect();
		const mark = innerHeight * 0.6;
		const p = Math.min(1, Math.max(0, (mark - r.top) / r.height));
		fill.style.transform = `scaleY(${p.toFixed(4)})`;
		items.forEach((li) => li.classList.toggle("is-passed", !li.hidden && li.getBoundingClientRect().top < mark));
	}
	const onScroll = () => {
		if (active && !raf) raf = requestAnimationFrame(update);
	};
	const io = new IntersectionObserver((entries) => {
		active = entries[0].isIntersecting;
		onScroll();
	});
	io.observe(list);
	on(window, "scroll", onScroll, { passive: true });
	update();
	cleanups.push(() => {
		io.disconnect();
		cancelAnimationFrame(raf);
		fill.remove();
		items.forEach((li) => li.classList.remove("is-passed"));
	});
}

// --- Entradas suaves ------------------------------------------------------

function setupReveals() {
	if (reduce.matches) return;
	const els = document.querySelectorAll(
		"main .section-head, main .card, main .features li, main .gallery figure, main .repo, .notice, .chooser, .race, .explore-grid"
	);
	const io = new IntersectionObserver(
		(entries) => {
			entries.forEach((e) => {
				if (!e.isIntersecting) return;
				e.target.classList.add("rv-in");
				io.unobserve(e.target);
			});
		},
		{ rootMargin: "0px 0px -8% 0px" }
	);
	els.forEach((el) => {
		// O que ja esta na tela no comeco nao anima.
		const r = el.getBoundingClientRect();
		if (r.top < innerHeight && r.bottom > 0) return;
		el.classList.add("rv");
		io.observe(el);
	});
	cleanups.push(() => {
		io.disconnect();
		els.forEach((el) => el.classList.remove("rv", "rv-in"));
	});
}

// --- Pergunta de publico e "Testar no demo" ------------------------------

// No modo completo a pergunta substitui as abas (que somem): os dois botoes
// grandes escolhem o publico, mostram qual esta valendo e trocam o painel
// com uma transicao.
function setupChooser() {
	const buttons = [...document.querySelectorAll(".chooser [data-choose]")];
	if (!buttons.length) return;
	const sync = () => {
		const aud = html.getAttribute("data-aud");
		buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.choose === aud)));
	};
	buttons.forEach((b) =>
		on(b, "click", () => {
			const aud = b.dataset.choose;
			const tab = document.getElementById(`tab-${aud}`);
			if (!tab) return;
			const changed = html.getAttribute("data-aud") !== aud;
			tab.click();
			const panel = document.getElementById(aud);
			if (!panel) return;
			reply(panel);
			if (changed && !reduce.matches && panel.animate) {
				panel.animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], {
					duration: 420,
					easing: "cubic-bezier(0.22, 1, 0.36, 1)"
				});
			}
			const top = panel.getBoundingClientRect().top;
			if (top > innerHeight * 0.75) panel.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "start" });
		})
	);
	// O balao de resposta "digita" um instante antes de falar.
	let typing = 0;
	function reply(panel) {
		const bubble = panel.querySelector(".reply");
		if (!bubble || reduce.matches) return;
		clearTimeout(typing);
		bubble.classList.add("is-typing");
		if (bubble.animate) {
			bubble.animate([{ transform: "scale(0.85)", opacity: 0 }, { transform: "none", opacity: 1 }], {
				duration: 240,
				easing: "cubic-bezier(0.2, 0, 0, 1)"
			});
		}
		typing = setTimeout(() => bubble.classList.remove("is-typing"), 700);
	}
	cleanups.push(() => {
		clearTimeout(typing);
		document.querySelectorAll(".reply.is-typing").forEach((b) => b.classList.remove("is-typing"));
	});

	const mo = new MutationObserver(sync);
	mo.observe(html, { attributes: true, attributeFilter: ["data-aud"] });
	cleanups.push(() => mo.disconnect());
	sync();
}

// A captura da cena voa ate onde o recurso abre no demo (FLIP), enquanto a
// pagina pula direto para la. Com rolagem suave junto, o fim da rolagem nao
// tem hora certa e o clone chegava antes ou depois do demo; com o salto, o
// olho segue o clone e so transform/opacity se mexem.
const TRY_PANEL = { spot: ".demo-spot", side: ".demo-side" };

function setupTry(palette) {
	const timers = new Set();
	const demo = document.getElementById("demo-area");
	const stage = demo.querySelector(".demo");
	let ghost = null;
	function dropGhost() {
		if (ghost) ghost.remove();
		ghost = null;
	}
	cleanups.push(() => {
		timers.forEach(clearTimeout);
		dropGhost();
	});

	// Centraliza o desktop do demo abaixo do cabecalho (56px), para o painel
	// que vai abrir ficar inteiro na tela; se nao couber, encosta no topo.
	function jump() {
		const r = stage.getBoundingClientRect();
		const room = innerHeight - 56;
		scrollTo({ top: scrollY + r.top - 56 - Math.max(0, (room - r.height) / 2), behavior: "instant" });
	}

	function open(what) {
		if (!desktop) return;
		stage.focus({ preventScroll: true });
		if (what === "spot") desktop.spotlight("");
		else if (what === "overview") desktop.act("tab");
		else if (what === "tile") desktop.tileDemo();
		else if (what === "side") desktop.act("side");
		else if (what === "cheat") desktop.act("cheat");
		else if (what === "wall") palette.cycle();
		else if (what === "taskbar") desktop.showTaskbar();
	}

	// Caixa final do painel que vai abrir. offset* ignora o transform de
	// fechado; o Spotlight se centraliza com translate(-50%).
	function target(what) {
		const s = stage.getBoundingClientRect();
		const el = TRY_PANEL[what] && stage.querySelector(TRY_PANEL[what]);
		if (!el) return s;
		let x = 0;
		let y = 0;
		for (let n = el; n && n !== stage; n = n.offsetParent) {
			x += n.offsetLeft;
			y += n.offsetTop;
		}
		if (what === "spot") x -= el.offsetWidth / 2;
		return { left: s.left + x, top: s.top + y, width: el.offsetWidth, height: el.offsetHeight };
	}

	function fly(img, from, what) {
		const to = target(what);
		// A captura inteira cabe no alvo (contain), sem distorcer.
		const k = Math.min(to.width / from.width, to.height / from.height);
		const w = from.width * k;
		const h = from.height * k;
		const left = to.left + (to.width - w) / 2;
		const top = to.top + (to.height - h) / 2;
		dropGhost();
		const g = img.cloneNode(false);
		g.removeAttribute("loading");
		g.removeAttribute("data-i18n-attr");
		g.alt = "";
		g.setAttribute("aria-hidden", "true");
		g.className = "try-ghost";
		// O raio encolhe junto com a escala: no comeco ele bate com o da cena.
		g.style.cssText = `left:${left}px;top:${top}px;width:${w}px;height:${h}px;border-radius:${(18 * k).toFixed(1)}px`;
		document.body.append(g);
		ghost = g;
		g.animate(
			[
				{ transform: `translate(${from.left - left}px, ${from.top - top}px) scale(${1 / k})`, opacity: 1 },
				{ opacity: 1, offset: 0.5 },
				{ transform: "none", opacity: 0 }
			],
			{ duration: 420, easing: "cubic-bezier(0.2, 0, 0, 1)" }
		).finished.then(() => g === ghost && dropGhost(), () => {});
	}

	document.querySelectorAll("[data-try]").forEach((b) =>
		on(b, "click", (event) => {
			event.preventDefault();
			const what = b.dataset.try;
			timers.forEach(clearTimeout);
			timers.clear();
			if (reduce.matches) {
				jump();
				open(what);
				return;
			}
			const scene = b.closest(".journey-scene");
			const img = scene && scene.querySelector(".journey-visual img");
			// Mede antes do salto: depois dele a cena ja saiu da tela.
			const from = img && img.complete && img.naturalWidth ? img.getBoundingClientRect() : null;
			jump();
			if (from && from.width && from.height) fly(img, from, what);
			if (stage.animate) {
				stage.animate([{ transform: "scale(0.96)", opacity: 0.6 }, { transform: "none", opacity: 1 }], {
					duration: 300,
					easing: "cubic-bezier(0.2, 0, 0, 1)"
				});
			}
			// O painel comeca a aparecer quando o clone ja esta chegando.
			const timer = setTimeout(() => {
				timers.delete(timer);
				open(what);
			}, 120);
			timers.add(timer);
		})
	);
}

// --- Liga e desliga ----------------------------------------------------------

export function start() {
	if (desktop) return;
	cleanups = [];
	const area = document.getElementById("demo-area");
	let palette = null;
	desktop = createDesktop(area, {
		onDark: (dark) => palette && palette.setDark(dark)
	});
	palette = setupPalette(area);
	cleanups.push(() => palette.destroy());
	cleanups.push(setupShowcase());
	setupRace();
	setupExplorer();
	setupReleases();
	setupReveals();
	setupChooser();
	setupTry(palette);
	on(window, "resize", () => desktop && desktop.relayout());
	html.classList.add("rich-ready");
}

export function destroy() {
	if (!desktop) return;
	desktop.destroy();
	desktop = null;
	cleanups.forEach((f) => f());
	cleanups = [];
	html.classList.remove("rich-ready");
}
