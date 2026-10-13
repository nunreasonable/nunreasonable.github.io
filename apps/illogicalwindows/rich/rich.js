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
 *  - a historia "Do Windows ao ii", presa na tela enquanto a pagina rola;
 *  - a corrida de inicializacao (mesma VM lenta, versoes diferentes);
 *  - o explorador de recursos (imagens de um recurso so);
 *  - "Testar no demo", linha do tempo das versoes e
 *    entradas suaves das secoes.
 * Tudo que fica em loop para fora da tela ou com a aba escondida.
 */

import { createDesktop } from "./desktop.js?v=20261013-1";
import { PRESETS, wallpaperUrl, drawThumb, presetTones, demoScheme, pageScheme, PAGE_KEYS, tonesFromFile } from "./palette.js?v=20261013-1";

const html = document.documentElement;
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const darkQuery = matchMedia("(prefers-color-scheme: dark)");
const WALL_KEY = "iw:wall";

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
	const walls = document.querySelectorAll(".demo-wall, .ss-wall-ii");
	const swatches = area.querySelector(".demo-swatches");
	const fileInput = area.querySelector(".demo-upload input");
	let tones = presetTones("rose");
	let demoDark = true;
	let current = "rose";
	let userUrl = null;

	function applyTones() {
		const d = demoScheme(tones, demoDark);
		for (const k in d) {
			stage.style.setProperty(k, d[k]);
			document.querySelectorAll(".story-stage").forEach((el) => el.style.setProperty(k, d[k]));
		}
		stage.classList.toggle("is-light", !demoDark);
		if (current === "rose" && !userUrl) {
			PAGE_KEYS.forEach((k) => html.style.removeProperty(k));
			return;
		}
		const p = pageScheme(tones, darkQuery.matches);
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
	choose(PRESETS.some((p) => p.id === saved) ? saved : "rose", false);

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

// --- Historia presa na tela ----------------------------------------------

function setupStory() {
	const story = document.getElementById("story");
	if (!story) return;
	const steps = [...story.querySelectorAll(".story-steps li")];
	const total = steps.length;
	let active = false;
	let raf = 0;
	let last = -1;

	function update() {
		raf = 0;
		const r = story.getBoundingClientRect();
		const span = r.height - innerHeight;
		const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
		story.style.setProperty("--p", p.toFixed(3));
		const step = Math.min(total - 1, Math.floor(p * total * 0.999));
		if (step !== last) {
			last = step;
			story.dataset.step = String(step);
			steps.forEach((li, i) => {
				li.classList.toggle("is-on", i === step);
				li.classList.toggle("is-past", i < step);
			});
		}
	}

	const onScroll = () => {
		if (active && !raf) raf = requestAnimationFrame(update);
	};
	const io = new IntersectionObserver((entries) => {
		active = entries[0].isIntersecting;
		if (active) onScroll();
	});
	io.observe(story);
	on(window, "scroll", onScroll, { passive: true });
	on(window, "resize", onScroll);
	update();
	cleanups.push(() => {
		io.disconnect();
		cancelAnimationFrame(raf);
	});
}

// --- Corrida de inicializacao ---------------------------------------------

function setupRace() {
	const race = document.getElementById("race");
	if (!race) return;
	const lanes = [...race.querySelectorAll(".race-lane")];
	const SPEED = 6; // 1 s na tela = 6 s na VM
	let raf = 0;
	let t0 = 0;

	function frame(now) {
		if (!t0) t0 = now;
		const simulated = ((now - t0) / 1000) * SPEED;
		let running = false;
		lanes.forEach((lane) => {
			const goal = Number(lane.dataset.seconds);
			const p = Math.min(1, simulated / goal);
			lane.style.setProperty("--race", p.toFixed(4));
			lane.querySelector(".race-time").textContent = `${Math.min(simulated, goal).toFixed(1)} s`;
			if (p >= 1 && !lane.classList.contains("is-done")) lane.classList.add("is-done");
			if (p < 1) running = true;
		});
		raf = running ? requestAnimationFrame(frame) : 0;
		if (!running) race.classList.add("is-finished");
	}

	function run() {
		cancelAnimationFrame(raf);
		t0 = 0;
		race.classList.remove("is-finished");
		lanes.forEach((lane) => {
			lane.classList.remove("is-done");
			lane.style.setProperty("--race", "0");
		});
		if (reduce.matches) {
			lanes.forEach((lane) => {
				lane.classList.add("is-done");
				lane.style.setProperty("--race", "1");
				lane.querySelector(".race-time").textContent = `${Number(lane.dataset.seconds).toFixed(1)} s`;
			});
			race.classList.add("is-finished");
			return;
		}
		raf = requestAnimationFrame(frame);
	}

	let started = false;
	const io = new IntersectionObserver((entries) => {
		if (entries[0].isIntersecting && !started) {
			started = true;
			run();
		}
	}, { threshold: 0.5 });
	io.observe(race);
	on(race.querySelector(".race-replay"), "click", run);
	cleanups.push(() => {
		io.disconnect();
		cancelAnimationFrame(raf);
	});
}

// --- Explorador de recursos --------------------------------------------------

function setupExplorer() {
	const box = document.getElementById("explore");
	if (!box) return;
	const tabs = [...box.querySelectorAll('[role="tab"]')];
	const panels = [...box.querySelectorAll('[role="tabpanel"]')];
	const frame = box.querySelector(".explore-frame");
	let index = 0;
	let timer = 0;
	let paused = false;
	let visible = false;

	function select(i, focus) {
		index = (i + tabs.length) % tabs.length;
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
		// Pre-carrega a proxima imagem.
		const next = panels[(index + 1) % panels.length].querySelector("img[data-src]");
		if (next) {
			next.src = next.dataset.src;
			next.removeAttribute("data-src");
		}
	}

	function schedule() {
		clearTimeout(timer);
		if (!visible || paused || reduce.matches || document.hidden) return;
		timer = setTimeout(() => {
			select(index + 1, false);
			schedule();
		}, 5200);
	}

	tabs.forEach((t, i) => on(t, "click", () => {
		select(i, false);
		paused = true;
		schedule();
	}));
	on(box.querySelector('[role="tablist"]'), "keydown", (e) => {
		const k = e.key;
		if (k !== "ArrowDown" && k !== "ArrowUp" && k !== "ArrowRight" && k !== "ArrowLeft") return;
		e.preventDefault();
		paused = true;
		select(index + (k === "ArrowDown" || k === "ArrowRight" ? 1 : -1), true);
	});
	on(box, "pointerenter", () => {
		paused = true;
		clearTimeout(timer);
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
		clearTimeout(timer);
		cancelAnimationFrame(raf);
		frame.style.transform = "";
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
		items.forEach((li) => li.classList.toggle("is-passed", li.getBoundingClientRect().top < mark));
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
		"main .section-head, main .card, main .features li, main .gallery figure, main .repo, .notice, .race, .explore-grid"
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

// --- "Testar no demo" ----------------------------------------------------

function setupTry(palette) {
	const demo = document.getElementById("demo-area");
	document.querySelectorAll("[data-try]").forEach((b) =>
		on(b, "click", () => {
			demo.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "center" });
			const stage = demo.querySelector(".demo");
			setTimeout(() => {
				stage.focus({ preventScroll: true });
				const what = b.dataset.try;
				if (what === "spot") desktop.spotlight("");
				else if (what === "overview") desktop.act("tab");
				else if (what === "tile") desktop.tileDemo();
				else if (what === "side") desktop.act("side");
				else if (what === "cheat") desktop.act("cheat");
				else if (what === "wall") palette.cycle();
				else if (what === "taskbar") desktop.showTaskbar();
			}, reduce.matches ? 0 : 450);
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
	setupStory();
	setupRace();
	setupExplorer();
	setupReleases();
	setupReveals();
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
