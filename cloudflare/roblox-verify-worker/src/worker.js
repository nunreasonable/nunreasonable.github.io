// Verificacao de conta Roblox do Sollarety, em daeese.me/oauth/roblox/*.
//
// O oposto do fun-oauth-worker, que nao guarda nada e nao assina nada porque o
// que ele devolve so desenha botoes. Aqui o resultado DA CARGO num servidor do
// Discord, entao cada passo e conferido:
//
//   /start     -> login do Discord (scope identify). Descobre QUEM esta no
//                 navegador.
//   /discord   -> volta do Discord. Troca o code, le o id, e manda para o login
//                 do Roblox com PKCE.
//   /callback  -> volta do Roblox. Troca o code, le o id da conta Roblox, revoga
//                 o token na hora e guarda "Discord X e dono do Roblox Y" no
//                 Durable Object por meia hora.
//   /result    -> o bot busca o resultado, com o BOT_API_SECRET. Le e apaga.
//
// Por que o Discord entra no navegador, e nao um codigo gerado pelo /verify:
// um link com codigo pode ser repassado. Quem recebe autoriza o Roblox DELE e a
// conta cai no Discord de quem mandou o link - com os cargos de rank junto. Com
// o Discord provado no mesmo navegador que o Roblox, repassar o link so faz a
// vitima vincular a propria conta a si mesma.
//
// A sessao entre os passos mora num cookie assinado (HMAC com SESSION_KEY), nao
// em armazenamento: sao dez minutos de vida e so interessam a este navegador.

import { DurableObject } from "cloudflare:workers";

const DISCORD_API = "https://discord.com/api/v10";
const ROBLOX_OAUTH = "https://apis.roblox.com/oauth/v1";

const PREFIX = "/oauth/roblox";
const COOKIE = "sollarety_rv";

// Tempo para completar os dois logins. O authorization code do Roblox vive um
// minuto, mas a pessoa pode ter de digitar senha e 2FA nos dois sites.
const SESSION_TTL_SECONDS = 600;

// Quanto o resultado espera o bot vir buscar. O /verify consulta por dez
// minutos; a folga cobre quem termina o login e so depois clica em "Ja
// autorizei".
const RESULT_TTL_MS = 30 * 60 * 1000;

const DISCORD_ID = /^\d{17,20}$/;

// Chave do rate limit: o IP que a borda viu, com IPv6 agrupado no /64 - quem
// tem um /64 inteiro trocaria de endereco a cada tentativa. Mesma funcao dos
// outros Workers, copiada porque cada um e um arquivo autocontido.
function limiterKey(request) {
	const ip = request.headers.get("CF-Connecting-IP") || "";
	if (!ip.includes(":") || ip.includes(".")) {
		return ip || "unknown";
	}

	const [head, tail] = ip.toLowerCase().split("::");
	const headGroups = head ? head.split(":") : [];
	const tailGroups = tail ? tail.split(":") : [];
	const groups = tail === undefined
		? headGroups
		: [...headGroups, ...Array(8 - headGroups.length - tailGroups.length).fill("0"), ...tailGroups];

	return `${groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, "")).join(":")}::/64`;
}

// ---------------------------------------------------------------------------
// Durable Object: os resultados pendentes
// ---------------------------------------------------------------------------

// Uma instancia so, com SQLite. Nao e KV de proposito: o KV cacheia na borda
// ate a leitura de chave INEXISTENTE e leva ate um minuto para propagar uma
// escrita, e o bot pergunta "ja tem?" a cada quatro segundos - com KV, a
// primeira pergunta sem resultado prenderia o "nao" no cache e a verificacao
// pareceria travada. O Durable Object responde com o que foi gravado agora.
export class PendingLinks extends DurableObject {
	constructor(ctx, env) {
		super(ctx, env);
		this.sql = ctx.storage.sql;
		this.sql.exec(
			"CREATE TABLE IF NOT EXISTS pending (discord_id TEXT PRIMARY KEY, payload TEXT NOT NULL, expires_at INTEGER NOT NULL)"
		);
	}

