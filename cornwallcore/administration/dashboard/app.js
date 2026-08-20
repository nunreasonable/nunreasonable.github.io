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
  auditList: document.getElementById("auditList"),
  auditEmpty: document.getElementById("auditEmpty"),

  tabs: Array.from(document.querySelectorAll(".tab")),
  tabPanels: Array.from(document.querySelectorAll(".tab-panel")),

  rosterSearch: document.getElementById("rosterSearch"),
  rosterRefreshBtn: document.getElementById("rosterRefreshBtn"),
  rosterTotals: document.getElementById("rosterTotals"),
  rosterBody: document.getElementById("rosterBody"),
  rosterMsg: document.getElementById("rosterMsg"),

  editUsername: document.getElementById("editUsername"),
  editNewUsername: document.getElementById("editNewUsername"),
  editKills: document.getElementById("editKills"),
  editDeaths: document.getElementById("editDeaths"),
  editAssists: document.getElementById("editAssists"),
  editBattles: document.getElementById("editBattles"),
  editScope: document.getElementById("editScope"),
  editSaveBtn: document.getElementById("editSaveBtn"),
  editRemoveBtn: document.getElementById("editRemoveBtn"),
  editMsg: document.getElementById("editMsg"),

  rankUsername: document.getElementById("rankUsername"),
  rankValue: document.getElementById("rankValue"),
  rankSaveBtn: document.getElementById("rankSaveBtn"),
  rankMsg: document.getElementById("rankMsg"),

  pushPending: document.getElementById("pushPending"),
  pushDryBtn: document.getElementById("pushDryBtn"),
  pushBtn: document.getElementById("pushBtn"),
  pushResult: document.getElementById("pushResult"),
  pushMsg: document.getElementById("pushMsg"),

  auditHistoryList: document.getElementById("auditHistoryList"),
  auditHistoryEmpty: document.getElementById("auditHistoryEmpty"),

  deployCode: document.getElementById("deployCode"),
  deployBtn: document.getElementById("deployBtn"),
  deployMsg: document.getElementById("deployMsg"),

  dmRoleId: document.getElementById("dmRoleId"),
  dmUserId: document.getElementById("dmUserId"),
  dmCode: document.getElementById("dmCode"),
  dmMessage: document.getElementById("dmMessage"),
  dmBtn: document.getElementById("dmBtn"),
  dmProgressWrap: document.getElementById("dmProgressWrap"),
  dmProgressBar: document.getElementById("dmProgressBar"),
  dmProgressText: document.getElementById("dmProgressText"),
  dmMsg: document.getElementById("dmMsg"),

  enlistUserId: document.getElementById("enlistUserId"),
  enlistRoblox: document.getElementById("enlistRoblox"),
  enlistSocial: document.getElementById("enlistSocial"),
  enlistBtn: document.getElementById("enlistBtn"),
  enlistResult: document.getElementById("enlistResult"),
  enlistMsg: document.getElementById("enlistMsg"),

  promotionsRefreshBtn: document.getElementById("promotionsRefreshBtn"),
  promotionsBody: document.getElementById("promotionsBody"),
  promotionsMsg: document.getElementById("promotionsMsg"),

  logLevel: document.getElementById("logLevel"),
  logQuery: document.getElementById("logQuery"),
  logRefreshBtn: document.getElementById("logRefreshBtn"),
  logAuto: document.getElementById("logAuto"),
  logCounts: document.getElementById("logCounts"),
  logOutput: document.getElementById("logOutput"),
  logMsg: document.getElementById("logMsg")
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

/**
 * Escreve uma mensagem de status.
 *
 * O tom vira classe CSS em vez de cor inline: antes o vermelho de erro estava
 * escrito em hexadecimal aqui dentro, fora do sistema de cores da folha de
 * estilo, entao mudar a paleta nao alcancava esta mensagem.
 *
 * Aceita `true` como segundo argumento por compatibilidade com as chamadas
 * antigas, que passavam um booleano de "isError".
 */
function setMessage(el, text, tone = "") {
  const resolved = tone === true ? "error" : (tone || "");

  el.textContent = text;
  el.classList.remove("is-error", "is-success");

  if (!text) {
    return;
  }

  if (resolved === "error") {
    el.classList.add("is-error");
  } else if (resolved === "success") {
    el.classList.add("is-success");
  }
}

