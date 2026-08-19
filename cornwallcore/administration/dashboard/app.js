const DEFAULT_LOCAL_API_BASE = "http://127.0.0.1:5056";
// O proxy da API mora no dominio raiz. O dashboard agora e servido em
// dashboard.daeese.me, que nao tem rota /api propria, entao as chamadas saem
// cross-origin para ca - o Worker da API libera essa origem por CORS.
const PROXY_API_ORIGIN = "https://daeese.me";
const PERMISSION_LABELS = {
  4: "Developer",
  3: "General Staff",
  2: "Regimental Command",
  1: "NCO/Officer"
};

function isLocalHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function getDefaultApiBase() {
  const { protocol, hostname } = window.location;

  // Desenvolvimento local: a pagina roda em http://localhost e fala direto com
  // o bot, sem passar pelo proxy.
  if (protocol !== "https:" && isLocalHost(hostname)) {
    return DEFAULT_LOCAL_API_BASE;
  }

  // Em daeese.me o proxy e same-origin. Em dashboard.daeese.me nao existe rota
  // /api, entao apontamos para o proxy no dominio raiz.
  return hostname === "daeese.me" ? "/api" : `${PROXY_API_ORIGIN}/api`;
}

function normalizeApiBase(value) {
  const input = (value || "").trim();
  if (!input) {
    return getDefaultApiBase();
  }

  if (input === "/") {
    return "";
  }

  try {
    const parsedUrl = new URL(input, window.location.origin);
    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      return parsedUrl.pathname.startsWith("/api") ? `${parsedUrl.origin}/api` : parsedUrl.origin;
    }
  } catch {
  }

  if (input.startsWith("/api")) {
    return "/api";
  }

  return input.replace(/\/$/, "");
}

function shouldForceProxyBase(value) {
  if (window.location.protocol !== "https:") {
    return false;
  }

  if (!/^https?:\/\//i.test(value)) {
    return false;
  }

  // Descarta valor guardado que nao vai funcionar numa pagina https: http://
  // e bloqueado como conteudo misto, e qualquer origem que nao seja a do proxy
  // oficial seria barrada no CORS. A origem da propria pagina tambem vale,
  // para o caso de o dashboard estar sendo servido em daeese.me.
  const acceptable = [PROXY_API_ORIGIN, window.location.origin];
  return !acceptable.some((origin) => value === origin || value.startsWith(`${origin}/`));
}

const storedApiBase = localStorage.getItem("dashboardApiBase") || "";
const initialApiBase = shouldForceProxyBase(storedApiBase) ? getDefaultApiBase() : (storedApiBase || getDefaultApiBase());

const state = {
  apiBase: normalizeApiBase(initialApiBase),
  token: sessionStorage.getItem("dashboardToken") || "",
  user: null
};

const els = {
  loginView: document.getElementById("loginView"),
  dashboardView: document.getElementById("dashboardView"),
  apiBase: document.getElementById("apiBase"),
  linkCode: document.getElementById("linkCode"),
  loginBtn: document.getElementById("loginBtn"),
  loginMessage: document.getElementById("loginMessage"),
  profileAvatar: document.getElementById("profileAvatar"),
  profileName: document.getElementById("profileName"),
  profilePermission: document.getElementById("profilePermission"),
  refreshAuditBtn: document.getElementById("refreshAuditBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  roleUserId: document.getElementById("roleUserId"),
  roleId: document.getElementById("roleId"),
  roleReason: document.getElementById("roleReason"),
  addRoleBtn: document.getElementById("addRoleBtn"),
  removeRoleBtn: document.getElementById("removeRoleBtn"),
  roleMsg: document.getElementById("roleMsg"),
  msgChannelId: document.getElementById("msgChannelId"),
  msgContent: document.getElementById("msgContent"),
  sendMsgBtn: document.getElementById("sendMsgBtn"),
  msgSendStatus: document.getElementById("msgSendStatus"),
  punishUserId: document.getElementById("punishUserId"),
  punishReason: document.getElementById("punishReason"),
  timeoutMinutes: document.getElementById("timeoutMinutes"),
  timeoutBtn: document.getElementById("timeoutBtn"),
  removeRegimentBtn: document.getElementById("removeRegimentBtn"),
  punishMsg: document.getElementById("punishMsg"),
  auditList: document.getElementById("auditList")
};

els.apiBase.value = state.apiBase;

function apiUrl(path) {
  const base = normalizeApiBase(state.apiBase);
  if (!base) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (base.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    return `${base}${normalizedPath.substring(4)}`;
  }

  if (base.startsWith("http://") || base.startsWith("https://")) {
    return `${base}${normalizedPath}`;
  }

  return `${base.startsWith("/") ? base : `/${base}`}${normalizedPath}`;
}

async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const requestUrl = apiUrl(path);
  let res;

  try {
    res = await fetch(requestUrl, {
      ...options,
      headers
    });
  } catch (err) {
    const usingInsecureApi = state.apiBase.startsWith("http://");
    const inHttpsPage = window.location.protocol === "https:";
    const remotePage = !isLocalHost(window.location.hostname);

    if (usingInsecureApi && inHttpsPage) {
      throw new Error("Conexao bloqueada pelo navegador: pagina HTTPS nao pode chamar API HTTP. Use /api ou HTTPS na API.");
    }

    if (state.apiBase.includes("127.0.0.1") && remotePage) {
      throw new Error("API em localhost nao funciona para acesso remoto. Use /api com proxy no servidor.");
    }

    throw new Error("Falha de rede ao conectar na API. Confira URL da API e se o bot esta online.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      state.token = "";
      sessionStorage.removeItem("dashboardToken");
      state.user = null;
      showLogin();
    }

    throw new Error(data.error || "Erro desconhecido na API");
  }

  return data;
}