	async put(discordId, payload) {
		const expiresAt = Date.now() + RESULT_TTL_MS;
		this.sql.exec(
			"INSERT INTO pending (discord_id, payload, expires_at) VALUES (?, ?, ?) " +
				"ON CONFLICT(discord_id) DO UPDATE SET payload = excluded.payload, expires_at = excluded.expires_at",
			discordId,
			JSON.stringify(payload),
			expiresAt
		);

		// Sem alarme de pe, agenda a limpeza. Com alarme, o proprio alarm()
		// reagenda para o proximo vencimento.
		if ((await this.ctx.storage.getAlarm()) === null) {
			await this.ctx.storage.setAlarm(expiresAt);
		}
	}

	// Le e apaga numa tacada: um resultado e entregue uma vez so.
	async take(discordId) {
		const rows = this.sql
			.exec("SELECT payload, expires_at FROM pending WHERE discord_id = ?", discordId)
			.toArray();
		this.sql.exec("DELETE FROM pending WHERE discord_id = ?", discordId);

		if (rows.length === 0 || rows[0].expires_at <= Date.now()) {
			return null;
		}

		return JSON.parse(rows[0].payload);
	}

	async alarm() {
		this.sql.exec("DELETE FROM pending WHERE expires_at <= ?", Date.now());

		const next = this.sql.exec("SELECT MIN(expires_at) AS next FROM pending").one().next;
		if (next !== null) {
			await this.ctx.storage.setAlarm(next);
		}
	}
}

function pendingStore(env) {
	return env.PENDING.get(env.PENDING.idFromName("pending"));
}

// ---------------------------------------------------------------------------
// Utilitarios
// ---------------------------------------------------------------------------

const encoder = new TextEncoder();

