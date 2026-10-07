/*
 * Modo leve automatico das paginas do site.
 *
 * Carregado como <script> CLASSICO e bloqueante no <head> de cada pagina com
 * efeitos (e nao como modulo, que e sempre adiado): ele precisa marcar
 * <html data-lite> ANTES do primeiro desenho, senao quem ja foi detectado como
 * maquina fraca veria a pagina pesada piscar antes de ficar leve. E pequeno e
 * fica em cache.
 *
 * Como decide:
 *  1. ?lite=1 / ?lite=0 na URL forca ligado/desligado e fica guardado
 *     (desligado manual nunca e religado pela deteccao).
 *  2. Maquina claramente fraca liga na hora: 2 nucleos ou menos, 2 GB de RAM
 *     ou menos (navigator.deviceMemory) ou economia de dados ligada.
 *  3. Senao, mede o frame rate nos primeiros segundos COM os efeitos rodando:
 *     janelas de 2 s, com a aba visivel; duas janelas seguidas com mediana de
 *     quadro acima de 25 ms (abaixo de ~40 fps) ligam o modo leve. Pagina
 *     parada nao serve de medida (o navegador desenha a 60 fps sem esforco),
 *     por isso a pagina pode pedir para esperar: <html data-lite-watch="manual">
 *     e depois daeeseLite.watch(), quando os efeitos comecarem.
 *  4. A decisao automatica vale 7 dias no localStorage; depois mede de novo.
 *
 * As paginas reagem por CSS (:root[data-lite] ...) e, no que for JS (canvas,
 * animacoes de layout), pelo evento "lite:change" no document ou por
 * window.daeeseLite.on.
 */
(function () {
	"use strict";

	var KEY = "daeese:lite";
	var AUTO_DAYS = 7;
	var SLOW_FRAME_MS = 25;
	var WINDOW_MS = 2000;
	var WATCH_FOR_MS = 30000;
	var root = document.documentElement;

	function read() {
		try {
			return localStorage.getItem(KEY);
		} catch (e) {
			return null;
		}
	}

	function write(value) {
		try {
			if (value === null) {
				localStorage.removeItem(KEY);
			} else {
				localStorage.setItem(KEY, value);
			}
		} catch (e) {
			// Sem armazenamento a decisao vale so para esta visita.
		}
	}

	// Formatos guardados: "on:manual", "off:manual" e "on:auto:<timestamp>".
	function storedDecision() {
		var raw = read();
		if (!raw) {
			return null;
		}
		var parts = raw.split(":");
		if (parts[1] === "manual") {
			return { on: parts[0] === "on", manual: true };
		}
		var at = Number(parts[2]) || 0;
		if (parts[0] === "on" && Date.now() - at < AUTO_DAYS * 86400000) {
			return { on: true, manual: false };
		}
		write(null);
		return null;
	}

	var api = {
		on: false,
		reason: "",
		enable: enable,
		disable: disable,
		watch: watch
	};
	window.daeeseLite = api;

	function apply(on, reason) {
		var changed = api.on !== on;
		api.on = on;
		api.reason = reason;
		if (on) {
			root.setAttribute("data-lite", "");
		} else {
			root.removeAttribute("data-lite");
		}
		if (changed) {
			document.dispatchEvent(new CustomEvent("lite:change", { detail: { on: on, reason: reason } }));
		}
	}

	function enable(reason) {
		write("on:auto:" + Date.now());
		apply(true, reason || "auto");
	}

	function disable() {
		write("off:manual");
		apply(false, "manual");
	}

	function weakHardware() {
		var nav = navigator;
		if (nav.connection && nav.connection.saveData) {
			return "save-data";
		}
		if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) {
			return "memory";
		}
		if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 2) {
			return "cores";
		}
		return "";
	}

	var watching = false;

	// Mede em janelas de 2 s enquanto a aba esta visivel, por ate 30 s de tempo
	// visivel. Mediana e nao media: um quadro lento isolado (decodificar uma
	// imagem, abrir um card) nao pode mandar ninguem para o modo leve.
	function watch() {
		if (watching || api.on || typeof requestAnimationFrame !== "function") {
			return;
		}
		watching = true;

		var frames = [];
		var last = 0;
		var windowStart = 0;
		var visibleSpent = 0;
		var slowWindows = 0;

		function tick(now) {
			if (api.on) {
				return;
			}
			if (document.hidden) {
				last = 0;
				frames = [];
				windowStart = 0;
				requestAnimationFrame(tick);
				return;
			}
			if (last) {
				frames.push(now - last);
			}
			last = now;
			if (!windowStart) {
				windowStart = now;
			}

			if (now - windowStart >= WINDOW_MS) {
				visibleSpent += now - windowStart;
				frames.sort(function (a, b) { return a - b; });
				var median = frames.length ? frames[Math.floor(frames.length / 2)] : 0;
				slowWindows = median > SLOW_FRAME_MS ? slowWindows + 1 : 0;
				frames = [];
				windowStart = now;

				if (slowWindows >= 2) {
					enable("fps");
					return;
				}
				if (visibleSpent >= WATCH_FOR_MS) {
					return;
				}
			}
			requestAnimationFrame(tick);
		}

		requestAnimationFrame(tick);
	}

	// --- Decisao inicial ---------------------------------------------------
	var query = /[?&]lite=([01])\b/.exec(location.search);
	if (query) {
		write(query[1] === "1" ? "on:manual" : "off:manual");
	}

	var stored = storedDecision();
	if (stored) {
		apply(stored.on, stored.manual ? "manual" : "remembered");
	} else {
		var weak = weakHardware();
		if (weak) {
			enable(weak);
		}
	}

	var manualOff = stored && stored.manual && !stored.on;
	if (!api.on && !manualOff && root.getAttribute("data-lite-watch") !== "manual") {
		if (document.readyState === "complete") {
			watch();
		} else {
			window.addEventListener("load", function () { watch(); }, { once: true });
		}
	}

	// A pagina que pediu para esperar chama daeeseLite.watch() quando os
	// efeitos comecarem; com o desligado manual, o watch vira no-op.
	if (manualOff) {
		api.watch = function () {};
	}
})();
