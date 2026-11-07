/*
 * Portugues da pagina de status do ccore.
 *
 * Os valores numericos (uptime, latencia, contagens) vem da API e nao passam
 * por aqui - o que este dicionario traduz sao os rotulos em volta deles.
 *
 * As chaves status.checking_the_bot e status.fetching_the_current_status_from
 * nao tem data-i18n no HTML: a pagina reescreve esse texto sozinha a cada
 * refresh (ver LIVE_STRINGS em status/index.html), que importa este modulo
 * direto pra nao duplicar a traducao em dois lugares.
 */
export const pt = {
  "status.refresh_now": "Atualizar agora",

  "status.ccore_status": "ccore — Status",
  "status.status_of_the_12_regimento":
    'Status do bot do 12° Regimento de Infantaria "Chaves".',
  "status.back_to_ccore": "Voltar para o ccore",
  "status.dashboard": "Painel",
  "status.checking_the_bot": "Consultando o bot…",
  "status.fetching_the_current_status_from": "Buscando o estado atual na API do bot.",
  "status.uptime": "Tempo no ar",
  "status.latency": "Latência",
  "status.servers": "Servidores",
  "status.members": "Membros",
  "status.version": "Versão",
  "status.library": "Biblioteca",
  "status.refreshes_on_its_own_every":
    "Atualiza sozinho a cada 15 segundos. Última medição:",
  "status.data_about_the_machine_hosting":
    ". Dados sobre a máquina que hospeda o bot não aparecem aqui — eles ficam na aba",
  "status.tab_of_the": "do",
  "status.which_requires_a_login": ", que exige login.",
  "status.admin_dashboard": "painel administrativo"
};

export default pt;
