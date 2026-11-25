#!/usr/bin/env bash
# Renderiza cada *.src.html deste diretorio na capa .webp de mesmo nome,
# 1200x1200. Mesma ideia do filearchive/widget/render.sh: Firefox headless
# com um perfil temporario (nunca o perfil de verdade do usuario), screenshot
# um pouco maior que o quadro e o recorte fino pro tamanho exato com Pillow -
# so que aqui termina em WebP (qualidade ~88) em vez de PNG, porque e o
# formato que o resto da discografia usa pras capas.
#
#   ./render.sh                 # renderiza todas as capas
#   ./render.sh blood-oath      # so uma

set -euo pipefail
cd "$(dirname "$0")"

SLUGS=(blood-oath sollarety ii-windows mocktail rosemary-overlay ccore)
SIZE=1200
WINDOW=1260

only="${1:-}"

profile=""
trap '[ -n "$profile" ] && rm -rf "$profile"' EXIT

for slug in "${SLUGS[@]}"; do
  [ -n "$only" ] && [ "$only" != "$slug" ] && continue

  src="$PWD/$slug.src.html"
  out="$PWD/$slug.webp"
  if [ ! -f "$src" ]; then
    echo "!! $src nao existe, pulando" >&2
    continue
  fi

  profile="$(mktemp -d)"
  raw="$(mktemp -u --suffix=.png)"

  firefox --headless --no-remote --profile "$profile" \
          --screenshot "$raw" \
          --window-size="${WINDOW},${WINDOW}" \
          "file://$src" >/dev/null 2>&1

  python3 - "$raw" "$out" "$SIZE" <<'PY'
import sys
from PIL import Image

raw, out, size = sys.argv[1], sys.argv[2], int(sys.argv[3])
img = Image.open(raw).convert("RGB")
if img.width < size or img.height < size:
    raise SystemExit(f"captura menor que o quadro: {img.size} < {(size, size)}")
# .frame fica ancorada no canto superior esquerdo (body place-items: start).
img.crop((0, 0, size, size)).save(out, "WEBP", quality=88)
PY

  rm -f "$raw"
  rm -rf "$profile"
  profile=""

  dims="$(python3 -c "from PIL import Image; i = Image.open('$out'); print(f'{i.width}x{i.height}')")"
  echo "ok  $slug.webp  ($dims, $(du -h "$out" | cut -f1))"
done