function parseDiscordSnowflake(value, label) {
  const raw = (value || "").trim();
  if (!/^\d{10,20}$/.test(raw)) {
    throw new Error(`${label} invalido. Informe um ID numerico do Discord.`);
  }

  return raw;
}

const FALLBACK_AVATAR = "https://cdn.discordapp.com/embed/avatars/0.png";

// Avatares vem da API do bot, que os repassa do Discord. So aceitamos http(s)
// para que um valor tipo "javascript:" nunca chegue a um atributo src.
function safeAvatarUrl(value) {
  const candidate = String(value || "").trim();
  if (/^https?:\/\//i.test(candidate)) {
    return candidate;
  }

  return FALLBACK_AVATAR;
}

function setMessage(el, text, isError = false) {
  el.textContent = text;
  el.style.color = isError ? "#ff8f8f" : "#9ab0c2";
}

function getPermissionLabel(level) {
  return PERMISSION_LABELS[level] || "Unknown";
}

function showDashboard() {
  els.loginView.classList.add("hidden");
  els.dashboardView.classList.remove("hidden");
}

function showLogin() {
  els.dashboardView.classList.add("hidden");
  els.loginView.classList.remove("hidden");
}

function applyUser(user) {
  state.user = user;
  els.profileAvatar.src = safeAvatarUrl(user.avatarUrl);
  els.profileName.textContent = user.username;
  els.profilePermission.textContent = `${getPermissionLabel(user.permissionLevel)} (${user.permissionLevel})`;

  const level = Number(user.permissionLevel) || 0;

  // Sempre reatribuido (nao so desabilitado) para que trocar de conta sem
  // recarregar a pagina reflita a permissao do usuario atual.
  const canManageRoles = level >= 3;
  els.addRoleBtn.disabled = !canManageRoles;
  els.removeRoleBtn.disabled = !canManageRoles;
  setMessage(
    els.roleMsg,
    canManageRoles ? "" : "Sua permissão não permite gerenciar cargos.",
    !canManageRoles
  );

  const canPunish = level >= 2;
  els.timeoutBtn.disabled = !canPunish;
  els.removeRegimentBtn.disabled = !canPunish;
  setMessage(
    els.punishMsg,
    canPunish ? "" : "Sua permissão não permite punições administrativas.",
    !canPunish
  );
}

async function loadMeAndAudit() {
  const me = await apiRequest("/api/auth/me");
  applyUser(me.user);
  showDashboard();
  await loadAudit();
}

async function loadAudit() {
  const { logs } = await apiRequest("/api/audit", { method: "GET" });
  els.auditList.innerHTML = "";

  for (const log of Array.isArray(logs) ? logs : []) {
    const li = document.createElement("li");
    const img = document.createElement("img");
    img.src = safeAvatarUrl(log.actorAvatarUrl);
    img.alt = `Avatar de ${log.actorUsername}`;

    const main = document.createElement("div");
    main.className = "audit-main";

    // actorUsername/action/details sao controlados por qualquer membro do
    // Discord: montamos nos de texto em vez de interpolar em innerHTML.
    const actor = document.createElement("strong");
    actor.textContent = log.actorUsername ?? "";
    main.appendChild(actor);
    main.appendChild(document.createTextNode(` - ${log.action ?? ""}`));
    main.appendChild(document.createElement("br"));
    main.appendChild(document.createTextNode(log.details ?? ""));

    const time = document.createElement("span");
    time.className = "audit-time";
    const parsedTime = new Date(log.timestampUtc);
    time.textContent = Number.isNaN(parsedTime.getTime())
      ? ""
      : parsedTime.toLocaleString("pt-BR");

    main.appendChild(time);
    li.appendChild(img);
    li.appendChild(main);
    els.auditList.appendChild(li);
  }
}

