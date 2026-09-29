#!/usr/bin/env bash
#
# Aplica na zona daeese.me as protecoes de borda que vivem na Cloudflare e nao
# num Worker: a regra de rate limit do WAF, as regras custom e a regra de cache.
#
# Por que isto existe: essas protecoes sao as unicas que agem ANTES do Worker.
# Um limite escrito dentro do Worker protege a origem, mas a requisicao barrada
# ja foi uma invocacao - e a cota diaria de Workers do plano Free e da conta
# inteira. So o WAF barra sem gastar cota. E configuracao de painel que nao
# fica versionada em lugar nenhum se nao for por aqui; os itens 1 e 2 do
# INFRA.md mostram quanto tempo configuracao de painel fica pendente.
#
# Uso:
#   ./apply.sh                    # o mesmo que plan
#   ./apply.sh plan               # diff entre a zona e o rulesets.json, sem escrever
#   ./apply.sh apply [--adopt]    # aplica o rulesets.json
#   ./apply.sh check              # DNS sem proxy, Security Level, Browser Integrity Check
#   ./apply.sh under-attack on    # botao de panico (ver o aviso que ele imprime)
#   ./apply.sh under-attack off
#
# Token: API token criado no painel (My Profile > API Tokens), restrito a zona
# daeese.me, com Zone:Read, DNS:Read, Zone Settings:Edit, Zone WAF:Edit,
# Cache Rules:Edit e Analytics:Read. Fica em ~/.config/daeese/cloudflare-zone-token
# (modo 600) ou em CF_ZONE_TOKEN. O OAuth do wrangler nao serve: nao tem escopo
# de WAF nem de configuracao de zona.
#
# O PUT no entrypoint de uma fase SUBSTITUI a fase inteira. Por isso toda regra
# daqui leva ref com prefixo "daeese-", e o apply se recusa a apagar regra que
# nao tenha esse prefixo (criada no painel) a menos que receba --adopt.

set -euo pipefail

ZONE_NAME="daeese.me"
API="https://api.cloudflare.com/client/v4"
REF_PREFIX="daeese-"
TOKEN_FILE="${HOME}/.config/daeese/cloudflare-zone-token"
STATE_DIR="${HOME}/.config/daeese"
RULESETS="$(dirname "$0")/rulesets.json"

die() {
  echo "[zone-security] $*" >&2
  exit 1
}

load_token() {
  if [[ -n "${CF_ZONE_TOKEN:-}" ]]; then
    TOKEN="$CF_ZONE_TOKEN"
    return
  fi

  [[ -f "$TOKEN_FILE" ]] || die "sem token: crie $TOKEN_FILE (modo 600) ou exporte CF_ZONE_TOKEN. Escopos no topo deste script."

  # Token com permissao de editar o WAF da zona: legivel por outro usuario e
  # o mesmo que publicado.
  local mode
  mode="$(stat -c '%a' "$TOKEN_FILE")"
  [[ "$mode" == "600" || "$mode" == "400" ]] || die "$TOKEN_FILE tem modo $mode; rode: chmod 600 $TOKEN_FILE"

  TOKEN="$(tr -d '[:space:]' < "$TOKEN_FILE")"
  [[ -n "$TOKEN" ]] || die "$TOKEN_FILE esta vazio."
}

# O token vai por arquivo de configuracao do curl num descritor anonimo, nao
# por argumento: argumento de processo aparece no `ps` de qualquer usuario.
api() {
  local method=$1 path=$2 body=${3:-}
  local args=(-sS -X "$method" -K <(printf 'header = "Authorization: Bearer %s"\n' "$TOKEN"))
  if [[ -n "$body" ]]; then
    args+=(-H "Content-Type: application/json" --data-binary "$body")
  fi
  curl "${args[@]}" "${API}${path}"
}

# Chamada que precisa dar certo. Devolve o .result; em erro, mostra o que a API
# disse e para.
api_ok() {
  local response
  response="$(api "$@")"
  if [[ "$(jq -r '.success' <<<"$response")" != "true" ]]; then
    echo "[zone-security] $1 $2 falhou:" >&2
    jq '.errors' <<<"$response" >&2
    exit 1
  fi
  jq '.result' <<<"$response"
}

resolve_zone() {
  ZONE_ID="$(api_ok GET "/zones?name=${ZONE_NAME}" | jq -r '.[0].id // empty')"
  [[ -n "$ZONE_ID" ]] || die "zona $ZONE_NAME nao encontrada com este token."
}

# Regras atuais da fase, ja reduzidas aos campos que o rulesets.json controla.
# Fase sem entrypoint (404) e fase vazia.
current_rules() {
  local phase=$1 response
  response="$(api GET "/zones/${ZONE_ID}/rulesets/phases/${phase}/entrypoint")"
  if [[ "$(jq -r '.success' <<<"$response")" != "true" ]]; then
    if jq -e '.errors[]? | select(.code == 10003 or (.message | test("not found"; "i")))' <<<"$response" >/dev/null; then
      echo '[]'
      return
    fi
    echo "[zone-security] GET entrypoint $phase falhou:" >&2
    jq '.errors' <<<"$response" >&2
    exit 1
  fi
  # A API devolve campos com valor padrao que o rulesets.json nao escreve (id,
  # version, requests_to_origin...). Sem esta projecao o plan acusaria
  # diferenca eterna.
  jq '[.result.rules[]?
       | {ref, description, expression, action, action_parameters, enabled,
          ratelimit: (.ratelimit | if . then {characteristics, period, requests_per_period, mitigation_timeout} else null end)}
       | with_entries(select(.value != null))]' <<<"$response"
}

desired_rules() {
  jq --arg phase "$1" '.[$phase].rules' "$RULESETS"
}

