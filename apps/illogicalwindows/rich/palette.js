/*
 * Papeis de parede e cores do modo completo.
 *
 * Os papeis de parede prontos sao desenhados aqui mesmo num canvas (manchas
 * de cor e duas faixas suaves), entao nao ha imagem para baixar. As cores
 * seguem o mesmo caminho do matugen do ii: Material You (tonal spot) a partir
 * de uma cor de origem. Para os prontos, os tons ja vem calculados abaixo; a
 * biblioteca material-color-utilities so e baixada (jsdelivr) quando alguem
 * usa a propria imagem, e essa imagem nunca sai do navegador.
 *
 * Os papeis de parede da barra do topo (WALL_TONES) usam o mesmo caminho:
 * pageTokens() gera os tokens da pagina, ja com o contraste travado, e o
 * script do head do index.html traz o resultado pronto (o modo leve nao
 * baixa este arquivo).
 */

const MCU_URL = "https://cdn.jsdelivr.net/npm/@material/material-color-utilities@0.3.0/+esm";

// Tons gerados com material-color-utilities 0.3.0 (themeFromSourceColor).
const TONES = {"rose":{"p":{"10":"#3d0023","20":"#63003b","30":"#8c0056","35":"#9e1062","40":"#ae226f","55":"#df4c96","60":"#ef59a3","65":"#ff67b0","75":"#ff9ac4","80":"#ffb0cf","90":"#ffd9e5","98":"#fff8f8"},"s":{"10":"#2a151e","30":"#5a3f49","90":"#fed9e5"},"n":{"6":"#171214","10":"#201a1c","12":"#241e20","17":"#2e282a","22":"#393335","90":"#ebe0e2","92":"#f1e5e7","94":"#f7ebed","96":"#fdf1f3","98":"#fff8f8"},"v":{"30":"#504348","50":"#837378","60":"#9d8c91","80":"#d5c2c7"}},"lagoon":{"p":{"10":"#001f2a","20":"#003546","30":"#004d64","35":"#005a73","40":"#006783","55":"#008fb5","60":"#059dc7","65":"#2aaad5","75":"#52c5f1","80":"#64d3ff","90":"#bde9ff","98":"#f4faff"},"s":{"10":"#081e27","30":"#354a53","90":"#d0e6f2"},"n":{"6":"#111415","10":"#191c1e","12":"#1d2022","17":"#272a2c","22":"#323537","90":"#e1e2e4","92":"#e7e8ea","94":"#edeef0","96":"#f2f4f6","98":"#f8f9fb"},"v":{"30":"#40484c","50":"#70787d","60":"#8a9297","80":"#c0c8cd"}},"moss":{"p":{"10":"#0f2000","20":"#1e3700","30":"#2d5000","35":"#355c00","40":"#3f6904","55":"#63912e","60":"#6f9e3a","65":"#7cac46","75":"#96c75e","80":"#a3d66a","90":"#bef283","98":"#f0ffd8"},"s":{"10":"#151e0b","30":"#404a33","90":"#dbe7c8"},"n":{"6":"#121410","10":"#1b1c18","12":"#1f201c","17":"#292a26","22":"#343530","90":"#e3e3db","92":"#e9e8e1","94":"#efeee7","96":"#f5f4ec","98":"#fafaf2"},"v":{"30":"#44483d","50":"#75796c","60":"#8e9285","80":"#c5c8ba"}},"ember":{"p":{"10":"#311300","20":"#512400","30":"#733500","35":"#853e00","40":"#974800","55":"#cb6a1d","60":"#db762a","65":"#eb8336","75":"#ffa365","80":"#ffb689","90":"#ffdbc7","98":"#fff8f5"},"s":{"10":"#2b1709","30":"#5b4130","90":"#ffdbc7"},"n":{"6":"#18120f","10":"#201a17","12":"#241e1b","17":"#2f2925","22":"#3a3330","90":"#ece0da","92":"#f2e6e0","94":"#f8ebe6","96":"#fef1eb","98":"#fff8f5"},"v":{"30":"#52443c","50":"#84746a","60":"#9f8d83","80":"#d7c3b8"}},"dusk":{"p":{"10":"#170065","20":"#2b0d96","30":"#4330ac","35":"#4f3eb8","40":"#5b4bc5","55":"#8172ee","60":"#8e80fc","65":"#9c8fff","75":"#b8afff","80":"#c7bfff","90":"#e4dfff","98":"#fcf8ff"},"s":{"10":"#1b192c","30":"#474459","90":"#e5dff9"},"n":{"6":"#141316","10":"#1c1b1f","12":"#201f23","17":"#2a292d","22":"#353438","90":"#e5e1e6","92":"#ebe7ec","94":"#f1ecf1","96":"#f7f2f7","98":"#fcf8fd"},"v":{"30":"#47464f","50":"#78767f","60":"#928f99","80":"#c9c5d0"}}};

