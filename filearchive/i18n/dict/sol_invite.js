/*
 * Portugues da pagina de convite do Sollarety (apps/sollarety/invite/).
 *
 * TRADUCAO DE CORTESIA, igual as outras paginas do Sollarety: o ingles no
 * HTML e a versao que vale. Chave ausente cairia em ingles (nome do bot,
 * "/help" etc.), mas aqui toda chave do HTML tem traducao - ver o script de
 * paridade usado na revisao desta pagina.
 *
 * As chaves err_* e signed_in* traduzem texto AO VIVO: o invite/index.html
 * guarda o ingles delas escondido em #i18n-live-strings (data-i18n normal,
 * traduzido como qualquer outro) e o script le o resultado ja traduzido com
 * str() na hora de montar a frase - ver renderUser()/showAlert() la.
 */
export const pt = {
  "sol_invite.sollarety": "SOLLARETY",
  "sol_invite.tagline": "Moderação, advertências, diversão e utilidade - em um só bot de Discord.",

  "sol_invite.add_to_a_server": "Adicionar a um servidor",
  "sol_invite.sign_in_intro":
    "Entre com o Discord e esta página vai listar os servidores em que você pode adicionar um bot, assim você escolhe um em vez de caçar num menu. Nada que você faça aqui é salvo.",

  "sol_invite.permissions_to_request": "Permissões a solicitar",
  "sol_invite.preset_full_title": "Completo",
  "sol_invite.preset_full_detail":
    "Tudo que os comandos precisam: Banir, Expulsar, Silenciar, Gerenciar Mensagens, Gerenciar Canais, Gerenciar Cargos e Gerenciar Apelidos, além de ler e postar nos canais e Conectar e Falar para música.",
  "sol_invite.preset_fun_title": "Só diversão",
  "sol_invite.preset_fun_detail":
    "Ler e postar, além de Conectar e Falar para música. Os comandos de moderação continuam aparecendo no servidor, mas vão se recusar a rodar porque o bot não tem permissão para executá-los, e a verificação Roblox vincula contas sem dar cargos.",

  "sol_invite.continue_with_discord": "Continuar com o Discord",
  "sol_invite.add_without_signing_in": "Adicionar sem entrar",
  "sol_invite.signin_privacy_note":
    'Entrar pede ao Discord seu nome de usuário e a lista de servidores em que você está - nada além disso, e nunca suas mensagens. A lista é lida uma vez, mostrada a você, e descartada; ela não é salva em nenhum servidor, incluindo este. "Adicionar sem entrar" pula tudo isso e deixa o próprio seletor do Discord escolher o servidor.',

  "sol_invite.choose_a_server": "Escolha um servidor",
  "sol_invite.pick_server_subtitle": "Escolha um servidor para adicionar o Sollarety.",
  "sol_invite.filter_placeholder": "Filtrar servidores",
  "sol_invite.filter_aria_label": "Filtrar servidores",

  "sol_invite.no_guilds_p1":
    "Nenhum dos seus servidores pode receber um bot novo. Adicionar um exige a permissão",
  "sol_invite.manage_server": "Gerenciar Servidor",
  "sol_invite.no_guilds_p2":
    "por isso só aparecem aqui os servidores que você é dono ou ajuda a administrar.",

  "sol_invite.start_over": "Começar de novo",

  "sol_invite.done": "Concluído",
  "sol_invite.done_p1": "O Sollarety entrou.",
  "sol_invite.done_p2": "Digite",
  "sol_invite.done_p3":
    "no servidor para ver todos os comandos. Se os comandos de barra não aparecerem na hora, dê ao Discord até uma hora para propagá-los.",

  "sol_invite.nav_commands": "Comandos",
  "sol_invite.nav_tos": "Termos de Serviço",
  "sol_invite.nav_privacy": "Política de Privacidade",
  "sol_invite.nav_add_another": "Adicionar a outro servidor",

  "sol_invite.never_reads_strong": "O bot nunca lê suas mensagens.",
  "sol_invite.never_reads_p1":
    "Ele não solicita o intent de Conteúdo de Mensagens do Discord, então o texto das mensagens não é recebido, lido ou armazenado. Veja a",
  "sol_invite.privacy_policy_link": "Política de Privacidade",
  "sol_invite.never_reads_p2": "para o panorama completo.",

  "sol_invite.footer_p1": "Sollarety · C# / .NET 10 · hospedado junto com o",
  "sol_invite.ccore": "ccore",
  "sol_invite.footer_p2": "em daeese.me",

  // Texto AO VIVO (ver o comentario no topo do arquivo).
  "sol_invite.signed_in_as": "Conectado como",
  "sol_invite.signed_in": "Conectado",
  "sol_invite.err_denied":
    "O login do Discord foi cancelado, então nada aconteceu. Você pode tentar de novo, ou adicionar o bot sem entrar.",
  "sol_invite.err_config":
    "Esta página ainda não terminou de ser configurada - falta o id da aplicação Discord dela. Não há nada de errado do seu lado.",
  "sol_invite.err_oauth":
    "O Discord não completou o login. Tente de novo em um instante, ou adicione o bot sem entrar.",
  "sol_invite.err_state":
    "Esse login não correspondeu ao que esta página iniciou, então foi ignorado. Comece de novo nesta aba.",
  "sol_invite.err_busy":
    "Muitas tentativas de login vindas da sua rede. Espere um minuto e tente de novo."
};
