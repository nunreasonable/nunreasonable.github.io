// Backend do convite do Sollarety em ccore.daeese.me/fun/invite/.
//
// Existe por um motivo so: trocar o `code` do OAuth2 pelo access token exige o
// client secret, e segredo nao pode morar numa pagina estatica do GitHub Pages.
// Tudo o mais - montar a URL de autorizacao, desenhar a lista, mandar o usuario
// para o Discord - a propria pagina faz sozinha.
//
// O que este Worker devolve ao navegador nao precisa ser confiavel. A lista de
// servidores serve so para desenhar botoes; quem decide de fato se aquela
// pessoa pode adicionar o bot naquele servidor e o Discord, na tela de
// autorizacao. Por isso nada aqui e assinado - nao ha o que falsificar que o
// Discord nao va recusar depois.

const DISCORD_API = "https://discord.com/api/v10";

// Bit MANAGE_GUILD. E a permissao que o Discord exige para adicionar uma
// aplicacao a um servidor, entao e por ela que a lista e filtrada: mostrar um
// servidor onde o clique so pode dar errado seria pior que omiti-lo.
const MANAGE_GUILD = 1n << 5n;

// Teto para o fragmento nao crescer sem limite em quem esta em centenas de
// servidores. O nome tambem e cortado pelo mesmo motivo.
const MAX_GUILDS = 200;
const MAX_NAME_LENGTH = 100;

// Codigos de erro que a pagina sabe traduzir. Nada de repassar o corpo de erro
// do Discord: ele carrega detalhe de aplicacao que o visitante nao deve ver.
const ERR_DENIED = "denied";     // o usuario clicou em cancelar
const ERR_CONFIG = "config";     // falta client id ou secret na borda
const ERR_OAUTH = "oauth";       // qualquer falha da conversa com o Discord

function base64urlEncode(text) {
	// btoa so aceita latin1, e nome de servidor tem emoji e acento a vontade.
	const bytes = new TextEncoder().encode(text);
	let binary = "";
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}

	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function redirectTo(url) {
	return new Response(null, {
		status: 302,
		headers: {
			Location: url,
			// A resposta carrega dado de conta no fragmento. Nenhum cache pode
			// guardar isto, nem o do navegador.
			"Cache-Control": "no-store",
			"Referrer-Policy": "no-referrer"
		}
	});
}

function failTo(returnUrl, code, state) {
	const suffix = state ? `&state=${encodeURIComponent(state)}` : "";
	return redirectTo(`${returnUrl}#e=${code}${suffix}`);
}

async function exchangeCode(env, code) {
	const body = new URLSearchParams({
		grant_type: "authorization_code",
		client_id: env.DISCORD_CLIENT_ID,
		client_secret: env.DISCORD_CLIENT_SECRET,
		code,
		redirect_uri: env.REDIRECT_URI
	});

	const response = await fetch(`${DISCORD_API}/oauth2/token`, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body
	});

	if (!response.ok) {
		throw new Error(`token endpoint respondeu ${response.status}`);
	}

	const payload = await response.json();
	if (!payload.access_token) {
		throw new Error("token endpoint nao devolveu access_token");
	}

	return payload.access_token;
}

async function fetchAsUser(accessToken, path) {
	const response = await fetch(`${DISCORD_API}${path}`, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});

	if (!response.ok) {
		throw new Error(`GET ${path} respondeu ${response.status}`);
	}

	return response.json();
}

function canAddBots(guild) {
	if (guild.owner === true) {
		return true;
	}

	try {
		return (BigInt(guild.permissions ?? "0") & MANAGE_GUILD) !== 0n;
	} catch {
		// Campo ausente ou fora do formato: melhor omitir do que oferecer um
		// botao que so pode falhar.
		return false;
	}
}

function packGuilds(guilds) {
	return guilds
		.filter(canAddBots)
		.slice(0, MAX_GUILDS)
		.map((guild) => ({
			i: guild.id,
			n: String(guild.name ?? "").slice(0, MAX_NAME_LENGTH),
			c: guild.icon ?? null
		}));
}

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const returnUrl = env.RETURN_URL || "https://ccore.daeese.me/fun/invite/";

		if (!url.pathname.startsWith("/oauth/fun/callback")) {
			return new Response("Not found", { status: 404 });
		}

		// So GET chega aqui de verdade: e um redirect do navegador.
		if (request.method !== "GET" && request.method !== "HEAD") {
			return new Response("Method not allowed", { status: 405 });
		}

		// O state e gerado pela pagina e devolvido intacto. Quem compara e a
		// pagina, que e a unica ponta que sabe qual valor ela guardou - o Worker
		// nao tem sessao para consultar.
		const state = url.searchParams.get("state") || "";
		const code = url.searchParams.get("code");

		if (!code) {
			return failTo(returnUrl, ERR_DENIED, state);
		}

		if (!env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET) {
			return failTo(returnUrl, ERR_CONFIG, state);
		}

		try {
			const accessToken = await exchangeCode(env, code);

			const [user, guilds] = await Promise.all([
				fetchAsUser(accessToken, "/users/@me"),
				fetchAsUser(accessToken, "/users/@me/guilds")
			]);

			// O token morre aqui. Nao vai para cookie, nem para o fragmento, nem
			// para lugar nenhum que o navegador consiga ler.
			const payload = {
				s: state,
				u: {
					n: user.global_name || user.username || "",
					i: user.id,
					a: user.avatar ?? null
				},
				g: packGuilds(Array.isArray(guilds) ? guilds : [])
			};

			return redirectTo(`${returnUrl}#d=${base64urlEncode(JSON.stringify(payload))}`);
		} catch {
			return failTo(returnUrl, ERR_OAUTH, state);
		}
	}
};