// Papeis de parede da barra do topo (capturas do ii e o jade do logo), mesmos
// tons, gerados das miniaturas com QuantizerCelebi + Score (scratch/tones.mjs).
const WALL_TONES = {"jade":{"p":{"10":"#002019","20":"#00382d","30":"#005142","35":"#005e4d","40":"#006b58","55":"#00957b","60":"#00a387","65":"#00b294","75":"#3cceae","80":"#4fdcbc","90":"#70f9d7","98":"#e6fff5"},"s":{"10":"#072019","30":"#344c44","90":"#cde9de"},"n":{"6":"#111413","10":"#191c1b","12":"#1d201f","17":"#272b29","22":"#323634","90":"#e1e3e0","92":"#e6e9e6","94":"#eceeec","96":"#f2f4f1","98":"#f8faf7"},"v":{"30":"#3f4945","50":"#6f7975","60":"#89938e","80":"#bfc9c4"}},"meadow":{"p":{"10":"#171e00","20":"#2a3400","30":"#3e4c00","35":"#495900","40":"#536500","55":"#788c28","60":"#849934","65":"#91a740","75":"#acc259","80":"#bad165","90":"#d5ed7e","98":"#f4ffc6"},"s":{"10":"#191d08","30":"#444930","90":"#e1e6c3"},"n":{"6":"#13140f","10":"#1b1c17","12":"#1f201b","17":"#2a2a25","22":"#353530","90":"#e4e2da","92":"#eae8e0","94":"#f0eee6","96":"#f6f4eb","98":"#fcf9f1"},"v":{"30":"#46483c","50":"#77786a","60":"#919283","80":"#c7c8b8"}},"city":{"p":{"10":"#001e2e","20":"#00344c","30":"#004c6d","35":"#00587e","40":"#00658f","55":"#1a8cc3","60":"#3299d1","65":"#44a7df","75":"#64c2fc","80":"#86ceff","90":"#c8e6ff","98":"#f6faff"},"s":{"10":"#0b1d29","30":"#384956","90":"#d2e5f5"},"n":{"6":"#111416","10":"#191c1e","12":"#1d2022","17":"#282a2c","22":"#333537","90":"#e2e2e5","92":"#e7e8eb","94":"#edeef0","96":"#f3f3f6","98":"#f9f9fc"},"v":{"30":"#41484d","50":"#71787e","60":"#8b9198","80":"#c1c7ce"}},"space":{"p":{"10":"#110563","20":"#282377","30":"#3f3c8f","35":"#4b489b","40":"#5854a8","55":"#7d7ad1","60":"#8a87df","65":"#9894ed","75":"#b4b1ff","80":"#c3c0ff","90":"#e3dfff","98":"#fcf8ff"},"s":{"10":"#1a1a2c","30":"#464559","90":"#e3e0f9"},"n":{"6":"#131316","10":"#1c1b1f","12":"#201f23","17":"#2a292d","22":"#353438","90":"#e5e1e6","92":"#ebe7ec","94":"#f1edf1","96":"#f6f2f7","98":"#fcf8fd"},"v":{"30":"#47464f","50":"#787680","60":"#928f9a","80":"#c8c5d0"}},"pop":{"p":{"10":"#380038","20":"#580a57","30":"#732770","35":"#81337c","40":"#8e4089","55":"#b965b2","60":"#c872bf","65":"#d77fcd","75":"#f59aea","80":"#ffaaf4","90":"#ffd7f5","98":"#fff7f9"},"s":{"10":"#271624","30":"#554151","90":"#f7daef"},"n":{"6":"#161215","10":"#1e1a1d","12":"#231e21","17":"#2d292c","22":"#383336","90":"#e9e0e4","92":"#efe6e9","94":"#f5ebef","96":"#fbf1f5","98":"#fff7f9"},"v":{"30":"#4e444b","50":"#80747c","60":"#9a8d95","80":"#d1c2cb"}}};

