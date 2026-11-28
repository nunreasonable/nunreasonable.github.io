/*
 * Portugues da home (o portfolio em daeese.me).
 *
 * Chave ausente = fica em ingles, entao nomes proprios (Blood Oath, Sollarety,
 * ccore, nomes de tecnologia) nao aparecem aqui.
 *
 * Tres familias de chave:
 *   home.*         texto fixo do HTML (nav, hero, secoes, rodape, player)
 *   p.<slug>.*     cards de projeto, gerados pelo JS a partir de profileData
 *   live.*         texto AO VIVO (Listening now, legendas da galeria, status do
 *                  Discord). Este nao usa data-i18n: o JS da pagina importa
 *                  este mesmo arquivo e reescreve esses textos no evento
 *                  i18n:change.
 *
 * As legendas (cap) e os textos alternativos (alt) de cada imagem seguem a
 * ordem de profileData.projects[].images: cap0 e a primeira imagem, e assim
 * por diante. Reordenar as imagens la exige reordenar aqui.
 *
 * Quando o sentido de um texto muda, a chave ganha nome novo (o `keys` do
 * projeto no index.html, como p.ginrose.d1Bsd): um dicionario velho em cache
 * nunca poe a traducao antiga em cima do ingles novo.
 */
export const pt = {
  "p.ginrose.taglineBsd": "Um launcher comunitário de código aberto para o cliente oficial do Roblox para macOS, no Linux e nativamente no FreeBSD e no GhostBSD.",
  "p.ginrose.format": "Linux, FreeBSD e GhostBSD",
  "p.ginrose.d0Bsd": "O Ginrose é um launcher independente da comunidade, sem vínculo nem endosso da Roblox Corporation. Baixa o cliente oficial do Roblox para macOS diretamente da Roblox e o executa pelo Rosemary no Linux, e nativamente no FreeBSD e no GhostBSD. Inclui perfis gráficos por jogo, limite de quadros e Discord Rich Presence.",
  "p.ginrose.d1Bsd": "A versão 26.0.5.1 volta a abrir no FreeBSD, onde a janela do launcher fechava ao abrir. A versão 26.0.5.0 passou o Rosemary para um upstream mais recente, com correções nas bibliotecas de shaders do Metal e no FreeBSD, e deixou os diálogos flutuando em compositores de tiling como o Hyprland. O aviso opcional da localização do servidor do Roblox continua disponível. Atualizações anteriores passaram a numerar as versões por ano, puderam mostrar o sistema no status do Discord, trouxeram builds de FreeBSD, passaram a seguir contas num canal de deploy da Roblox fora do LIVE, trouxeram melhorias de renderização, shaders e entrada, deixaram o download do Roblox terminar em conexões mais lentas, passaram a avisar quando a escolha do Rosemary não é salva, preservaram o app já associado aos links do Roblox, melhoraram o ritmo dos quadros, reduziram a CPU por desenho e corrigiram a posição do cursor no Wayland. No Linux tem o Flatpak e pacotes nativos para Arch, Debian, Ubuntu, Fedora e openSUSE, além de um flake do Nix e um ebuild do Gentoo; no FreeBSD 14.5 ou mais recente ele instala nativamente, e o GhostBSD roda as mesmas builds. As experiências rodam no Rosemary com vídeo e som. Vem junto com o Ginrose Studio, o irmão dele para o Roblox Studio, que por enquanto roda só no Linux. O Ginrose é livre e de código aberto sob GPL-3.0 ou posterior, com builds oficiais publicadas pelo projeto Ginrose para Linux e FreeBSD x86_64. O site reúne download, instalação e links do fonte.",
  "p.ginrose.link0": "Site e download",
  "p.ginrose-studio.tagline": "Um launcher comunitário de código aberto para o Roblox Studio oficial para macOS no Linux.",
  "p.ginrose-studio.state": "Experimental",
  "p.ginrose-studio.d0": "O Ginrose Studio é um launcher independente da comunidade, sem vínculo nem endosso da Roblox Corporation. Compilado do mesmo código do Ginrose, ele baixa o Roblox Studio oficial para macOS direto da Roblox e o executa no Linux pelo Rosemary.",
  "p.ginrose-studio.d1v26": "É uma ferramenta de desenvolvimento, então é permissivo: qualquer FastFlag, qualquer variável de ambiente para o Rosemary, argumentos extras e o binário do Rosemary que você quiser, e o Control funciona como Command em todos os atalhos por padrão. Desde a versão 26.0.5.0, os diálogos do Studio flutuam em compositores de tiling como o Hyprland e o Rosemary vem de um upstream mais recente, com correções nas bibliotecas de shaders do Metal. Por enquanto roda só no Linux; ainda não há build para FreeBSD. Login, abrir places e Team Create funcionam; ainda é experimental.",
  "p.ginrose-studio.link0": "Site e download",
  "home.enter": "Entrar no site",
  "home.exploreDisco": "Explorar a discografia",
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
  "home.devRole": "Desenvolvedor fullstack",
  "home.bioRust":
    "Trabalho com Rust, C#, JS, HTML e CSS. Meu fuso principal é UTC-3, às vezes UTC 0.\nDesenvolvedor fullstack na Vltra Entertainment.",
  "home.link.contactTag": "E-mail",
  "home.stat.releases": "Lançamentos",
  "home.stat.latest": "Último lançamento",
  "home.stat.genres": "Gêneros",
  "home.stat.listening": "Ouvindo agora",
  "home.about": "Sobre",

  // --- Secoes ---------------------------------------------------------------
  "home.disco.title": "Discografia",
  "home.disco.count": "lançamentos",
  "home.disco.lede": "Escolha uma capa para abrir o lançamento.",
  "home.links.title": "Links",
  "home.links.lede": "Políticas e convites das comunidades.",
  "home.policy.tos": "Termos de Serviço",
  "home.policy.privacy": "Política de Privacidade",
  "home.policy.vltra": "CONVITE VLTRA",
  "home.policy.bloodOath": "CONVITE BLOOD OATH",
  "home.footer": "Atualizado em 26 de novembro de 2026",
  "home.backToTop": "Voltar ao topo ↑",

  // --- Cards (partes comuns) ------------------------------------------------
  "home.project.stack": "Tecnologias",
  "home.project.close": "Fechar projeto",
  "home.gallery.open": "Abrir imagem em tamanho cheio",
  "home.gallery.group": "Imagens",
  "tag.Slash commands": "Comandos slash",
  "tag.Web Development": "Desenvolvimento web",

  // --- Player e lightbox -----------------------------------------------------
  "home.player.close": "Fechar player",
  "home.player.art": "Capa do álbum",
  "home.player.listen": "Ouça também!",
  "home.lightbox.label": "Visualizador de imagens",
  "home.lightbox.close": "Fechar imagem",
  "home.lightbox.prev": "Imagem anterior",
  "home.lightbox.next": "Próxima imagem",

  // --- Texto ao vivo --------------------------------------------------------
  "live.nothingNow": "Nada no momento",
  "live.liveOnSpotify": "Ao vivo no Spotify",
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
  "p.blood-oath.format": "Jogo de Roblox",
  "p.blood-oath.state": "Em desenvolvimento",
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
  "p.ii-windows.title": "Illogical Windows",
  "p.ii-windows.tagline":
    "O desktop illogical-impulse do end-4, feito em Quickshell, portado do Hyprland para o Windows 11 e 10.",
  "p.ii-windows.defenderResponse": "O ii ainda não é assinado, então o Microsoft Defender pode detectá-lo. O setup e o site do produto mostram como adicionar exclusões para as pastas do ii.",
  "p.ii-windows.format": "Windows 11 e 10",
  "p.ii-windows.state": "Estável",
  "p.ii-windows.d0": "O desktop illogical-impulse do end-4, rodando nativamente no Windows 10 e 11. Seus apps e arquivos continuam onde estão; o ii traz outra barra, barras laterais e widgets ao redor deles.",
  "p.ii-windows.d1": "Busque com a tecla Windows, controle música e notificações pela barra lateral e organize widgets e janelas do seu jeito. As cores acompanham o wallpaper, com onze visuais para escolher.",
  "p.ii-windows.d2": "Portei o Quickshell para Windows com C++/WinRT, Qt e Direct3D 11 e adaptei o ii aos serviços nativos do Windows: desktops virtuais, áudio, notificações, captura de tela e atalhos globais. O design do desktop é do end-4; o backend e a integração com Windows são meu trabalho.",
  "p.ii-windows.d3": "Grátis e de código aberto. Um instalador por usuário instala, atualiza e remove tudo. Explore a demo interativa no site do produto ou leia as notas de versão no GitHub. Este fork também tem suporte em uma thread dedicada no servidor original do ii no Discord. A 26.2.0.0 traz sete visuais novos que lembram a escolha de cada um, o dashboard em cartões do end4-pC para as Configurações, um painel opcional do Claude Code, uma tela de boas-vindas com saudações dinâmicas e um relógio de data grande com os widgets de Frase e Saudação. ARM64 continua experimental. Ainda não é assinado: pedi a assinatura de código gratuita da SignPath Foundation e continuo tentando conseguir.",
  "p.ii-windows.heading0": "Seu desktop no dia a dia",
  "p.ii-windows.heading1": "O port para Windows",
  "p.ii-windows.heading2": "Experimente",
  "p.ii-windows.cap0": "Widgets do desktop com as cores do seu wallpaper.",
  "p.ii-windows.alt0": "Widgets do desktop com as cores do seu wallpaper.",
  "p.ii-windows.cap1": "Uma tecla para apps, arquivos e ações rápidas.",
  "p.ii-windows.alt1": "Uma tecla para apps, arquivos e ações rápidas.",
  "p.ii-windows.cap2": "Música, notificações e controles rápidos juntos.",
  "p.ii-windows.alt2": "Música, notificações e controles rápidos juntos.",
  "p.ii-windows.cap3": "Configurações para deixar o desktop do seu jeito.",
  "p.ii-windows.alt3": "Configurações para deixar o desktop do seu jeito.",
  "p.ii-windows.cap4": "Escolha um wallpaper e deixe as cores acompanharem.",
  "p.ii-windows.alt4": "Escolha um wallpaper e deixe as cores acompanharem.",
  "p.ii-windows.cap5": "Windows Terminal na mesma paleta.",
  "p.ii-windows.alt5": "Windows Terminal na mesma paleta.",
  "p.ii-windows.link0": "Site",
  "p.ii-windows.link1": "Baixar a 26.2.0.0",
  "p.ii-windows.link2": "ii-windows no GitHub",
  "p.ii-windows.link3": "Fork do Quickshell",
  "p.ii-windows.link6": "Thread de suporte · Discord original do ii",
  "p.ii-windows.link5": "Política de assinatura de código",
  "p.ii-windows.link4": "Fork do ii",

  // --- Sollarety -------------------------------------------------------------
  "p.sollarety.tagline": "Um bot de moderação, verificação Roblox, música e diversão para comunidades no Discord.",
  "p.sollarety.format": "Bot de Discord",
  "p.sollarety.d0Rust":
    "O Sollarety é um bot de Discord para servidores de comunidade: moderação, advertências, verificação Roblox, música e um monte de comandos de diversão. Ele foi reescrito em Rust em 2026, com poise e serenity, e songbird para voz. Ele roda na mesma infraestrutura do ccore, mas os dois são aplicações separadas e não compartilham dado nenhum.",
  "p.sollarety.d1":
    "A moderação segue as permissões do próprio servidor no Discord, então não há cargo para configurar, e as advertências ficam registradas por escrito. A verificação Roblox passa pelo login oficial do Roblox, então o bot nunca vê senha nenhuma. Cada servidor decide o que a verificação dá, de cargos por rank de grupo a uma idade mínima de conta que barra contas recém-criadas.",
  "p.sollarety.d2Intent":
    "A música toca do YouTube, do SoundCloud ou do Spotify com votação para pular, e nada fica guardado: a fila vive só na memória. O Sollarety não pede o Message Content intent do Discord, então o único texto de mensagem que ele recebe é o das mensagens que o mencionam e o das que você escolhe com o comando Translate dele, no menu Apps. Esse texto é para a IA local, e não fica guardado.",
  "p.sollarety.link0": "Adicionar ao Discord",
  "p.sollarety.link1": "Site",
  "p.sollarety.capVerify": "/verify: vincular o Roblox sem nunca digitar uma senha",
  "p.sollarety.capPage": "A página do Sollarety no daeese.me",
  "p.sollarety.altVerify": "Como o /verify funciona, em três passos",
  "p.sollarety.altPage": "O site do Sollarety com o emblema do sol prateado",

  // --- ccore -------------------------------------------------------------------
  "p.ccore.title": "Aplicação de Discord ccore",
  "p.ccore.tagline": "Bot de utilidade e automação do 12° Regimento de Infantaria no CONSTANTES.",
  "p.ccore.format": "Bot de Discord",
  "p.ccore.state": "Menos atualizações — não desativado",
  "p.ccore.d0":
    "O ccore é o bot de administração do 12° Regimento de Infantaria \"Chaves\", um regimento da comunidade CONSTANTES. Ele cuida do alistamento com verificação Roblox automática, dos deployments, da planilha do regimento e dos avisos.",
  "p.ccore.d1":
    "Ele é travado num servidor de propósito: foi feito para uma comunidade, não como bot público para vários servidores. Também foi dele que saiu a infraestrutura do Sollarety. Os dois dividem a hospedagem, não os dados. Desde novembro de 2026 ele roda em Rust, reescrito a partir da versão original em C# / .NET.",
  "p.ccore.d2": "O ccore do 12° não vai receber tantas atualizações daqui em diante, mas não está desativado. Ele foi o pontapé inicial que deixou o Sollarety brilhar, e deve virar um engine: o template de bot/app para Discord do daeese, a base para novos apps num futuro próximo.",
  "p.ccore.link0": "Site",
  "p.ccore.link1": "Discord do CONSTANTES",
  "p.ccore.link2": "Sollarety",
  "p.ccore.cap0": "A página do ccore no daeese.me",
  "p.ccore.cap1": "O emblema do ccore",
  "p.ccore.alt0": "O site do ccore",
  "p.ccore.alt1": "Emblema do ccore",

  // --- mocktail ---------------------------------------------------------------
  "p.mocktail.format": "Overlay do Portage",
  "p.mocktail.tagline":
    "Overlay não oficial do Portage que leva o Mocktail, o cliente Android do Roblox no Linux, para o Gentoo.",
  "p.mocktail.d0":
    "O Mocktail é o runtime de compatibilidade que roda o cliente Android x86-64 do Roblox no Linux. Este é um overlay do Portage não oficial, feito por terceiros, com ebuilds para ele, para quem usa Gentoo instalar com o emerge como qualquer outro pacote.",
  "p.mocktail.d1":
    "O overlay tem um build a partir do código-fonte, um ebuild live -9999 que acompanha a branch main e um pacote binário pré-compilado como alternativa. Ele não tem vínculo com o Mocktail, o Roblox nem a VinegarHQ: eu mantenho os ebuilds, não o software.",
  "p.mocktail.link0": "Ver no GitHub",
  "p.mocktail.cap0": "Roblox, no Gentoo",
  "p.mocktail.alt0": "Roblox, no Gentoo: os passos de instalação e os três ebuilds",
  "p.rosemary-overlay.format": "Overlay do Portage",
  "p.rosemary-overlay.tagline": "Overlay não oficial do Portage que compila o Rosemary, a camada de compatibilidade com macOS por trás do Ginrose, no Gentoo.",
  "p.rosemary-overlay.d0": "O Rosemary roda aplicativos de macOS no Linux. Este overlay não oficial, de terceiros, empacota a release upstream dele para o Gentoo, para instalar com emerge como qualquer outra coisa. Também oferece Ginrose e Ginrose Studio pelo pacote games-util/ginrose: a USE flag player instala o Ginrose e studio instala o Ginrose Studio.",
  "p.rosemary-overlay.d1": "O ebuild compila o Rosemary do código com o cargo.eclass do Gentoo, offline depois que o Portage baixa as fontes, com as dependências Git fixadas no lockfile do upstream. As USE flags escolhem os backends de OpenGL, Vulkan e WebKit. Precisa do Rust 1.99 e do SDL 3.4, e é testado num contêiner limpo do Gentoo. Não tem vínculo com o Rosemary: eu mantenho o ebuild, não o software.",
  "p.rosemary-overlay.link0": "Ver no GitHub",

  // --- VLTRA -------------------------------------------------------------------
  "p.vltra.format": "Trabalho no estúdio",
  "p.vltra.tagline": "Desenvolvedor fullstack na VLTRA Entertainment.",
  "p.vltra.d0": "Trabalho como desenvolvedor fullstack na VLTRA Entertainment.",
  "p.vltra.d1": "A comunidade do estúdio fica no Discord, e é lá que dá para acompanhar no que ele está trabalhando.",
  "p.vltra.link0": "Entre no Discord da VLTRA",
  "p.vltra.alt0": "Logo da VLTRA Entertainment"
};