function base64url(bytes) {
	let binary = "";
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}

	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(value) {
	const padded = value.replace(/-/g, "+").replace(/_/g, "/");
	const binary = atob(padded + "===".slice((padded.length + 3) % 4));
	return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function randomToken(bytes = 32) {
	const buffer = new Uint8Array(bytes);
	crypto.getRandomValues(buffer);
	return base64url(buffer);
}

async function hmacKey(env) {
	return crypto.subtle.importKey(
		"raw",
		encoder.encode(env.SESSION_KEY),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign", "verify"]
	);
}

// Comparacao em tempo constante. O timingSafeEqual exige o mesmo tamanho, e o
// tamanho em si ja vazaria algo; comparando os hashes, os dois lados sempre
// tem 32 bytes.
async function safeEqual(a, b) {
	const [ha, hb] = await Promise.all([
		crypto.subtle.digest("SHA-256", encoder.encode(a)),
		crypto.subtle.digest("SHA-256", encoder.encode(b))
	]);

	return crypto.subtle.timingSafeEqual(ha, hb);
}

// ---------------------------------------------------------------------------
// Sessao em cookie assinado
// ---------------------------------------------------------------------------

async function sealSession(env, session) {
	const body = base64url(encoder.encode(JSON.stringify(session)));
	const signature = await crypto.subtle.sign("HMAC", await hmacKey(env), encoder.encode(body));
	return `${body}.${base64url(new Uint8Array(signature))}`;
}

async function openSession(env, request) {
	const header = request.headers.get("Cookie") || "";
	const match = header.split(/;\s*/).find((part) => part.startsWith(`${COOKIE}=`));
	if (!match) {
		return null;
	}

	const [body, signature] = match.slice(COOKIE.length + 1).split(".");
	if (!body || !signature) {
		return null;
	}

	try {
		const valid = await crypto.subtle.verify(
			"HMAC",
			await hmacKey(env),
			base64urlDecode(signature),
			encoder.encode(body)
		);
		if (!valid) {
			return null;
		}

		const session = JSON.parse(new TextDecoder().decode(base64urlDecode(body)));
		return typeof session.exp === "number" && session.exp > Date.now() / 1000 ? session : null;
	} catch {
		return null;
	}
}

function sessionCookie(value, maxAge) {
	// SameSite=Lax e o que deixa o cookie voltar no redirect de discord.com e
	// roblox.com (navegacao de topo com GET) sem mandar em mais nada cruzado.
	return `${COOKIE}=${value}; Path=${PREFIX}; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

// ---------------------------------------------------------------------------
// Respostas
// ---------------------------------------------------------------------------

const SECURITY_HEADERS = {
	"Cache-Control": "no-store",
	"Referrer-Policy": "no-referrer",
	"X-Content-Type-Options": "nosniff",
	"Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'"
};

function redirect(location, cookie) {
	const headers = new Headers({ ...SECURITY_HEADERS, Location: location });
	if (cookie) {
		headers.append("Set-Cookie", cookie);
	}

	return new Response(null, { status: 302, headers });
}

function escapeHtml(value) {
	return String(value ?? "").replace(/[&<>"']/g, (c) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#39;"
	})[c]);
}

// Paginas em ingles, como o resto do site. O texto e fixo: nada que veio de um
// provedor entra aqui sem escape, e erro de provedor nunca e repassado.
function page(status, title, paragraphs, clearCookie = true) {
	const body = paragraphs.map((p) => `<p>${p}</p>`).join("\n");
	const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(title)} · Sollarety</title>
<style>
:root { color-scheme: light dark; --bg: #f6f6f8; --card: #ffffff; --text: #1d1d22; --muted: #5c5c66; --accent: #5865f2; }
@media (prefers-color-scheme: dark) { :root { --bg: #111114; --card: #1b1b20; --text: #ececf1; --muted: #a0a0ab; --accent: #8c96ff; } }
* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 16px; background: var(--bg); color: var(--text);
  font: 16px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif; }
main { width: 100%; max-width: 30rem; background: var(--card); border-radius: 14px; padding: 28px 24px; box-shadow: 0 1px 3px rgb(0 0 0 / 12%); }
h1 { margin: 0 0 12px; font-size: 1.35rem; }
p { margin: 0 0 12px; color: var(--muted); }
p:last-child { margin-bottom: 0; }
strong { color: var(--text); }
a { color: var(--accent); }
</style>
</head>
<body>
<main>
<h1>${escapeHtml(title)}</h1>
${body}
</main>
</body>
</html>`;

	const headers = new Headers({ ...SECURITY_HEADERS, "Content-Type": "text/html; charset=utf-8" });
	if (clearCookie) {
		headers.append("Set-Cookie", sessionCookie("", 0));
	}

	return new Response(html, { status, headers });
}

const RESTART = `<a href="${PREFIX}/start">Start again</a>, or run <strong>/verify</strong> in Discord.`;

function errorPage(kind) {
	switch (kind) {
		case "config":
			return page(503, "Verification is not set up yet", [
				"This page is missing part of its configuration. Nothing is wrong on your end.",
				"Please let the people who run Sollarety know."
			]);
		case "denied":
			return page(400, "Sign-in cancelled", [
				"One of the sign-ins was cancelled, so nothing was linked.",
				RESTART
			]);
		case "busy": {
			const response = page(429, "Too many attempts", [
				"Too many sign-in attempts came from your network. Wait a minute, then try again.",
				RESTART
			]);
			response.headers.set("Retry-After", "60");
			return response;
		}
		case "session":
			return page(400, "This sign-in expired", [
				"The sign-in took too long, was started in another tab, or cookies are blocked for this site. Nothing was linked.",
				RESTART
			]);
		default:
			return page(502, "Something went wrong", [
				"Discord or Roblox did not complete the sign-in. Nothing was linked.",
				"Roblox only lets accounts aged 13 or older authorize apps.",
				RESTART
			]);
	}
}

// ---------------------------------------------------------------------------
// Conversa com os provedores
// ---------------------------------------------------------------------------

async function postForm(url, params) {
	const response = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
		body: new URLSearchParams(params)
	});

	if (!response.ok) {
		throw new Error(`${url} respondeu ${response.status}`);
	}

	return response.json();
}

async function getJson(url, accessToken) {
	const response = await fetch(url, {
		headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" }
	});

	if (!response.ok) {
		throw new Error(`${url} respondeu ${response.status}`);
	}

	return response.json();
}

function isConfigured(env) {
	return Boolean(
		env.DISCORD_CLIENT_ID && env.DISCORD_CLIENT_SECRET && env.DISCORD_REDIRECT_URI &&
		env.ROBLOX_CLIENT_ID && env.ROBLOX_CLIENT_SECRET && env.ROBLOX_REDIRECT_URI &&
		env.SESSION_KEY && env.PENDING
	);
}

// ---------------------------------------------------------------------------
// Rotas
// ---------------------------------------------------------------------------