export const PRESETS = [
	{ id: "rose", bg: ["#1a0b14", "#2a0f22"], blobs: [["#e4509a", 0.72, 0.38, 0.55], ["#7a2a8c", 0.22, 0.7, 0.6], ["#ff8a5c", 0.9, 0.85, 0.35]], ribbons: ["#ff9ac4", "#c04a8c"] },
	{ id: "lagoon", bg: ["#04121c", "#082236"], blobs: [["#1f7fa8", 0.3, 0.35, 0.6], ["#3fd0c9", 0.78, 0.7, 0.45], ["#1b3f8f", 0.85, 0.2, 0.5]], ribbons: ["#7fe3e0", "#2a9dc4"] },
	{ id: "moss", bg: ["#0b1208", "#16210f"], blobs: [["#5b8a2e", 0.25, 0.6, 0.6], ["#b7c95a", 0.75, 0.3, 0.42], ["#2f6b4f", 0.85, 0.85, 0.5]], ribbons: ["#d4e58a", "#6f9e3a"] },
	{ id: "ember", bg: ["#170a05", "#2a1209"], blobs: [["#e0662e", 0.65, 0.55, 0.6], ["#f2b84b", 0.25, 0.25, 0.4], ["#a32f3a", 0.2, 0.85, 0.5]], ribbons: ["#ffc98a", "#e07a2e"] },
	{ id: "dusk", bg: ["#0a0818", "#151033"], blobs: [["#5b4bd1", 0.3, 0.4, 0.6], ["#c06bd6", 0.8, 0.65, 0.48], ["#2a3b9c", 0.7, 0.15, 0.45]], ribbons: ["#c7b8ff", "#6b5cd6"] }
];

const W = 1280;
const H = 800;

function drawWallpaper(preset, ctx, w, h) {
	const g = ctx.createLinearGradient(0, 0, w, h);
	g.addColorStop(0, preset.bg[0]);
	g.addColorStop(1, preset.bg[1]);
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, w, h);

	const size = Math.max(w, h);
	for (const [color, x, y, r] of preset.blobs) {
		const rg = ctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, r * size);
		rg.addColorStop(0, color + "d0");
		rg.addColorStop(0.45, color + "55");
		rg.addColorStop(1, color + "00");
		ctx.fillStyle = rg;
		ctx.fillRect(0, 0, w, h);
	}

	// Duas faixas largas e translucidas, no espirito dos papeis do Windows 11.
	ctx.lineCap = "round";
	preset.ribbons.forEach((color, i) => {
		const lw = (i ? 0.16 : 0.1) * h;
		ctx.lineWidth = lw;
		ctx.strokeStyle = color + (i ? "30" : "40");
		ctx.beginPath();
		const y0 = (0.62 + i * 0.12) * h;
		ctx.moveTo(-0.1 * w, y0);
		ctx.bezierCurveTo(0.3 * w, y0 - 0.45 * h, 0.6 * w, y0 + 0.35 * h, 1.1 * w, y0 - 0.3 * h);
		ctx.stroke();
	});
}

const urlCache = new Map();

// URL (blob) do papel de parede pronto, desenhado uma vez por visita.
export function wallpaperUrl(preset) {
	if (urlCache.has(preset.id)) return urlCache.get(preset.id);
	const p = new Promise((resolve) => {
		const c = document.createElement("canvas");
		c.width = W;
		c.height = H;
		drawWallpaper(preset, c.getContext("2d"), W, H);
		c.toBlob((b) => resolve(b ? URL.createObjectURL(b) : c.toDataURL()), "image/webp", 0.86);
	});
	urlCache.set(preset.id, p);
	return p;
}

export function drawThumb(preset, canvas) {
	const r = Math.min(window.devicePixelRatio || 1, 2);
	const w = canvas.clientWidth || 56;
	const h = canvas.clientHeight || 36;
	canvas.width = Math.round(w * r);
	canvas.height = Math.round(h * r);
	drawWallpaper(preset, canvas.getContext("2d"), canvas.width, canvas.height);
}

