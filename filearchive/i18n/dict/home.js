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
  "p.ii-windows.status": "Versão experimental · v0.6.2",
  "p.ii-windows.d0":
    "O illogical-impulse (ii) é o shell de desktop em Quickshell que o end-4 fez para o Hyprland: a barra, as barras laterais, o overview e os widgets. Este port faz ele rodar num desktop de verdade do Windows, 11 ou 10, e chegar lá exige dois forks.",
  "p.ii-windows.d1":
    "O primeiro é o próprio Quickshell, com o núcleo tornado portável e um backend nativo novo para Windows. Ele reserva espaço na tela como AppBar, desenha janelas translúcidas sem moldura em Direct3D 11 e acompanha janelas e desktops virtuais por trás da mesma API Quickshell.Hyprland que o ii já usa. Em volta disso ficam atalhos globais (inclusive apertar só a tecla Super), Core Audio, controles de mídia, captura de janelas ao vivo para as prévias do overview, um servidor de notificações que espelha os avisos do Windows, OCR, blur atrás dos painéis e um crash handler que grava um minidump e reabre o shell. Cada serviço WinRT roda na sua própria thread multithreaded apartment e devolve os resultados para o Qt.",
  "p.ii-windows.d2":
    "O segundo é o ii por cima: o histórico da config separado do repositório de dotfiles, para as mudanças do upstream continuarem entrando, com cada comando de Linux trocado por uma API nativa ou desligado sem erro. O ii pega o wallpaper do Windows e monta a paleta Material You com o matugen, e a mesma paleta veste o Windows Terminal: esquema de cores, perfil e um prompt do Oh My Posh nas cores do ii, gerados por um port em C++ do código de cores de terminal do ii que bate bit a bit com a versão em Python.",
  "p.ii-windows.d3":
    "Já testado na VM: a barra, a barra lateral direita, o overview com prévias ao vivo, as notificações, os modos claro e escuro e os esquemas de cores, o seletor de wallpaper, recortes de tela com OCR, desktops virtuais, uma taskbar que só aparece na borda de baixo e o cheatsheet de atalhos, que segue o layout do teclado. Tudo é compilado a partir do Linux com clang-cl, xwin e Qt 6.11.",
  "p.ii-windows.d4":
    "A versão 0.1.0 saiu em 2 de outubro com um instalador gráfico pequeno, feito em Rust com Tauri, que baixa o pacote do release no GitHub, confere o SHA-256 e instala tudo para o usuário atual, sem precisar de administrador. O mesmo instalador atualiza, repara e desinstala, e a desinstalação devolve o wallpaper, o modo claro ou escuro, a cor de destaque e a configuração da taskbar que ele encontrou. A 0.1.1 atacou o travamento de mouse e teclado em hardware de verdade, tirando os eventos de janela da thread principal do ii.",
  "p.ii-windows.d5":
    "A 0.2.0 traz o Windows 10 (versão 2004 ou mais nova): desktops virtuais, blur atrás dos painéis e a taskbar que só aparece com o ponteiro, em qualquer borda da tela, funcionam lá também, e o instalador confere o WebView2 e instala o Windows Terminal ou o winget quando faltam. Ela também já vem com o runtime do Visual C++, que a 0.1.x exigia instalado, e o brilho agora funciona na tela de notebooks, escurecendo por software em monitores sem DDC/CI.",
  "p.ii-windows.d6":
    "A 0.3.0, de 5 de outubro, grava a tela com a captura e o codificador H.264 do próprio Windows, então o FFmpeg deixou de ser necessário, põe uma bandeja do sistema na barra do ii que divide os ícones com a do Explorer e leva o wallpaper e os widgets para dentro da área de trabalho do Windows, atrás dos ícones. O tradutor e o tradutor de tela, o reconhecimento de música (SongRec) e o LaTeX no chat de IA (um MicroTeX compilado para Windows) agora funcionam no Windows também. Ela está mesclada com o Quickshell 0.3.1 e o ii mais recente do end-4, e o instalador agora procura um release mais novo no GitHub toda vez que abre e se atualiza antes. A 0.3.1 veio no mesmo dia com duas correções: o blur do Windows 10 não aparece mais como uma faixa nas pontas arredondadas da barra flutuante, e a janela do instalador abre na parte livre da tela em vez de embaixo da barra do ii.",
  "p.ii-windows.d7":
    "A 0.4.0, lançada na mesma noite, traz tiling opcional: o layout dwindle do Hyprland em cima das áreas de trabalho virtuais do próprio Windows, comandado pelos atalhos do ii, sem nenhum gerenciador de janelas a mais para instalar (vem desligado). O tradutor de tela agora põe cada parágrafo traduzido por cima do texto original, os widgets da área de trabalho ficam junto dos ícones e voltam a poder ser arrastados, os ícones da bandeja de apps abertos antes do ii respondem ao clique e o console clássico do PowerShell ganha as cores e a fonte do ii. Ela também corrige um crash no ajudante de áreas de trabalho virtuais do Windows 10, uma segunda cópia do ii abrindo por cima da primeira e a barra às vezes perdendo o espaço reservado.",
  "p.ii-windows.d8":
    "A 0.5.0, um dia depois, deixa segurar Win e arrastar para mover uma janela, ou Win + arrastar com o botão direito para redimensionar, com tiling e entre monitores com escalas diferentes. O Windows volta a desenhar o papel de parede e o ii só põe os widgets dele na área de trabalho, então trocar o papel de parede no Windows recolore o ii. A barra encolhe os applets quando eles não cabem, e chegam um visualizador de mídia, um seletor de cor nativo, clima, game mode e o botão do WARP.",
  "p.ii-windows.d9":
    "A 0.6.0 inicia bem mais rápido em máquinas mais fracas: numa VM limitada a dois núcleos lentos e um disco lento, a barra aparece em uns 4 segundos em vez de uns 43. A tecla do Windows abre uma busca Spotlight para apps, arquivos, histórico da área de transferência, emoji, ações do sistema e a web, o Win+Tab abre os workspaces, e o cheatsheet ganha uma aba System com CPU, GPU, memória e discos. A 0.6.1 traz quase todas as opções para o app de Configurações, agora também em português do Brasil, e a 0.6.2 deixa tudo mais rápido de novo: a barra aparece em uns 2 segundos naquela mesma VM, as Configurações abrem dentro do ii em menos de um segundo e o download ficou uns 45 MB mais leve. Continua experimental, e o instalador ainda não é assinado, então o SmartScreen pode avisar.",
  "p.ii-windows.link0": "Site",
  "p.ii-windows.link1": "Baixar o instalador",
  "p.ii-windows.link2": "ii-windows no GitHub",
  "p.ii-windows.link3": "Fork do Quickshell",
  "p.ii-windows.link4": "Fork do ii",
  "p.ii-windows.cap0": "As cores do ii tiradas do wallpaper do Windows; a taskbar só aparece na borda de baixo",
  "p.ii-windows.cap1": "A aba System do cheatsheet: CPU, GPU, memória e discos, novidade da 0.6.0",
  "p.ii-windows.cap2": "Spotlight na tecla do Windows: apps, arquivos, ações do sistema, emoji e a área de transferência, novidade da 0.6.0",
  "p.ii-windows.cap3": "Tiling opcional: o layout dwindle do Hyprland nas áreas de trabalho virtuais do Windows, novidade da 0.4.0",
  "p.ii-windows.cap4": "O instalador: instala, atualiza, repara e desinstala, tudo por usuário",
  "p.ii-windows.cap5": "Windows 10 (0.2.0), com o wallpaper e o relógio atrás dos ícones da área de trabalho (0.3.0)",
  "p.ii-windows.cap6": "O tradutor na barra lateral esquerda, novidade da 0.3.0",
  "p.ii-windows.cap7": "Windows Terminal com as cores do ii e um prompt do Oh My Posh",
  "p.ii-windows.cap8": "Cheatsheet de atalhos no Super+/, seguindo o layout do teclado",
  "p.ii-windows.cap9": "Barra lateral direita: atalhos rápidos, notificações e calendário",
  "p.ii-windows.cap10": "Overview dos workspaces, no Win+Tab desde a 0.6.0",
  "p.ii-windows.alt0": "Desktop do Windows 11 com a barra e o relógio do ii, coloridos a partir de um wallpaper de anime",
  "p.ii-windows.alt1": "O cheatsheet do ii na aba System, com os dados do host, medidores de CPU, GPU e memória e os discos",
  "p.ii-windows.alt2": "A busca Spotlight do ii mostrando os apps instalados com os ícones deles",
  "p.ii-windows.alt3": "Quatro janelas do Bloco de Notas organizadas pelo tiling do ii no layout dwindle do Hyprland, embaixo da barra do ii",
  "p.ii-windows.alt4": "O instalador do ii-windows na página de opções, com chaves para iniciar com o Windows e configurar o terminal",
  "p.ii-windows.alt5": "Área de trabalho do Windows 10 em que o wallpaper e o relógio do ii ficam atrás dos ícones",
  "p.ii-windows.alt6": "O tradutor da barra lateral esquerda do ii passando uma frase em português para o inglês",
  "p.ii-windows.alt7": "Janelas do Windows Terminal na paleta rosa do ii com um prompt do Oh My Posh",
  "p.ii-windows.alt8": "Cheatsheet de atalhos do ii com os atalhos do shell, de mídia, de janelas e de apps",
  "p.ii-windows.alt9": "Barra lateral direita do ii aberta, com atalhos rápidos, notificações e um calendário",
  "p.ii-windows.alt10": "Overview dos workspaces do ii com um campo de busca",

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