async function start(env) {
	const state = randomToken(16);
	const session = { step: "discord", st: state, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };

	const params = new URLSearchParams({
		client_id: env.DISCORD_CLIENT_ID,
		response_type: "code",
		scope: "identify",
		redirect_uri: env.DISCORD_REDIRECT_URI,
		state,
		// Quem ja autorizou o Sollarety passa direto, sem tela de consentimento.
		prompt: "none"
	});

	return redirect(
		`https://discord.com/oauth2/authorize?${params}`,
		sessionCookie(await sealSession(env, session), SESSION_TTL_SECONDS)
	);
}

async function discordCallback(env, ctx, url, session) {
	if (url.searchParams.get("error") || !url.searchParams.get("code")) {
		return errorPage("denied");
	}

	const token = await postForm(`${DISCORD_API}/oauth2/token`, {
		grant_type: "authorization_code",
		client_id: env.DISCORD_CLIENT_ID,
		client_secret: env.DISCORD_CLIENT_SECRET,
		code: url.searchParams.get("code"),
		redirect_uri: env.DISCORD_REDIRECT_URI
	});

	const user = await getJson(`${DISCORD_API}/users/@me`, token.access_token);
	if (!DISCORD_ID.test(String(user.id))) {
		throw new Error("id do Discord fora do formato");
	}

	// O token so servia para ler o id. Revogado ja, em segundo plano: a resposta
	// ao navegador nao espera por isso.
	ctx.waitUntil(
		postForm(`${DISCORD_API}/oauth2/token/revoke`, {
			token: token.access_token,
			token_type_hint: "access_token",
			client_id: env.DISCORD_CLIENT_ID,
			client_secret: env.DISCORD_CLIENT_SECRET
		}).catch(() => {})
	);

	const verifier = randomToken(32);
	const challenge = base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(verifier))));
	const state = randomToken(16);

	const next = {
		step: "roblox",
		st: state,
		v: verifier,
		d: String(user.id),
		dn: String(user.global_name || user.username || "").slice(0, 64),
		du: String(user.username || "").slice(0, 64),
		exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
	};

	const params = new URLSearchParams({
		client_id: env.ROBLOX_CLIENT_ID,
		response_type: "code",
		scope: "openid profile",
		redirect_uri: env.ROBLOX_REDIRECT_URI,
		state,
		code_challenge: challenge,
		code_challenge_method: "S256"
	});

	return redirect(
		`${ROBLOX_OAUTH}/authorize?${params}`,
		sessionCookie(await sealSession(env, next), SESSION_TTL_SECONDS)
	);
}

async function robloxCallback(env, ctx, url, session) {
	if (url.searchParams.get("error") || !url.searchParams.get("code")) {
		return errorPage("denied");
	}

	const token = await postForm(`${ROBLOX_OAUTH}/token`, {
		grant_type: "authorization_code",
		code: url.searchParams.get("code"),
		code_verifier: session.v,
		client_id: env.ROBLOX_CLIENT_ID,
		client_secret: env.ROBLOX_CLIENT_SECRET
	});

	const info = await getJson(`${ROBLOX_OAUTH}/userinfo`, token.access_token);

	// Nao ha motivo para manter sessao com o Roblox: o que se queria era o id.
	// Revogar o refresh token encerra a autorizacao inteira do lado deles.
	if (token.refresh_token) {
		ctx.waitUntil(
			postForm(`${ROBLOX_OAUTH}/token/revoke`, {
				token: token.refresh_token,
				client_id: env.ROBLOX_CLIENT_ID,
				client_secret: env.ROBLOX_CLIENT_SECRET
			}).catch(() => {})
		);
	}

	const robloxId = String(info.sub ?? "");
	if (!/^\d{1,20}$/.test(robloxId)) {
		throw new Error("sub do Roblox fora do formato");
	}

	// preferred_username e o nome de usuario; nickname e o de exibicao. O bot so
	// confia no id e rele os nomes na API publica, mas guarda estes como reserva.
	const name = String(info.preferred_username || info.name || "").slice(0, 64);
	const displayName = String(info.nickname || info.name || name).slice(0, 64);

	await pendingStore(env).put(session.d, {
		discordId: session.d,
		robloxId,
		name,
		displayName,
		createdAt: Number.isFinite(info.created_at) ? info.created_at : null,
		at: Date.now()
	});

	return page(200, "Account linked", [
		`Roblox account <strong>@${escapeHtml(name)}</strong> is now linked to the Discord account <strong>${escapeHtml(session.dn || session.du)}</strong>` +
			(session.du && session.dn !== session.du ? ` (@${escapeHtml(session.du)})` : "") + ".",
		"You can close this tab and go back to Discord. Sollarety picks this up within a few seconds.",
		"Not the Discord account you ran <strong>/verify</strong> with? This browser is signed in to a different one. " +
			"Sign out on discord.com and start again; this link expires on its own in 30 minutes."
	]);
}

