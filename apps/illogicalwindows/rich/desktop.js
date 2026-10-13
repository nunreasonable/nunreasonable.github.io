/*
 * O mini ii jogavel do topo da pagina.
 *
 * Tudo e DOM (nada de canvas), para o texto ficar nitido e traduzivel: a
 * marcacao fixa (barra, Spotlight, overview, cheatsheet, sidebar, barra de
 * tarefas) ja vem no HTML com data-i18n, e aqui so entram as janelas e o
 * comportamento.
 *
 * Teclas, com o demo em foco (o navegador no Windows nunca recebe a tecla
 * Win, o sistema fica com ela): Espaco = Win (Spotlight), Enter = Win+Enter,
 * Q = Win+Q, Tab = Win+Tab, / = Win+/, 1-3 = Win+1-3, Esc fecha ou sai. Onde
 * o navegador entrega a tecla Meta, Meta+tecla funciona igual.
 *
 * O "coach" fala com o visitante: reage ao que ele faz e conta o que falta
 * descobrir. As frases moram no bloco #iw-strings (data-i18n), entao trocam
 * de idioma junto com a pagina.
 */

const APPS = ["terminal", "files", "notes", "music", "settings"];
const MAX_WINDOWS = 5;
const GAP = 8;
const GOALS = ["spot", "tile", "overview", "cheat", "side", "wall", "taskbar"];

