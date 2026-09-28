/*
 * Portugues da Politica de Privacidade do Sollarety.
 *
 * TRADUCAO DE CORTESIA. O texto em ingles e a versao que vale - ele e o que
 * esta no HTML e o que o Discord Developer Portal aponta. Ha uma nota dizendo
 * isso no rodape da propria pagina; se mexer numa lingua, mexa na outra.
 */
export const pt = {
  // Nota de idioma. A mesma chave nas quatro paginas juridicas.
  "i18n.authoritative":
    "Esta página também está disponível em português, como tradução de cortesia. Em caso de divergência entre as duas, a versão em inglês é a que vale.",

  "sol_pp.terms_of_service": "Termos de Serviço",
  "sol_pp.privacy_policy": "Política de Privacidade",
  "sol_pp.last_updated_september_28_2026": "Última atualização: 28 de setembro de 2026",

  "sol_pp.the_bot_does_not_read": "O Bot não lê as suas mensagens.",
  "sol_pp.it_does_not_request_discord":
    "Ele não pede o intent de Message Content do Discord, o que significa que o Discord nunca lhe envia o texto das mensagens. Ele não tem como guardar, pesquisar ou repassar algo que não recebe.",

  "sol_pp.1_what_is_stored": "1. O que é guardado",
  "sol_pp.only_three_things_outlast_the": "Só três coisas sobrevivem ao momento em que acontecem:",
  "sol_pp.warnings": "Advertências.",
  "sol_pp.when_a_moderator_runs_the":
    "Quando um moderador roda o comando de advertência, o Bot guarda o ID de usuário do Discord do membro advertido, o ID e a tag do moderador, o motivo que o moderador digitou, o ID do servidor e a data. Isso é gravado num arquivo na máquina que hospeda o Bot.",
  "sol_pp.moderation_log_messages": "Mensagens do log de moderação.",
  "sol_pp.each_moderation_action_is_posted":
    "Cada ação de moderação é publicada como mensagem num canal escolhido pelos seus administradores. Essa mensagem vive no seu servidor, sob o seu controle, como qualquer outra.",
  "sol_pp.roblox_account_links": "Vínculos de conta Roblox.",
  "sol_pp.when_you_verify_with_the":
    "Quando você se verifica com o comando de verificação, o Bot guarda o seu ID de usuário do Discord junto do seu ID de usuário no Roblox, do nome de usuário e do nome de exibição no Roblox, da data em que a conta Roblox foi criada e da data em que você se verificou. Isso é gravado num arquivo na máquina que hospeda o Bot, e vale em todo servidor que usa o Bot. Só é criado quando você mesmo conclui a verificação.",

  "sol_pp.2_what_is_held_only": "2. O que fica só na memória",
  "sol_pp.the_bot_keeps_a_short":
    "O Bot mantém um buffer curto da própria saída de console, para que os administradores consigam diagnosticar falhas sem acesso ao servidor. Ele pode conter IDs de usuário e mensagens de erro. Nunca é gravado em disco e é",
  "sol_pp.erased_every_time_the_bot": "apagado toda vez que o Bot reinicia",

  "sol_pp.3_what_is_read_but": "3. O que é lido mas não guardado",
  "sol_pp.to_check_role_hierarchy_before":
    "Para conferir a hierarquia de cargos antes de uma punição, e para responder aos comandos userinfo e serverinfo, o Bot lê cargos, apelidos e datas de entrada no Discord. Essa informação é usada para montar a resposta e depois descartada — nada é anotado.",
  "sol_pp.the_purge_command_deletes_messages":
    "O comando de limpeza apaga mensagens pela API do Discord. Ele não lê nem copia o conteúdo delas antes de apagar.",
  "sol_pp.to_apply_roblox_verification_the":
    "Para aplicar a verificação Roblox, o Bot lê na API pública do Roblox o nome atual de uma conta Roblox vinculada, quando ela foi criada e em quais grupos do Roblox ela está, com qual rank — o mesmo que qualquer pessoa vê num perfil do Roblox. A resposta fica na memória por no máximo cinco minutos, para não perguntar duas vezes, e nunca é anotada.",

  "sol_pp.4_what_is_never_collected": "4. O que nunca é coletado",
  "sol_pp.message_content_attachments_or_embeds": "conteúdo de mensagens, anexos ou embeds;",
  "sol_pp.direct_messages": "mensagens diretas;",
  "sol_pp.voice_audio": "áudio de voz;",
  "sol_pp.email_addresses_ip_addresses_payment":
    "endereços de e-mail, endereços IP, dados de pagamento ou qualquer identidade do mundo real;",
  "sol_pp.your_discord_or_roblox_password":
    "a sua senha do Discord ou do Roblox — os dois logins acontecem nos próprios sites do Discord e do Roblox;",
  "sol_pp.anything_at_all_from_users":
    "absolutamente nada de usuários que nunca aparecem num comando de moderação e nunca verificam uma conta Roblox.",

  "sol_pp.5_how_long_it_is": "5. Por quanto tempo fica guardado",
  "sol_pp.until_a_moderator_deletes_them":
    "Até um moderador apagá-las. O comando delwarn remove uma advertência em definitivo, e remover o Bot do seu servidor impede que novos registros sejam criados. Não há expiração automática: um histórico de advertências que se apagasse sozinho perderia o próprio sentido.",
  "sol_pp.a_roblox_link_is_kept":
    "Um vínculo Roblox fica guardado até você removê-lo com o comando unverify, que o apaga na hora, para todos os servidores. Remover o Bot de um servidor não apaga vínculos: um vínculo pertence a quem o criou, não a um servidor específico.",

  "sol_pp.6_who_can_see_it": "6. Quem consegue ver",
  "sol_pp.warnings_are_visible_through_the":
    "Pelo Bot, as advertências só são visíveis a membros com a permissão Moderar Membros no servidor a que a advertência pertence. Uma advertência registrada num servidor não é visível de outro. O canal de log é visível para quem os seus administradores derem acesso.",
  "sol_pp.a_roblox_link_can_be":
    "Um vínculo Roblox pode ser consultado com o comando whois por membros de qualquer servidor que use o Bot e em que você esteja — saber qual conta Roblox é de quem é justamente o propósito da verificação. Ninguém mais o vê.",
  "sol_pp.data_is_not_sold_rented":
    "Os dados não são vendidos, alugados nem compartilhados com terceiros. Não há serviço de análise nem publicidade.",

  "sol_pp.7_where_it_is_stored": "7. Onde fica guardado",
  "sol_pp.on_a_single_self_hosted":
    "Numa única máquina auto-hospedada, operada pelos administradores do Bot. Os dados guardados não são enviados a nenhum serviço externo. Além da própria API do Discord, o Bot só conversa com a API pública do Roblox, para ler as informações listadas na seção 3, e com o programa de verificação descrito na seção 12, para buscar uma verificação concluída.",

  "sol_pp.8_your_rights": "8. Os seus direitos",
  "sol_pp.you_may_ask_what_the":
    "Você pode perguntar o que o Bot registrou sobre você, e pedir que seja apagado, falando com os administradores do Bot pelos canais oficiais do servidor do Discord. Apagar uma advertência não apaga a mensagem já publicada no canal de log do servidor — essa mensagem pertence ao seu servidor, e um administrador dele pode removê-la.",
  "sol_pp.you_can_delete_your_own":
    "Você pode apagar o seu próprio vínculo Roblox a qualquer momento com o comando unverify, sem precisar pedir a ninguém.",

  "sol_pp.9_children": "9. Crianças",
  "sol_pp.the_bot_is_not_directed":
    "O Bot não se dirige a ninguém abaixo da idade mínima exigida pelos",
  "sol_pp.in_their_country_it_is":
    "no país da pessoa. Ele não é usado, com conhecimento disso, para coletar informação dessas pessoas.",
  "sol_pp.discord_terms_of_service": "Termos de Serviço do Discord",

  "sol_pp.10_discord_s_own_handling": "10. O tratamento feito pelo próprio Discord",
  "sol_pp.everything_the_bot_does_passes":
    "Tudo o que o Bot faz passa pelo Discord, que trata os seus dados sob a própria",
  "sol_pp.this_policy_covers_only_what": ". Esta política cobre apenas o que o Bot faz.",

  "sol_pp.11_the_invite_page": "11. A página de convite",
  "sol_pp.the_invite_page_at": "A página de convite em",
  "sol_pp.can_sign_you_in_with":
    "pode conectar você com o Discord para mostrar em quais dos seus servidores você tem permissão de adicionar o Bot. Esse login pede ao Discord duas coisas e nada além disso: o seu nome de usuário e avatar, e a lista de servidores em que você está. Ele não pede as suas mensagens, e não concede ao Bot acesso a servidor nenhum por conta própria.",
  "sol_pp.what_becomes_of_that_data":
    "O que acontece com esses dados: um pequeno programa rodando na borda da rede troca o código de uso único do Discord por um token de acesso temporário, lê o seu nome e a sua lista de servidores uma vez, e joga o token fora quando a requisição termina. Nada é gravado em banco de dados, log ou arquivo, porque não existe nenhum onde gravar. A lista volta para o seu navegador na parte da URL depois do",
  "sol_pp.which_browsers_never_send_to":
    ", que os navegadores nunca enviam a um servidor, e a página a limpa da barra de endereços assim que termina de desenhar a lista. Fechar a aba não deixa nada para trás.",
  "sol_pp.signing_in_is_optional_the": "Fazer login é opcional. A mesma página oferece um link",
  "sol_pp.link_which_hands_you_straight":
    ", que leva você direto ao seletor de servidores do próprio Discord e não conta absolutamente nada a este site.",
  "sol_pp.add_without_signing_in": "adicionar sem fazer login",

  "sol_pp.12_roblox_verification": "12. Verificação Roblox",
  "sol_pp.the_verify_command_sends_you":
    "O comando de verificação leva você a uma página em daeese.me que faz dois logins: primeiro com o Discord, para saber qual conta do Discord está usando o navegador, e depois com o Roblox, pelo login oficial do Roblox. O login do Discord pede só o seu nome de usuário. O login do Roblox pede só o seu ID de usuário no Roblox, o nome de usuário, o nome de exibição, a data de criação da conta e o link do avatar. O Bot nunca vê a sua senha em nenhum dos dois sites.",
  "sol_pp.what_becomes_of_that_data_2":
    "O que acontece com esses dados: um pequeno programa na borda da rede troca cada código de uso único por um token temporário, lê os dados da conta uma vez e revoga os dois tokens na hora, então não sobra acesso contínuo a nenhuma das contas. Depois ele guarda o par — o seu ID de usuário do Discord e os dados da sua conta Roblox — por até 30 minutos, até o Bot buscá-lo. Buscar apaga. A partir daí, o vínculo vive só no arquivo descrito na seção 1.",
  "sol_pp.a_short_lived_signed_cookie":
    "Entre os dois logins, a página mantém um cookie assinado no seu navegador por até dez minutos, para saber que os dois logins vieram do mesmo lugar. Ele não contém senha nem token, e é apagado quando a verificação termina.",

  "sol_pp.13_changes": "13. Alterações",
  "sol_pp.this_policy_may_change_material":
    'Esta política pode mudar. Alterações relevantes serão refletidas aqui com uma nova data de "última atualização".',

  "sol_pp.14_contact": "14. Contato",
  "sol_pp.questions_about_this_policy_or":
    "Dúvidas sobre esta política, ou pedidos relativos aos seus dados, podem ser levados aos administradores do Bot pelos canais oficiais do servidor do Discord.",

  "sol_pp.sollarety_is_a_separate_discord":
    "O Sollarety é uma aplicação de Discord separada do",
  "sol_pp.they_do_not_share_storage":
    ". Eles não compartilham armazenamento, e a política de privacidade do ccore não descreve este Bot.",
  "sol_pp.overview": "visão geral",
  "sol_pp.terms": "termos"
};

export default pt;