async function result(env, request, url) {
	if (!env.BOT_API_SECRET || !env.PENDING) {
		return new Response("Not configured", { status: 503, headers: SECURITY_HEADERS });
	}

	const auth = request.headers.get("Authorization") || "";
	const presented = auth.startsWith("Bearer ") ? auth.slice(7) : "";
	if (!presented || !(await safeEqual(presented, env.BOT_API_SECRET))) {
		return new Response("Unauthorized", { status: 401, headers: SECURITY_HEADERS });
	}

	const discordId = url.searchParams.get("d") || "";
	if (!DISCORD_ID.test(discordId)) {
		return new Response("Bad request", { status: 400, headers: SECURITY_HEADERS });
	}

	const payload = await pendingStore(env).take(discordId);
	if (!payload) {
		return new Response(JSON.stringify({ status: "pending" }), {
			status: 404,
			headers: { ...SECURITY_HEADERS, "Content-Type": "application/json" }
		});
	}

	return new Response(JSON.stringify(payload), {
		status: 200,
		headers: { ...SECURITY_HEADERS, "Content-Type": "application/json" }
	});
}

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		// So GET. HEAD tambem consumiria o authorization code (de uso unico) e,
		// no /result, o resultado pendente, sem entregar nada a ninguem.
		if (request.method !== "GET") {
			return new Response("Method not allowed", { status: 405, headers: { ...SECURITY_HEADERS, Allow: "GET" } });
		}

		// Rate limit por IP antes de qualquer rota. O cookie de sessao nao e de uso
		// unico: com ele e o state de um /start, da para repetir /discord?code=lixo
		// por dez minutos, e cada repeticao custa uma troca de token no Discord.
		//
		// Fica de fora so o polling do bot no /result - vem com Bearer, sai do IP
		// de casa a cada 4 s por verificacao pendente e, com varias ao mesmo
		// tempo, estouraria o limite de quem esta so fazendo login. Um Bearer
		// falso nao ganha nada com a isencao: custa dois SHA-256 e leva 401.
		const botPoll = url.pathname === `${PREFIX}/result`
			&& (request.headers.get("Authorization") || "").startsWith("Bearer ");
		if (!botPoll && env.VERIFY_LIMITER) {
			const { success } = await env.VERIFY_LIMITER.limit({ key: limiterKey(request) });
			if (!success) {
				return errorPage("busy");
			}
		}

		// Igualdade exata em cada rota, nao startsWith: "/oauth/roblox/callbackX"
		// nao e rota nenhuma.
		switch (url.pathname) {
			case `${PREFIX}/result`:
				return result(env, request, url);

			case `${PREFIX}/start`:
				return isConfigured(env) ? start(env) : errorPage("config");

			case `${PREFIX}/discord`:
			case `${PREFIX}/callback`: {
				if (!isConfigured(env)) {
					return errorPage("config");
				}

				const step = url.pathname.endsWith("/discord") ? "discord" : "roblox";
				const session = await openSession(env, request);

				// O state volta do provedor e tem de bater com o que este navegador
				// guardou. E o que impede alguem de fazer outra pessoa terminar um
				// login comecado por ele.
				const state = url.searchParams.get("state") || "";
				if (!session || session.step !== step || !state || !(await safeEqual(state, session.st))) {
					return errorPage("session");
				}

				try {
					return step === "discord"
						? await discordCallback(env, ctx, url, session)
						: await robloxCallback(env, ctx, url, session);
				} catch (error) {
					console.log(`[roblox-verify] ${step}: ${error.message}`);
					return errorPage("oauth");
				}
			}

			default:
				return new Response("Not found", { status: 404, headers: SECURITY_HEADERS });
		}
	}
};