phases() {
  jq -r 'keys[]' "$RULESETS"
}

cmd_plan() {
  local phase current changed=0
  for phase in $(phases); do
    # Em variavel, nao em <(...): erro da API dentro de substituicao de
    # processo nao para o script, e o diff mostraria "apagar tudo".
    current="$(current_rules "$phase")"
    if diff -u --label "zona/$phase" --label "rulesets.json/$phase" \
         <(jq -S . <<<"$current") <(desired_rules "$phase" | jq -S .); then
      echo "[zone-security] $phase: igual."
    else
      changed=1
    fi
  done
  [[ $changed -eq 0 ]] && echo "[zone-security] nada a aplicar." || true
}

cmd_apply() {
  local adopt=0 phase foreign payload
  [[ "${1:-}" == "--adopt" ]] && adopt=1

  # Checa tudo antes de escrever qualquer coisa: abortar no meio deixaria a
  # zona com metade das fases novas.
  for phase in $(phases); do
    foreign="$(current_rules "$phase")"
    foreign="$(jq --arg p "$REF_PREFIX" '[.[] | select((.ref // "") | startswith($p) | not)]' <<<"$foreign")"
    if [[ "$(jq 'length' <<<"$foreign")" -gt 0 && $adopt -eq 0 ]]; then
      echo "[zone-security] $phase tem regra que nao e deste script (sem ref ${REF_PREFIX}*):" >&2
      jq '.[] | {ref, description, expression}' <<<"$foreign" >&2
      die "o apply apagaria essas regras. Leve-as para o rulesets.json ou rode com --adopt para descarta-las."
    fi
  done

  for phase in $(phases); do
    payload="$(jq --arg phase "$phase" '{description: .[$phase].description, rules: .[$phase].rules}' "$RULESETS")"
    api_ok PUT "/zones/${ZONE_ID}/rulesets/phases/${phase}/entrypoint" "$payload" >/dev/null
    echo "[zone-security] $phase: aplicado ($(jq 'length' <<<"$(desired_rules "$phase")") regra(s))."
  done
}

setting() {
  api_ok GET "/zones/${ZONE_ID}/settings/$1" | jq -r '.value'
}

cmd_check() {
  local records exposed
  records="$(api_ok GET "/zones/${ZONE_ID}/dns_records?per_page=5000")"

  # Registro sem proxy entrega o IP de origem, e com ele o atacante fala direto
  # com a origem e pula a Cloudflare inteira - WAF, rate limit e mitigacao de
  # DDoS. Os tunnels sao CNAME para cfargotunnel.com e tem de estar laranja.
  exposed="$(jq -r '.[] | select((.type == "A" or .type == "AAAA" or .type == "CNAME") and .proxied == false)
                    | "  \(.type)\t\(.name)\t\(.content)"' <<<"$records")"
  if [[ -n "$exposed" ]]; then
    echo "[zone-security] ATENCAO: registro(s) sem proxy - a origem fica exposta:"
    echo "$exposed"
  else
    echo "[zone-security] DNS: todo A/AAAA/CNAME esta com proxy."
  fi

  # O cloudflared-ssh esta desligado desde setembro; se o hostname dele ainda
  # aponta para o tunnel, e porta de entrada esquecida.
  jq -r '.[] | select(.name | test("ssh"; "i")) | "[zone-security] hostname de ssh ainda no DNS: \(.name) -> \(.content)"' <<<"$records"

  echo "[zone-security] security_level: $(setting security_level)"
  echo "[zone-security] browser_check: $(setting browser_check)"
  # O clips-gallery registrou cf-cache-status DYNAMIC ate para /static; se o
  # development_mode estiver ligado, a regra daeese-cache-static nao vale nada.
  echo "[zone-security] development_mode: $(setting development_mode)"
  echo "[zone-security] cache_level: $(setting cache_level)"
}

cmd_under_attack() {
  local saved="${STATE_DIR}/security-level.before" current
  case "${1:-}" in
    on)
      current="$(setting security_level)"
      if [[ "$current" != "under_attack" ]]; then
        mkdir -p "$STATE_DIR"
        printf '%s' "$current" > "$saved"
      fi
      api_ok PATCH "/zones/${ZONE_ID}/settings/security_level" '{"value":"under_attack"}' >/dev/null
      cat <<'EOF'
[zone-security] Under Attack LIGADO: todo visitante passa por um desafio de navegador.
  Quebra enquanto estiver ligado:
  - fetch de ccore.daeese.me/status para daeese.me/api/status (o desafio e por host);
  - polling do CommunityBot em daeese.me/oauth/roblox/result (HttpClient nao resolve desafio);
  - embeds de clips no Discord.
  Desligue assim que o ataque passar: ./apply.sh under-attack off
EOF
      ;;
    off)
      local restore="medium"
      [[ -f "$saved" ]] && restore="$(cat "$saved")"
      api_ok PATCH "/zones/${ZONE_ID}/settings/security_level" "$(jq -n --arg v "$restore" '{value: $v}')" >/dev/null
      rm -f "$saved"
      echo "[zone-security] Under Attack desligado; security_level voltou para $restore."
      ;;
    *)
      die "uso: $0 under-attack on|off"
      ;;
  esac
}

command -v jq >/dev/null || die "precisa do jq."
[[ -f "$RULESETS" ]] || die "nao achei $RULESETS."
jq empty "$RULESETS" || die "$RULESETS nao e JSON valido."

load_token
resolve_zone

case "${1:-plan}" in
  plan)         cmd_plan ;;
  apply)        cmd_apply "${2:-}" ;;
  check)        cmd_check ;;
  under-attack) cmd_under_attack "${2:-}" ;;
  *)            die "subcomando desconhecido: $1 (plan | apply [--adopt] | check | under-attack on|off)" ;;
esac