/**
 * Nome do nivel de permissao.
 *
 * A API ja devolve `permissionName`; PERMISSION_LABELS existe so como reserva
 * para o caso de uma resposta antiga sem esse campo. Preferir o valor do
 * servidor evita que os dois lados divirjam silenciosamente quando os niveis
 * mudarem no bot.
 */
function getPermissionLabel(level, serverName) {
  if (typeof serverName === "string" && serverName.trim()) {
    return serverName.trim();
  }

  return PERMISSION_LABELS[level] || "Desconhecido";
}

function showDashboard() {
  els.loginView.classList.add("hidden");
  els.dashboardView.classList.remove("hidden");

  // Reafirma o invariante em vez de confiar nas classes escritas a mao no
  // HTML: ao abrir o painel, exatamente uma aba esta visivel e as outras nao.
  // Se um painel novo for adicionado sem o .hidden inicial, isto corrige
  // sozinho em vez de deixar dois aparecerem juntos.
  selectTab(activeTabName());
}

// Aba marcada como ativa no HTML; cai na primeira se nenhuma estiver.
function activeTabName() {
  const marked = els.tabs.find((tab) => tab.classList.contains("is-active"));
  return (marked || els.tabs[0])?.dataset.tab;
}

function showLogin() {
  els.dashboardView.classList.add("hidden");
  els.loginView.classList.remove("hidden");
}

function applyUser(user) {
  state.user = user;
  els.profileAvatar.src = safeAvatarUrl(user.avatarUrl);
  els.profileName.textContent = user.username;
  els.profilePermission.textContent =
    `${getPermissionLabel(user.permissionLevel, user.permissionName)} (nível ${user.permissionLevel})`;

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

  // Deployment segue o mesmo nivel das punicoes: e uma acao que notifica o
  // servidor inteiro.
  els.deployBtn.disabled = !canPunish;
  setMessage(els.deployMsg, canPunish ? "" : "Sua permissão não permite enviar deployments.", !canPunish);

  // Nivel 3 concentra o que altera dados historicos ou expoe o interior do
  // bot: auditoria, DM em massa, alistamento e logs.
  const canManageAudit = level >= 3;
  [els.editSaveBtn, els.editRemoveBtn, els.rankSaveBtn, els.pushBtn, els.pushDryBtn].forEach((btn) => {
    btn.disabled = !canManageAudit;
  });
  setMessage(els.editMsg, canManageAudit ? "" : "Sua permissão não permite editar a auditoria.", !canManageAudit);
  setMessage(els.rankMsg, canManageAudit ? "" : "Sua permissão não permite definir patentes.", !canManageAudit);
  setMessage(els.pushMsg, canManageAudit ? "" : "Sua permissão não permite publicar a auditoria.", !canManageAudit);

  els.dmBtn.disabled = !canManageAudit;
  setMessage(els.dmMsg, canManageAudit ? "" : "Sua permissão não permite enviar DM em massa.", !canManageAudit);

  els.enlistBtn.disabled = !canManageAudit;
  setMessage(els.enlistMsg, canManageAudit ? "" : "Sua permissão não permite alistar usuários.", !canManageAudit);

  els.logRefreshBtn.disabled = !canManageAudit;
  els.logAuto.disabled = !canManageAudit;
  if (!canManageAudit) {
    stopLogAutoRefresh();
    els.logAuto.checked = false;
  }
  setMessage(els.logMsg, canManageAudit ? "" : "Sua permissão não permite ver os logs do bot.", !canManageAudit);
}

/* ------------------------------------------------------------------ *
 * Abas
 * ------------------------------------------------------------------ */

function selectTab(name) {
  els.tabs.forEach((tab) => {
    const active = tab.dataset.tab === name;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", active ? "true" : "false");
  });

  els.tabPanels.forEach((panel) => {
    panel.classList.toggle("hidden", panel.dataset.panel !== name);
  });

  // Sair da aba de logs desliga o auto-refresh: manter um timer batendo na
  // API por uma aba que ninguem esta vendo e so gasto.
  if (name !== "logs") {
    stopLogAutoRefresh();
  } else if (els.logAuto.checked) {
    startLogAutoRefresh();
  }
}

