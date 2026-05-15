# Cornwall Discord Bot

Bot Discord para o 32nd "The Cornwall" Regiment of Foot com funcionalidades de alistamento, deployments e mensagens.

## Comandos do Bot

### Alistamento & Verificação
- **`/enlistuser`** - Alista um usuário com verificação automática ROBLOX
  - Requer: Cargo de permissão configurado
  - Parâmetros: usuário, username ROBLOX
  - Função: Verificação anti-ALT + atribuição de cargos + nickname + log

- **`/alistar-se`** - Auto-alistamento com formulário interativo
  - Canal específico requerido
  - Função: Formulário completo + verificação ROBLOX automática

### Planilha & Informações
- **`/checkspreadsheetinfo`** - Consulta informações da planilha regimental
  - Parâmetro: username na planilha
  - Função: Busca dados na aba Roster da planilha

### Mensagens & Comunicações
- **`/deployment`** - Envia mensagem de deployment
  - Requer: Cargo de permissão configurado
  - Parâmetro: código do jogo
  - Função: Embed com roles ping + botões de acesso

- **`/dmrole`** - Envia DM para cargo/usuário (com código)
  - Requer: Cargo de permissão configurado
  - Parâmetros: cargo/usuário, código, mensagem
  - Limite: 500 membros por execução

- **`/dmrolemsg`** - Envia DM para cargo/usuário (sem código)
  - Requer: Cargo de permissão configurado
  - Parâmetros: cargo/usuário, mensagem
  - Limite: 500 membros por execução

### Sistema de Repost
- **`/messages`** - Verifica status do armazenamento de mensagens
  - Função: Estatísticas e progresso do sistema

- **`/repost`** - Republica mensagem aleatória armazenada
  - Requer: Mínimo de mensagens armazenadas
  - Cooldown: 2 horas após uso manual

### Utilitários
- **`/ping`** - Testa latência do bot
  - Função: Retorna tempo de resposta em ms

### Comandos de Administração
- **`vsfdliliane`** - Comando especial restrito
  - Requer: ID de usuário específico
  - Função: Respostas personalizadas

---

## Configuração

O bot utiliza o arquivo `config.json` para configurações de:
- IDs de canais e cargos
- URLs de planilhas e links
- Permissões de comandos
- Mensagens personalizadas
- Lista de termos bloqueados e resposta automática do blacklist

Observação: o bot agora usa o intent `MessageContent` para ler o texto das mensagens e detectar termos bloqueados. Esse intent também precisa estar habilitado no painel do aplicativo do Discord.

## Requisitos

- .NET 8.0+
- DisCatSharp
- Configuração adequada no `config.json`
- Permissões do bot no servidor Discord