async function submitLogin() {
  if (els.loginBtn.disabled) {
    return;
  }

  els.loginBtn.disabled = true;
  setMessage(els.loginMessage, "Autenticando...");
  state.apiBase = normalizeApiBase(els.apiBase.value);
  els.apiBase.value = state.apiBase;

  if (shouldForceProxyBase(state.apiBase)) {
    state.apiBase = getDefaultApiBase();
    els.apiBase.value = state.apiBase;
  }

  localStorage.setItem("dashboardApiBase", state.apiBase);

  if (state.apiBase.includes("127.0.0.1") && !isLocalHost(window.location.hostname)) {
    setMessage(els.loginMessage, "URL localhost so funciona na mesma maquina do bot. Use /api para acesso remoto.", true);
    els.loginBtn.disabled = false;
    return;
  }

  try {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ linkCode: els.linkCode.value.trim() })
    });

    state.token = data.token;
    sessionStorage.setItem("dashboardToken", state.token);
    setMessage(els.loginMessage, "Login realizado com sucesso.");
    await loadMeAndAudit();
  } catch (err) {
    setMessage(els.loginMessage, err.message, true);
  } finally {
    els.loginBtn.disabled = false;
  }
}

els.loginBtn.addEventListener("click", submitLogin);

// Enter em qualquer um dos campos envia o login.
[els.apiBase, els.linkCode].forEach((input) => {
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitLogin();
    }
  });
});

els.logoutBtn.addEventListener("click", async () => {
  try {
    await apiRequest("/api/auth/logout", { method: "POST" });
  } catch {
  }

  state.token = "";
  sessionStorage.removeItem("dashboardToken");
  state.user = null;
  showLogin();
});

els.refreshAuditBtn.addEventListener("click", async () => {
  els.refreshAuditBtn.disabled = true;
  try {
    await loadAudit();
    setMessage(els.loginMessage, "");
  } catch (err) {
    setMessage(els.loginMessage, err.message, true);
  } finally {
    els.refreshAuditBtn.disabled = false;
  }
});

els.sendMsgBtn.addEventListener("click", async () => {
  try {
    await apiRequest("/api/messages/send", {
      method: "POST",
      body: JSON.stringify({
        channelId: parseDiscordSnowflake(els.msgChannelId.value, "Canal"),
        message: els.msgContent.value
      })
    });

    setMessage(els.msgSendStatus, "Mensagem enviada com sucesso.");
    await loadAudit();
  } catch (err) {
    setMessage(els.msgSendStatus, err.message, true);
  }
});

els.addRoleBtn.addEventListener("click", async () => {
  try {
    await apiRequest("/api/roles/add", {
      method: "POST",
      body: JSON.stringify({
        userId: parseDiscordSnowflake(els.roleUserId.value, "Usuario"),
        roleId: parseDiscordSnowflake(els.roleId.value, "Cargo"),
        reason: els.roleReason.value.trim()
      })
    });

    setMessage(els.roleMsg, "Cargo adicionado.");
    await loadAudit();
  } catch (err) {
    setMessage(els.roleMsg, err.message, true);
  }
});

els.removeRoleBtn.addEventListener("click", async () => {
  try {
    await apiRequest("/api/roles/remove", {
      method: "POST",
      body: JSON.stringify({
        userId: parseDiscordSnowflake(els.roleUserId.value, "Usuario"),
        roleId: parseDiscordSnowflake(els.roleId.value, "Cargo"),
        reason: els.roleReason.value.trim()
      })
    });

    setMessage(els.roleMsg, "Cargo removido.");
    await loadAudit();
  } catch (err) {
    setMessage(els.roleMsg, err.message, true);
  }
});

els.timeoutBtn.addEventListener("click", async () => {
  try {
    const duration = Number(els.timeoutMinutes.value.trim());
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error("Timeout invalido. Informe minutos maiores que zero.");
    }

    await apiRequest("/api/punishments/timeout", {
      method: "POST",
      body: JSON.stringify({
        userId: parseDiscordSnowflake(els.punishUserId.value, "Usuario"),
        durationMinutes: duration,
        reason: els.punishReason.value.trim()
      })
    });

    setMessage(els.punishMsg, "Timeout aplicado.");
    await loadAudit();
  } catch (err) {
    setMessage(els.punishMsg, err.message, true);
  }
});

els.removeRegimentBtn.addEventListener("click", async () => {
  try {
    await apiRequest("/api/punishments/remove-from-regiment", {
      method: "POST",
      body: JSON.stringify({
        userId: parseDiscordSnowflake(els.punishUserId.value, "Usuario"),
        reason: els.punishReason.value.trim()
      })
    });

    setMessage(els.punishMsg, "Usuário removido do regimento.");
    await loadAudit();
  } catch (err) {
    setMessage(els.punishMsg, err.message, true);
  }
});

(async function bootstrap() {
  showLogin();
  if (!state.token) {
    return;
  }

  try {
    await loadMeAndAudit();
  } catch {
    state.token = "";
    sessionStorage.removeItem("dashboardToken");
    showLogin();
  }
})();
