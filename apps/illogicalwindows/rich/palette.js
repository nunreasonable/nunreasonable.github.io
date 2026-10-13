/*
 * Papeis de parede e cores do modo completo.
 *
 * Os papeis de parede prontos sao desenhados aqui mesmo num canvas (manchas
 * de cor e duas faixas suaves), entao nao ha imagem para baixar. As cores
 * seguem o mesmo caminho do matugen do ii: Material You (tonal spot) a partir
 * de uma cor de origem. Para os prontos, os tons ja vem calculados abaixo; a
 * biblioteca material-color-utilities so e baixada (jsdelivr) quando alguem
 * usa a propria imagem, e essa imagem nunca sai do navegador.
 */

const MCU_URL = "https://cdn.jsdelivr.net/npm/@material/material-color-utilities@0.3.0/+esm";

// Tons gerados com material-color-utilities 0.3.0 (themeFromSourceColor).
const TONES = {"rose":{"p":{"10":"#3d0023","20":"#63003b","30":"#8c0056","35":"#9e1062","40":"#ae226f","55":"#df4c96","60":"#ef59a3","65":"#ff67b0","75":"#ff9ac4","80":"#ffb0cf","90":"#ffd9e5","98":"#fff8f8"},"s":{"10":"#2a151e","30":"#5a3f49","90":"#fed9e5"},"n":{"6":"#171214","10":"#201a1c","12":"#241e20","17":"#2e282a","22":"#393335","90":"#ebe0e2","92":"#f1e5e7","94":"#f7ebed","96":"#fdf1f3","98":"#fff8f8"},"v":{"30":"#504348","50":"#837378","60":"#9d8c91","80":"#d5c2c7"}},"lagoon":{"p":{"10":"#001f2a","20":"#003546","30":"#004d64","35":"#005a73","40":"#006783","55":"#008fb5","60":"#059dc7","65":"#2aaad5","75":"#52c5f1","80":"#64d3ff","90":"#bde9ff","98":"#f4faff"},"s":{"10":"#081e27","30":"#354a53","90":"#d0e6f2"},"n":{"6":"#111415","10":"#191c1e","12":"#1d2022","17":"#272a2c","22":"#323537","90":"#e1e2e4","92":"#e7e8ea","94":"#edeef0","96":"#f2f4f6","98":"#f8f9fb"},"v":{"30":"#40484c","50":"#70787d","60":"#8a9297","80":"#c0c8cd"}},"moss":{"p":{"10":"#0f2000","20":"#1e3700","30":"#2d5000","35":"#355c00","40":"#3f6904","55":"#63912e","60":"#6f9e3a","65":"#7cac46","75":"#96c75e","80":"#a3d66a","90":"#bef283","98":"#f0ffd8"},"s":{"10":"#151e0b","30":"#404a33","90":"#dbe7c8"},"n":{"6":"#121410","10":"#1b1c18","12":"#1f201c","17":"#292a26","22":"#343530","90":"#e3e3db","92":"#e9e8e1","94":"#efeee7","96":"#f5f4ec","98":"#fafaf2"},"v":{"30":"#44483d","50":"#75796c","60":"#8e9285","80":"#c5c8ba"}},"ember":{"p":{"10":"#311300","20":"#512400","30":"#733500","35":"#853e00","40":"#974800","55":"#cb6a1d","60":"#db762a","65":"#eb8336","75":"#ffa365","80":"#ffb689","90":"#ffdbc7","98":"#fff8f5"},"s":{"10":"#2b1709","30":"#5b4130","90":"#ffdbc7"},"n":{"6":"#18120f","10":"#201a17","12":"#241e1b","17":"#2f2925","22":"#3a3330","90":"#ece0da","92":"#f2e6e0","94":"#f8ebe6","96":"#fef1eb","98":"#fff8f5"},"v":{"30":"#52443c","50":"#84746a","60":"#9f8d83","80":"#d7c3b8"}},"dusk":{"p":{"10":"#170065","20":"#2b0d96","30":"#4330ac","35":"#4f3eb8","40":"#5b4bc5","55":"#8172ee","60":"#8e80fc","65":"#9c8fff","75":"#b8afff","80":"#c7bfff","90":"#e4dfff","98":"#fcf8ff"},"s":{"10":"#1b192c","30":"#474459","90":"#e5dff9"},"n":{"6":"#141316","10":"#1c1b1f","12":"#201f23","17":"#2a292d","22":"#353438","90":"#e5e1e6","92":"#ebe7ec","94":"#f1ecf1","96":"#f7f2f7","98":"#fcf8fd"},"v":{"30":"#47464f","50":"#78767f","60":"#928f99","80":"#c9c5d0"}}};

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
	return TONES[id];
}

function hexToRgb(hex) {
	const n = parseInt(hex.slice(1), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function alpha(hex, a) {
	const [r, g, b] = hexToRgb(hex);
	return `rgba(${r}, ${g}, ${b}, ${a})`;
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

// Tokens da pagina inteira (o --accent e companhia do CSS da vitrine).
export function pageScheme(t, dark) {
	const { p } = t;
	return dark
		? {
				"--accent": p[65],
				"--accent-ink": p[75],
				"--accent-soft": alpha(p[65], 0.12),
				"--on-accent": p[10],
				"--surface-tint": `color-mix(in srgb, ${p[30]} 32%, #171a1f)`
			}
		: {
				"--accent": p[55],
				"--accent-ink": p[35],
				"--accent-soft": alpha(p[55], 0.14),
				"--on-accent": p[10],
				"--surface-tint": p[98]
			};
}

export const PAGE_KEYS = ["--accent", "--accent-ink", "--accent-soft", "--on-accent", "--surface-tint"];

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
