#!/usr/bin/env bash
#
# Publica os Workers da Cloudflare que este repositorio versiona.
#
# Por que isto existe: os Workers nao tem pipeline. O conteudo do site sobe
# sozinho pelo GitHub Pages a cada commit, mas `cloudflare/` nao - editar um
# Worker e esquecer o `wrangler deploy` deixa o que roda na borda diferente do
# que esta no repositorio, e nada avisa. Foi exatamente o risco registrado no
# INFRA.md.
#
# Por que compara hash em vez de publicar sempre: cada `wrangler deploy` cria
# uma versao nova mesmo quando o codigo e identico. Numa maquina que reinicia
# todo dia isso encheria a lista de versoes de entradas iguais, e ela deixaria
# de servir para achar a mudanca real. Publicando so quando o fonte muda, a
# garantia ("a borda reflete o repositorio") continua valendo e o historico
# continua legivel.
#
# Uso:
#   ./deploy-workers.sh           # publica so o que mudou
#   ./deploy-workers.sh --force   # publica tudo, ignorando o carimbo
#
# Roda no boot pelo servico de usuario ccore-workers-deploy.service.

set -euo pipefail

cd "$(dirname "$0")"

WORKERS=(api-proxy-worker site-router-worker)
FORCE=0
if [[ "${1:-}" == "--force" ]]; then
  FORCE=1
fi

# O wrangler renova o access token sozinho pelo refresh token (escopo
# offline_access), entao nao ha login interativo aqui. Mas as credenciais moram
# em ~/.config/.wrangler: isto tem de rodar como o usuario dono delas, nunca
# como root.
if [[ ! -f "${HOME}/.config/.wrangler/config/default.toml" ]]; then
  echo "[deploy-workers] sem credencial do wrangler em ~/.config/.wrangler. Rode 'npx wrangler login'." >&2
  exit 1
fi

# Hash do que de fato vai para a borda: o codigo e a configuracao.
source_hash() {
  find src wrangler.toml -type f -print0 2>/dev/null \
    | sort -z \
    | xargs -0 sha256sum \
    | sha256sum \
    | cut -d' ' -f1
}

deployed=0
skipped=0
failed=0

for worker in "${WORKERS[@]}"; do
  if [[ ! -d "$worker" ]]; then
    echo "[deploy-workers] $worker: diretorio nao existe, pulando." >&2
    continue
  fi

  rc=0
  (
    cd "$worker"
    stamp=".wrangler/.deployed-hash"   # .wrangler/ e gitignored
    current="$(source_hash)"

    if [[ $FORCE -eq 0 && -f "$stamp" && "$(cat "$stamp")" == "$current" ]]; then
      echo "[deploy-workers] $worker: sem mudanca desde a ultima publicacao."
      exit 10
    fi

    # Tres tentativas: no boot a rede pode estar de pe sem DNS resolvendo
    # ainda, e um unico erro transitorio nao deve deixar a borda desatualizada
    # ate o proximo reinicio.
    for attempt in 1 2 3; do
      echo "[deploy-workers] $worker: publicando (tentativa $attempt)..."
      if npx --yes wrangler@4 deploy; then
        mkdir -p .wrangler
        printf '%s' "$current" > "$stamp"
        echo "[deploy-workers] $worker: publicado."
        exit 0
      fi

      if [[ $attempt -lt 3 ]]; then
        sleep $((attempt * 10))
      fi
    done

    echo "[deploy-workers] $worker: FALHOU apos 3 tentativas." >&2
    exit 1
  ) || rc=$?

  case ${rc:-0} in
    0)  deployed=$((deployed + 1)) ;;
    10) skipped=$((skipped + 1)) ;;
    *)  failed=$((failed + 1)) ;;
  esac
done

echo "[deploy-workers] resumo: $deployed publicado(s), $skipped sem mudanca, $failed falha(s)."
[[ $failed -eq 0 ]]