export function createDesktop(root, opts) {
	const $ = (sel) => root.querySelector(sel);
	const stage = $(".demo");
	const winLayer = $(".demo-windows");
	const spot = $(".demo-spot");
	const spotInput = $(".demo-spot input");
	const spotList = $(".demo-spot-list");
	const overview = $(".demo-overview");
	const ovGrid = $(".demo-ov-grid");
	const cheat = $(".demo-cheat");
	const side = $(".demo-side");
	const scrim = $(".demo-scrim");
	const taskbar = $(".demo-taskbar");
	const coachText = $(".demo-coach-text");
	const coach = $(".demo-coach");
	const toast = $(".demo-toast");
	const progressText = root.querySelector(".demo-progress-text");
	const progressBar = root.querySelector(".demo-progress-bar");
	const reduce = matchMedia("(prefers-reduced-motion: reduce)");
	const cleanups = [];

	const on = (el, type, fn, o) => {
		el.addEventListener(type, fn, o);
		cleanups.push(() => el.removeEventListener(type, fn, o));
	};

	// --- Textos ------------------------------------------------------------
	const S = (key, vars) => {
		const el = document.querySelector(`#iw-strings [data-s="${key}"]`);
		let text = el ? el.textContent.trim() : key;
		if (vars) for (const k in vars) text = text.split(`{${k}}`).join(vars[k]);
		return text;
	};

	// --- Estado ------------------------------------------------------------
	const workspaces = [[], [], []];
	let ws = 0;
	let focused = null;
	let nextApp = 0;
	let open = null; // "spot" | "overview" | "cheat" | "side" | null
	let coachKey = null;
	let coachVars = null;
	const found = new Set();
	let uid = 0;

	// --- Coach -------------------------------------------------------------
	function say(key, vars) {
		coachKey = key;
		coachVars = vars || null;
		coachText.textContent = S(key, vars);
		if (!reduce.matches && coach.animate) {
			coach.animate([{ transform: "translateY(4px) scale(0.98)", opacity: 0.6 }, { transform: "none", opacity: 1 }], {
				duration: 260,
				easing: "cubic-bezier(0.22, 1, 0.36, 1)"
			});
		}
	}

	function renderProgress() {
		progressText.textContent = S("progress", { n: found.size, total: GOALS.length });
		progressBar.style.transform = `scaleX(${found.size / GOALS.length})`;
	}

	function discover(goal) {
		if (found.has(goal)) return false;
		found.add(goal);
		renderProgress();
		if (found.size === GOALS.length) {
			setTimeout(() => {
				say("coach.done");
				stage.classList.add("is-done");
			}, 1600);
		}
		opts.onDiscover && opts.onDiscover(goal, found.size);
		return true;
	}

	let toastTimer = 0;
	function showToast(text) {
		toast.textContent = text;
		toast.classList.add("show");
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
	}

	// --- Janelas -------------------------------------------------------------
	function appTitle(app) {
		return S(`app.${app}`);
	}

	function buildContent(app) {
		const c = document.createElement("div");
		c.className = `dw-body dw-${app}`;
		if (app === "terminal") {
			c.innerHTML =
				'<p><span class="dw-prompt">PS C:\\Users\\you&gt;</span> <span class="dw-typed"></span></p>' +
				'<div class="dw-fetch" hidden><span class="dw-logo" aria-hidden="true"></span><p>' +
				"<b>ii</b>@windows<br/><b>OS</b> Windows 11<br/><b>Shell</b> Quickshell<br/><b>Theme</b> Material You<br/>" +
				'<span class="dw-swatches"><i></i><i></i><i></i><i></i></span></p></div>';
			const typed = c.querySelector(".dw-typed");
			const fetch = c.querySelector(".dw-fetch");
			const cmd = "fastfetch";
			if (reduce.matches) {
				typed.textContent = cmd;
				fetch.hidden = false;
			} else {
				let i = 0;
				const t = setInterval(() => {
					typed.textContent = cmd.slice(0, ++i);
					if (i >= cmd.length) {
						clearInterval(t);
						setTimeout(() => (fetch.hidden = false), 180);
					}
				}, 55);
				cleanups.push(() => clearInterval(t));
			}
		} else if (app === "files") {
			const names = ["files.docs", "files.pics", "files.music", "files.down", "files.video", "files.proj"];
			c.innerHTML = names.map((k) => `<span class="dw-file"><i aria-hidden="true"></i><span data-s-live="${k}">${S(k)}</span></span>`).join("");
		} else if (app === "notes") {
			c.innerHTML = `<p data-s-live="notes.text">${S("notes.text")}</p>`;
		} else if (app === "music") {
			c.innerHTML =
				'<span class="dw-cover" aria-hidden="true"></span><p><b>Lo-fi beats</b><br/>ii radio</p>' +
				'<span class="dw-viz" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>';
		} else if (app === "settings") {
			c.innerHTML =
				`<p class="dw-row"><span data-s-live="side.dark">${S("side.dark")}</span><span class="dw-switch on"></span></p>` +
				`<p class="dw-row"><span data-s-live="side.night">${S("side.night")}</span><span class="dw-switch"></span></p>` +
				`<p class="dw-row"><span data-s-live="settings.style">${S("settings.style")}</span><span class="dw-chip">Float</span></p>`;
		}
		return c;
	}

	function createWindow(app) {
		const el = document.createElement("div");
		el.className = "dw";
		el.dataset.app = app;
		el.dataset.id = String(++uid);
		el.innerHTML = `<div class="dw-title"><span class="dw-name" data-s-live="app.${app}">${appTitle(app)}</span><button type="button" class="dw-close" tabindex="-1" aria-hidden="true"></button></div>`;
		el.appendChild(buildContent(app));
		return el;
	}

	function rects(count) {
		const w = winLayer.clientWidth;
		const h = winLayer.clientHeight;
		let r = { x: GAP, y: GAP, w: w - GAP * 2, h: h - GAP * 2 };
		const out = [];
		for (let i = 0; i < count; i++) {
			if (i === count - 1) {
				out.push(r);
				break;
			}
			// Dwindle: divide o espaco livre pelo lado maior, a nova janela fica
			// com a segunda metade (como o Hyprland faz por padrao).
			if (r.w >= r.h) {
				const half = (r.w - GAP) / 2;
				out.push({ x: r.x, y: r.y, w: half, h: r.h });
				r = { x: r.x + half + GAP, y: r.y, w: half, h: r.h };
			} else {
				const half = (r.h - GAP) / 2;
				out.push({ x: r.x, y: r.y, w: r.w, h: half });
				r = { x: r.x, y: r.y + half + GAP, w: r.w, h: half };
			}
		}
		return out;
	}

	// FLIP: mede antes, aplica o layout novo e anima so transform.
	function layout(animate = true) {
		const list = workspaces[ws];
		const before = new Map(list.map((el) => [el, el.isConnected && el.style.width ? el.getBoundingClientRect() : null]));
		const rs = rects(list.length);
		list.forEach((el, i) => {
			const r = rs[i];
			el.style.left = r.x + "px";
			el.style.top = r.y + "px";
			el.style.width = r.w + "px";
			el.style.height = r.h + "px";
		});
		if (!animate || reduce.matches) return;
		list.forEach((el) => {
			const a = before.get(el);
			const b = el.getBoundingClientRect();
			if (!a) {
				el.animate([{ transform: "scale(0.86)", opacity: 0 }, { transform: "none", opacity: 1 }], {
					duration: 320,
					easing: "cubic-bezier(0.22, 1, 0.36, 1)"
				});
				return;
			}
			if (!b.width || !b.height) return;
			const dx = a.left - b.left;
			const dy = a.top - b.top;
			const sx = a.width / b.width;
			const sy = a.height / b.height;
			if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) return;
			el.animate([{ transformOrigin: "0 0", transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` }, { transformOrigin: "0 0", transform: "none" }], {
				duration: 360,
				easing: "cubic-bezier(0.22, 1, 0.36, 1)"
			});
		});
	}

	function setFocus(el) {
		focused = el;
		workspaces[ws].forEach((w) => w.classList.toggle("is-focused", w === el));
	}

	function spawn(app, quiet) {
		const list = workspaces[ws];
		if (list.length >= MAX_WINDOWS) {
			say("coach.full");
			return;
		}
		const name = app || APPS[nextApp++ % APPS.length];
		const el = createWindow(name);
		winLayer.appendChild(el);
		list.push(el);
		setFocus(el);
		layout();
		if (quiet) return;
		if (discover("tile")) say("coach.tiled");
		else say(list.length >= 4 ? "coach.many" : "coach.more");
	}

	function closeWindow(el) {
		const list = workspaces[ws];
		const target = el || focused || list[list.length - 1];
		if (!target) {
			say("coach.nothing");
			return;
		}
		const i = list.indexOf(target);
		if (i < 0) return;
		list.splice(i, 1);
		const finish = () => target.remove();
		if (reduce.matches || !target.animate) finish();
		else {
			target.style.pointerEvents = "none";
			target.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(0.9)" }], { duration: 180, easing: "ease-in" }).onfinish = finish;
		}
		setFocus(list[Math.min(i, list.length - 1)] || null);
		layout();
		say("coach.closed");
	}

	function switchWorkspace(i) {
		if (i === ws || i < 0 || i > 2) return;
		const dir = i > ws ? 1 : -1;
		const old = workspaces[ws];
		old.forEach((el) => (el.style.display = "none"));
		ws = i;
		workspaces[ws].forEach((el) => (el.style.display = ""));
		root.querySelectorAll(".demo-ws button").forEach((b, j) => {
			b.classList.toggle("on", j === ws);
			b.setAttribute("aria-pressed", String(j === ws));
		});
		layout(false);
		setFocus(workspaces[ws][workspaces[ws].length - 1] || null);
		if (!reduce.matches && winLayer.animate) {
			winLayer.animate([{ transform: `translateX(${dir * 6}%)`, opacity: 0 }, { transform: "none", opacity: 1 }], {
				duration: 300,
				easing: "cubic-bezier(0.22, 1, 0.36, 1)"
			});
		}
	}

	// Arrastar pelo titulo troca a janela de lugar com a que estiver embaixo
	// (o Win + arrastar do ii, em versao de bolso).
	let drag = null;
	on(winLayer, "pointerdown", (e) => {
		const win = e.target.closest(".dw");
		if (!win) return;
		setFocus(win);
		if (e.target.closest(".dw-close")) return;
		if (!e.target.closest(".dw-title") || e.button !== 0) return;
		e.preventDefault();
		drag = { win, x: e.clientX, y: e.clientY, moved: false };
		win.setPointerCapture(e.pointerId);
	});
	on(winLayer, "pointermove", (e) => {
		if (!drag) return;
		const dx = e.clientX - drag.x;
		const dy = e.clientY - drag.y;
		if (!drag.moved && Math.hypot(dx, dy) < 4) return;
		drag.moved = true;
		drag.win.classList.add("is-dragging");
		drag.win.style.transform = `translate(${dx}px, ${dy}px)`;
	});
	const endDrag = (e) => {
		if (!drag) return;
		const { win, moved } = drag;
		drag = null;
		win.classList.remove("is-dragging");
		win.style.transform = "";
		if (!moved) return;
		win.style.visibility = "hidden";
		const under = document.elementFromPoint(e.clientX, e.clientY);
		win.style.visibility = "";
		const other = under && under.closest(".dw");
		const list = workspaces[ws];
		if (other && other !== win && list.includes(other)) {
			const a = list.indexOf(win);
			const b = list.indexOf(other);
			list[a] = other;
			list[b] = win;
			say("coach.swapped");
		}
		layout();
	};
	on(winLayer, "pointerup", endDrag);
	on(winLayer, "pointercancel", endDrag);
	on(winLayer, "click", (e) => {
		const btn = e.target.closest(".dw-close");
		if (btn) closeWindow(btn.closest(".dw"));
	});

	// --- Paineis ---------------------------------------------------------
	function setPanel(name) {
		const panels = { spot, overview, cheat, side };
		open = name;
		for (const k in panels) panels[k].toggleAttribute("data-open", k === name);
		scrim.toggleAttribute("data-open", name === "spot" || name === "overview" || name === "cheat");
		stage.dataset.panel = name || "";
		if (name === "spot") {
			spotInput.value = "";
			renderSpot();
			setTimeout(() => spotInput.focus({ preventScroll: true }), 0);
		} else if (document.activeElement === spotInput || (document.activeElement && side.contains(document.activeElement))) {
			stage.focus({ preventScroll: true });
		}
		if (name === "overview") renderOverview();
	}

	function toggle(name) {
		setPanel(open === name ? null : name);
	}

	// --- Spotlight ---------------------------------------------------------
	const EMOJI = [
		["\u2728", "sparkles brilho magic"],
		["\uD83C\uDF89", "party festa tada"],
		["\uD83D\uDD25", "fire fogo lit"],
		["\u2764\uFE0F", "heart coracao love amor"],
		["\uD83D\uDE02", "joy laugh rir risada"],
		["\uD83D\uDC4D", "thumbs up joinha ok"],
		["\uD83D\uDE80", "rocket foguete"],
		["\uD83C\uDF19", "moon lua night noite"]
	];
	const ACTIONS = ["lock", "sleep", "restart", "shutdown"];
	const CLIP = ["git clone https://github.com/nunreasonable/ii-windows", "Win + Tab"];
	let spotItems = [];
	let spotSel = 0;

	function norm(s) {
		return s
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "");
	}

	function mathResult(q) {
		if (!/^[\d\s+\-*/().,%^]+$/.test(q) || !/\d/.test(q) || !/[+\-*/^%]/.test(q)) return null;
		try {
			const expr = q.replace(/,/g, ".").replace(/\^/g, "**");
			const v = Function(`"use strict"; return (${expr});`)();
			if (typeof v !== "number" || !isFinite(v)) return null;
			return Math.round(v * 1e6) / 1e6;
		} catch (err) {
			return null;
		}
	}

	function renderSpot() {
		const q = spotInput.value.trim();
		const nq = norm(q);
		const items = [];
		const math = mathResult(q);
		if (math !== null) items.push({ kind: "math", label: `= ${math}`, run: () => showToast(S("toast.copied", { x: String(math) })) });
		APPS.forEach((app) => {
			const label = appTitle(app);
			if (!nq || norm(label).includes(nq) || app.includes(nq)) items.push({ kind: "app", label, app, run: () => spawn(app) });
		});
		ACTIONS.forEach((a) => {
			const label = S(`act.${a}`);
			if (nq && (norm(label).includes(nq) || a.includes(nq))) items.push({ kind: "act", label, run: () => showToast(S("toast.action")) });
		});
		EMOJI.forEach(([e, kw]) => {
			if (nq && kw.split(" ").some((k) => k.startsWith(nq))) items.push({ kind: "emoji", label: `${e}  ${kw.split(" ")[0]}`, run: () => showToast(S("toast.copied", { x: e })) });
		});
		CLIP.forEach((c) => {
			if (nq && norm(c).includes(nq)) items.push({ kind: "clip", label: c, run: () => showToast(S("toast.copied", { x: c })) });
		});
		if (q) items.push({ kind: "web", label: S("spot.web", { q }), run: () => showToast(S("toast.web")) });
		spotItems = items.slice(0, 7);
		spotSel = Math.min(spotSel, Math.max(0, spotItems.length - 1));
		spotList.innerHTML = "";
		spotItems.forEach((it, i) => {
			const li = document.createElement("li");
			li.className = "demo-spot-item" + (i === spotSel ? " sel" : "");
			li.setAttribute("role", "option");
			li.setAttribute("aria-selected", String(i === spotSel));
			li.dataset.kind = it.kind;
			li.dataset.i = String(i);
			const tag = document.createElement("span");
			tag.className = "demo-spot-kind";
			tag.textContent = S(`kind.${it.kind}`);
			const label = document.createElement("span");
			label.textContent = it.label;
			li.append(label, tag);
			spotList.appendChild(li);
		});
	}

	function runSpot(i) {
		const it = spotItems[i];
		if (!it) return;
		setPanel(null);
		it.run();
		if (it.kind !== "app") return;
		say("coach.launched");
	}

	on(spotInput, "input", () => {
		spotSel = 0;
		renderSpot();
	});
	on(spotInput, "keydown", (e) => {
		e.stopPropagation();
		if (e.key === "Escape") {
			e.preventDefault();
			setPanel(null);
		} else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
			e.preventDefault();
			const n = spotItems.length || 1;
			spotSel = (spotSel + (e.key === "ArrowDown" ? 1 : n - 1)) % n;
			renderSpot();
		} else if (e.key === "Enter") {
			e.preventDefault();
			runSpot(spotSel);
		}
	});
	on(spotList, "click", (e) => {
		const li = e.target.closest(".demo-spot-item");
		if (li) runSpot(Number(li.dataset.i));
	});

	// --- Overview ----------------------------------------------------------
	let ovSel = 0;
	function renderOverview() {
		ovSel = ws;
		ovGrid.innerHTML = "";
		workspaces.forEach((list, i) => {
			const card = document.createElement("button");
			card.type = "button";
			card.className = "demo-ov-card" + (i === ws ? " cur" : "") + (i === ovSel ? " sel" : "");
			card.dataset.ws = String(i);
			const label = document.createElement("span");
			label.className = "demo-ov-label";
			label.textContent = S("ws", { n: i + 1 });
			card.appendChild(label);
			const mini = document.createElement("span");
			mini.className = "demo-ov-mini";
			const w = winLayer.clientWidth || 1;
			const h = winLayer.clientHeight || 1;
			rects(list.length).forEach((r, j) => {
				const m = document.createElement("i");
				m.style.left = (r.x / w) * 100 + "%";
				m.style.top = (r.y / h) * 100 + "%";
				m.style.width = (r.w / w) * 100 + "%";
				m.style.height = (r.h / h) * 100 + "%";
				m.textContent = appTitle(list[j].dataset.app);
				mini.appendChild(m);
			});
			card.appendChild(mini);
			ovGrid.appendChild(card);
		});
	}
	function moveOverview(step) {
		ovSel = (ovSel + step + 3) % 3;
		ovGrid.querySelectorAll(".demo-ov-card").forEach((c, i) => c.classList.toggle("sel", i === ovSel));
	}
	on(ovGrid, "click", (e) => {
		const card = e.target.closest(".demo-ov-card");
		if (!card) return;
		setPanel(null);
		switchWorkspace(Number(card.dataset.ws));
	});

	// --- Sidebar -----------------------------------------------------------
	on(side, "click", (e) => {
		const t = e.target.closest("[data-toggle]");
		if (!t) return;
		const onNow = t.getAttribute("aria-pressed") !== "true";
		t.setAttribute("aria-pressed", String(onNow));
		const what = t.dataset.toggle;
		if (what === "dark") {
			opts.onDark && opts.onDark(onNow);
			say(onNow ? "coach.dark" : "coach.light");
		} else if (what === "night") {
			stage.classList.toggle("is-night", onNow);
		} else if (what === "dnd") {
			showToast(S(onNow ? "toast.dndOn" : "toast.dndOff"));
		}
	});
	on(side, "input", (e) => {
		const r = e.target.closest("input[type=range]");
		if (r && r.dataset.slider === "bright") stage.style.setProperty("--dim", String((100 - Number(r.value)) / 140));
	});

	// --- Barra de tarefas so na borda ---------------------------------------
	let tbTimer = 0;
	const edge = $(".demo-edge");
	function showTaskbar() {
		clearTimeout(tbTimer);
		taskbar.classList.add("show");
		if (discover("taskbar")) say("coach.taskbar");
	}
	function hideTaskbarSoon() {
		clearTimeout(tbTimer);
		tbTimer = setTimeout(() => taskbar.classList.remove("show"), 500);
	}
	on(edge, "pointerenter", showTaskbar);
	on(edge, "click", showTaskbar);
	on(taskbar, "pointerenter", () => clearTimeout(tbTimer));
	on(taskbar, "pointerleave", hideTaskbarSoon);
	on(edge, "pointerleave", (e) => {
		if (!taskbar.contains(e.relatedTarget)) hideTaskbarSoon();
	});

	// --- Acoes (teclado, trilho de teclas e botoes da barra) ----------------
	function act(name) {
		flashKey(name);
		switch (name) {
			case "win":
				toggle("spot");
				if (open === "spot") {
					if (discover("spot")) say("coach.spot");
					else say("coach.spotAgain");
				}
				break;
			case "enter":
				if (open) setPanel(null);
				spawn(null);
				break;
			case "q":
				if (open) setPanel(null);
				closeWindow();
				break;
			case "tab":
				if (open === "overview") {
					moveOverview(1);
				} else {
					setPanel("overview");
					if (discover("overview")) say("coach.overview");
				}
				break;
			case "cheat":
				toggle("cheat");
				if (open === "cheat" && discover("cheat")) say("coach.cheat");
				break;
			case "side":
				toggle("side");
				if (open === "side" && discover("side")) say("coach.side");
				break;
		}
	}

	function flashKey(name) {
		const b = root.querySelector(`.demo-keys [data-act="${name}"]`);
		if (!b) return;
		b.classList.remove("hit");
		void b.offsetWidth;
		b.classList.add("hit");
	}

	on(root, "click", (e) => {
		const b = e.target.closest("[data-act]");
		if (!b || !root.contains(b)) return;
		e.preventDefault();
		if (!stage.contains(document.activeElement)) stage.focus({ preventScroll: true });
		act(b.dataset.act);
	});
	on(root, "click", (e) => {
		const b = e.target.closest(".demo-ws button");
		if (b) switchWorkspace(Number(b.dataset.ws));
	});

	let metaAlone = false;
	on(stage, "keydown", (e) => {
		if (e.target === spotInput) return;
		if (e.target.closest && e.target.closest(".demo-side") && e.key !== "Escape") return;
		const k = e.key;
		if (k === "Meta" || k === "OS") {
			metaAlone = true;
			return;
		}
		metaAlone = false;
		if (e.ctrlKey || e.altKey) return;
		const map = { " ": "win", Enter: "enter", q: "q", Q: "q", Tab: "tab", "/": "cheat", s: "side", S: "side" };
		if (open === "overview") {
			if (k === "ArrowRight" || k === "ArrowLeft") {
				e.preventDefault();
				moveOverview(k === "ArrowRight" ? 1 : -1);
				return;
			}
			if (k === "Enter") {
				e.preventDefault();
				setPanel(null);
				switchWorkspace(ovSel);
				return;
			}
		}
		if (k === "Tab" && e.shiftKey) return;
		if (k === "Escape") {
			if (open) {
				e.preventDefault();
				setPanel(null);
			} else {
				const next = root.querySelector(".demo-keys button");
				if (next) next.focus();
			}
			return;
		}
		if (/^[1-3]$/.test(k)) {
			e.preventDefault();
			switchWorkspace(Number(k) - 1);
			return;
		}
		const name = map[k];
		if (name) {
			e.preventDefault();
			act(name);
		}
	});
	on(stage, "keyup", (e) => {
		if ((e.key === "Meta" || e.key === "OS") && metaAlone) {
			metaAlone = false;
			act("win");
		}
	});
	on(stage, "focus", () => {
		if (!found.size && coachKey === "coach.idle") say(matchMedia("(pointer: coarse)").matches ? "coach.touch" : "coach.ready");
	});
	on(scrim, "click", () => setPanel(null));

	// --- Relogio ------------------------------------------------------------
	const timeEls = root.querySelectorAll(".demo-time");
	const dateEls = root.querySelectorAll(".demo-date");
	function tick() {
		const d = new Date();
		const lang = document.documentElement.lang || "en";
		const t = d.toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" });
		const ds = d.toLocaleDateString(lang, { weekday: "short", day: "2-digit", month: "2-digit" });
		timeEls.forEach((el) => (el.textContent = t));
		dateEls.forEach((el) => (el.textContent = ds));
	}
	tick();
	let clock = 0;
	function setLive(live) {
		stage.toggleAttribute("data-live", live);
		clearInterval(clock);
		if (live) clock = setInterval(tick, 15000);
	}
	let inView = false;
	const io = new IntersectionObserver((entries) => {
		inView = entries[0].isIntersecting;
		setLive(inView && !document.hidden);
	});
	io.observe(stage);
	cleanups.push(() => io.disconnect());
	on(document, "visibilitychange", () => setLive(inView && !document.hidden));

	// --- Idioma --------------------------------------------------------------
	function relabel() {
		root.querySelectorAll("[data-s-live]").forEach((el) => (el.textContent = S(el.dataset.sLive)));
		if (coachKey) coachText.textContent = S(coachKey, coachVars);
		renderProgress();
		tick();
		if (open === "spot") renderSpot();
		if (open === "overview") renderOverview();
	}
	on(document, "i18n:change", () => setTimeout(relabel, 0));

	// Comeco: duas janelas para a tela nao nascer vazia.
	say("coach.idle");
	renderProgress();
	setTimeout(() => {
		spawn("terminal", true);
		spawn("music", true);
	}, 0);

	return {
		act,
		spotlight(query) {
			setPanel("spot");
			if (discover("spot")) say("coach.spot");
			if (query) {
				spotInput.value = query;
				renderSpot();
			}
		},
		tileDemo() {
			if (workspaces[ws].length < 3) {
				spawn();
				setTimeout(() => workspaces[ws].length < 3 && spawn(), 260);
			} else spawn();
		},
		showTaskbar() {
			showTaskbar();
			hideTaskbarSoon();
			clearTimeout(tbTimer);
			tbTimer = setTimeout(() => taskbar.classList.remove("show"), 2200);
		},
		discover(goal, key) {
			if (discover(goal) && key) say(key);
			else if (key) say(key);
		},
		relayout() {
			layout(false);
		},
		destroy() {
			cleanups.forEach((f) => f());
			clearInterval(clock);
			clearTimeout(toastTimer);
			clearTimeout(tbTimer);
			workspaces.flat().forEach((el) => el.remove());
			setPanel(null);
			stage.classList.remove("is-night", "is-done");
		}
	};
}
