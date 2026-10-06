#!/usr/bin/env bash
# Renderiza os assets do Rich Presence (filearchive/presence/{large,lang,os}/)
# a partir dos .src.html deste diretorio, no mesmo esquema de
# filearchive/widget/render.sh: Firefox headless tira a captura, Pillow
# recorta para o tamanho exato e otimiza o PNG.
#
# Os badges de lang/ e os/ nao sao escritos a mao: gen_badges.py os gera a
# partir de badge.template.html + as tabelas de rotulo. Por isso este script
# sempre roda o gerador primeiro - rodar so ./render.sh depois de editar um
# rotulo em gen_badges.py basta.
#
#   ./render.sh            # gera os badges e renderiza tudo
#   ./render.sh idle       # so um alvo (nome do arquivo, sem grupo/extensao)
#   ./render.sh lang/rust  # so um badge
set -euo pipefail

cd "$(dirname "$0")"

python3 gen_badges.py

# grupo:nome:largura:altura:paleta
# "paleta=1" pede quantizacao (poucas cores chapadas, os badges aguentam sem
# gerar faixas visiveis); os grandes ficam em RGB porque a constelacao e a
# esfera tem gradiente fino demais para paleta sem banding.
TARGETS=()
for name in idle code orbit; do
  TARGETS+=("large:$name:512:512:0")
done
for src in lang/*.src.html; do
  id="$(basename "$src" .src.html)"
  TARGETS+=("lang:$id:128:128:1")
done
for src in os/*.src.html; do
  id="$(basename "$src" .src.html)"
  TARGETS+=("os:$id:128:128:1")
done

only="${1:-}"

tmp=""
trap '[ -n "$tmp" ] && rm -rf "$tmp"' EXIT

for target in "${TARGETS[@]}"; do
  IFS=: read -r group name w h palette <<< "$target"
  key="$group/$name"
  if [ -n "$only" ] && [ "$only" != "$name" ] && [ "$only" != "$key" ]; then
    continue
  fi

  src="$PWD/$group/$name.src.html"
  [ "$group" = "large" ] && src="$PWD/$name.src.html"
  out_dir="$PWD/../$group"
  mkdir -p "$out_dir"
  out="$out_dir/$name.png"

  if [ ! -f "$src" ]; then
    echo "!! $src nao existe, pulando" >&2
    continue
  fi

  vw=$((w + 60))
  vh=$((h + 60))

  tmp="$(mktemp -d)"
  firefox --headless --screenshot "$tmp/raw.png" \
          --window-size="$vw,$vh" "file://$src" >/dev/null 2>&1

  python3 - "$tmp/raw.png" "$out" "$w" "$h" "$palette" <<'PY'
import sys
from PIL import Image

raw, out, w, h, palette = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5] == "1"
img = Image.open(raw).convert("RGB")
if img.width < w or img.height < h:
    raise SystemExit(f"captura menor que o quadro: {img.size} < {(w, h)}")
# A .frame fica ancorada no canto superior esquerdo (body place-items: start).
img = img.crop((0, 0, w, h))
if palette:
    # Badges sao disco liso + anel + rotulo: poucas cores reais, paleta
    # adaptativa de 64 cores nao mostra banding e o PNG fica bem menor.
    img = img.convert("P", palette=Image.ADAPTIVE, colors=64)
img.save(out, optimize=True)
PY

  rm -rf "$tmp"
  dims="$(python3 -c "from PIL import Image;i=Image.open('$out');print(f'{i.width}x{i.height}')")"
  echo "ok  $key.png  ($dims, $(du -h "$out" | cut -f1))"
done
