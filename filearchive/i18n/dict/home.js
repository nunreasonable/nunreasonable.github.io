/*
 * Portugues da home (o portfolio em daeese.me).
 *
 * Chave ausente = fica em ingles, entao nomes proprios (Blood Oath, Sollarety,
 * ccore, nomes de tecnologia) nao aparecem aqui.
 *
 * Tres familias de chave:
 *   home.*         texto fixo do HTML (nav, hero, secoes, rodape, player)
 *   p.<slug>.*     cards de projeto, gerados pelo JS a partir de profileData
 *   live.*         texto AO VIVO (Now Playing, legendas da galeria, status do
 *                  Discord). Este nao usa data-i18n: o JS da pagina importa
 *                  este mesmo arquivo e reescreve esses textos no evento
 *                  i18n:change.
 *
 * As legendas (cap) e os textos alternativos (alt) de cada imagem seguem a
 * ordem de profileData.projects[].images: cap0 e a primeira imagem, e assim
 * por diante. Reordenar as imagens la exige reordenar aqui.
 */
export const pt = {
  "p.ginrose.tagline": "O cliente oficial de Roblox para macOS no Linux, com Rosemary.",
  "p.ginrose.status": "Flatpak v0.2.2 · Rosemary 0.4.0",
  "p.ginrose.d0": "O Ginrose baixa o cliente oficial diretamente do Roblox e roda no Linux pelo Rosemary. Inclui perfis gráficos por jogo, limite de quadros e Discord Rich Presence.",
  "p.ginrose.d1": "A versão 0.2.2 traz o Rosemary 0.4.0 e uma correção para o cursor ao trocar de janela. Disponível como Flatpak para Linux x86_64. Ginrose é software proprietário; Rosemary é um componente separado sob GPL-3.0. O site reúne download, instruções de instalação e comandos.",
  "p.ginrose.link0": "Site e download",
  "home.enter": "Entrar no site",
  "home.viewProjects": "Explorar projetos",
  "home.contactAction": "Entre em contato",
  // --- Portao e intro ------------------------------------------------------
  "home.gate": "clique para entrar",
  "home.intro.init": "inicializando daeese.me",
  "home.intro.modules": "carregando módulos",
  "home.intro.modulesDots": "......",
  "home.intro.gateway": "gateway do discord",
  "home.intro.gatewayDots": "......",
  "home.intro.ready": "pronto.",

  // --- Nav e hero ------------------------------------------------------------
  "home.nav.label": "Seções",
  "home.nav.work": "Projetos",
  "home.nav.links": "Links",
  "home.nav.contact": "Contato",
  "home.avatarAlt": "Foto de perfil",
  "home.role": "Desenvolvedor fullstack",
  "home.bio":
    "Trabalho com C#, JS, HTML e CSS. Meu fuso principal é UTC-3, às vezes UTC 0.\nDesenvolvedor fullstack na Vltra Entertainment.",
  "home.getInTouch": "Fale comigo",
  "home.scrollCue": "Projetos",
  "home.link.contact": "Contato",
  "home.link.contactTag": "E-mail",

  // --- Secoes ---------------------------------------------------------------
  "home.work.title": "Projetos selecionados",
  "home.work.lede": "Clique num projeto para abrir.",
  "home.links.title": "Links",
  "home.links.lede": "Políticas e convites das comunidades.",
  "home.policy.tos": "Termos de Serviço",
  "home.policy.privacy": "Política de Privacidade",
  "home.policy.vltra": "CONVITE VLTRA",
  "home.policy.bloodOath": "CONVITE BLOOD OATH",
  "home.footer": "Atualizado em 2 de outubro de 2026",
  "home.backToTop": "Voltar ao topo ↑",

  // --- Cards (partes comuns) ------------------------------------------------
  "home.project.stack": "Tecnologias",
  "home.project.close": "Fechar projeto",
  "home.gallery.open": "Abrir imagem em tamanho cheio",
  "home.gallery.group": "Imagens",
  "tag.Slash commands": "Comandos slash",

  // --- Player e lightbox -----------------------------------------------------
  "home.player.close": "Fechar player",
  "home.player.art": "Capa do álbum",
  "home.player.listen": "Ouça também!",
  "home.lightbox.label": "Visualizador de imagens",
  "home.lightbox.close": "Fechar imagem",
  "home.lightbox.prev": "Imagem anterior",
  "home.lightbox.next": "Próxima imagem",

  // --- Texto ao vivo --------------------------------------------------------
  "live.notListening": "Não estou ouvindo nada agora",
  "live.idle": "Spotify parado",
  "live.liveOnSpotify": "Ao vivo no Spotify",
  "live.nowPlaying": "Tocando agora",
  "live.live": "Ao vivo",
  "live.notPlaying": "Nada tocando",
  "live.startListening": "Comece a ouvir no Spotify",
  "live.noArtwork": "Sem capa",
  "live.albumArtwork": "Capa do álbum",
  "live.discordStatus": "Status no Discord",
  "live.status.online": "Online",
  "live.status.idle": "Ausente",
  "live.status.dnd": "Não perturbe",
  "live.status.invisible": "Invisível",
  "live.status.offline": "Offline",
  "live.showImage": "Mostrar imagem",

  // --- Blood Oath ------------------------------------------------------------
  "p.blood-oath.tagline": "Um jogo de mundo aberto no Roblox ambientado no sertão nordestino em 1898.",
  "p.blood-oath.status": "Em desenvolvimento",
  "p.blood-oath.d0":
    "Um jogo online de mundo aberto no espírito de Red Dead Redemption 2, ambientado no sertão nordestino antes de 1910: a era do cangaço, quando Antônio Silvino corria o sertão e Lampião ainda era um nome que ninguém conhecia.",
  "p.blood-oath.d1":
    "Os jogadores escolhem um lado entre quatro facções (cangaceiros, a Volante, jagunços e sertanejos) e acumulam fama, recompensas e uma história contada em capítulos. Nomes, roupas, armas de fogo, lojas e o dinheiro em réis vêm todos da época.",
  "p.blood-oath.d2":
    "Por baixo é um projeto Rojo em Luau: catálogos orientados a dados para personagens, fardas, armas e regiões, armas de fogo com balística própria (gravidade, arrasto, dano por distância e por parte do corpo) e um servidor que valida e limita tudo o que o cliente envia. Em desenvolvimento pelo Imperial Engineer Corps.",
  "p.blood-oath.link0": "Entre no Discord",
  "p.blood-oath.cap0": "Pôster de anúncio",
  "p.blood-oath.cap1": "As quatro facções: cangaceiros, Volante, jagunços e sertanejos",
  "p.blood-oath.cap2": "Mapa do jogo de Recife e Olinda, 1898",
  "p.blood-oath.alt0": "Pôster de anúncio de Blood Oath: Brazil 1898",
  "p.blood-oath.alt1": "Ícones das quatro facções",
  "p.blood-oath.alt2": "Mapa desenhado à mão de Recife e Olinda em 1898",

  // --- ii on Windows 11 ---------------------------------------------------
  "p.ii-windows.title": "ii no Windows",
  "p.ii-windows.tagline":
    "O desktop illogical-impulse do end-4, feito em Quickshell, portado do Hyprland para o Windows 11 e 10.",
  "p.ii-windows.defenderResponse": "A Microsoft não conseguiu reproduzir uma detecção no qsw.exe da 1.0.8. A análise continua em andamento; se a detecção persistir, a Microsoft solicita logs de suporte do PC afetado para continuar investigando.",
  "p.ii-windows.status": "Versão estável · v1.0.8 — Jazz-Handed Octopus",
  "p.ii-windows.d0": "O desktop illogical-impulse do end-4, rodando nativamente no Windows 10 e 11. Seus apps e arquivos continuam onde estão; o ii traz outra barra, barras laterais e widgets ao redor deles.",
  "p.ii-windows.d1": "Busque com a tecla Windows, controle música e notificações pela barra lateral e organize widgets e janelas do seu jeito. As cores acompanham o wallpaper, com dois visuais para escolher.",
  "p.ii-windows.d2": "Portei o Quickshell para Windows com C++/WinRT, Qt e Direct3D 11 e adaptei o ii aos serviços nativos do Windows: desktops virtuais, áudio, notificações, captura de tela e atalhos globais. O design do desktop é do end-4; o backend e a integração com Windows são meu trabalho.",
  "p.ii-windows.d3": "Grátis e de código aberto. Um instalador por usuário instala, atualiza e remove tudo. Explore a demo interativa no site do produto ou leia as notas de versão no GitHub. Este fork também tem suporte em uma thread dedicada no servidor original do ii no Discord. A partir da 26.1.1.0, as releases terão assinatura de código gratuita por SignPath.io, com certificado da SignPath Foundation. A 1.0.8 continua sendo a versão atual, sem assinatura.",
  "p.ii-windows.heading0": "Seu desktop no dia a dia",
  "p.ii-windows.heading1": "O port para Windows",
  "p.ii-windows.heading2": "Experimente",
  "p.ii-windows.cap0": "Widgets do desktop com as cores do seu wallpaper.",
  "p.ii-windows.alt0": "Widgets do desktop com as cores do seu wallpaper.",
  "p.ii-windows.cap1": "Uma tecla para apps, arquivos e ações rápidas.",
  "p.ii-windows.alt1": "Uma tecla para apps, arquivos e ações rápidas.",
  "p.ii-windows.cap2": "Música, notificações e controles rápidos juntos.",
  "p.ii-windows.alt2": "Música, notificações e controles rápidos juntos.",
  "p.ii-windows.cap3": "Dois visuais com configurações para deixar do seu jeito.",
  "p.ii-windows.alt3": "Dois visuais com configurações para deixar do seu jeito.",
  "p.ii-windows.cap4": "Escolha um wallpaper e deixe as cores acompanharem.",
  "p.ii-windows.alt4": "Escolha um wallpaper e deixe as cores acompanharem.",
  "p.ii-windows.cap5": "Windows Terminal na mesma paleta.",
  "p.ii-windows.alt5": "Windows Terminal na mesma paleta.",
  "p.ii-windows.link0": "Site",
  "p.ii-windows.link1": "Baixar o instalador",
  "p.ii-windows.link2": "ii-windows no GitHub",
  "p.ii-windows.link3": "Fork do Quickshell",
  "p.ii-windows.link6": "Thread de suporte · Discord original do ii",
  "p.ii-windows.link5": "Política de assinatura de código",
  "p.ii-windows.link4": "Fork do ii",

  // --- Sollarety -------------------------------------------------------------
  "p.sollarety.tagline": "Um bot de moderação, verificação Roblox, música e diversão para comunidades no Discord.",
  "p.sollarety.d0":
    "O Sollarety é um bot de Discord para servidores de comunidade: moderação, advertências, verificação Roblox, música e um monte de comandos de diversão. Ele roda na mesma infraestrutura do ccore, mas os dois são aplicações separadas e não compartilham dado nenhum.",
  "p.sollarety.d1":
    "A moderação segue as permissões do próprio servidor no Discord, então não há cargo para configurar, e as advertências ficam registradas por escrito. A verificação Roblox passa pelo login oficial do Roblox, então o bot nunca vê senha nenhuma. Cada servidor decide o que a verificação dá, de cargos por rank de grupo a uma idade mínima de conta que barra contas recém-criadas.",
  "p.sollarety.d2":
    "A música toca do YouTube, do SoundCloud ou do Spotify com votação para pular, e nada fica guardado: a fila vive só na memória. O bot também nunca lê as suas mensagens. Ele nem pede o Message Content intent do Discord.",
  "p.sollarety.link0": "Adicionar ao Discord",
  "p.sollarety.link1": "Site",
  "p.sollarety.cap0": "Um bot de Discord que nunca lê as suas mensagens",
  "p.sollarety.cap1": "/verify: vincular o Roblox sem nunca digitar uma senha",
  "p.sollarety.cap2": "A página do Sollarety no daeese.me",
  "p.sollarety.alt0": "Pôster do Sollarety: um bot de Discord que nunca lê as suas mensagens",
  "p.sollarety.alt1": "Como o /verify funciona, em três passos",
  "p.sollarety.alt2": "O site do Sollarety com o emblema do sol prateado",

  // --- ccore -------------------------------------------------------------------
  "p.ccore.title": "Aplicação de Discord ccore",
  "p.ccore.tagline": "Bot de utilidade e automação do 12° Regimento de Infantaria no CONSTANTES.",
  "p.ccore.status": "Menos atualizações — não desativado",
  "p.ccore.d0":
    "O ccore é o bot de administração do 12° Regimento de Infantaria \"Chaves\", um regimento da comunidade CONSTANTES. Ele cuida do alistamento com verificação Roblox automática, dos deployments, da planilha do regimento e dos avisos.",
  "p.ccore.d1":
    "Ele é travado num servidor de propósito: foi feito para uma comunidade, não como bot público para vários servidores. Também foi dele que saiu a infraestrutura do Sollarety. Os dois dividem a hospedagem, não os dados.",
  "p.ccore.d2": "O ccore do 12° não vai receber tantas atualizações daqui em diante, mas não está desativado. Ele foi o pontapé inicial que deixou o Sollarety brilhar, e deve virar um engine: o template de bot/app para Discord do daeese, a base para novos apps num futuro próximo.",
  "p.ccore.link0": "Site",
  "p.ccore.link1": "Discord do CONSTANTES",
  "p.ccore.link2": "Sollarety",
  "p.ccore.cap0": "A página do ccore no daeese.me",
  "p.ccore.cap1": "O emblema do ccore",
  "p.ccore.alt0": "O site do ccore",
  "p.ccore.alt1": "Emblema do ccore",

  // --- mocktail ---------------------------------------------------------------
  "p.mocktail.tagline":
    "Overlay não oficial do Portage que leva o Mocktail, o cliente Android do Roblox no Linux, para o Gentoo.",
  "p.mocktail.d0":
    "O Mocktail é o runtime de compatibilidade que roda o cliente Android x86-64 do Roblox no Linux. Este é um overlay do Portage não oficial, feito por terceiros, com ebuilds para ele, para quem usa Gentoo instalar com o emerge como qualquer outro pacote.",
  "p.mocktail.d1":
    "O overlay tem um build a partir do código-fonte, um ebuild live -9999 que acompanha a branch main e um pacote binário pré-compilado como alternativa. Ele não tem vínculo com o Mocktail, o Roblox nem a VinegarHQ: eu mantenho os ebuilds, não o software.",
  "p.mocktail.link0": "Ver no GitHub",
  "p.mocktail.cap0": "Roblox, no Gentoo",
  "p.mocktail.alt0": "Roblox, no Gentoo: os passos de instalação e os três ebuilds",

  // --- VLTRA -------------------------------------------------------------------
  "p.vltra.tagline": "Desenvolvedor fullstack na VLTRA Entertainment.",
  "p.vltra.d0": "Trabalho como desenvolvedor fullstack na VLTRA Entertainment.",
  "p.vltra.d1": "A comunidade do estúdio fica no Discord, e é lá que dá para acompanhar no que ele está trabalhando.",
  "p.vltra.link0": "Entre no Discord da VLTRA",
  "p.vltra.alt0": "Logo da VLTRA Entertainment"
};
