#!/usr/bin/env bash
# Renderiza cada *.src.html deste diretorio no PNG de mesmo nome.
#
# O repo ja versionava og-banner.src.html ao lado do og-banner.png, mas a
# captura era manual ("abrir este arquivo, capturar a .frame"). Aqui ela e
# automatizada porque sao tres artes e elas precisam ser refeitas juntas
# sempre que os tokens carmim da home mudarem.
#
# Usa Firefox headless: nao ha Chrome CLI nesta maquina. O --window-size e
# maior que o quadro de proposito; o recorte fino para o tamanho exato fica
# com o Pillow, que ja estava instalado.
#
#   ./render.sh            # renderiza tudo
#   ./render.sh rp-large   # renderiza so um
set -euo pipefail

cd "$(dirname "$0")"

# nome:largura:altura
TARGETS=(
  "rp-large:1024:1024"
  "rp-small:512:512"
  "profile-banner:600:240"
)

only="${1:-}"

for target in "${TARGETS[@]}"; do
  IFS=: read -r name w h <<< "$target"
  [ -n "$only" ] && [ "$only" != "$name" ] && continue

  src="$PWD/$name.src.html"
  out="$PWD/$name.png"
  if [ ! -f "$src" ]; then
    echo "!! $src nao existe, pulando" >&2
    continue
  fi

  # Margem no viewport para nenhuma barra de rolagem comer a borda do quadro.
  vw=$((w + 60))
  vh=$((h + 60))

  tmp="$(mktemp -d)"
  firefox --headless --screenshot "$tmp/raw.png" \
          --window-size="$vw,$vh" "file://$src" >/dev/null 2>&1

  python3 - "$tmp/raw.png" "$out" "$w" "$h" <<'PY'
import sys
from PIL import Image

raw, out, w, h = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
img = Image.open(raw).convert("RGB")
if img.width < w or img.height < h:
    raise SystemExit(f"captura menor que o quadro: {img.size} < {(w, h)}")
# A .frame fica ancorada no canto superior esquerdo (body place-items: start).
img.crop((0, 0, w, h)).save(out, optimize=True)
PY

  rm -rf "$tmp"
  echo "ok  $name.png  ($(python3 -c "from PIL import Image;i=Image.open('$out');print(f'{i.width}x{i.height}')") , $(du -h "$out" | cut -f1))"
done