// --- Cores -------------------------------------------------------------

export function presetTones(id) {
	return TONES[id] || WALL_TONES[id];
}

// Papel de parede procedural feito so com os tons de um esquema: o demo usa
// isso para acompanhar o papel de parede escolhido na barra do topo.
export function presetFromTones(id, t) {
	const { p, s, n } = t;
	return {
		id: "page:" + id,
		bg: [n[6], p[10]],
		blobs: [[p[40], 0.28, 0.38, 0.6], [p[65], 0.78, 0.68, 0.46], [s[30], 0.86, 0.18, 0.5]],
		ribbons: [p[90], p[55]]
	};
}

function hexToRgb(hex) {
	const n = parseInt(hex.slice(1), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function alpha(hex, a) {
	const [r, g, b] = hexToRgb(hex);
	return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function toHex(rgb) {
	return "#" + rgb.map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0")).join("");
}

function mix(a, b, t) {
	const x = hexToRgb(a);
	const y = hexToRgb(b);
	return toHex(x.map((v, i) => v + (y[i] - v) * t));
}

function luminance(hex) {
	const c = hexToRgb(hex).map((v) => {
		v /= 255;
		return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

export function contrast(a, b) {
	const x = luminance(a);
	const y = luminance(b);
	return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// Trava a luminosidade: empurra a cor para o branco (ou para o preto) ate
// ela passar do contraste pedido contra o fundo. Os tons do M3 ja passam;
// isto segura o caso aproximado (HSL) da imagem do visitante sem rede.
function ensure(fg, bg, ratio, toward) {
	const end = toward || (luminance(bg) < 0.2 ? "#ffffff" : "#000000");
	let c = fg;
	for (let i = 1; i <= 20 && contrast(c, bg) < ratio; i++) c = mix(fg, end, i / 20);
	return c;
}

function hue(hex) {
	const [r, g, b] = hexToRgb(hex).map((x) => x / 255);
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	if (max === min) return 0;
	const d = max - min;
	let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
	return (h * 60 + 360) % 360;
}

// Tokens da pagina inteira a partir dos tons (esquema escuro do M3, como o
// ii por padrao). A pagina e sempre escura; so o demo tem modo claro.
export function pageTokens(t) {
	const { p, n, v } = t;
	const top = n[22];
	const accent = ensure(p[80], top, 4.5);
	const container = p[30];
	return {
		"--bg": n[6],
		"--bg-alt": n[10],
		"--surface": n[12],
		"--surface-2": n[17],
		"--surface-3": top,
		"--surface-tint": mix(n[12], p[30], 0.3),
		"--line": alpha(v[80], 0.12),
		"--line-strong": alpha(v[80], 0.24),
		"--text": ensure(n[90], top, 7),
		"--muted": ensure(v[80], top, 4.5),
		"--accent": accent,
		"--accent-ink": accent,
		"--accent-soft": alpha(accent, 0.13),
		"--on-accent": ensure(p[20], accent, 4.5, "#000000"),
		"--accent-container": container,
		"--on-accent-container": ensure(p[90], container, 4.5),
		"--header-bg": alpha(n[10], 0.96),
		"--logo-a": p[65],
		"--logo-b": p[80],
		"--logo-c": p[90],
		// As capturas da apresentacao sao rosas (~328 graus): giram ate o tom do destaque.
		"--shot-rot": Math.round(hue(accent) - 328) + "deg",
		"--theme": n[6]
	};
}

// Esquema do mini desktop (o ii usa o esquema escuro por padrao).
export function demoScheme(t, dark) {
	const { p, s, n, v } = t;
	return dark
		? {
				"--d-primary": p[80],
				"--d-on-primary": p[20],
				"--d-primary-container": p[30],
				"--d-on-primary-container": p[90],
				"--d-secondary-container": s[30],
				"--d-on-secondary-container": s[90],
				"--d-surface": n[6],
				"--d-surface-low": n[10],
				"--d-surface-mid": n[12],
				"--d-surface-high": n[17],
				"--d-surface-top": n[22],
				"--d-on-surface": n[90],
				"--d-on-surface-variant": v[80],
				"--d-outline": v[60],
				"--d-outline-variant": v[30]
			}
		: {
				"--d-primary": p[40],
				"--d-on-primary": "#ffffff",
				"--d-primary-container": p[90],
				"--d-on-primary-container": p[10],
				"--d-secondary-container": s[90],
				"--d-on-secondary-container": s[10],
				"--d-surface": n[98],
				"--d-surface-low": n[96],
				"--d-surface-mid": n[94],
				"--d-surface-high": n[92],
				"--d-surface-top": n[90],
				"--d-on-surface": p[10],
				"--d-on-surface-variant": v[30],
				"--d-outline": v[50],
				"--d-outline-variant": v[80]
			};
}

export const WALL_IDS = Object.keys(WALL_TONES);

// --- Imagem do visitante -----------------------------------------------

let mcu = null;

function loadMcu() {
	if (!mcu) {
		mcu = import(MCU_URL).catch((err) => {
			mcu = null;
			throw err;
		});
	}
	return mcu;
}

// Cor de origem sem a biblioteca (sem rede): media ponderada pela
// saturacao, que chega perto o bastante para um fallback.
function roughSource(data) {
	let r = 0;
	let g = 0;
	let b = 0;
	let wsum = 0;
	for (let i = 0; i < data.length; i += 4) {
		const R = data[i];
		const G = data[i + 1];
		const B = data[i + 2];
		const max = Math.max(R, G, B);
		const min = Math.min(R, G, B);
		const w = (max - min) / 255 + 0.02;
		r += R * w;
		g += G * w;
		b += B * w;
		wsum += w;
	}
	return [r / wsum, g / wsum, b / wsum].map(Math.round);
}

function hslTones(rgb) {
	const [r, g, b] = rgb.map((x) => x / 255);
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h = 0;
	if (max !== min) {
		const d = max - min;
		if (max === r) h = ((g - b) / d) % 6;
		else if (max === g) h = (b - r) / d + 2;
		else h = (r - g) / d + 4;
	}
	h = Math.round(h * 60 + 360) % 360;
	const tone = (sat) => (l) => {
		const c = document.createElement("canvas").getContext("2d");
		c.fillStyle = `hsl(${h} ${sat}% ${l}%)`;
		return c.fillStyle;
	};
	const mk = (sat, list) => Object.fromEntries(list.map((l) => [l, tone(sat)(l)]));
	return {
		p: mk(70, [10, 20, 30, 35, 40, 55, 60, 65, 75, 80, 90, 98]),
		s: mk(25, [10, 30, 90]),
		n: mk(8, [6, 10, 12, 17, 22, 90, 92, 94, 96, 98]),
		v: mk(14, [30, 50, 60, 80])
	};
}

// Le a imagem, reduz para 128 px e devolve { url, tones }.
export async function tonesFromFile(file) {
	const url = URL.createObjectURL(file);
	const bitmap = await createImageBitmap(file);
	const side = 128;
	const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
	const c = document.createElement("canvas");
	c.width = Math.max(1, Math.round(bitmap.width * scale));
	c.height = Math.max(1, Math.round(bitmap.height * scale));
	const ctx = c.getContext("2d", { willReadFrequently: true });
	ctx.drawImage(bitmap, 0, 0, c.width, c.height);
	bitmap.close && bitmap.close();
	const data = ctx.getImageData(0, 0, c.width, c.height).data;

	try {
		const m = await loadMcu();
		const pixels = [];
		for (let i = 0; i < data.length; i += 4) {
			if (data[i + 3] < 255) continue;
			pixels.push(m.argbFromRgb(data[i], data[i + 1], data[i + 2]));
		}
		const ranked = m.Score.score(m.QuantizerCelebi.quantize(pixels, 128));
		const theme = m.themeFromSourceColor(ranked[0]);
		const pal = { p: theme.palettes.primary, s: theme.palettes.secondary, n: theme.palettes.neutral, v: theme.palettes.neutralVariant };
		const want = TONES.rose;
		const tones = {};
		for (const k of Object.keys(want)) {
			tones[k] = Object.fromEntries(Object.keys(want[k]).map((x) => [x, m.hexFromArgb(pal[k].tone(Number(x)))]));
		}
		return { url, tones };
	} catch (err) {
		return { url, tones: hslTones(roughSource(data)) };
	}
}