els.tabs.forEach((tab) => {
  tab.addEventListener("click", () => selectTab(tab.dataset.tab));
});

/* ------------------------------------------------------------------ *
 * Helpers de renderizacao
 *
 * Toda a montagem de tabela e lista usa nos de texto, nunca innerHTML: nome
 * de jogador, patente e texto de excecao sao conteudo de terceiros. E a mesma
 * regra que loadAudit() ja seguia.
 * ------------------------------------------------------------------ */

function cell(text, className) {
  const td = document.createElement("td");
  td.textContent = text ?? "";
  if (className) {
    td.className = className;
  }
  return td;
}

function emptyRow(tbody, colspan, text) {
  const tr = document.createElement("tr");
  const td = document.createElement("td");
  td.colSpan = colspan;
  td.className = "empty-cell";
  td.textContent = text;
  tr.appendChild(td);
  tbody.appendChild(tr);
}

function formatDateTime(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleString("pt-BR");
}

function readCount(input, label) {
  const raw = (input.value || "").trim();
  if (raw === "") {
    return 0;
  }

  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} precisa ser um número inteiro não negativo.`);
  }

  return value;
}

async function loadMeAndAudit() {
  const me = await apiRequest("/api/auth/me");
  applyUser(me.user);
  showDashboard();
  await loadAudit();

  // O efetivo e o historico sao complementares: se um deles falhar, o painel
  // continua utilizavel e o erro aparece na propria aba, em vez de derrubar o
  // login inteiro de volta para a tela de codigo.
  try {
    await loadRoster();
    await loadAuditHistory();
  } catch (err) {
    setMessage(els.rosterMsg, err.message, true);
  }
}

async function loadAudit() {
  const { logs } = await apiRequest("/api/audit", { method: "GET" });
  els.auditList.innerHTML = "";

  // Sem isto a lista simplesmente ficava em branco, sem dizer se estava vazia
  // ou se a carga tinha falhado.
  const hasLogs = Array.isArray(logs) && logs.length > 0;
  els.auditEmpty.classList.toggle("hidden", hasLogs);

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
    setMessage(els.loginMessage, "Login realizado com sucesso.", "success");
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

  // Sem isto os timers continuariam batendo na API depois do logout, com o
  // token ja invalidado, e cada tick devolveria 401.
  stopLogAutoRefresh();
  stopDmPolling();

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

    setMessage(els.msgSendStatus, "Mensagem enviada com sucesso.", "success");
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

    setMessage(els.roleMsg, "Cargo adicionado.", "success");
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

    setMessage(els.roleMsg, "Cargo removido.", "success");
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

    setMessage(els.punishMsg, "Timeout aplicado.", "success");
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

    setMessage(els.punishMsg, "Usuário removido do regimento.", "success");
    await loadAudit();
  } catch (err) {
    setMessage(els.punishMsg, err.message, true);
  }
});

/* ------------------------------------------------------------------ *
 * Auditoria
 * ------------------------------------------------------------------ */

let rosterCache = [];

function renderRoster() {
  const filter = (els.rosterSearch.value || "").trim().toLowerCase();
  const rows = filter
    ? rosterCache.filter((e) => (e.username || "").toLowerCase().includes(filter))
    : rosterCache;

  els.rosterBody.innerHTML = "";

  if (rows.length === 0) {
    emptyRow(els.rosterBody, 7, rosterCache.length === 0
      ? "Nenhum jogador registrado ainda."
      : "Nenhum jogador corresponde à busca.");
    return;
  }

  for (const entry of rows) {
    const tr = document.createElement("tr");
    tr.className = "clickable";
    tr.tabIndex = 0;
    tr.appendChild(cell(entry.username));
    tr.appendChild(cell(entry.kills));
    tr.appendChild(cell(entry.deaths));
    tr.appendChild(cell(entry.assists));
    tr.appendChild(cell(entry.kd));
    tr.appendChild(cell(entry.battles));
    tr.appendChild(cell(entry.rank || "—"));

    const fill = () => fillEditForm(entry);
    tr.addEventListener("click", fill);
    tr.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        fill();
      }
    });

    els.rosterBody.appendChild(tr);
  }
}

// Clicar numa linha preenche o formulario de edicao: sem isso seria preciso
// redigitar nome e numeros a mao, e um erro de digitacao criaria um jogador
// novo em vez de editar o existente.
function fillEditForm(entry) {
  els.editUsername.value = entry.username;
  els.editNewUsername.value = "";
  els.editKills.value = entry.kills;
  els.editDeaths.value = entry.deaths;
  els.editAssists.value = entry.assists;
  els.editBattles.value = entry.battles;
  els.rankUsername.value = entry.username;
  els.rankValue.value = entry.rank || "";
  setMessage(els.editMsg, `Carregado: ${entry.username}.`);
}

async function loadRoster() {
  const data = await apiRequest("/api/audit/roster");
  rosterCache = Array.isArray(data.entries) ? data.entries : [];

  const totals = data.totals || {};
  els.rosterTotals.textContent =
    `${totals.players ?? 0} jogadores · ${totals.battles ?? 0} batalhas · ${totals.kills ?? 0} kills` +
    (data.lastUpdatedUtc ? ` · atualizado em ${formatDateTime(data.lastUpdatedUtc)}` : "");

  const pending = Array.isArray(data.pending) ? data.pending : [];
  els.pushPending.textContent = pending.length === 0
    ? "Nenhum lote pendente. Publicar envia as mudanças feitas direto no arquivo."
    : `${pending.length} lote(s) pendente(s) na fila.`;

  renderRoster();
}

async function loadAuditHistory() {
  const { logs } = await apiRequest("/api/audit/history");
  els.auditHistoryList.innerHTML = "";

  const hasLogs = Array.isArray(logs) && logs.length > 0;
  els.auditHistoryEmpty.classList.toggle("hidden", hasLogs);

  for (const log of hasLogs ? logs : []) {
    const li = document.createElement("li");
    const main = document.createElement("div");
    main.className = "audit-main";

    const actor = document.createElement("strong");
    actor.textContent = log.username ?? "";
    main.appendChild(actor);
    main.appendChild(document.createTextNode(` — ${log.action ?? ""}`));
    main.appendChild(document.createElement("br"));
    main.appendChild(document.createTextNode(log.details ?? ""));

    const time = document.createElement("span");
    time.className = "audit-time";
    time.textContent = formatDateTime(log.timestampUtc);
    main.appendChild(time);

    li.appendChild(main);
    els.auditHistoryList.appendChild(li);
  }
}

els.rosterSearch.addEventListener("input", renderRoster);

els.rosterRefreshBtn.addEventListener("click", async () => {
  els.rosterRefreshBtn.disabled = true;
  try {
    await loadRoster();
    await loadAuditHistory();
    setMessage(els.rosterMsg, "Efetivo atualizado.", "success");
  } catch (err) {
    setMessage(els.rosterMsg, err.message, true);
  } finally {
    els.rosterRefreshBtn.disabled = false;
  }
});

els.editSaveBtn.addEventListener("click", async () => {
  try {
    const username = (els.editUsername.value || "").trim();
    if (!username) {
      throw new Error("Informe o jogador a editar.");
    }

    await apiRequest("/api/audit/entry", {
      method: "POST",
      body: JSON.stringify({
        username,
        newUsername: (els.editNewUsername.value || "").trim(),
        kills: readCount(els.editKills, "Kills"),
        deaths: readCount(els.editDeaths, "Deaths"),
        assists: readCount(els.editAssists, "Assists"),
        battles: readCount(els.editBattles, "Batalhas"),
        scope: els.editScope.value
      })
    });

    setMessage(els.editMsg, "Registro atualizado.", "success");
    await loadRoster();
    await loadAuditHistory();
    await loadAudit();
  } catch (err) {
    setMessage(els.editMsg, err.message, true);
  }
});

els.editRemoveBtn.addEventListener("click", async () => {
  const username = (els.editUsername.value || "").trim();
  if (!username) {
    setMessage(els.editMsg, "Informe o jogador a remover.", true);
    return;
  }

  // Remocao apaga historico acumulado de batalhas: vale uma confirmacao.
  if (!window.confirm(`Remover "${username}" de ${els.editScope.value}? Isso não pode ser desfeito pelo painel.`)) {
    return;
  }

  try {
    const result = await apiRequest("/api/audit/entry", {
      method: "POST",
      body: JSON.stringify({ username, scope: els.editScope.value, remove: true })
    });

    setMessage(els.editMsg, `Removido (${result.removed} registro(s)).`, "success");
    await loadRoster();
    await loadAuditHistory();
    await loadAudit();
  } catch (err) {
    setMessage(els.editMsg, err.message, true);
  }
});

els.rankSaveBtn.addEventListener("click", async () => {
  try {
    const username = (els.rankUsername.value || "").trim();
    if (!username) {
      throw new Error("Informe o jogador.");
    }

    const result = await apiRequest("/api/audit/ranks", {
      method: "POST",
      body: JSON.stringify({ ranks: [{ username, rank: (els.rankValue.value || "").trim() }] })
    });

    if (Array.isArray(result.missing) && result.missing.length > 0) {
      throw new Error(`Jogador não encontrado na auditoria: ${result.missing.join(", ")}`);
    }

    setMessage(els.rankMsg, result.changed > 0 ? "Patente definida." : "Nada mudou: a patente já era essa.", "success");
    await loadRoster();
    await loadAuditHistory();
    await loadAudit();
  } catch (err) {
    setMessage(els.rankMsg, err.message, true);
  }
});

async function runPush(dryRun) {
  const button = dryRun ? els.pushDryBtn : els.pushBtn;
  button.disabled = true;
  setMessage(els.pushMsg, dryRun ? "Simulando..." : "Publicando...");

  try {
    const result = await apiRequest("/api/audit/push", {
      method: "POST",
      body: JSON.stringify({ dryRun })
    });

    const lines = [
      result.nothingToDo
        ? "Nada a publicar: o GitHub já está igual ao arquivo local."
        : (dryRun ? "Prévia — nada foi gravado nem enviado." : "Publicado no GitHub."),
      `Lotes pendentes: ${result.pendingBatches}`,
      `Lotes consolidados: ${result.batchesApplied}`,
      `Jogadores atualizados: ${result.playersUpdated}`,
      `Batalhas somadas: ${result.battlesAdded}`,
      `Total no efetivo: ${result.totalEntries}`
    ];

    if (Array.isArray(result.newPlayers) && result.newPlayers.length > 0) {
      lines.push(`Novos jogadores: ${result.newPlayers.join(", ")}`);
    }
    if (result.auditCommitUrl) {
      lines.push(`Commit: ${result.auditCommitUrl}`);
    }

    els.pushResult.textContent = lines.join("\n");
    els.pushResult.classList.remove("hidden");
    setMessage(els.pushMsg, dryRun ? "Prévia concluída." : "Publicação concluída.", "success");

    await loadRoster();
    await loadAuditHistory();
    await loadAudit();
  } catch (err) {
    setMessage(els.pushMsg, err.message, true);
  } finally {
    button.disabled = false;
  }
}

els.pushDryBtn.addEventListener("click", () => runPush(true));

els.pushBtn.addEventListener("click", () => {
  if (window.confirm("Publicar a auditoria no GitHub? A fila pendente será consolidada.")) {
    runPush(false);
  }
});

/* ------------------------------------------------------------------ *
 * Comunicacoes
 * ------------------------------------------------------------------ */

els.deployBtn.addEventListener("click", async () => {
  try {
    const codigo = (els.deployCode.value || "").trim();
    if (!codigo) {
      throw new Error("Informe o código do jogo.");
    }

    const result = await apiRequest("/api/deployment", {
      method: "POST",
      body: JSON.stringify({ codigo })
    });

    const extra = result.warning ? ` ${result.warning}` : "";
    setMessage(els.deployMsg, `Deployment enviado (${result.rolesPinged} cargo(s) pingado(s)).${extra}`, "success");
    await loadAudit();
  } catch (err) {
    setMessage(els.deployMsg, err.message, true);
  }
});

let dmPollTimer = null;

function renderDmJob(job) {
  els.dmProgressWrap.classList.remove("hidden");

  const done = (job.sent || 0) + (job.failed || 0);
  const percent = job.total > 0 ? Math.round((done / job.total) * 100) : 0;
  els.dmProgressBar.style.width = `${percent}%`;

  const stateLabel = { enviando: "Enviando", concluido: "Concluído", falhou: "Falhou" }[job.state] || job.state;
  els.dmProgressText.textContent =
    `${stateLabel} — ${job.sent} enviada(s), ${job.failed} falha(s) de ${job.total} para ${job.targetName}.`;

  if (job.state !== "enviando") {
    stopDmPolling();
    const failures = Array.isArray(job.failureSamples) && job.failureSamples.length > 0
      ? ` Exemplos de falha: ${job.failureSamples.slice(0, 5).join(", ")}.`
      : "";
    setMessage(
      els.dmMsg,
      job.state === "falhou" ? `Envio interrompido: ${job.error || "erro desconhecido"}` : `Envio concluído.${failures}`,
      job.state === "falhou" ? "error" : "success"
    );
  }
}

function stopDmPolling() {
  if (dmPollTimer !== null) {
    window.clearInterval(dmPollTimer);
    dmPollTimer = null;
  }
}

function startDmPolling(jobId) {
  stopDmPolling();
  dmPollTimer = window.setInterval(async () => {
    try {
      const { job } = await apiRequest(`/api/dm/status?jobId=${encodeURIComponent(jobId)}`);
      renderDmJob(job);
    } catch (err) {
      stopDmPolling();
      setMessage(els.dmMsg, `Perdi o acompanhamento do envio: ${err.message}`, true);
    }
  }, 4000);
}

els.dmBtn.addEventListener("click", async () => {
  try {
    const roleRaw = (els.dmRoleId.value || "").trim();
    const userRaw = (els.dmUserId.value || "").trim();

    if (!roleRaw && !userRaw) {
      throw new Error("Informe o ID de um cargo ou de um usuário.");
    }

    const payload = {
      code: (els.dmCode.value || "").trim(),
      message: els.dmMessage.value
    };

    if (roleRaw) {
      payload.roleId = parseDiscordSnowflake(roleRaw, "Cargo");
    }
    if (userRaw) {
      payload.userId = parseDiscordSnowflake(userRaw, "Usuario");
    }

    const result = await apiRequest("/api/dm", { method: "POST", body: JSON.stringify(payload) });

    // O envio continua no bot mesmo que esta aba seja fechada: o job vive no
    // servidor e pode ser reencontrado pelo jobId.
    setMessage(els.dmMsg, `Envio iniciado para ${result.job.total} destinatário(s). Isso pode levar bastante tempo.`, "success");
    renderDmJob(result.job);
    startDmPolling(result.job.jobId);
    await loadAudit();
  } catch (err) {
    setMessage(els.dmMsg, err.message, true);
  }
});

/* ------------------------------------------------------------------ *
 * Alistamento e promocoes
 * ------------------------------------------------------------------ */

els.enlistBtn.addEventListener("click", async () => {
  els.enlistBtn.disabled = true;
  setMessage(els.enlistMsg, "Verificando a conta no ROBLOX...");

  try {
    const result = await apiRequest("/api/enlist", {
      method: "POST",
      body: JSON.stringify({
        userId: parseDiscordSnowflake(els.enlistUserId.value, "Usuario"),
        robloxUsername: (els.enlistRoblox.value || "").trim(),
        socialRole: els.enlistSocial.checked
      })
    });

    const lines = [
      `Idade da conta: ${result.accountAgeDays} dias`,
      `Amigos: ${result.friends}`,
      `Badges: ${result.badges}`
    ];

    if (result.approved) {
      lines.push(`Cargos adicionados: ${(result.rolesAdded || []).join(", ") || "nenhum"}`);
      lines.push(`Apelido alterado: ${result.nicknameChanged ? "sim" : "não"}`);
      if (Array.isArray(result.warnings) && result.warnings.length > 0) {
        lines.push("", "Avisos:", ...result.warnings.map((w) => `- ${w}`));
      }
    }

    els.enlistResult.textContent = lines.join("\n");
    els.enlistResult.classList.remove("hidden");

    // Reprovado nao e erro de rede: a consulta funcionou e a resposta foi
    // "negado". Por isso a API devolve 200 e o tom aqui e de erro, com os
    // numeros que motivaram a recusa a vista.
    setMessage(
      els.enlistMsg,
      result.approved ? "Usuário alistado." : (result.reason || "Alistamento negado."),
      result.approved ? "success" : "error"
    );

    await loadAudit();
  } catch (err) {
    setMessage(els.enlistMsg, err.message, true);
  } finally {
    els.enlistBtn.disabled = false;
  }
});

els.promotionsRefreshBtn.addEventListener("click", async () => {
  els.promotionsRefreshBtn.disabled = true;
  try {
    const data = await apiRequest("/api/promotions");
    els.promotionsBody.innerHTML = "";

    const players = Array.isArray(data.players) ? data.players : [];
    if (players.length === 0) {
      emptyRow(els.promotionsBody, 6, "Nenhum jogador na auditoria ainda.");
    }

    for (const p of players) {
      const tr = document.createElement("tr");
      tr.appendChild(cell(p.username));
      tr.appendChild(cell(p.currentRank || "—"));
      tr.appendChild(cell(p.battles));
      tr.appendChild(cell(p.targetRank || p.nextRank || "—"));
      tr.appendChild(cell(p.battlesToNext > 0 ? `${p.battlesToNext} bat.` : "—"));

      const situacao = p.promotable
        ? (p.needsApproval ? "Elegível (exige avaliação)" : "Elegível")
        : (p.status === "OutsideLadder" ? "Fora da escada" : "Em dia");
      tr.appendChild(cell(situacao, p.promotable ? "is-eligible" : ""));

      els.promotionsBody.appendChild(tr);
    }

    setMessage(els.promotionsMsg, `${data.promotable} elegível(is) de ${data.total} jogador(es).`, "success");
  } catch (err) {
    setMessage(els.promotionsMsg, err.message, true);
  } finally {
    els.promotionsRefreshBtn.disabled = false;
  }
});

/* ------------------------------------------------------------------ *
 * Logs
 * ------------------------------------------------------------------ */

let logAutoTimer = null;

function stopLogAutoRefresh() {
  if (logAutoTimer !== null) {
    window.clearInterval(logAutoTimer);
    logAutoTimer = null;
  }
}

function startLogAutoRefresh() {
  stopLogAutoRefresh();
  logAutoTimer = window.setInterval(() => {
    loadLogs().catch(() => stopLogAutoRefresh());
  }, 10000);
}

async function loadLogs() {
  const params = new URLSearchParams({ take: "200" });
  if (els.logLevel.value) {
    params.set("level", els.logLevel.value);
  }
  if ((els.logQuery.value || "").trim()) {
    params.set("q", els.logQuery.value.trim());
  }

  const data = await apiRequest(`/api/logs?${params.toString()}`);
  const logs = Array.isArray(data.logs) ? data.logs : [];

  const counts = data.counts || {};
  els.logCounts.textContent =
    `Buffer: ${counts.info ?? 0} info · ${counts.aviso ?? 0} aviso · ${counts.erro ?? 0} erro · ${counts.totalSeen ?? 0} linha(s) desde o último reinício.`;

  // textContent, nao innerHTML: uma linha de log pode conter qualquer coisa,
  // inclusive o conteudo de uma mensagem do Discord vindo numa excecao.
  els.logOutput.textContent = logs.length === 0
    ? "Nenhuma linha corresponde ao filtro."
    : logs
        .map((l) => `[${new Date(l.timestampUtc).toLocaleTimeString("pt-BR")}] ${String(l.level).padEnd(5)} ${l.text}`)
        .join("\n");

  setMessage(els.logMsg, `${logs.length} linha(s).`);
}

els.logRefreshBtn.addEventListener("click", async () => {
  els.logRefreshBtn.disabled = true;
  try {
    await loadLogs();
  } catch (err) {
    setMessage(els.logMsg, err.message, true);
  } finally {
    els.logRefreshBtn.disabled = false;
  }
});

els.logLevel.addEventListener("change", () => {
  loadLogs().catch((err) => setMessage(els.logMsg, err.message, true));
});

els.logAuto.addEventListener("change", () => {
  if (els.logAuto.checked) {
    startLogAutoRefresh();
    loadLogs().catch((err) => setMessage(els.logMsg, err.message, true));
  } else {
    stopLogAutoRefresh();
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
